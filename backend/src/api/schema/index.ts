const types = require('./types');
import * as graphql from 'graphql';

import {
  getAppAccount,
  createGoogleAccount,
  getSpreedSheets,
  createSpreadSheet,
  getSheets,
  getSpreedSheetsHeaderColumns,
  createAutomation,
  updateActivation,
  deleteAutomation,
  disconnect,
  getAutomation,
  metaFields,
  updateAutomation,
  updateRevokedAccount,
} from './resources';

const Query = new graphql.GraphQLObjectType({
  name: "Query",
  fields: () => ({
    googleAccount: {
      type: graphql.GraphQLNonNull(types.AppAccount),
      resolve: getAppAccount
    },
    getSpreedSheets: {
      type: graphql.GraphQLNonNull(types.GetSpreedSheets),
      args: {
        nextPageToken: { type: graphql.GraphQLString },
        first: { type: graphql.GraphQLInt },
        after: { type: graphql.GraphQLString },
        endCursor: { type: graphql.GraphQLString }
      },
      resolve: getSpreedSheets
    },
    getSheets: {
      type: graphql.GraphQLNonNull(graphql.GraphQLList(graphql.GraphQLNonNull(types.sheet))),
      args: {
        spreadsheetId: { type: graphql.GraphQLString }
      },
      resolve: getSheets
    },
    getSpreadSheetHeaderColumns: {
      type: graphql.GraphQLNonNull(graphql.GraphQLList(graphql.GraphQLNonNull(graphql.GraphQLString))),
      args: {
        spreadsheetId: {type: graphql.GraphQLNonNull(graphql.GraphQLString)},
        sheetId: {type: graphql.GraphQLNonNull(graphql.GraphQLInt)}
      },
      resolve : getSpreedSheetsHeaderColumns
    },
    getAutomation: {
      type: types.getAutomation,
      args: {
        automationId: {type: graphql.GraphQLNonNull(graphql.GraphQLString)}
      },
      resolve: getAutomation
    }
  })
});

const Mutation = new graphql.GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    addGoogleAccount: {
      type: graphql.GraphQLNonNull(types.AppAccount),
      args: {
        token: { type: graphql.GraphQLNonNull(graphql.GraphQLString) }
      },
      resolve: createGoogleAccount
    },
	updateRevokedAccount: {
		type: graphql.GraphQLNonNull(types.AppAccount),
		args: {
			token: { type: graphql.GraphQLNonNull(graphql.GraphQLString) }
		},
		resolve: updateRevokedAccount
	},
    createSpreedsheet: {
      type: types.CreateSpreadSheet,
      args: {
        title: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
        sheetTitle: { type: graphql.GraphQLNonNull(graphql.GraphQLString) }
      },
      resolve: createSpreadSheet
    },
    createAutomation: {
      type: graphql.GraphQLNonNull(types.AppAccount),
      args: {
        spreadsheetId: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
        sheetId: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) },
        metaFields: {type: metaFields},
        group: {type: graphql.GraphQLNonNull(graphql.GraphQLBoolean)},
        automationType: { type: new graphql.GraphQLInputObjectType({
          name: 'automationType',
          fields: () => ({
            contacts: { type : graphql.GraphQLNonNull(graphql.GraphQLBoolean) },
            orders : { type: graphql.GraphQLNonNull(graphql.GraphQLBoolean) }
          })
        }) },
		tags: {type: graphql.GraphQLString}
      },
      resolve: createAutomation
    },
    updateAutoActivation: {
      type: graphql.GraphQLNonNull(types.AppAccount),
      args: {
        automationId: {type: graphql.GraphQLNonNull(graphql.GraphQLString)}
      },
      resolve: updateActivation
    },
    updateAutomation: {
      type: types.getAutomation,
      args: {
        metaFields: { type : graphql.GraphQLNonNull(metaFields) },
        automationId: { type : graphql.GraphQLNonNull(graphql.GraphQLString) },
        group: {type: graphql.GraphQLNonNull(graphql.GraphQLBoolean)}
      },
      resolve: updateAutomation
    },
    deleteAutomation: {
      type: graphql.GraphQLNonNull(types.AppAccount),
      args: {
        automationId: {type: graphql.GraphQLNonNull(graphql.GraphQLString)}
      },
      resolve: deleteAutomation
    },
    disconnect: {
      type: graphql.GraphQLNonNull(types.AppAccount),
      resolve: disconnect
    }
  })
});



export default new graphql.GraphQLSchema({
  query: Query,
  mutation: Mutation,
});