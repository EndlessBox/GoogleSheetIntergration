import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
	return (
		<div className="page">
			<header className="navbar navbar-expand-md navbar-light d-print-none">
				<div className="container-xl" style={{ maxWidth: "1000px" }}>
					<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-menu">
						<span className="navbar-toggler-icon"></span>
					</button>
					<h1 className="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
						<a href=".">
							<img src="https://www.lightfunnels.com/images/lightfunnels-logo.svg" width="110" height="32" alt="Tabler" className="navbar-brand-image" />
						</a>
					</h1>
				</div>
			</header>
			<div className="page-wrapper">
				<div className="container-md" style={{ maxWidth: "1000px" }}>
					<div className="page-header">
						<div className="row align-items-center">

							<div className="col">
								<div className="page-title">Lightfunnels & Google Sheets Integration App </div>
								<div className="text-muted">Sync your Lightfunnels contacts and orders with Google Sheets.</div>
							</div>
							<div className="col-auto d-none d-md-flex">
							</div>
						</div>
					</div>
				</div>
				<div className="page-body">
					<div className="container-xl" style={{ maxWidth: "1000px" }}>
						<div className="card">
							<div className="card-body">
								<h3>About the app</h3>
								<p>Use the Google Sheets app to sync your Lightfunnels data with Google Sheets. The app can automatically sync your contacts and orders information to your Google Sheets as soon as a prospect buys a product or subscribes as a lead on your funnel.</p>
								<img src="https://i.imgur.com/kgR124S.png" alt="" />
								<img src="https://i.imgur.com/egSrMWc.png" alt="" />
								<img src="https://i.imgur.com/g9FwKPf.png" alt="" />
								<img src="https://i.imgur.com/XySQPOp.png" alt="" />

							</div>
							<footer className="footer footer-transparent d-print-none">
								<div className="container-xl text-center" style={{ maxWidth: "1000px" }}>
									<ul className="list-inline list-inline-dots mb-0">
										<li className="list-inline-item"><a href="https://lightfunnels.com/" target="_blank" className="link-secondary">Website</a></li>
										<li className="list-inline-item"><Link to="/privacy" className="link-secondary">Privacy Policy</Link></li>
									</ul>
									<p className="mt-3">© 2022 Lightfunnels LTD. All rights reserved.</p>
								</div>
							</footer>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}