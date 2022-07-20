import React, { Fragment } from "react";
import store from 'store';
import qs from 'qs';
import { Token } from "../data";
import Loading from "./modals/loading";

export default function Middleware(props) {

	const q = React.useMemo(() => {
		return qs.parse(props.location.search, { ignoreQueryPrefix: true });
	}, [props.location.search]);

	const [token, setToken] = React.useState<undefined | string>(() => {
		return q['installation-id'] && store.get(installToKey(q['installation-id']))
	});

	React.useEffect(
		function () {

			if (q.code && q.state && q['account-id']) {
				fetch(process.env.ApiURL + 'lightfunnels/connect-response', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						code: q.code,
						state: q.state,
						accountID: q['account-id']
					})
				})
					.then(resp => resp.json())
					.then(function (resp) {
						store.set(installToKey(resp.id), resp.token);
						setToken(resp.token);
					});
			} else if (!token && q['account-id']) {
				fetch(process.env.ApiURL + 'lightfunnels/connect-url', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						accountID: q['account-id'],
						redirectUrl: window.location.origin + '/app'
					})
				})
					.then(resp => resp.text())
					.then(function (resp) {
						window.location.href = resp;
					});
			}

		}, []
	);

	if (!token) {
		return (
			<Fragment children={<Loading />} />
		);
	}

	return (
		<Token.Provider value={token}>
			{props.children}
		</Token.Provider>
	);
}

function installToKey(id){
	return 'i' + id + '_token';
}