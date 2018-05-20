// @flow
/* eslint-disable no-console, no-shadow */
const fs = require('fs');
const path = require('path');

const webpackConfig = require('../webpack.config');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const express = require('express');
const config = require('./config/environment');

const startApp = require('./core/start');

startApp().then( (root) => {
  if (root) {
    root.logger.info(`${root.id}. Started root process`);
  }
});

// Launch Relay by using webpack.config.js
const relayServer = new WebpackDevServer(webpack(webpackConfig), {
  contentBase: '/build/',
  proxy: {
    '/graphql': `http://localhost:${config.graphql.port}`
  },
  stats: {
    colors: true
  },
  hot: true,
  historyApiFallback: true
});

// Serve static resources
relayServer.use('/', express.static(path.join(__dirname, '../build')));
relayServer.listen(config.port, () => console.log(`Relay is listening on port ${config.port}`));
