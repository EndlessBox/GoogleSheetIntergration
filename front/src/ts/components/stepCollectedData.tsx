import React from "react";
import { IconNotes, IconPlus, IconUsers } from "@tabler/icons";
import {Actions} from "./stepMetafields"

interface props {
	collectedData: { contacts: boolean, orders: boolean },
	setCollectedData: (a: {type: "contacts"|"orders"}) => void,
	cancel?: () => void
	setActiveStep: (a: number) => void
}


export default function StepCollectedData({ collectedData, setCollectedData, cancel, setActiveStep }: props) {
	return (
		<div className="step-content collected-data-type">
			<div className="content-header">
			<h2>1. Select collected data</h2>
			<p>
				Make sure you are using a sheet created with an account linked to Lightfunnels. It does
				not work if created with an account other than the linked account
			</p>
			</div>
			<div className="content">
				<label className="form-selectgroup-item">
					<input
						type="radio"
						name="icons"
						value="user"
						className="form-selectgroup-input"
						defaultChecked={collectedData.orders}
						onClick={() => {
							setCollectedData({ type: "orders" });
						}}
					/>
					<div className="form-selectgroup-label">
						<IconNotes />
						<span>Collect Orders</span>
					</div>
				</label>
				<label className="form-selectgroup-item">
					<input
						type="radio"
						name="icons"
						value="home"
						className="form-selectgroup-input"
						defaultChecked={collectedData.contacts}
						onClick={() => {
							setCollectedData({ type: "contacts" });
						}}
					/>
					<div className="form-selectgroup-label">
						<IconUsers stroke="2" />
						<span>Collect Contacts</span>
					</div>
				</label>
			</div>
			<Actions
				prev={cancel}
				disableNext={!collectedData.orders && !collectedData.contacts}
				next={() => {
					setActiveStep(2);
				}}
			/>
		</div>
	);
}