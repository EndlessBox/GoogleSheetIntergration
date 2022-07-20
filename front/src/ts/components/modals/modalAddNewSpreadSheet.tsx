import React, { useEffect, useState } from "react";
import { useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { useRelayErrors } from "../../data";
import type { modalAddNewSpreadSheetMutation } from "./__generated__/modalAddNewSpreadSheetMutation.graphql"

interface props {
	setAddNewSpreadSheet: React.Dispatch<React.SetStateAction<boolean>>,
	setSelectedSpreedsheet: React.Dispatch<React.SetStateAction<{
		id: string;
		name: string;
	} | null>>,
	setSelectedSheet: React.Dispatch<React.SetStateAction<{
		id: number;
		name: string;
	} | null>>,
	setActiveStep:React.Dispatch<React.SetStateAction<number>>,
	setIsNewlyCreated: React.Dispatch<React.SetStateAction<boolean>>
	setIsNew: (a: boolean) => void
}
export default function ModalAddNewSpreadsheet({ setIsNew, setAddNewSpreadSheet, setSelectedSheet, setSelectedSpreedsheet, setActiveStep, setIsNewlyCreated}: props) {
	const [newSpreadsheetName, setNewSpreadsheetName] = useState("")
	const [newSheetName, setNewSheetName] = useState("")
	const [commit, loading] = useMutation<modalAddNewSpreadSheetMutation>(createNewSpreedSheetMutation)
	const [onError, errors, setErrors] = useRelayErrors();

	return (
		<div className="modal-dialog2 modal-lg">
			<div className="modal-content">
				<div className="modal-header">
					<h5 className="modal-title">New report</h5>
					<button
						type="button"
						className="btn-close"
						onClick={() => setAddNewSpreadSheet(false)}
					></button>
				</div>
				<div className="modal-body">
					{
						errors[""] &&
						<div className="alert alert-danger" role="alert">
							<h4 className="alert-title">Error&hellip;</h4>
							<div className="text-muted">{errors[""]}</div>
						</div>
					}
					<div className="mb-3">
						<label className="form-label">Spreadsheet title</label>
						<input
							type="text"
							className="form-control"
							name="example-text-input"
							placeholder="Your spreadsheet name"
							value={newSpreadsheetName}
							onChange={(e) => setNewSpreadsheetName(e.target.value)}

						/>
					</div>
					<div className="mb-3">
						<label className="form-label">Sheet title</label>
						<input
							type="text"
							className="form-control"
							name="example-text-input"
							placeholder="Your sheet name"
							value={newSheetName}
							onChange={(e) => setNewSheetName(e.target.value)}


						/>
					</div>

					<div className="modal-footer">
						<button
							className="btn btn-link link-secondary"
							onClick={() => setAddNewSpreadSheet(false)}
						>
							Cancel
						</button>
						<button disabled={newSpreadsheetName && newSheetName ? false : true}
							className={`btn btn-primary ms-auto ${loading ? "btn-loading" : ""}`}
							onClick={() => {
								setErrors([]);
								commit({
									variables: {
										title: newSpreadsheetName,
										sheetTitle: newSheetName
									},
									onCompleted(data) {
										setIsNew(true);
										setSelectedSpreedsheet({ id: data.createSpreedsheet!.spreadsheetId, name: data.createSpreedsheet!.properties!.title! })
										setSelectedSheet({ id: data.createSpreedsheet!.sheets[0]!.properties?.sheetId, name: data.createSpreedsheet!.sheets[0]!.properties?.title })
										setIsNewlyCreated(true);
										setAddNewSpreadSheet(false);
										setActiveStep((prev) => prev + 2)
									},
									onError
								})
							}}>
							Create
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}


const createNewSpreedSheetMutation = graphql`
	mutation modalAddNewSpreadSheetMutation($title: String!, $sheetTitle: String!){
		createSpreedsheet(title: $title, sheetTitle: $sheetTitle){
			spreadsheetId 
			properties {
				title
			}
			sheets {
				properties {
					sheetId
					title
				}
			}
		}
	}

`