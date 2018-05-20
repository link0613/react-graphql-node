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

const hostActions = require('./host.actions');

const { cache, cacheSet } = require('../cache');

const {
  hxGetHostSummary,
  hxGetHostSystemInformation,
  hxGetAllHosts
} = require('../api/hx');

async function getEntity(params) {
  return cache(hxGetHostSummary, params.args.id, params);
}

async function getAllEntities(params) {
  return cacheSet(hxGetAllHosts, params);
}

const entityDefinition = TypeComposer.create('Host');

entityDefinition.setRecordIdFn((entity) => {
  return entity._id;
});

entityDefinition.addResolver({
  name: 'findById',
  args: {
    id: 'String!'
  },
  type: entityDefinition,
  resolve: getEntity
});

entityDefinition.addResolver({
  name: 'findMany',
  args: {
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
    type: GraphQLString,
    description: 'The partial API URL to this entity excluding the api prefix and version'
  },

  acqs: {
    type: GraphQLInt,
    description: 'The number of acquisitions acquired for the host',
  },

  alerting_conditions: {
    type: GraphQLInt,
    description: 'The number of conditions that have alerted for the host',
  },

  agent_version: {
    type: GraphQLString,
    description: 'The agent version string of the host'
  },

  hostname: {
    type: GraphQLString
  },

  domain: {
    type: GraphQLString
  },

  containment_missing_software: {
    type: GraphQLBoolean
  },

  containment_queued: {
    type: GraphQLBoolean,
    description: 'Determines whether the host is queued for containment'
  },

  containment_state: {
    type: GraphQLString,
    description: 'The containment state of the host (normal|contain|contain_fail|containing|contained|uncontain|uncontaining|wtfc|wtfu)'
  },

  timezone: {
    type: GraphQLString
  },

  gmt_offset_seconds: {
    type: GraphQLInt
  },

  primary_ip_address: {
    type: GraphQLString
  },

  primary_mac: {
    type: GraphQLString
  },

  last_alert: {
    type: 'JSON',
    description: 'Partial Alert JSON * document, _id, and url fields'
  },

  last_alert_timestamp: {
    type: GraphQLString,
    description: 'The time stamp of the last alert for the host'
  },

  last_exploit_block: {
    type: GraphQLString
  },

  last_exploit_block_timestamp: {
    type: GraphQLString
  },

  last_audit_timestamp: {
    type: GraphQLString,
    description: 'The time stamp of the last audit run against the host'
  },

  last_poll_timestamp: {
    type: GraphQLString
  },

  last_poll_ip: {
    type: GraphQLString
  },

  initial_agent_checkin: {
    type: GraphQLString
  },

  reported_clone: {
    type: GraphQLBoolean,
    description: ''
  },

  has_execution_alerts: {
    type: GraphQLBoolean,
    description: 'Determines whether the  host has any execution alerts'
  },

  has_presence_alerts: {
    type: GraphQLBoolean,
    description: 'Determines whether the host has any presence alerts'
  },

  excluded_from_containment: {
    type: GraphQLBoolean,
    description: 'Determines whether the host is excluded from containment'
  },

  stats: {
    type: 'JSON'
  },

  os: {
    type: 'JSON'
  },

  sysinfo: {
    type: 'JSON',
    description: 'System information of the host',
    resolve: (source) => {
      if (source.sysinfo && source.sysinfo.url) {
        return hxGetHostSystemInformation(source._id).then((sysinfo) => {
          // TODO: Update cached instance with sysinfo
          return sysinfo;
        });
      } else if (!source.sysinfo) {
        return hxGetHostSystemInformation(source._id).then((sysinfo) => {
          // TODO: Update cached instance with sysinfo
          return sysinfo;
        });
      }

      return source.sysinfo;
    }
  },

  _actions: {
    type: '[JSON]',
    description: 'List of actions which can be performed on the entity',
    resolve: (source) => hostActions
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
