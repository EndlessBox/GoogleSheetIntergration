import React from "react";
import { IconLogout, IconPlus } from "@tabler/icons";
import DisconnectModal from "./modals/disconnect_modal";
import type {appGetAccountQuery$data} from "../pages/app/__generated__/appGetAccountQuery.graphql"

interface props {
    setNewAut: React.Dispatch<React.SetStateAction<boolean>>,
    account: NonNullable<appGetAccountQuery$data['googleAccount']['account']>
}

export default function Header({setNewAut, account}: props) {
  const [disconnect, setDisconnect] = React.useState(false);
  const [show, setShow] = React.useState(false);

  return (
    <div className="page-header">
      <div className="row align-items-center">
        <div className="col">
          <h1 className="page-title">
            Automations - <span>{account.given_name}'s</span>
          </h1>
        </div>
        <div className="actions col-auto ms-auto">
          <button onClick={() => setNewAut(true)} className="btn btn-primary d-none d-sm-inline-block">
            <IconPlus />
            Create new report
          </button>
          <span className="divider-vertical"></span>
          <div className="dropdown">
            <button
              className={`btn btn-outline dropdown-toggle connected-acc ${show ? "show": ""}`}
              type="button"
              id="dropdownMenuButton11"
              data-bs-toggle="dropdown"
              aria-expanded={show}
              onClick={() => {
                setShow(prev => !prev)
              }}
            >
              {account.picture ? (
                <span
                  className="avatar rounded-circle"
                  style={{ backgroundImage: `url("${account.picture}")` }}
                ></span>
              ) : (
                <span className="avatar rounded-circle">{account.given_name.charAt(0)}</span>
              )}
              <span className="acc-name">{account.given_name}</span>
              {/* <IconLogout /> */}
            </button>
            <ul className={`dropdown-menu dropdown-menu-end ${show ? "show" : ""}`} aria-labelledby="dropdownMenuButton11">
              <li>
                <button className="btn btn-ghost-danger" onClick={() => setDisconnect(true)}>
                  <IconLogout />
                  Disconnect
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {disconnect && <DisconnectModal setDisconnect={setDisconnect} />}
    </div>
  );
}