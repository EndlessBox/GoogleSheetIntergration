import React, {useState} from "react";
import { IconTrash } from "@tabler/icons";
import {setIn} from "immutable";

interface props {
  fieldName: string,
  id: string,
  setLocalMetaFields: React.Dispatch<React.SetStateAction<{}>>,
  localMetaFields: MetaFields,
  submitted: boolean
  isNewlyCreated: boolean
}


export default function HeadCell ({ isNewlyCreated, fieldName, id, setLocalMetaFields, localMetaFields, submitted }: props) {
  const [inputContent, setInputContent] = useState(fieldName);  
  return (
    <>
      <input
        className={`form-control ${submitted && localMetaFields[id].active && (inputContent === "") ? 'is-invalid' : ''} `}
        defaultValue={fieldName}
        placeholder="Enter column Name ..."
        onChange={(e) => {
          setInputContent(e.target.value);
          setLocalMetaFields((prev) => {
            return setIn(prev, [id, "column"], e.target.value);
          });
        }}
      />
      <label className="form-check form-switch">
      	{
      	 	!isNewlyCreated  ?
	      	 	<input
	      	    className="form-check-input"
	      	    type="checkbox"
	      	    checked={localMetaFields[id].active}
	      	    onChange={(event) => {
	      	      setLocalMetaFields(prev => {
	      	        let newState = {...prev}
	      	        newState[id] = {column: prev[id].column, value: prev[id].value, active: event?.target.checked}
	      	        return newState
	      	      })
	      	    }}
	      	  /> :
	      	  <button type="button" className="btn btn-more" onClick={() => {
	      	    setLocalMetaFields(prev => {
	      	      let newState = {...prev}
	      	      delete newState[id]
	      	      return newState
	      	    })
	      	  }}>
	      	    <IconTrash size="20px" />
	      	  </button>
      	}
      </label>
    </>
  );
};