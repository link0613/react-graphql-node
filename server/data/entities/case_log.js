// Cache TTL for entity
const ENTITY_NAME = 'CaseLog';

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

const { TypeComposer } = require('graphql-compose');
const composeWithRelay = require('graphql-compose-relay').default;
const composeWithConnection = require('graphql-compose-connection').default;

const _ = require('lodash');

const caseLogActions = require('./case_log.actions');

async function getEntity(params) {
  const { cacheLayer, cacheIndex } = global;

  if (cacheLayer) {
    const { source, args, context, info, projection} = params;
    const indexName = `${cacheIndex}_${String(info.returnType).toLowerCase()}`;

    return cacheLayer.get(
      {
        index: indexName,
        type: String(info.returnType),
        id: String(args.id)
      })
      .then((cachedEntity) => {
        return {
          _id: args.id,
          ...cachedEntity._source
        };
      })
      .catch((error) => {
        return error;
      });
  }

  return null;
}

async function getAllEntities(params) {
  return null;
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
  creator: GraphQLString,
  description: GraphQLString,
  created_date: GraphQLString,
  updated_date: GraphQLString,
  severity: GraphQLString,
  attachments: [GraphQLString],
  _actions: {
    type: '[JSON]',
    resolve: (source) => {
      return caseLogActions;
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
