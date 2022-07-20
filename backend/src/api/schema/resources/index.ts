import * as graphql from 'graphql'
const types = require('../types');
import knex from '../../../services/db';
import lightfunnels from '../../../services/lightfunnels';
import { globalIdField } from 'graphql-relay';
import _ from 'lodash';
import { SimpleError } from "../../errors";
import idGenerator from "../../../services/id";
import consts from "../../../services/consts";

import google,  { client } from "../../../services/google";
import { drive_v3 } from 'googleapis';
import { GaxiosResponse } from 'gaxios';
import lodash from "lodash";
import variables from "../../../../../front/src/variables/item-fields";


types.googleAccountDetail = new graphql.GraphQLObjectType({
	name: 'googleAccountDetail',
	fields: () => ({
		id: globalIdField(),
		_id: {
			type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
			resolve(_) {
				return _.id
			}
		},
		email: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
		name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
		given_name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
		family_name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
		picture: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
		revoked: { type: graphql.GraphQLNonNull(graphql.GraphQLBoolean) }

	})
})

types.Automation = new graphql.GraphQLObjectType({
	name: 'Automation',
	fields: () => ({
		id: globalIdField(),
		_id: {
			type: new graphql.GraphQLNonNull(graphql.GraphQLString),
			resolve(_) {
				return _.id;
			}
		},
		type: {type: graphql.GraphQLNonNull(graphql.GraphQLString)},
		spreadsheet : {
			type: types.SpreedSheetDetail,
			async resolve(_, args, ctx: ApiContext) {
				try{
					let google_account = await ctx.loaders.GoogleAccountByAutomationId.load(_.id);
					if (google_account.revoked)
						return null
					let test = await ctx.loaders.Spreadsheet.load(_.spreadsheet_id)
					if (!test)
						return null;
					return {node: {id: test.spreadsheetId, name: test.properties!.title}}
					
				} catch(err) {
					if (err.response.data.error === 'invalid_grant')
					{
						await knex.table('google_account')
						.innerJoin('automations', 'google_account.id', 'automations.google_account_id')
						.update("revoked", true)
						.where("automations.id", _.id);
						throw new SimpleError("account_revoked");
					}
					throw(err);
				}
			}
		},
		sheetId: {
			type : graphql.GraphQLNonNull(graphql.GraphQLInt),
			resolve(_){
				return _.sheet_id
			}
		},
		created_at: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
		active: {type: graphql.GraphQLNonNull(graphql.GraphQLBoolean)}
	})
})

types.AppAccount = new graphql.GraphQLObjectType({
	name: 'AppAccount',
	fields: () => ({
		id: globalIdField(),
		_id: {
			type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
			resolve(_) {
				return _.id;
			}
		},
		account: {
			type: types.googleAccountDetail,
			async resolve(_, args, ctx: ApiContext) {
				let account = await ctx.loaders.GoogleAccountByAccountId.load(_.id)
				return account;
			}
		},
		automations: {
			type: graphql.GraphQLNonNull(graphql.GraphQLList(types.Automation)),
			async resolve(_, args, ctx: ApiContext) {
				let automations = await knex.table('automations')
									.where('automations.account_id', ctx.account.id)
				return automations
			}
		}
	})
})

// Relay Pagination
types.SpreedSheetDetail = new graphql.GraphQLObjectType({
	name: 'spreedSheetDetail',
	fields: () => ({
		node: {
			type: new graphql.GraphQLObjectType({
					name: "node",
					fields: () => ({
						id: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
						name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
					})
				})
		},
		cursor: { type: graphql.GraphQLString }
	})
})

types.PageInfo = new graphql.GraphQLObjectType({
	name: 'PageInfo',
	fields: () => ({
		endCursor: { type: graphql.GraphQLString },
		hasNextPage: { type: graphql.GraphQLNonNull(graphql.GraphQLBoolean) },
		hasPreviousPage: { type: graphql.GraphQLNonNull(graphql.GraphQLBoolean) },
		startCursor: { type: graphql.GraphQLString }
	})
})
types.GetSpreedSheets = new graphql.GraphQLObjectType({
	name: 'getSpreedSheets',
	fields: () => ({
		pageInfo: { type: graphql.GraphQLNonNull(types.PageInfo) },
		edges: { type: graphql.GraphQLList(types.SpreedSheetDetail) }
	})
});
types.sheet = new graphql.GraphQLObjectType({
	name: 'sheet',
	fields: () => ({
		properties: {
			type: graphql.GraphQLNonNull(
				new graphql.GraphQLObjectType({
					name: 'properties',
					fields: () => ({
						sheetId: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) },
						title: { type: graphql.GraphQLNonNull(graphql.GraphQLString) }
					})
				})
			)
		}
	})
});

types.CreateSpreadSheet = new graphql.GraphQLObjectType({
	name: 'createSpreadsheet',
	fields: () => ({
	  spreadsheetId: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
	  properties: {
			type: new graphql.GraphQLObjectType({
			  name: "spreadsheetProperties",
			  fields: () => ({
					title: { type: graphql.GraphQLString }
				})
			})
	  },
	  sheets: { type: graphql.GraphQLNonNull(graphql.GraphQLList(types.sheet)) }
	})
})

types.getAutomation = new graphql.GraphQLObjectType({
	name: 'getAutomation',
	fields: () => ({
		id: globalIdField(),
		_id: {
			type: graphql.GraphQLNonNull(graphql.GraphQLString),
			resolve (_) {
				return _.id
			}
		},
		created_at: {type: graphql.GraphQLNonNull(graphql.GraphQLString)},
		spreadsheet : {
			type : new graphql.GraphQLObjectType({
				name: 'spreadsheetDetails',
				fields: () => ({
					id: { type: graphql.GraphQLNonNull(graphql.GraphQLString)},
					name: { type: graphql.GraphQLNonNull(graphql.GraphQLString)}
				})
			}),
		async resolve(_, args, ctx: ApiContext) {
			let spreadDetails = await ctx.loaders.Spreadsheet.load(_.spreadsheet_id)
			if (!spreadDetails)
				return null;
			return{
				id: _.spreadsheet_id,
				name: spreadDetails!.properties?.title
			}
		}},
		sheet: {
			type : new graphql.GraphQLObjectType({
				name: 'sheetDetails',
				fields: () => ({
					id: { type: graphql.GraphQLNonNull(graphql.GraphQLString)},
					name: { type: graphql.GraphQLNonNull(graphql.GraphQLString)}
				}),
			}),
			async resolve(_, args, ctx:ApiContext) {
				let spreadDetails = await ctx.loaders.Spreadsheet.load(_.spreadsheet_id)
				if (!spreadDetails)
					return null;
				let sheet = spreadDetails.sheets!.find(sheet => sheet.properties?.sheetId === _.sheet_id)
				if (!sheet)
					return null;
				return {
					id: sheet.properties!.sheetId,
					name: sheet.properties!.title
				}
			}},
		metaFields: {
			type : metaFields,
			resolve(_){
				return JSON.parse(_.meta_fields)
			}},
		type: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
		group: { type: graphql.GraphQLNonNull(graphql.GraphQLBoolean) }
	})
})

export async function getAutomation(_, args, ctx: ApiContext) {
	return await ctx.loaders.Automation.load(args.automationId)
}


export const metaFields = new graphql.GraphQLScalarType({
	name: 'metaFields',
	serialize: lodash.identity,
	parseValue: lodash.identity,
	parseLiteral() {
	  throw new Error("The provided metaFields has incorrect format");
	}
  });


async function verify(id_token: string) {
	const ticket = await client.verifyIdToken({
		idToken: id_token,
		audience: process.env.GoogleClientID
	})
	return ticket.getPayload();
}

function checkScopes(scopes): boolean {
	if (!scopes.includes("https://www.googleapis.com/auth/drive") 
		|| !scopes.includes("https://www.googleapis.com/auth/docs") 
		|| !scopes.includes("https://www.googleapis.com/auth/spreadsheets"))
		return true
	return false
}

function checkOrginis(userInfos): boolean {
	if (userInfos.aud !== process.env.GoogleClientID)
		return true
	if (userInfos.iss !== "accounts.google.com"
		&& userInfos.iss !== "https://accounts.google.com")
		return true
	return false
}

export async function createGoogleAccount(_, args, ctx: ApiContext) {

	const { tokens } = await ctx.oauth2Client.getToken(args.token)

	let userInfos = await verify(tokens.id_token!);
	let scopes = (await client.getTokenInfo(tokens.access_token!)).scopes;
	
	if (checkScopes(scopes))
		throw new SimpleError("insufficient_permissions");
	if (checkOrginis(userInfos) || !userInfos)
		throw new SimpleError("invalid_token_source_app");

	await knex.table('google_account').insert({
		email: userInfos.email,
		name: userInfos.name,
		given_name: userInfos.given_name,
		family_name: userInfos.family_name,
		picture: userInfos.picture,
		access_token: tokens.access_token,
		refresh_token: tokens.refresh_token,
		access_exp_date: tokens.expiry_date,
		account_id: ctx.account.id
	});

	return { id: ctx.account.id };
}

export async function updateRevokedAccount(_, args, ctx: ApiContext) {
	const { tokens } = await ctx.oauth2Client.getToken(args.token);
	
	let userInfos = await verify(tokens.id_token!);
	let scopes = (await client.getTokenInfo(tokens.access_token!)).scopes;
	
	if (checkScopes(scopes))
		throw new SimpleError("insufficient_permissions");
	if (checkOrginis(userInfos) || !userInfos)
		throw new SimpleError("invalid_token_source_app");

	ctx.oauth2Client.setCredentials({access_token: tokens.access_token, refresh_token: tokens.refresh_token});
	
	await knex.table('google_account').update({
		access_token: tokens.access_token,
		refresh_token: tokens.refresh_token,
		revoked: false
	}).where('account_id', ctx.account.id);
	
	return {id: ctx.account.id};
}

export async function getSpreedSheets(_, args, ctx: ApiContext) {
	try {
		const drive = google.drive({ version: 'v3', auth: ctx.oauth2Client });
		let response: GaxiosResponse<drive_v3.Schema$FileList> = await drive.files.list({
			pageSize: 10,
			fields: 'nextPageToken, files(id,name,mimeType)',
			pageToken: args.after,
			q: "mimeType='application/vnd.google-apps.spreadsheet'"
		})
	
		// Relay Pagination
		let nodes = response.data.files!.map(file => ({ node: file, cursor: response.data.nextPageToken }));
		let pageInfo = {
			endCursor: response.data.nextPageToken,
			hasNextPage: Boolean(response.data.nextPageToken),
			hasPreviousPage: false,
			startCursor: response.data.nextPageToken
		}
	
	
		return { edges: nodes, pageInfo }
		
	} catch (error) {
		if (error.response.data.error === 'invalid_grant')
		{
			await knex.table('google_account')
				.update("revoked", true)
				.where("account_id", ctx.account.id);
			throw new SimpleError("account_revoked");
		}
		else
			throw(error);
	}
}

export async function getSheets(_, args, ctx: ApiContext) {
		const sheets = google.sheets({ version: 'v4', auth: ctx.oauth2Client });
		let res = await sheets.spreadsheets.get({
			spreadsheetId: args.spreadsheetId
		});
		return res.data.sheets;
}

export async function createSpreadSheet(_, args, ctx: ApiContext) {

	const sheets = google.sheets({ version: 'v4', auth: ctx.oauth2Client });
	const resp = await sheets.spreadsheets.create({
		requestBody: {
			properties: {
				title: args.title,
			},
			sheets: [{ properties: { title: args.sheetTitle } }]
		}
	});

	return resp.data;
}

export async function getSpreedSheetsHeaderColumns(_, args, ctx: ApiContext) {
	const sheets = google.sheets({ version: 'v4', auth: ctx.oauth2Client });
	let res = await sheets.spreadsheets.get({
		spreadsheetId: args.spreadsheetId
	});
	
	let sheet = res.data.sheets!.find(sheet => sheet.properties!.sheetId === args.sheetId);

	let headColumnsResp = await sheets.spreadsheets.values.get({
		range: `${sheet!.properties!.title}!1:1`,
		spreadsheetId: args.spreadsheetId,
		majorDimension: "ROWS"
	})
	
	return headColumnsResp.data.values ? headColumnsResp.data.values[0] : []
}




export async function createAutomation(_, args, ctx:ApiContext) {
	return knex.transaction(async function(trx) {

		const sheets = google.sheets({ version: 'v4', auth: ctx.oauth2Client });

		let spreadSheet = await sheets.spreadsheets.get({
			spreadsheetId: args.spreadsheetId
		});
		let sheet = spreadSheet.data.sheets!.find(sheet => sheet.properties!.sheetId === args.sheetId);
		let rowData: String[] = [];
		
		let checkVars = args.automationType.orders ? variables.item.map(item => item.value) : variables.contact.map(item => item.value);
		let sanitizedMetaFields:object = {};

		Object.keys(args.metaFields).sort((a, b) => parseInt(a) - parseInt(b)).map(key => {
			if(args.metaFields[key].value.startsWith("custom/") || checkVars.includes(args.metaFields[key].value)){
				rowData.push(args.metaFields[key].column);
				
				sanitizedMetaFields[key] = args.metaFields[key];
			}
		});

		await sheets.spreadsheets.values.update({
			spreadsheetId: args.spreadsheetId,
			range: `${sheet!.properties!.title}!1:1`,
			valueInputOption: "RAW",
			requestBody: {values: [rowData]}
		})

		let automationId = idGenerator("automation");

		const hookResult = await lightfunnels({
			token: ctx.account.lightfunnelsToken,
			data: {
				query: `
					mutation createWebhook ($node: WebhookInput!){
						createWebhook(node: $node){
							type,
							url,
							id,
							_id
						}
					}
				`,
				variables: {
					node: {
						type: args.automationType.orders ? "order/confirmed" : "contact/signup",
						url: `${process.env.AppURL}webhooks/automation?automationId=${automationId}`,
						settings: {}
					}
				}
			}
		});

		await trx.table('automations').insert({
			id: automationId,
			account_id: ctx.account.id,
			google_account_id: ctx.googleAccount.id,
			type: args.automationType.orders ? consts.ORDERS : consts.CONTACTS,
			spreadsheet_id: args.spreadsheetId,
			sheet_id: args.sheetId,
			meta_fields: JSON.stringify(sanitizedMetaFields),
			webhookId: hookResult.data.createWebhook._id,
			group: args.group ? args.group : false,
			tags: args.tags ? args.tags : ""
		});

		return { id: ctx.account.id }
	})	

}

export async function disconnect(_, args, ctx: ApiContext) {
	await knex.table('google_account').where({account_id: ctx.account.id}).del();
	return {id: ctx.account.id};
}

export async function updateActivation(_, args, ctx: ApiContext) {
	const automation = await ctx.loaders.Automation.load(args.automationId);
	if(automation){
		await knex.table('automations').where({id: args.automationId}).update({active: !automation.active})
	}
	return {id: ctx.account.id};
}

export async function deleteAutomation(_, args, ctx:ApiContext) {
	const automation = await ctx.loaders.Automation.load(args.automationId);
	if(automation){
		await knex.transaction(async trx => {
			await trx.table('automations').where({id: args.automationId}).del()
			await lightfunnels({
				token: ctx.account.lightfunnelsToken,
				data: {
					query: `
						mutation deleteWebhook($id: Int!) {
							deleteWebhook(id: $id)
						}
					`,
					variables: {
						id: automation.webhookId
					}
				}
			});
		});
	}
	return ({id: ctx.account.id});
}

export async function getAppAccount(_, args, ctx: ApiContext) {
	return { id: ctx.account.id };
}


export async function updateAutomation(_, args, ctx: ApiContext) {

	let automation = await ctx.loaders.Automation.load(args.automationId)

	if (automation){
		await knex.transaction(async trx => {
			const sheets = google.sheets({ version: 'v4', auth: ctx.oauth2Client });
			let rowData: String[] = [];
			let spreadDetails = await ctx.loaders.Spreadsheet.load(automation.spreadsheet_id)

			if (!spreadDetails)
				throw new SimpleError("sheet_deleted");
			
			let sheet = spreadDetails.sheets?.find(sheet => sheet.properties?.sheetId === automation.sheet_id)

			if (!sheet) 
				throw new SimpleError("sheet_deleted");

			let checkVars = automation.type === consts.CONTACTS ? variables.contact : variables.item;
			let sanitizedMetaFields: object = {};
			Object.keys(args.metaFields).sort((a, b) => parseInt(a) - parseInt(b)).map(key => {
				if(args.metaFields[key].value.startsWith("custom/") || checkVars.includes(args.metaFields[key].value)){
					rowData.push(args.metaFields[key].column);
					sanitizedMetaFields[key] = args.metaFields[key];
				}
			});

			await sheets.spreadsheets.values.update({
				spreadsheetId: automation.spreadsheet_id,
				range: `${sheet!.properties!.title}!1:1`,
				valueInputOption: "RAW",
				requestBody: {values: [rowData]}
			})
						
			await trx.table('automations').where({
				id: args.automationId,
				account_id: ctx.account.id
			}).update({meta_fields: JSON.stringify(sanitizedMetaFields), group: args.group});

			automation.meta_fields = JSON.stringify(sanitizedMetaFields);
			automation.group = args.group;
			return ;
		})}	
	return automation
}