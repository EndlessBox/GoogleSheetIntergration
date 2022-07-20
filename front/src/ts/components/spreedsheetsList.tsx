import React, { RefObject, Suspense } from "react"
import { graphql, loadQuery, PreloadedQuery, usePaginationFragment, usePreloadedQuery, useQueryLoader, useRelayEnvironment } from "react-relay";
import type { spreedsheetsListGetSpreedSheetsQuery } from "./__generated__/spreedsheetsListGetSpreedSheetsQuery.graphql";
import type { spreedsheetsPaginationQuery } from "./__generated__/spreedsheetsPaginationQuery.graphql"
import type { spreedsheetsListPagination$key } from "./__generated__/spreedsheetsListPagination.graphql";
import Loading from "./modals/loading";

interface props {
    setSelectedSpreedSheet: React.Dispatch<React.SetStateAction<{
        id: string;
        name: string;
    } | null>>

}

export default function SpreedSheetsList({ setSelectedSpreedSheet }: props) {
    const env = useRelayEnvironment();
    const getSpreedsheetsQuery = React.useMemo(() => {
        return loadQuery<spreedsheetsListGetSpreedSheetsQuery>(
            env, getAccountSpreedSheets, {
            nextPageToken: null,
            first: 10,
            after: ""
        }
        )
    }, [])
    const [googleSheetListQueryRef, googleSheetListForceReload] = useQueryLoader(getAccountSpreedSheets, getSpreedsheetsQuery)
	return (
		<Suspense  fallback={<Loading />}>
				<SpreedSheetsListContent setSelectedSpreedSheet={setSelectedSpreedSheet} queryRef={googleSheetListQueryRef} />
		</Suspense>
	)
}

interface propsContent {
	setSelectedSpreedSheet:React.Dispatch<React.SetStateAction<{
		id: string;
		name: string;
	} | null>>,
	queryRef: PreloadedQuery<spreedsheetsListGetSpreedSheetsQuery, Record<string, unknown>> | null | undefined

}

function SpreedSheetsListContent({setSelectedSpreedSheet, queryRef}: propsContent) {

	const sheetsData = usePreloadedQuery<spreedsheetsListGetSpreedSheetsQuery>(getAccountSpreedSheets, queryRef!)
    const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment<spreedsheetsPaginationQuery, spreedsheetsListPagination$key>(spreedsheetsFragement, sheetsData);


    function handleScroll(e) {
        let bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight
        if (bottom && hasNext) {
            loadNext(10);
        }
    }


    return <ul
        onScroll={handleScroll}
        className="dropdown-menu w-full"
        aria-labelledby="dropdownMenuButton3"

    >

        {data.getSpreedSheets!.edges!.map(element => {
            return <li onClick={() => {
                setSelectedSpreedSheet(element!.node!)
            }} key={element!.node!.id} className="dropdown-item">{element?.node!.name}</li>
        })}
        {hasNext && isLoadingNext && <div className="loading-content">
            <div className="spinner spinner-border spinner-sheets"></div>
        </div>}
    </ul>

}


const spreedsheetsFragement = graphql`
    fragment spreedsheetsListPagination on Query @refetchable(queryName: "spreedsheetsPaginationQuery"){
        getSpreedSheets(nextPageToken: $nextPageToken, first: $first, after: $after) @connection(key: "pagination__getSpreedSheets") {
            edges {
                node {
                    id
                    name
                }
            }
            pageInfo {
                hasNextPage
                endCursor
                hasPreviousPage
                startCursor
            }
        }
    }
`
const getAccountSpreedSheets = graphql`
query spreedsheetsListGetSpreedSheetsQuery ($nextPageToken: String, $first: Int, $after: String) {
    ...spreedsheetsListPagination
  }
`


