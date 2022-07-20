import React, {useRef, useState} from "react";
import ReactDOM from "react-dom";
import IconStatusCircle from "../../../assets/icons/status-circle";
import { IconExternalLink, IconTrash, IconEdit } from "@tabler/icons";
import { graphql } from "relay-runtime";
import type { cellUpdateActiveMutation } from "./__generated__/cellUpdateActiveMutation.graphql"
import { useMutation } from "react-relay";
import type { appGetAccountQuery$data } from "../../pages/app/__generated__/appGetAccountQuery.graphql"
import DeleteAutomation from "./delete_automation_modal";


interface props { 
  automation: appGetAccountQuery$data['googleAccount']['automations'][number],
  setAutomationEdit: (a: string) => void
}

export default function Cell({ automation, setAutomationEdit }: props) {
  const [commitActivation, loadingActivation] = useMutation<cellUpdateActiveMutation>(updateAutoActive);
  const [isOpen, setIsOpen] = React.useState(false);
  const [showDelete, setShowDelete] = useState(false);
  
  return (
    <>
      {ReactDOM.createPortal(showDelete && <DeleteAutomation setIsDelete={setShowDelete} automationId={automation._id} />, document.getElementById('modals'))}
      <td>{automation.spreadsheet!.node!.name}</td>
      <td className="text-uppercase">{automation.type}</td>
      <td className="text-muted td_status">
        <span className="dropdown">
          <button
            className={`btn dropdown-toggle align-text-top automation-status`}
            data-bs-boundary="viewport"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            id="selectStatus"
          >
            <IconStatusCircle
              size={14}
              className="automation-status-icon"
              color={automation.active ? "#4FBB87" : "#FF4949"}
            />
            {automation.active ? "Enabled" : "Disabled"}
          </button>

          {
		          <ul className="dropdown-menu" aria-labelledby="selectStatus" >
		            <li onClick={() => {
		              if(loadingActivation) return;
		              setIsOpen(false);
		              commitActivation({variables: {
		                automationId: automation._id
		              }})
		            }}
		            className={`dropdown-item ${automation.active && "active"}`}>
		              <IconStatusCircle size={14} className="automation-status-icon" color="#4FBB87" />
		              Active
		            </li>
		            <li onClick={() => {
		              if(loadingActivation) return;
		              setIsOpen(false);
		              commitActivation({variables: {
		                automationId: automation._id
		              }})
		            }}
		             className={`dropdown-item ${!automation.active && "active"}`}>
		              <IconStatusCircle size={14} className="automation-status-icon" color="#FF4949" />
		              Inactive
		            </li>
		          </ul>
          }
        </span>
      </td>
      <td className="text-muted">{(automation.created_at.split(" "))[0]}</td>
      <td>
        <a href={`https://docs.google.com/spreadsheets/d/${automation.spreadsheet!.node!.id}/edit#gid=${automation.sheetId}`} target="_blank" className="btn btn-more external-sheet-link me-3"> 
          <IconExternalLink size={40} />
        </a>
        <button type="button" className="btn btn-more me-3" onClick={() => {
          setAutomationEdit(automation._id);
        }}>
          <IconEdit size={40} />
        </button>
        <button type="button" className="btn btn-more" onClick={() => {
          setShowDelete(true);
        }}>
          <IconTrash size={40} />
        </button>
      </td>
    </>
  );
}


const updateAutoActive = graphql`
  mutation cellUpdateActiveMutation($automationId: String!) {
    updateAutoActivation(automationId: $automationId){
      id
      automations {
        id
        active
      }
    }
  }

`