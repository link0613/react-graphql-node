const {
  TypeComposer
} = require('graphql-compose');

// Cache TTL for entity
const ENTITY_NAME = 'Script';
const ENTITY_TTL = 600;

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

const scriptActions = require('./script.actions');

const { cache, cacheSet } = require('../cache');

const {
  hxGetScriptById,
  hxGetScriptContent,
  hxGetScripts,
} = require('../api/hx');

async function getEntity(params) {
  return cache(hxGetScriptById, params.args.id, params);
}

async function getAllEntities(params) {
  return hxGetScripts(params.args);
}

const entityDefinition = TypeComposer.create(ENTITY_NAME);

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
  _id: GraphQLString,
  last_used_at: GraphQLString,
  url: GraphQLString,
  download: GraphQLString,
  content: {
    type: GraphQLString,
    resolve: (source) => {
      if (source.download) {
        return hxGetScriptContent(source._id).then((content) => {
          // TODO: Update cached instance with content
          return content;
        });
      }

      return null;
    }
  },
  _actions: {
    type: '[JSON]',
    resolve: (source) => {
      return scriptActions;
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
