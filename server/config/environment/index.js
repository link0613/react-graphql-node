/* eslint-disable global-require */
const _ = require('lodash');

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  graphql: {
    port: 8000
  }
};

module.exports = _.extend(config, require(`./${config.env}`).default);
