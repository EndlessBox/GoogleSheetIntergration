import React, { Suspense } from "react";

import Middleware from "../../components/middleware";
import { ErrorBoundary } from "../../components/errorBoundary";
import { Relay } from '../../relay'
import Content from "./app";
import Loading from "../../components/modals/loading";

export default function App(props) {
	return (
		<Middleware {...props} >
			<Suspense fallback={
				<Loading />
			}>
				<Relay>
					<ErrorBoundary>
						<Content />
					</ErrorBoundary>
				</Relay>
			</Suspense>
		</Middleware>
	)
}