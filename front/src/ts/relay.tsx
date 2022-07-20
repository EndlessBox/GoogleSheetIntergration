import React from 'react';

import {
  RelayEnvironmentProvider
} from 'react-relay';

import {
  Environment,
  Network,
  RecordSource,
  Store,
} from 'relay-runtime';
import {Token} from "./data";

export const store = new Store(new RecordSource());

type HttpError = {
  message: string
  key: string
  path: string[]
  name: string
}

export function Relay(props: {children: React.ReactNode}){

  const token = React.useContext(Token);

  const environment = React.useMemo(
    function(){
      return new Environment({
        network: Network.create(
          function (operation, variables) {
            return (
              fetch(
                process.env.ApiURL + 'api',
                {
                  method: 'post',
                  body: JSON.stringify({
                    query: operation.text,
                    variables
                  }),
                  headers: {
                    'authorization': 'bearer ' + token,
                    'Content-Type': 'application/json; charset=UTF-8'
                  }
                },
              )
              .then(resp => resp.json())
              .then(
                response => {
                  if(response.errors){
                    const er: any = new Error('ServerError');
                    er.data = response.data;
                    er.errors = response.errors;
                    return Promise.reject(er);
                  }
                  return response;
                }
              )
            );
          }
        ),
        store
      });
    },
    [token]
  );

  return(
    <RelayEnvironmentProvider environment={environment} >
      {props.children}
    </RelayEnvironmentProvider>
  );
}