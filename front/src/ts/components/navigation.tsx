import { IconLogout } from "@tabler/icons";
import React from "react";
import { useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import G_sheet_full_logo from "../../assets/images/g-sheets-full-logo.svg";
import type { navigationDisconnectMutation } from "./__generated__/navigationDisconnectMutation.graphql"
import type {appGetAccountQuery$data} from "../pages/app/__generated__/appGetAccountQuery.graphql"

interface props {
    account: NonNullable<appGetAccountQuery$data['googleAccount']['account']>
    setNewAuto : React.Dispatch<React.SetStateAction<boolean>>
}

export default function Navigation({account, setNewAuto}: props) {

  const [commit, loading] = useMutation<navigationDisconnectMutation>(disconnect);
  
  return (
    <div className="navigation">
      <div className="container">
        <a onClick={() => {
          setNewAuto(false);
        }}>
          <img src={G_sheet_full_logo} alt="" className="logo" />
        </a>
        <div>
        <button
        	onClick={() => {
        		if(loading) return;
        		commit({variables: {}});
        	}}
        	className={"btn btn-ghost-danger " + (loading ? "btn-loading": "")}>
            <IconLogout />
            Disconnect
          </button>
          <span className="divider-vertical"></span>
          <div className="connected-acc">
            {account.picture ? (
              <span
                className="avatar rounded-circle"
                style={{ backgroundImage: `url("${account.picture}")` }}
              ></span>
            ) : (
              <span className="avatar rounded-circle">{account.name.charAt(0)}</span>
            )}

            <span className="acc-name">{account.given_name ?? account.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}



const disconnect = graphql`
  mutation navigationDisconnectMutation {
    disconnect {
      id
      account {
        id
      }
    }
  }
`