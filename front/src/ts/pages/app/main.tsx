import React, { Suspense, useEffect, useState } from "react";
import { PreloadedQuery, usePreloadedQuery } from "react-relay";
import Auth from "../../components/auth"
import type { appGetAccountQuery } from "./__generated__/appGetAccountQuery.graphql";
import Loading from "../../components/modals/loading";
import New from "../../components/new";
import Header from "../../components/header";
import AutomationsList from "../../components/automationsList";
import { getAccount } from "./app";
import EditAutomation from "../../components/editAutomation";

interface props {
    accountQueryRef: PreloadedQuery<appGetAccountQuery, Record<string, unknown>> | null | undefined
}


export default function Main ({accountQueryRef}: props) {
  const [newAuto, setNewAuto] = useState(false);
  const [automationEdit, setAutomationEdit] = useState<string>("");
  const data = usePreloadedQuery<appGetAccountQuery>(getAccount, accountQueryRef!)

  return (
    <>
      {
        data.googleAccount.account && !data.googleAccount.account.revoked ? 
          <React.Fragment>
            {
              data.googleAccount.automations.length > 0 &&
              !newAuto && !automationEdit &&
              <div className="home">
                <div className="container">
                  <Suspense fallback={<Loading  content="Loading Automations ..."/>} />
                    <Header setNewAut={setNewAuto} account={data.googleAccount.account} /> 
                    <AutomationsList automations={data.googleAccount.automations} setAutomationEdit={setAutomationEdit} /> 
                </div>
              </div>
            }
            {(!data.googleAccount.automations.length || newAuto) &&
              <Suspense fallback={<Loading />}>
                <New isFirst={!data.googleAccount.automations.length} setNewAuto={setNewAuto} />
              </Suspense>
            }
            {
              automationEdit && <EditAutomation automationId={automationEdit} setAutomationId={setAutomationEdit} />
            }
          </React.Fragment> :
          <Suspense fallback={<Loading />}>
            <Auth revoked={data.googleAccount.account?.revoked ?? false} />
          </Suspense>
      }
    </>
  )
}