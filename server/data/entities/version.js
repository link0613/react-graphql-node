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

const {
  hxGetVersion
} = require('../api/hx');

async function getEntity({ source, args, context, info }) {
  return hxGetVersion().then((entity) => {
    return entity;
  });
}

const entityDefinition = TypeComposer.create('Version');

entityDefinition.setRecordIdFn((entity) => {
  return entity._id;
});

entityDefinition.addResolver({
  name: 'findById',
  args: {
  },
  type: entityDefinition,
  resolve: getEntity
});

entityDefinition.addResolver({
  name: 'findMany',
  args: {
  },
  type: [entityDefinition],
  resolve: () => null
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

  msoVersion: {
    type: GraphQLString
  },

  applianceId: {
    type: GraphQLString
  },

  version: {
    type: GraphQLString
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
