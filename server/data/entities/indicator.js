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

const indicatorActions = require('./indicator.actions');

const {
  hxGetIndicatorByName,
  hxGetIndicatorCategories,
} = require('../api/hx');

async function getEntity({ source, args, context, info }) {
  return hxGetIndicatorByName(args.category, args.indicator).then((entity) => {
    return entity;
  });
}

async function getAllEntities({ source, args, context, info }) {
  //return fetchAllHosts(args);
}

const entityDefinition = TypeComposer.create('Indicator');

entityDefinition.setRecordIdFn((entity) => {
  return entity._id;
});

entityDefinition.addResolver({
  name: 'findById',
  args: {
    category: 'String!',
    indicator: 'String!'
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

  name: {
    type: GraphQLString,
    description: 'The indicator name as displayed in UI'
  },

  created_by: {
    type: GraphQLString,
    description: 'Information about who created an indicator as displayed in UI'
  },

  uri_name: {
    type: GraphQLString,
    description: 'Unique name or identifier of the indicator. This is the identifier used to reference this indicator in a URL'
  },

  _actions: {
    type: '[JSON]',
    description: 'List of actions which can be performed on the entity',
    resolve: (source) => {
      return indicatorActions;
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
