import React, { useEffect, useRef, useState } from "react";
import { IconChevronRight, IconChevronLeft, IconPlus } from "@tabler/icons";
import { useLazyLoadQuery, useMutation, graphql } from "react-relay";
import HeadCell from "./tableHead";
import Tbody from "./tableBody"
import { useRelayErrors } from "../data";
import * as variables from "../../variables";
import type { editAutomationgetAutomationQuery } from "./__generated__/editAutomationgetAutomationQuery.graphql"
import type { editAutomationUpdateAutomationMutation } from "./__generated__/editAutomationUpdateAutomationMutation.graphql";
import GroupAutomations from "./modals/group_automations_modal";

interface Props {
	automationId: string,
	setAutomationId: (id: string) => void
}


export default function EditAutomation(props: Props) {
	const { automationId, setAutomationId } = props;
	const tableScroll = useRef<HTMLTableElement>(null);
	const [onError, errors, setErrors] = useRelayErrors();
	const [commit, onFly] = useMutation<editAutomationUpdateAutomationMutation>(updateAutomation);
	const [submitted, setSubmitted] = useState(false);
	const data = useLazyLoadQuery<editAutomationgetAutomationQuery>(getAutomation, {
		automationId: automationId
	})

	const listDownData = data.getAutomation?.type === "orders" ?
		variables.fields.default.item :
		variables.fields.default.contact ;

	const [localMetaFields, setLocalMetaFields] = useState<MetaFields>(data.getAutomation?.metaFields!);
	const [group, setGroup] = useState(data.getAutomation!.group);

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
		<div className="new">		
			<div className="container-full">
				<div className="step-content fields-mapping">
					<div className="content-header">
						<h2>Map your spreadsheet fields</h2>
						<p>
							Update your automation fields mapping.
						</p>
					</div>
					{
						errors[""] &&
						<div className="alert alert-danger mt-3" role="alert">
							<h4 className="alert-title">Error&hellip;</h4>
							<div className="text-muted">{errors[""]}</div>
						</div>
					}
					<div className="content full-content">
						<div className="d-flex flex-column overflow-hidden">
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
																	isNewlyCreated={false}
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
															value={listDownData.find(elem => localMetaFields[element].value == elem.value)}
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
								data.getAutomation?.type === "orders" && <GroupAutomations value={group} setValue={setGroup} />
							}
						</div>
					</div>
					<Actions
						prev={() => {
							setAutomationId("");
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
									automationId,
									metaFields: localMetaFields,
									group
								},
								onCompleted() {
									setAutomationId("");
								},
								onError
							});
						}}
					/>
				</div>
			</div>
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

const getAutomation = graphql`
	query editAutomationgetAutomationQuery($automationId: String!) {
		getAutomation(automationId: $automationId){
			id
			_id
			created_at
			metaFields
			type
			group
		}
	}
`

const updateAutomation = graphql`
	mutation editAutomationUpdateAutomationMutation($metaFields: metaFields!, $automationId: String!, $group: Boolean!){
		updateAutomation(metaFields: $metaFields, automationId: $automationId, group: $group){
			id
			_id
			created_at
			metaFields
			type
			group
		}
	}
`