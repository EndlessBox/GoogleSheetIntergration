import React from "react";
import Cell from "./modals/cell";
import type { appGetAccountQuery$data } from "../pages/app/__generated__/appGetAccountQuery.graphql"

interface props { 
  automations: appGetAccountQuery$data['googleAccount']['automations'],
  setAutomationEdit: (a: string) => void
}

export default function AutomationsList({ automations, setAutomationEdit }: props) {

  return (
    <div className="table-responsive">
      <table className="table table-vcenter">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Status</th>
            <th>Date created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {automations.map((automation) => {
			if (automation)
            	return <tr key={automation.id}>
							<Cell
								automation={automation}
								setAutomationEdit={setAutomationEdit}
							/>
						</tr>
			else 
				return null
		  })}
        </tbody>
      </table>
    </div>
  );
}
