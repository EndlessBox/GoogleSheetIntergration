import { IconAlertTriangle } from "@tabler/icons";
import React from "react";
import { useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import type { disconnectModalDisconnectMutation } from "./__generated__/disconnectModalDisconnectMutation.graphql"

export default function DisconnectModal({ setDisconnect }) {

  const [commit, loading] = useMutation<disconnectModalDisconnectMutation>(disconnect)

  return (
    <div
      className="modal modal-blur fade show"
      id="modal-danger"
      role="dialog"
      aria-modal="true"
      style={{ display: "block" }}
    >
      <div className="modal-dialog modal-sm modal-dialog-centered" role="document">
        <div className="modal-content">
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
            onClick={() => setDisconnect(false)}
          ></button>
          <div className="modal-status bg-danger"></div>
          <div className="modal-body text-center py-4">
            <IconAlertTriangle className="mb-2 text-danger icon-lg" />
            <h3>Are you sure?</h3>
            <div className="text-muted">
              Do you really want to disconnect?
              <br />
              All the created automation will gonna be deleted and this action cannot be undone.
            </div>
          </div>
          <div className="modal-footer">
            <div className="w-100">
              <div className="row">
                <div className="col">
                  <button
                    className="btn w-100"
                    data-bs-dismiss="modal"
                    onClick={() => setDisconnect(false)}
                  >
                    Cancel
                  </button>
                </div>
                <div className="col">
                  <button
                    className={`btn btn-danger w-100 ${loading ? "btn-loading": ""}`}
                    data-bs-dismiss="modal"
                    onClick={() => {
                      commit({
                        variables: {}
                      })
                    }}
                  >
                    Yes, Disconnect
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const disconnect = graphql`
  mutation disconnectModalDisconnectMutation {
    disconnect {
      id
      account {
        id
      }
    }
  }
`