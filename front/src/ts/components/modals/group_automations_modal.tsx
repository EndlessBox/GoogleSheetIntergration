import React from "react";

interface props {
	value: boolean,
	setValue: (a:boolean | ((a :boolean) => boolean)) => void
}

export default function GroupAutomations({value, setValue}: props){
	return <div className="alert alert-primary group-items-label align-self-center" role="alert">
				<label className="form-check">
					<input className="form-check-input" type="checkbox" checked={value} onChange={() => {
						setValue(prev => (!prev))
					}} />
					<span className="form-check-label">
						Group items with the same order ID to one row.
					</span>
				</label>
			</div>
}