import React, { Suspense } from 'react';
import { render } from 'react-dom';
import {
	Router,
	Route,
	Switch,
} from 'react-router-dom';

import App from "./pages/app";
import Home from "./pages/home";

import { createBrowserHistory } from 'history';

import "@tabler/core/src/scss/_core.scss";
import "@tabler/core/src/js/src/dropdown.js";
import '../styles/main.scss';
import Loading from './components/modals/loading';
import Privacy from './pages/privacy';

const history = createBrowserHistory();

render(
	<div className="appContainer">
		<Suspense fallback={
			<Loading />
		}>
			<Router history={history}>
				<Switch>
					<Route path="/app" component={App} />
					<Route path="/privacy" component={Privacy} />
					<Route component={Home} />
				</Switch>
			</Router>
		</Suspense>
	</div>,
	window.app
);


