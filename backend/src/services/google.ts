import  { google } from "googleapis";
import { OAuth2Client } from "googleapis-common";


export const oauth2Client = new google.auth.OAuth2(
	process.env.GoogleClientID,
	process.env.GoogleClientSecret,
	process.env.GoogleRedirectionURL
	);
export const client =  new OAuth2Client(process.env.GoogleClientID);

export default google;