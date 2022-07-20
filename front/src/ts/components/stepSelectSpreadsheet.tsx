import React, { RefObject } from "react";
import { IconPlus } from "@tabler/icons";
import SpreedSheetsList from "./spreedsheetsList";
import {Actions} from "./stepMetafields";

interface props {
	selectedSpreedsheet: { id: string, name: string} | null,
	setSelectedSpreedsheet: React.Dispatch<React.SetStateAction< props["selectedSpreedsheet"] >>,
	setAddNewSpreadSheet: React.Dispatch<React.SetStateAction<boolean>>
	setActiveStep: (a: number) => void
}

export default function StepSelectSpreadsheet({ selectedSpreedsheet, setSelectedSpreedsheet, setAddNewSpreadSheet, setActiveStep}: props) {
	return (
		<div className="step-content select-spreadsheet">
			<div className="content-header">
			<h2>2. Pick an existing spreadsheet or create a new one</h2>
			</div>
			<div className="content">
				<div className="select-sepreadsheet dropdown">
					<button
						className="btn btn-outline select-btn form-select dropdown-toggle"
						type="button"
						id="dropdownMenuButton3"
						data-bs-toggle="dropdown"
						aria-expanded="false"
					>
						{selectedSpreedsheet?.name ?? "Select…"}
					</button>
					<SpreedSheetsList setSelectedSpreedSheet={setSelectedSpreedsheet} />
				</div>
				<div className="hr-text">OR</div>
				<button className="btn btn-outline" onClick={() => setAddNewSpreadSheet(true)}>
					<IconPlus />
					Create new one
				</button>
			</div>
			<Actions
				prev={() => setActiveStep(1)}
				next={() => setActiveStep(3)}
				disableNext={!selectedSpreedsheet}
			/>
		</div>
	);
}