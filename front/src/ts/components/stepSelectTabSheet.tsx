import React, { useEffect } from "react";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";
import type {stepSelectTabSheetgetsheetsQuery} from "./__generated__/stepSelectTabSheetgetsheetsQuery.graphql"
import { SheetTab } from "./modals/sheetTab";
import {Actions} from "./stepMetafields";

interface props {
  selectedSpreedsheet: {
      id: string;
      name: string;
  },
  setSelectedSheet: React.Dispatch<React.SetStateAction< props["selectedSheet"] >>,
  selectedSheet: {id: number; name: string; } | null
  setActiveStep: (a: number) => void
}


export default function StepSelectTabSheet({ selectedSpreedsheet, setSelectedSheet , selectedSheet, setActiveStep}: props) {
  const sheets = useLazyLoadQuery<stepSelectTabSheetgetsheetsQuery>(getSheetsQuery, {spreadId: selectedSpreedsheet.id});
  return (
    <div className="step-content select-sheet-tab">
      <div className="content-header">
      <div className="content-header">
        <h2>3. Select a tab in your spreadsheet</h2>
        </div>
      </div>
      <div className="content">
        <div className="form-selectgroup form-selectgroup-boxes d-flex flex-column sheet-tabs">
          {sheets.getSheets!.map((sheet) => (
            <label className="form-selectgroup-item flex-fill sheet-tab-item" key={sheet.properties.sheetId}>
              <SheetTab name={sheet.properties.title} id={sheet.properties.sheetId} selectedSheet={selectedSheet} setSelectedSheet={setSelectedSheet}  />
            </label>
          ))}
        </div>
      </div>
      <Actions
      	prev={() => setActiveStep(2)}
      	next={() => setActiveStep(4)}
      	disableNext={!selectedSheet}
      />
    </div>
  );
}


const getSheetsQuery = graphql`
  query stepSelectTabSheetgetsheetsQuery($spreadId: String!){
    getSheets(spreadsheetId: $spreadId) {
      properties{
        sheetId
        title
      }
    }
  }
`
