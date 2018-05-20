// Cache TTL for entity
const ENTITY_NAME = 'Case';

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

const jsonpatch = require('fast-json-patch');
const caseDataChangeEntity = require('./case_data_change');
const caseLogEntity = require('./case_log');
const caseAttachmentEntity = require('./case_attachment');

const _ = require('lodash');
const moment = require('moment');

const { cache, cacheSet } = require('../cache');

const caseActions = require('./case.actions');

const casesMock = [
  {
    _id: 'rwWKDQsjp3',
    creator: 'admin',
    reporter: 'admin',
    assignee: 'admin',
    summary: 'Example Investigation',
    description: '',
    priority: 'high',
    status: 'in-progress',
    resolution: 'unresolved',
    created_date: moment().subtract(4, 'days').toISOString(),
    updated_date: moment().subtract(3, 'days').toISOString(),
    due_date: null,
    resolution_date: null
  },
  {
    _id: 'l2AE4cJOKk',
    creator: 'nick',
    reporter: 'nick',
    assignee: 'nick',
    summary: 'Sample Investigation Board',
    description: '',
    priority: 'low',
    status: 'open',
    resolution: 'unresolved',
    created_date: moment().subtract(3, 'days').toISOString(),
    updated_date: moment().subtract(1, 'days').toISOString(),
    due_date: null,
    resolution_date: null
  },
  {
    _id: 'vcKA8l9goD',
    creator: 'andrey',
    reporter: 'andrey',
    assignee: 'andrey',
    summary: 'Tracing Attack Vector',
    description: '',
    priority: 'high',
    status: 'open',
    resolution: 'unresolved',
    created_date: moment().subtract(2, 'days').toISOString(),
    updated_date: moment().subtract(3, 'hours').toISOString(),
    due_date: null,
    resolution_date: null
  }
];

async function getEntity(params) {
  const { cacheLayer, cacheIndex } = global;

  if (cacheLayer) {
    const { source, args, context, info, projection} = params;
    const indexName = `${cacheIndex}_${String(info.returnType).toLowerCase()}`;

    return casesMock.find((el) => el._id === args.id);

/*
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
*/
  }

  return null;
}

function getMock(params) {
  return Promise.resolve(casesMock);
}

async function getAllEntities(params) {
  return cacheSet(getMock, params);
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
  reporter: GraphQLString,
  assignee: GraphQLString,
  summary: GraphQLString,
  description: GraphQLString,
  priority: GraphQLString,
  status: GraphQLString,
  resolution: GraphQLString,
  created_date: GraphQLString,
  updated_date: GraphQLString,
  due_date: GraphQLString,
  resolution_date: GraphQLString,
  nodes: {
    type: '[JSON]',
    resolve: (source) => {
      return [
        {
          id: 'e67iCAi5jQKuSK4OJW0yZc',
          title: 'coral-vista32',
          timestamp: 1523478279,
        },
        {
          id: '5Uglf56cqj3BLzbJEKayuF',
          title: 'qa-ag-win764',
          timestamp: 1523390400,
        },
        {
          id: 'iDvKqqUp818uRFq59jic7O',
          title: 'alex08v23-x',
          timestamp: 1523217600
        },
        {
          id: '8RQyilQ9sUsFwAhj0Mzz6A',
          title: 'qa-lh-xpxps332',
          timestamp: 1523117600
        }
      ];
    }
  },
  edges: {
    type: '[JSON]',
    resolve: (source) => {
      return [
        {
          from: 'e67iCAi5jQKuSK4OJW0yZc',
          to: '5Uglf56cqj3BLzbJEKayuF'
        },
        {
          from: 'e67iCAi5jQKuSK4OJW0yZc',
          to: 'iDvKqqUp818uRFq59jic7O'
        }
      ];
    }
  },
  activity: {
    type: '[JSON]',
    resolve: (source) => {
      return [

      ];
    }
  },
  _actions: {
    type: '[JSON]',
    resolve: (source) => {
      return caseActions;
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
