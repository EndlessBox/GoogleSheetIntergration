import DataLoader from 'dataloader';
import { OAuth2Client } from 'google-auth-library';
import { sheets_v4 } from 'googleapis';
import knex from '../services/db';

import google from '../services/google';

interface googleAccount {
	id: number,
	accessToken: string,
	refreshToken: string
}

export default function setupLoaders(acid: number, lfToken: string, oauth2Client: OAuth2Client) {
	return {
		Account: new DataLoader<number, any>((ids) => {
			return knex.table('accounts')
				.whereIn('accounts.id', ids)
				.then(
					items => {
						return ids.map(
							id => {
								return items.find(item => item.id === id);
							}
						)
					}
				)
		}),
		GoogleAccountByAccountId: new DataLoader<number, any>((ids) => {
			return knex.table('google_account')
				.whereIn('google_account.account_id', ids)
				.then(
					items => {
						return ids.map(
							id => {
								return items.find(item => item.account_id === id)
							}
						)
					}
				)
		}),
		Spreadsheet: new DataLoader<string, sheets_v4.Schema$Spreadsheet | undefined>(async (ids) => {
			const sheets = google.sheets({version: 'v4', auth: oauth2Client})
			let result = await Promise.all(ids.map(async id => {
				let spreadData = await sheets.spreadsheets.get({
					spreadsheetId: id
				})
				if(!spreadData)
					return undefined;
				return spreadData.data;
			}))
			
			return ids.map(id => {
				return result.find(item => {
					if (!item) return false;
					return item.spreadsheetId === id
				} );
			});
		}),
		Automation: new DataLoader<number, any>((ids) => {
			return knex.table('automations')
				.join("google_account", q => {
					q.on("google_account.id", "automations.google_account_id")
					.on("google_account.account_id", knex.raw("?", [acid]));
				})
				.select("automations.*")
				.whereIn('automations.id', ids)
				.andWhere('automations.account_id', acid)
				.then(
					items => {
						return ids.map(
							id => {
								return items.find(item => item.id === id);
							}
						)
					}
				)
		}),
		GoogleAccountByAutomationId: new DataLoader<number, any>(async (ids) => {
			let result =  await knex.table('google_account')
				.innerJoin("automations", "google_account.id", "automations.google_account_id")
				.select("google_account.*", "automations.id as aut_id")
				.whereIn("automations.id", ids)
				.then(
					items => {
						return ids.map(
							id => {
								return items.find(item => item.aut_id === id)
							}
						)
					}
				)
				return result;
		})
	};
}


export type Loaders = ReturnType<typeof setupLoaders>;