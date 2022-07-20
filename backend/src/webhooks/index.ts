import type { Context, APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import knex from '../services/db';
import log from '../services/log';
import crypto from 'crypto';
import lodash from "lodash";
import type {MetaFields} from "../../../front/partial";
import cst  from "../services/consts";
import google from "../services/google";
import lf from '../services/lightfunnels';


export async function handler(event: APIGatewayProxyEventV2, ctx: Context): Promise<APIGatewayProxyResultV2> {

	ctx.callbackWaitsForEmptyEventLoop = false;

	const [_, base, kind, webhookSufix] = event.rawPath.split('/');
	var statusCode = 200;

	try {

		switch (kind) {
			case 'automation' : {
				const eventBody = event.body!;
				var webhookPayload = JSON.parse(eventBody)
				if (typeof webhookPayload.custom === 'string') 
					webhookPayload.custom = JSON.parse(webhookPayload.custom);
				const hmac = event.headers['lightfunnels-hmac']
				const localyCalculatedHmac = crypto
					.createHmac('sha256', process.env.LightfunnelsAppSecret as string)
					.update(eventBody, 'utf8').digest('base64')

				if (hmac === localyCalculatedHmac) {
						
					let [googleAccount] = await knex
								.table('automations')
								.join("google_account", "google_account.id", "automations.google_account_id")
								.join("accounts", "automations.account_id", "accounts.id")
								.select(
									"automations.active",
									"automations.id as automations_id",
									"automations.spreadsheet_id",
									"automations.sheet_id",
									"automations.meta_fields",
									"automations.type",
									"automations.group",
									"automations.tags",
									'google_account.id',
									'google_account.access_token',
									'google_account.refresh_token',
									'accounts.lightfunnels_token'
								)
								.where("automations.id", event.queryStringParameters?.automationId)

					if(!googleAccount || !googleAccount.active){
						break;
					}

					const metaFields: MetaFields = JSON.parse(googleAccount.meta_fields)
					
					const oauth2Client = new google.auth.OAuth2(
						process.env.GoogleClientID,
						process.env.GoogleClientSecret,
						process.env.GoogleRedirectionURL
					);
					oauth2Client.setCredentials({ access_token: googleAccount.access_token, refresh_token: googleAccount.refresh_token });
					const sheets = google.sheets({version: 'v4', auth: oauth2Client});
					if (googleAccount.type === cst.ORDERS) {
						const resp = await lf({
							token: googleAccount.lightfunnels_token,
							data:{
								query:`
									query order($id: Int!){
										order(id: $id){
											_id
											notes
											email
											phone
											name
											id
											total
											subtotal
											financial_status
											discount_value
											shipping
											created_at(format: "YYYY-MM-DD HH:mm:ss")
											checkout{
												step{
													funnel_id
												}
											}
											items{
												... on VariantSnapshot {
													_id
													__typename
													sku
													image{
														path
													}
													price
													title
													parent_id: variant_id
												}
												... on OrderBumpSnapshot {
													_id
													__typename
													sku
													image{
														path
													}
													price
													title
													parent_id: product_id
												}
											}
											billing_address{
												line1
												line2
												country
												city
												first_name
												last_name
												zip
												state
											}
											shipping_address{
												line1
												line2
												country
												city
												first_name
												last_name
												zip
												state
											}
											customer{
												first_name
												last_name
												accepts_marketing
												notes
												custom
												tags
											}
											custom 
										}
									}
								`,
								variables:{
									id: webhookPayload.id
								}
							}
						});
						let order = resp.data.order;
						if (googleAccount.group) {
							let local_item: {sku: string[], price: number, title: string[], _id: string[], __typename: string[]} = {
								sku: [],
								price: 0,
								title: [],
								_id: [],
								__typename: []
							} 
							
							order.items.map(item => {
								item.sku ? local_item.sku.push(item.sku) : null;
								local_item.title.push(item.title);
								local_item._id.push(item._id.toString());
								local_item.__typename.push(item.__typename);
							});
							order['item'] = {}
							order['item']['sku'] = local_item.sku.join(',');
							order['item']['price'] = order.total
							order['item']['title'] = local_item.title.join(',');
							order['item']['_id'] = local_item._id.join(',');
							order['item']['__typename'] = local_item.__typename.join(',');
							order['quantity'] = order.items.length ;
							
							
							webhookPayload = order;
						} else {

							let itemList = order.items.map(item => {
								return {...order, item: item, quantity: 1}
							})
							let finalSheetsData: Array<Array<string>> = []
							
							itemList.map(item => {
								let sheetRowData: string[] = [];
					
								Object.keys(metaFields).sort((a, b) => parseInt(a) - parseInt(b)).map(key => {
								if (metaFields[key].active) {
									let checkIfNested = metaFields[key].value.split('/');
									if (metaFields[key].value === "customer/tags")
										sheetRowData.push(lodash.get(item, checkIfNested, []).join(","));
									else 
										sheetRowData.push(lodash.get(item, checkIfNested, ""));
								}
								else
									sheetRowData.push("")
								});
								finalSheetsData.push(sheetRowData)

							})
							let spreadSheet = await sheets.spreadsheets.get({spreadsheetId: googleAccount.spreadsheet_id});
							let sheet = spreadSheet.data.sheets!.find(sheet => sheet.properties!.sheetId === googleAccount.sheet_id);

							await sheets.spreadsheets.values.append({
								spreadsheetId: googleAccount.spreadsheet_id,
								range: `${sheet!.properties!.title}`,
								valueInputOption: "USER_ENTERED",
								requestBody: {values: finalSheetsData}
							});
							break;
						}


					}
					let communTags = [];
					if (googleAccount.type === cst.CONTACTS)
					{
						let storedTags = googleAccount.tags.split(',');
						if (googleAccount.tags) {
							communTags = storedTags.filter(tag => webhookPayload.tags.includes(tag))
							if (communTags.length == 0)
								break;
						}
					}
					

					let sheetRowData: string[] = [];
					
					Object.keys(metaFields).sort((a, b) => parseInt(a) - parseInt(b)).map(key => {
						if (metaFields[key].active) {
							let checkIfNested = metaFields[key].value.split('/');
							if (googleAccount.type === cst.ORDERS && metaFields[key].value === "customer/tags")
								sheetRowData.push(lodash.get(webhookPayload, checkIfNested, []).join(","));
							else
								sheetRowData.push(lodash.get(webhookPayload, checkIfNested, ""));
						}
						else
							sheetRowData.push("")
					});

					let spreadSheet = await sheets.spreadsheets.get({spreadsheetId: googleAccount.spreadsheet_id});
					let sheet = spreadSheet.data.sheets!.find(sheet => sheet.properties!.sheetId === googleAccount.sheet_id);

					await sheets.spreadsheets.values.append({
						spreadsheetId: googleAccount.spreadsheet_id,
						range: `${sheet!.properties!.title}`,
						valueInputOption: "USER_ENTERED",
						requestBody: {values: [sheetRowData]}
					});

				}
				break;
			}

			case 'uninstall': {
				const hmac = event.headers['lightfunnels-hmac']
				const localyCalculatedHmac = crypto
					.createHmac('sha256', process.env.LightfunnelsAppSecret as string)
					.update(event.body!, 'utf8').digest('base64')

				if (hmac === localyCalculatedHmac) {
					let body = JSON.parse(event.body!);
					// as long as the event is recieved from lf, it will always have the acc id
					await knex.table('accounts')
						.where({
							lightfunnels_account_id: body.event.account.id
						}).del();
				}

				break;
			}
		}

	} catch (error) {
		if (error.response.data.error === 'invalid_grant')
		{
			await knex.table('google_account')
				.innerJoin('automations', 'google_account.id', 'automations.google_account_id')
				.update("revoked", true)
				.where("automations.id", event.queryStringParameters?.automationId);
		}
		else if (error.code == 404 && error.errors[0].reason === "notFound") {
			knex.transaction(async trx => {
				let [infos] = await trx
									.table('automations')
									.join("accounts", "automations.account_id", "accounts.id")
									.select(
										'automations.webhookId',
										'accounts.lightfunnels_token'
									)
									.where("automations.id", event.queryStringParameters?.automationId)
				await lf({
					token: infos.lightfunnels_token,
					data: {
						query: `mutation deleteWebhook($id: Int!){
							deleteWebhook(id: $id)
						}`,
						variables: {
							id: infos.webhookId
						}
					}
				});
				await trx.table('automations').where('id', event.queryStringParameters!.automationId).del();

			})
		}
		statusCode = 500
		log({
			cause: 'WEBHOOKS',
			message: error.message,
			stack: error.stack,
			name: error.name,
			error,
			event
		});
	}


	return {
		body: "",
		statusCode: statusCode,
		headers: {}
	}

}