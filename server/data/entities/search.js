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

const searchActions = require('./search.actions');

const {
  hxGetSearchById,
  hxGetSearches,
  hxGetSearchHosts
} = require('../api/hx');

async function getEntity(params) {
  return hxGetSearchById(params.args.id);
}

async function getAllEntities(params) {
  return hxGetSearches(params.args);
}

const entityDefinition = TypeComposer.create('Search');

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
    description: ''
  },

  state: {
    type: GraphQLString,
    description: ''
  },

  update_time: {
    type: GraphQLString,
    description: ''
  },

  create_time: {
    type: GraphQLString,
    description: ''
  },

  _revision: {
    type: GraphQLString,
    description: ''
  },

  input_type: {
    type: GraphQLString,
    description: ''
  },

  update_actor: {
    type: 'JSON',
    description: ''
  },

  create_actor: {
    type: 'JSON',
    description: ''
  },

  script: {
    type: 'JSON',
    description: ''
  },

  host_set: {
    type: 'JSON',
    description: ''
  },

  hosts: {
    type: 'JSON',
    description: '',
    resolve: (source) => {
      if (source._id) {
        return hxGetSearchHosts(source._id);
      }

      return null;
    }
  },

  settings: {
    type: 'JSON',
    description: ''
  },

  stats: {
    type: 'JSON',
    description: ''
  },

  error: {
    type: GraphQLString,
    description: ''
  },

  _actions: {
    type: '[JSON]',
    description: 'List of actions which can be performed on the entity',
    resolve: (source) => {
      return searchActions;
    }
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
