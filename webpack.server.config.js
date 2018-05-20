// @flow

const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

let appEntry;
let plugins;

const applicationEntry = 'server/server.js';

if (process.env.NODE_ENV === 'production') {
  appEntry = [
    path.join(__dirname, applicationEntry)
  ];

  plugins = [
    new webpack.optimize.OccurrenceOrderPlugin(),

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ];
}

module.exports = {
  target: 'node',

  entry: {
    server: appEntry,
  },

  devtool: 'none',

  externals: [
    nodeExternals({
      /*
            whitelist: [
              'node-fetch',
              'babel-polyfill',
              'express',
              'express-graphql',
              'graphql',
              'graphql-relay',
              'graphql-compose',
              'graphql-compose-relay',
              'graphql-compose-connection',
              'graphql-subscriptions',
              'elasticsearch',
              'amqplib',
              'uuid',
              'hyperid',
            ]
      */
    })
  ],

  output: {
    path: path.join(__dirname, 'build/server'),
    publicPath: '/',
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  },

  module: {
    rules: [
      {
        test: /\.js?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
          }
        }
      }
    ]
  },

  node: {
    net: 'empty',
    fs: 'empty'
  },

  plugins
};
