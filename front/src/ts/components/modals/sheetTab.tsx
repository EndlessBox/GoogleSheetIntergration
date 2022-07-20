import React from "react";

interface props {
  name: string,
  id: number,
  setSelectedSheet: React.Dispatch<React.SetStateAction<props["selectedSheet"]>>,
  selectedSheet: {
    id: number;
    name: string;
  } | null,
}

export function SheetTab ({ name, id, setSelectedSheet, selectedSheet}: props) {
    return (
      <>
        <input type="radio" name="form-payment" value="visa" className="form-selectgroup-input" onChange={() => {setSelectedSheet({id, name})}} checked={name === selectedSheet?.name && id === selectedSheet?.id ? true : false }  />
        <div className="form-selectgroup-label d-flex align-items-center p-3" >
          <div className="me-3">
            <span className="form-selectgroup-check"></span>
          </div>
          <span>{name}</span>
        </div>
      </>
    );
  }