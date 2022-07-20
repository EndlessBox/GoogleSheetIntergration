
interface ApiContext {
	account: {
		id: number
		lightfunnelsToken: string
	},
	oauth2Client: import('google-auth-library').OAuth2Client,
	googleAccount: {
		id: number, 
		email:string, 
		name: string,
		given_name: string,
		family_name: string,
		picture: string,
		access_token: string,
		refresh_token: string,
		access_exp_date: number,
		account_id: number
	},
	loaders: import('./api/loaders').Loaders
}



declare namespace NodeJS {
	export type ProcessEnv = {
		NodeEnv: "production" | "development"
		AppSecret: string
		LightfunnelsAppKey: string
		LightfunnelsAppSecret: string
		LightfunnelsUrl: string
		LightfunnelsFrontUrl: string
		AppURL: string
		DbHost: string
		DbUser: string
		DbName: string
		DbPass: string
		GoogleClientID: string
		GoogleClientSecret: string
		GoogleRedirectionURL: string
	}
}