const {
  TypeComposer
} = require('graphql-compose');

const {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInterfaceType,
  GraphQLUnionType,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLDirective
} = require('graphql');

const composeWithRelay = require('graphql-compose-relay').default;
const composeWithConnection = require('graphql-compose-connection').default;

const _ = require('lodash');

const { cache, cacheSet } = require('../cache');

const {
  hxGetAlert,
  hxGetHostSummary,
  hxGetAlertsAllHosts,
  hxGetFilteredAlertsAllHosts,
  hxGetConditionById
} = require('../api/hx');

const alertActions = require('./alert.actions');

async function getEntity(params) {
  return cache(hxGetAlert, params.args.id, params);
}

async function getAllEntities(params) {
  return cacheSet(hxGetAlertsAllHosts, params);
}

const entityDefinition = TypeComposer.create('Alert');

entityDefinition.setRecordIdFn((entity) => {
  return entity._id;
});

entityDefinition.addResolver({
  name: 'findById',
  description: 'Get Alert by ID',
  args: {
    id: 'String!'
  },
  type: entityDefinition,
  resolve: getEntity
});

entityDefinition.addResolver({
  name: 'findMany',
  description: 'Get List of Alerts for All Hosts',
  args: {
    _id: 'String',
    agent___id: 'String',
    condition___id: 'String',
    source: 'String'
  },
  type: [entityDefinition],
  resolve: getAllEntities
});

entityDefinition.addResolver({
  name: 'count',
  args: {
  },
  type: GraphQLInt,
  resolve: () => 0
});

entityDefinition.addFields({
  _id: {
    type: GraphQLString
  },

  url: {
    type: GraphQLString
  },

  event_id: {
    type: GraphQLString
  },

  event_type: {
    type: GraphQLString
  },

  event_values: {
    type: 'JSON'
  },

  event_at: {
    type: GraphQLString
  },

  matched_at: {
    type: GraphQLString
  },

  reported_at: {
    type: GraphQLString
  },

  source: {
    type: GraphQLString
  },

  resolution: {
    type: GraphQLString
  },

  agent: {
    type: 'JSON',
    description: 'ID of host where the alert has been triggered',
  },

  host: {
    type: 'JSON',
    description: 'Details of the host where the alert has been triggered',
    resolve: (source) => {
      if (source.agent && source.agent._id) {
        const cacheParams = {
          args: {
            id: source.agent._id
          },
          info: {
            returnType: 'Host'
          }
        };

        return cache(hxGetHostSummary, source.agent._id, cacheParams);
      }

      return null;
    }
  },

  condition: {
    type: 'JSON'
  },

  condition_details: {
    type: 'JSON',
    description: 'Details of the condition which has been triggered for the alert',
    resolve: (source) => {
      if (source.condition && source.condition._id) {
        const cacheParams = {
          args: {
            id: source.condition._id
          },
          info: {
            returnType: 'Condition'
          }
        };

        return cache(hxGetConditionById, source.condition._id, cacheParams);
      }

      return null;
    }
  },

  matched_source_alerts: {
    type: 'JSON'
  },

  title: {
    type: GraphQLString,
    resolve: (source) => {
      return null;
    }
  },

  _actions: {
    type: '[JSON]',
    description: 'List of actions which can be performed on the entity',
    resolve: (source) => alertActions
  }
});

module.exports = composeWithConnection(composeWithRelay(entityDefinition), {
  findResolverName: 'findMany',
  countResolverName: 'count',
  sort: {
    _ID_ASC: {
      value: { _id: 1 },
      cursorFields: ['_id'],

      beforeCursorQuery: (rawQuery, cursorData, resolveParams) => {
        if (!rawQuery._id) rawQuery._id = {};
        rawQuery._id.$lt = cursorData._id;
      },

      afterCursorQuery: (rawQuery, cursorData, resolveParams) => {
        if (!rawQuery._id) rawQuery._id = {};
        rawQuery._id.$gt = cursorData._id;
      },
    },

    _ID_DESC: {
      value: { _id: -1 },
      cursorFields: ['_id'],

      beforeCursorQuery: (rawQuery, cursorData, resolveParams) => {
        if (!rawQuery._id) rawQuery._id = {};
        rawQuery._id.$gt = cursorData._id;
      },

      afterCursorQuery: (rawQuery, cursorData, resolveParams) => {
        if (!rawQuery._id) rawQuery._id = {};
        rawQuery._id.$lt = cursorData._id;
      },
    }
  }
});
