const {
  TypeComposer
} = require('graphql-compose');

// Cache TTL for entity
const ENTITY_NAME = 'IndicatorCategory';
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

const indicatorCategoryActions = require('./indicator_category.actions');

const { cache, cacheSet } = require('../cache');

const {
  hxGetIndicatorCategoryByName,
  hxGetIndicatorCategories,
} = require('../api/hx');

async function getEntity(params) {
  return cache(hxGetIndicatorCategoryByName, params.args.category, params);
}

async function getAllEntities({ source, args, context, info }) {
  return hxGetIndicatorCategories().then((entity) => {
    return entity;
  });
}

const entityDefinition = TypeComposer.create(ENTITY_NAME);

entityDefinition.setRecordIdFn((entity) => {
  return entity._id;
});

entityDefinition.addResolver({
  name: 'findById',
  args: {
    category: 'String!',
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
  _revision: GraphQLString,
  name: GraphQLString,
  display_name: GraphQLString,
  uri_name: GraphQLString,
  url: GraphQLString,
  retention_policy: GraphQLString,
  ui_edit_policy: GraphQLString,
  ui_signature_enabled: GraphQLBoolean,
  ui_source_alerts_enabled: GraphQLBoolean,
  _actions: {
    type: '[JSON]',
    resolve: (source) => {
      return indicatorCategoryActions;
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
