import React, { useEffect } from "react";
import LF_Logo from "../../assets/images/lightfunnels-logo.svg";
import G_sheet_logo from "../../assets/images/google-sheet-logo.svg";
import { gapi } from "gapi-script"
import GoogleLogin, {GoogleLoginResponseOffline} from "react-google-login";
import { graphql, useMutation } from "react-relay";
import type { authCreateGoogleAccountMutation } from "./__generated__/authCreateGoogleAccountMutation.graphql"
import type { authUpdateRevokedAccountMutation } from "./__generated__/authUpdateRevokedAccountMutation.graphql"
import { useRelayErrors } from "../data"
import Loading from "./modals/loading";

interface props {
	revoked: boolean
}


export default function Auth({revoked}: props) {

	const [commitCreate, loadingCreate] = useMutation<authCreateGoogleAccountMutation>(createGoogleAccount);
	const [commitRevoke, loadingRevoke] = useMutation<authUpdateRevokedAccountMutation>(updateRevokedAccount);
	const [onError, errors, setErrors] = useRelayErrors();

	useEffect(() => {
		function start() {
			gapi.client.init({
				apiKey: process.env.ApiKey,
				clientId: process.env.ClientId,
				scope: "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/docs https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets",
			})
		}

		gapi.load('client:auth2', start);
	}, [])

	return (loadingCreate || loadingRevoke) ? <Loading /> :
		<div className="empty">
			<div className="empty-img">
				<img src={LF_Logo} width="68" height="68" alt="" />
				<img src={G_sheet_logo} width="68" height="68" alt="" />
			</div>
			<p className="empty-title">Google  Account</p>
			<p className="empty-subtitle text-muted">
				Connect your Google account to allow Lightfunnels to create and update Google Sheets for you.
			</p>
			<div className="empty-action">
				<GoogleLogin
					prompt="consent"
					clientId={process.env.ClientId!}
					buttonText="Sign in with Google"
					onSuccess={function handleLogin(data: GoogleLoginResponseOffline) {
						
						if (revoked){
							commitRevoke({
								variables: {
									code: data.code
								},
								onError
							})
						}
						else {
							commitCreate({
								variables: {
									code: data.code
								},
								onError
							})
						}
					}}
					onFailure={error => {
						setErrors([
							{
								name: "FrontGoogleAuthError",
								key: "front_google_auth_error",
								message: JSON.stringify(error),
								path: []
							}
						]);
					}}
					accessType="offline" responseType="code"></GoogleLogin>
			</div>
			{
				errors[""] && <div className="invalid-feedback" style={{ display: "block" }}>{errors[""]}</div>
			}
		</div>
}


const createGoogleAccount = graphql`
	mutation authCreateGoogleAccountMutation ($code: String!){
	  addGoogleAccount(token: $code){
		id
		_id
		account {
		  id
		  _id
		  email
		  name
		  given_name
		  family_name
		  picture
		  revoked
		}
		automations {
			id
			_id
			type
			spreadsheet {
				node {
					id
					name
				}
			}
			sheetId
			created_at
			active
		}
	  }
	}

`


const updateRevokedAccount = graphql`
	mutation authUpdateRevokedAccountMutation ($code: String!){
	  updateRevokedAccount(token: $code){
		id
		_id
		account {
		  id
		  _id
		  email
		  name
		  given_name
		  family_name
		  picture
		  revoked
		}
		automations {
			id
			_id
			type
			spreadsheet {
				node {
					id
					name
				}
			}
			sheetId
			created_at
			active
		}
	  }
	}

`
