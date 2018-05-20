const fs = require('fs');
const path = require('path');

const express = require('express');
const graphQLHTTP = require('express-graphql');

const parseArgs = require('../utils/parseArgs');
const KernelMicrotask = require('../core/kernel/microtask');

const config = require('../config/environment');
const schemaComposer = require('../data/schema');

const elasticsearch = require('elasticsearch');
const _ = require('lodash');

const {
  TypeComposer,
  typeByPath,
  toInputObjectType,
  getProjectionFromAST
} = require('graphql-compose');

const client = new elasticsearch.Client({
  host: 'localhost:9200'
  //,
  //log: 'trace'
});

global.cacheIndex = 'athena';
global.cacheLayer = client;

const knownEntities = [
  'Host',
  'Alert',
  'Indicator',
  'Source',
  'Case'
];

const allowedSchemaOperations = [
  'addFields',
  'addRelation',
  'addResolver',
  'addInterface',
  'setField',
  'setFields',
  'setResolver',
  'setInterfaces',
  'removeField',
  'removeResolver',
  'removeInterface',
  'removeOtherFields',
  'reorderFields',
  'setRecordIdFn',
  'extendField',
  'deprecateFields',
  'makeFieldNonNull',
  'makeFieldNullable',
  'setTypeName',
  'setDescription',
  'wrapResolver',
  'wrapResolverAs',
  'wrapResolverResolve'
];

let master;
let graphql;
let activeServer;
let stopping = false;

/**
 *
 * @param options
 * @param err
 * @returns {Promise<void>}
 */
async function exitHandler(options, err) {
  if (err) {
    console.log(err.stack);
  }

  if (!stopping) {
    stopping = true;

    if (master) {
      master.logger.info('Stopping root process');
      await master.stop();
    }

    if (options.exit) {
      process.exit();
    }

    stopping = false;
  }
}

/**
 *
 */
function bindExitHandlers() {
  process.on('exit', exitHandler.bind(null, { cleanup: true }));

  // Catches ctrl+c event
  process.on('SIGINT', exitHandler.bind(null, { exit: true }));

  // Catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
  process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

  // Catches uncaught exceptions
  process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
}

/**
 *
 * @param plugins
 * @returns {Promise<void>}
 */
async function startPlugins(plugins) {
  if (plugins && Array.isArray(plugins) && (plugins.length > 0)) {
    for (let pluginName of plugins) {
      const pluginPath = path.join(__dirname, '..', 'plugins', pluginName);
      const pluginEntrypoint = path.join(pluginPath, 'index.js');

      if (fs.existsSync(pluginPath) && fs.existsSync(pluginEntrypoint)) {
        let plugin = require(`../plugins/${pluginName}`);
        let pluginInstance = new plugin(pluginName);
      }
    }
  }
}

/**
 *
 * @param msg
 * @param reply
 * @param ack
 * @param nack
 * @returns {Promise<void>}
 */
async function handleInboundMessage(msg, reply, ack, nack) {
  const ttl = 60 * 5 * 1000;

  if (msg.registerPlugin) {
    const pluginName = msg.registerPlugin;

    await master.subscribe(`plugin.${pluginName}.outbound`, (msg, reply, ack, nack) => {
      const { cacheLayer, cacheIndex } = global;

      if (cacheLayer && msg.body && msg.id && msg.entityType && msg.field) {
        return cacheLayer.get(
          {
            index: cacheIndex,
            type: String(msg.entityType),
            id: String(msg.id)
          })
          .then((entity) => {
            return cacheLayer.update({
              index: cacheIndex,
              type: String(msg.entityType),
              id: String(msg.id),
              body: {
                doc: {
                  [msg.field]: {
                    _ttl: (Date.now() + ttl),
                    ...msg.body,
                  }
                }
              }
            }).then(() => {
              ack();
            });
          })
          .catch((error) => {
            nack();
          });
      }

      ack();
    });

    if (msg.appendSchema) {
      const schema = msg.appendSchema;

      if (typeof schema === 'object') {
        const schemaKeys = Object.keys(schema).filter(key => knownEntities.includes(key));
        schemaKeys.forEach((entityType) => {
          const entitySchema = schema[entityType];
          const entityOperations = Object.keys(entitySchema).filter(opKey => allowedSchemaOperations.includes(opKey));

          entityOperations.forEach((entityOp) => {
            const typeCompose = schemaComposer.rootQuery().get(entityType.toLowerCase());

            if (typeCompose) {
              switch (entityOp) {
                case 'addFields':
                  typeCompose.addFields(entitySchema[entityOp]);
                  Object.keys(entitySchema[entityOp]).forEach((field) => {
                    typeCompose.extendField(field, {
                      resolve: (source) => {
                        if (source[field] && source[field]._ttl && (source[field]._ttl < (Date.now() + ttl))) {
                          return _.omit(source[field], '_ttl');
                        } else {
                          master.send(`plugin.${pluginName}.inbound`, {
                            getEntityData: {
                              id: source._id,
                              entityType: entityType,
                              field: field
                            }
                          });

                          return {
                            __typename: 'deferredJSON',
                            __expires: Math.round((Date.now() + ttl) / 1000, 0),
                            __state: 'RESOLVING',
                            __context: {
                              id: source._id,
                              entityType: entityType,
                              field: field
                            },
                            errors: []
                          };
                        }
                      }
                    });
                  });
                  break;

                default:
                  break;
              }
            }
          });
        });

        createGraphQLService();
      }
    }

    ack();
  }

  master.logger.debug('MSG (root.inbound)', msg);
}

/**
 *
 * @returns {Promise<*>}
 */
async function startApplication() {
  let args = parseArgs(process.argv.slice(2));

  if (args.core !== false) {
    master = new KernelMicrotask({});
    await master.subscribe('root.inbound', handleInboundMessage);
    startGraphQL();
  }

  if (typeof args.plugins === 'string' && args.plugins) {
    const plugins = args.plugins.split(',');
    await startPlugins(plugins);
  }

  bindExitHandlers();

  return master;
}

/**
 *
 * @returns {boolean}
 */
function isDevelopmentEnvironment() {
  return (config.env === 'development');
}

/**
 *
 */
async function createGraphQLService() {
  if (activeServer) {
    console.log('Schema updates detected - restarting GraphQL service');

    activeServer.close(() => {
      graphql = express();
      const schema = schemaComposer.buildSchema();

      let instanceConfig = {
        schema
      };

      //if (isDevelopmentEnvironment()) {
      instanceConfig = Object.assign(instanceConfig, {
        graphiql: true,
        pretty: true
      });
      //}

      graphql.use('/', new graphQLHTTP(instanceConfig));
      activeServer = graphql.listen(config.graphql.port, () => console.log(`GraphQL is listening on port ${config.graphql.port}`));
    });

    return;
  }

  graphql = express();

  let instanceConfig = {
    schema: schemaComposer.buildSchema()
  };

  //if (isDevelopmentEnvironment()) {
  instanceConfig = Object.assign(instanceConfig, {
    graphiql: true,
    pretty: true
  });
  //}

  graphql.use('/', new graphQLHTTP(instanceConfig));
  activeServer = graphql.listen(config.graphql.port, () => console.log(`GraphQL is listening on port ${config.graphql.port}`));
}

/**
 *
 * @returns {Promise<void>}
 */
async function startGraphQL() {
  // Launch GraphQL
  createGraphQLService();
}

module.exports = startApplication;
