import React, { Suspense, useEffect, useReducer, useRef, useState } from "react";
import {
	useMutation,
	graphql,
} from "react-relay"
import StepCollectedData from "./stepCollectedData";
import StepSelectSpreadsheet from "./stepSelectSpreadsheet";
import ModalAddNewSpreadsheet from "./modals/modalAddNewSpreadSheet";
import StepSelectTabSheet from "./stepSelectTabSheet";
import StepMetaFields, {createAutomation} from "./stepMetafields";
import { useRelayErrors } from "../data";

interface props { 
	setNewAuto : React.Dispatch<React.SetStateAction<boolean>>
	isFirst: boolean
}

export default function New({setNewAuto, isFirst}: props) {
	const [activeStep, setActiveStep] = useState(1);
	const [collectedData, setCollectedData] = useReducer(collect, {
		contacts: false,
		orders: true,
	});
	const [addNewSpreadSheet, setAddNewSpreadSheet] = useState(false);

	const [selectedSpreedsheet, setSelectedSpreedsheet] = useState<{id: string, name: string} | null>(null);
	const [selectedSheet, setSelectedSheet] = useState<{id: number, name: string } | null>(null);
	const [isNewlyCreated, setIsNewlyCreated] = useState(false);
	const [isNew, setIsNew] = React.useState(false);

	return (
		<div className="new">
			<div className="container-full">
				<div className="steps steps-counter steps-lime">
					<span className={`step-item ${activeStep === 1 ? "active" : ""}`}></span>
					<span className={`step-item ${activeStep === 2 ? "active" : ""}`}></span>
					<span className={`step-item ${activeStep === 3 ? "active" : ""}`}></span>
					<span className={`step-item ${activeStep === 4 ? "active" : ""}`}></span>
				</div>
				{
					(activeStep === 1) &&
					<StepCollectedData
						collectedData={collectedData}
						setCollectedData={setCollectedData}
						setActiveStep={setActiveStep}
						cancel={
							isFirst ? undefined : 
							function (){
								setNewAuto(false);
							}
						}
					/>
				}
				{
					(activeStep === 2) &&
					<StepSelectSpreadsheet
						setActiveStep={setActiveStep}
						selectedSpreedsheet={selectedSpreedsheet}
						setSelectedSpreedsheet={setSelectedSpreedsheet}
						setAddNewSpreadSheet={setAddNewSpreadSheet}
					/>
				}
				{
					(activeStep === 3) &&
					<StepSelectTabSheet
						setActiveStep={setActiveStep}
						selectedSpreedsheet={selectedSpreedsheet!}
						setSelectedSheet={setSelectedSheet}
						selectedSheet={selectedSheet}
					/>
				}
				{
					(activeStep === 4) &&
					<StepMetaFields
						setActiveStep={setActiveStep}
						collectedData={collectedData}
						selectedSpreedsheet={selectedSpreedsheet}
						selectedSheet={selectedSheet}
						setNewAuto={setNewAuto}
						isNew={isNew}
					/>
				}
			{
				addNewSpreadSheet &&
				<ModalAddNewSpreadsheet
					setIsNew={setIsNew}
					setAddNewSpreadSheet={setAddNewSpreadSheet}
					setSelectedSheet={setSelectedSheet}
					setSelectedSpreedsheet={setSelectedSpreedsheet}
					setActiveStep={setActiveStep}
					setIsNewlyCreated={setIsNewlyCreated}
				/>
			}
			</div>
		</div>
	);
}


function collect(collectedData, action: {type: "contacts"|"orders"}) {
	switch (action.type) {
		case "contacts":
			return {
				contacts: true,
				orders: false,
			};
		case "orders":
			return {
				contacts: false,
				orders: true,
			};
		default:
			throw new Error("missing action");
			break;
			// return {
			//     contacts: false,
			//     orders: false,
			// };
	}
}