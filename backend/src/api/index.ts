import schema from './schema';
import * as graphql from 'graphql';
import type { Context, APIGatewayProxyEventV2WithRequestContext, APIGatewayProxyResultV2 } from 'aws-lambda';
import setupLoaders from './loaders';
import knex from '../services/db';
import { reduceError } from './errors';
import translation from '../services/translation';
import type {SignedData} from "../lightfunnels";
import  google  from '../services/google';

export async function handler(event: APIGatewayProxyEventV2WithRequestContext<{authorizer:{lambda: SignedData}}>, ctx: Context): Promise<APIGatewayProxyResultV2> {

	ctx.callbackWaitsForEmptyEventLoop = false;

	let response = {};
	let body: {query?: string, variables?, operationName?: string} = {};

	try {
		body = JSON.parse(event.body ?? '');
	} catch { };

	if (body.query) {

		let { variables, query, operationName } = body;

		const accountID = event.requestContext.authorizer.lambda.acid;

		let row = await knex.table('accounts')
			// here we use the app's ids, because it how we generated the token
			// check lightfunnels function
			.select(
				"google_account.*",
				"lightfunnels_token",
			)
			.leftJoin("google_account", "accounts.id", "google_account.account_id")
			.where('accounts.id', accountID)
			.first();
			
		if (!row) {

			// here we should throw an error
			// this can happen if the user installed the app then uninstalled it and 
			// tried to open it,
			// we still has a valid token in the browser store, but the row was removed from the database
			response = {
				data: null,
				errors: [
					{
						key: 'account_deleted' as keyof typeof translation,
						message: translation.account_deleted,
						path: []
					}
				]
			}

		} else {

			const { lightfunnels_token: lightfunnelsToken } = row;
			const { id, email, name, given_name, family_name, picture, access_token, refresh_token, access_exp_date, account_id } = row;

			const oauth2Client = new google.auth.OAuth2(
				process.env.GoogleClientID,
				process.env.GoogleClientSecret,
				process.env.GoogleRedirectionURL
			);

			oauth2Client.setCredentials({ access_token: access_token, refresh_token: refresh_token });

			const context: ApiContext = {
				account: {
					id: accountID,
					lightfunnelsToken,
				},
				oauth2Client,
				googleAccount: {id, email, name, given_name,  family_name, picture, access_token, refresh_token, access_exp_date, account_id},
				loaders: setupLoaders(accountID, lightfunnelsToken, oauth2Client)
			};

			oauth2Client.on('tokens', async (tokens) => {
				// idk why these are undefined
				context.googleAccount.access_token = tokens.access_token!;
				context.googleAccount.access_exp_date = tokens.expiry_date!;
				return knex.table('google_account')
					.where({ account_id: context.account.id })
					.update({ access_token: tokens.access_token, access_exp_date: tokens.expiry_date })
					.limit(1);
			});


			response = await graphql.graphql(
				schema,
				query,
				{},
				context,
				variables,
				operationName,
			)
				.then(
					function (resp: any) {
						if (resp.errors) {
							resp.errors = resp.errors.reduce(reduceError, []);
						}
						return resp;
					}
				);

		}


	}

	return {
		body: JSON.stringify(response),
		statusCode: 200,
		headers: {
			'Content-Type': 'application/json; charset=UTF-8'
		}
	}

}