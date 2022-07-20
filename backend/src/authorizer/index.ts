import { verify } from 'jsonwebtoken';
import type { Context, APIGatewayRequestAuthorizerEventV2 } from 'aws-lambda';

export async function handler(event: APIGatewayRequestAuthorizerEventV2, ctx: Context) {

	ctx.callbackWaitsForEmptyEventLoop = false;

	let isAuthorized = false, context = {};

	try {
		context = verify(event.identitySource[0].slice(7), process.env.AppSecret);
		isAuthorized = true;
	} catch {
		// ignore errors here
	}

	return { isAuthorized, context };

}