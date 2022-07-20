import React, { useEffect, useRef, useState } from "react";

interface props { 
	id: string,
	setLocalMetaFields:React.Dispatch<React.SetStateAction<{}>>,
	listDownData: {value: string, display: string}[],
	submitted: boolean,
	localMetaFields: MetaFields,
	value?: {value: string, display: string}
}

export default function Tbody ({value = {value:"", display: ""}, id, setLocalMetaFields, listDownData, submitted, localMetaFields}: props) {
			
	var listDownList = useRef<HTMLUListElement>(null);
	const [selectedValue, setSelectedValue] = useState(value);
	const [isCustom, setIsCustom] = useState(false);
	const [customField, setCustomField] = useState("");
	const customFieldInput = useRef<HTMLInputElement>(null);

	return (
		<td>
			<div className="field-select dropdown">
					
				<div className={`btn btn-outline select-btn dropdown-toggle form-select ${submitted && localMetaFields[id].active && ((selectedValue.value === "" && !isCustom) || (customField === "" && isCustom))  ? 'is-invalid' : ''}`}
					id="dropdownMenuButton1"
					data-bs-toggle="dropdown"
					aria-expanded="false"
					>
					<input
						ref={customFieldInput}
						value={isCustom ? customField : selectedValue.display}
						disabled={isCustom ? false : true}
						style={{ pointerEvents: `${isCustom ? "auto" : "none"}` }}
						placeholder="custom field"
						onChange={(e) => {
							setCustomField(e.target.value)
							setLocalMetaFields((prev) => {
								let newState = {...prev};
								newState[id] = {column: prev[id].column, value: `custom/${e.target.value}`, active: prev[id].active}
								return newState;
							})
						}}
					/>
				</div>

				{
					
						<ul
							className="dropdown-menu w-full"
							ref={listDownList}
							aria-labelledby="dropdownMenuButton1"
							>
								<li
									className="dropdown-item"
									onClick={() => {
										setIsCustom(true);
										setTimeout(() => customFieldInput.current!.focus(), 1);
										setLocalMetaFields((prev) => {
											let newState = {...prev};
											newState[id] = {column: prev[id].column, value: `custom/${customField}`, active: prev[id].active}
											return newState;
										})

									}}
								>
									Custom
								</li>

								{
									listDownData.map(element => {
											return <li onClick={() => {
												setIsCustom(false);
												setSelectedValue(element)
												setLocalMetaFields((prev) => {
													let newState = {...prev } 
													newState[id] = {column: prev[id].column, value: element.value, active: prev[id].active}
													return newState;
												})
											}} key={element.value} className="dropdown-item">{element.display}</li>
									})
								}

						</ul>
					
				}
			</div>
		</td>
	)
}