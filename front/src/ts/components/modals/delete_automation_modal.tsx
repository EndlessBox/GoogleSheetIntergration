import React from "react";
import { useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import type {deleteAutomationModalDeleteAutomationMutation} from "./__generated__/deleteAutomationModalDeleteAutomationMutation.graphql"

interface props {
  setIsDelete : (a:boolean) => void,
  automationId: string
}

export default function DeleteAutomation({ setIsDelete, automationId }: props) {
  const [commitDelete, loadingDelete] = useMutation<deleteAutomationModalDeleteAutomationMutation>(deleteAutomation);
  return (
    <div
      className="modal modal-blur fade show modal-dialog2"
      id="modal-simple"
      role="dialog"
      aria-modal="true"
      style={{ display: "block" }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Delete automation</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={() => setIsDelete(false)}
            ></button>
          </div>
          <div className="modal-body">
            Are you sure you want to delete this automation? This action cannot be undone.
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn me-auto"
              data-bs-dismiss="modal"
              onClick={() => setIsDelete(false)}
            >
              Cancel
            </button>
            <button type="button" className={`btn btn-danger ${loadingDelete ? "btn-loading": ""}`} data-bs-dismiss="modal" onClick={() => {
              commitDelete({
                variables: {
                  automationId
                },
                onCompleted() {
                  setIsDelete(false);
                }
              })
            }}>
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const deleteAutomation = graphql`
  mutation deleteAutomationModalDeleteAutomationMutation($automationId: String!) {
    deleteAutomation(automationId: $automationId){
      id
      automations {
        id
      }
    }
  }
`