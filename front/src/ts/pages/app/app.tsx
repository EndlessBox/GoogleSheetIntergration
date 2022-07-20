import React, { Suspense } from "react";
import { graphql, loadQuery, useQueryLoader, useRelayEnvironment } from "react-relay";
import type { appGetAccountQuery } from "./__generated__/appGetAccountQuery.graphql";
import Loading from "../../components/modals/loading";
import Main from "./main";

export default function App() {

  const env = useRelayEnvironment();
  const accountPrelodedQuery = React.useMemo(() => {
    return loadQuery<appGetAccountQuery>(
      env,
      getAccount,
      {}
    )
  }, [])

  const [accountQueryRef, accountForceReload] =  useQueryLoader(getAccount, accountPrelodedQuery);

  return (
      <Suspense fallback={<Loading />}>
        <Main accountQueryRef={accountQueryRef} />
      </Suspense>
  )
}

export const getAccount = graphql`
  query appGetAccountQuery {
    googleAccount {
      id
      _id
      account {
        id
        _id
        email
        name
        given_name
        family_name
        picture
		revoked
      }
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