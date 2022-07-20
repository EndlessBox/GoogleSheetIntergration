import React, { useEffect, useRef, useState } from "react";
import { IconChevronRight, IconChevronLeft, IconPlus } from "@tabler/icons";
import { useLazyLoadQuery, useMutation, graphql } from "react-relay";
import type { stepMetafieldsGetHeaderCellsQuery } from "./__generated__/stepMetafieldsGetHeaderCellsQuery.graphql"
import HeadCell from "./tableHead";
import Tbody from "./tableBody"
import { useRelayErrors } from "../data";
import * as variables from "../../variables";
import {setIn} from "immutable"
import type { stepMetafieldsAddAutomationMutation } from "./__generated__/stepMetafieldsAddAutomationMutation.graphql"
import GroupAutomations from "./modals/group_automations_modal";

interface Props {
	collectedData: {
		contacts: boolean;
		orders: boolean;
	},
	selectedSpreedsheet: {
		id: string;
		name: string;
	} | null,
	selectedSheet: {
		id: number;
		name: string;
	} | null,
	setNewAuto:  React.Dispatch<React.SetStateAction<boolean>>
	setActiveStep: (a: number) => void
	isNew: boolean
}


export default function StepMetaFields(props: Props) {
	const { collectedData, selectedSpreedsheet, selectedSheet, setNewAuto } = props;
	const tableScroll = useRef<HTMLTableElement>(null);
	const [onError, errors, setErrors] = useRelayErrors();
	const [commit, onFly] = useMutation<stepMetafieldsAddAutomationMutation>(createAutomation);
	const [submitted, setSubmitted] = useState(false);
	const [group, setGroup] = useState(false);
	const listDownData = collectedData.contacts?
		variables.fields.default.contact :
		variables.fields.default.item;
	const data = useLazyLoadQuery<stepMetafieldsGetHeaderCellsQuery>(getHeaderCells, {
		spreadsheetId: selectedSpreedsheet!.id!,
		sheetId: selectedSheet!.id!
	});
	const clientHeaderCells = data.getSpreadSheetHeaderColumns;
	const [localMetaFields, setLocalMetaFields] = useState<MetaFields>(
		function (){
			if (!clientHeaderCells.length)
				return (listDownData.reduce<MetaFields>(
					(ac, item, index) => {
						ac[index] = {column: item.display, value:  item.value , active: true }
						return ac;
					}, {}
				))
			else
				return clientHeaderCells.reduce<MetaFields>(
					(ac, item, index) => {
						ac[index] = {column: item, value: "" , active: false}
						return ac;
					}, {}
				)
		}
	);


	function changeScroll (isleft: boolean, end: number | null = null) {
		let currentScroll = tableScroll.current!.scrollLeft;
		if (currentScroll >= -300) {
			if (isleft) {
				tableScroll.current!.scrollLeft = currentScroll + (end ? 900000 : 300);
			} else {
				tableScroll.current!.scrollLeft = tableScroll.current!.scrollLeft - 300;
			}
		}
	};
	const shouldNotCommit = React.useMemo(() => {
		return Object.keys(localMetaFields)
			.some(key => (!localMetaFields[key].column || !localMetaFields[key].value) && localMetaFields[key].active);
		}, [localMetaFields]);
		
	return (
		<div className="step-content fields-mapping">
			<div className="content-header">
				<h2>4. Map your spreadsheet fields</h2>
				<p>
					Set up your column names and their values. Enable the columns you want to map.
					Disabled columns will be ignored.
				</p>
			</div>
			<button
				className="btn btn-ghost-primary mt-3"
				onClick={() => {
					setLocalMetaFields(prev => {
						let keys =  Object.keys(prev).map(Number);
						let maxValue = Math.max(...keys)
						return setIn(
							prev,
							[keys.length ? maxValue + 1 : 0],
							{column: "", value: "", active: false}
						);
					})
					changeScroll(true, 9000000)
				}}>
				<IconPlus />
				Add new column
			</button>
			{
				errors[""] &&
				<div className="alert alert-danger mt-3" role="alert">
					<h4 className="alert-title">Error&hellip;</h4>
					<div className="text-muted">{errors[""]}</div>
				</div>
			}
			<div className="content full-content d-block">
				<div className="d-flex flex-column">
					<div className="list-fields" ref={tableScroll}>
						<table className="table table-responsive" > 
							<thead>
								<tr>
									{
										Object.keys(localMetaFields).sort((a, b) => parseInt(a) - parseInt(b)).map((element) => {
											return ( 
												<th key={element}>
													<div className="field-item-header">
														<HeadCell
															isNewlyCreated={props.isNew}
															submitted={submitted}
															fieldName={localMetaFields[element].column}
															id={element}
															setLocalMetaFields={setLocalMetaFields}
															localMetaFields={localMetaFields}
														/>
													</div>
												</th>
											)
										})
									}
								</tr>
							</thead>
							<tbody>
								<tr>
									{
										Object.keys(localMetaFields).sort((a, b) => parseInt(a) - parseInt(b)).map((element) => {
											return (
												<Tbody 
													value={!clientHeaderCells.length ? listDownData.find(elem => localMetaFields[element].value == elem.value) : {value: "", display: ""}}
													key={element} 
													id={element} 
													setLocalMetaFields={setLocalMetaFields} 
													listDownData={listDownData}
													localMetaFields={localMetaFields}
													submitted={submitted}
												/>
											)
									})
									}
								</tr>
								{
									[1, 2, 3].map((e, index, arr) => {
										return (
											<tr key={index}>
												{Object.keys(localMetaFields).map((index) => {
													return (
														<td className="extra" key={index}>
															{arr.length === e && (
																<div className="fade-table f-bottom" key={index}></div>
															)}
														</td>
													);
												})}
											</tr>
										);
									})
								} 
							</tbody>
						</table>
					</div>
					<div className="fade-table f-left"></div>
					<div className="fade-table f-right"></div>
					<div className="scroll-btn btn-left" onClick={() => changeScroll(false)}>
						<IconChevronLeft size="24" color="#fff" />
					</div>
					<div className="scroll-btn btn-right" onClick={() => changeScroll(true)}>
						<IconChevronRight size="24" color="#fff" />
					</div>

				{
					collectedData.orders &&  <GroupAutomations value={group} setValue={setGroup} />
				}
				</div>
			</div>
			<Actions
				prev={() => {
					props.setActiveStep(3);
				}}
				loading={onFly}
				next={() => {
					if(onFly) return;
					setSubmitted(true);
					if(shouldNotCommit){
						return;
					}
					setErrors([]);
					commit({
						variables: {
							spreadsheetId: selectedSpreedsheet!.id!,
							sheetId: selectedSheet!.id!,
							automationType: collectedData,
							metaFields: localMetaFields,
							group: group
						},
						onCompleted() {
							setNewAuto(false);
						},
						onError
					});
					
				}}
			/>
		</div>
	);
}

type ActionsProps = {
	next?: () => void
	prev?: () => void
	disablePrev?: boolean
	disableNext?: boolean
	loading?: boolean
}
export function Actions(props: ActionsProps){
	return (
		<div className="actions">
			{
				props.prev &&
				<button
					disabled={props.disablePrev}
					onClick={props.prev}
					className="btn btn-outline">
					Prev
				</button>
			}			
			<div className="steps-divider" />
			{
				props.next && (
					<button
						disabled={props.disableNext}
						className={"btn main-button btn-primary " + (props.loading ? "btn-loading" : "")}
						onClick={props.next}
					>
						Next
					</button>
				)
			}
		</div>
	)
}

const getHeaderCells = graphql`
	query stepMetafieldsGetHeaderCellsQuery ($spreadsheetId: String!, $sheetId: Int!) {
		getSpreadSheetHeaderColumns(spreadsheetId: $spreadsheetId, sheetId: $sheetId)
	}
`

export const createAutomation = graphql`
	mutation stepMetafieldsAddAutomationMutation ($spreadsheetId: String!, $sheetId: Int!, $metaFields: metaFields!, $automationType: automationType!, $group: Boolean!) {
		createAutomation (spreadsheetId: $spreadsheetId, sheetId: $sheetId, metaFields: $metaFields, automationType: $automationType, group: $group) {
			id
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
