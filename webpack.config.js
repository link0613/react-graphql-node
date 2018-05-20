// @flow

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

let appEntry;
let devtool;
let plugins;

const applicationName = 'HX Athena';
const clientStart = './client/index.html';
const applicationEntry = 'client/index.js';
const applicationLogo = './client/assets/logo.png';

if (process.env.NODE_ENV === 'production') {
  appEntry = [
    path.join(__dirname, applicationEntry)
  ];

  devtool = 'none';

  plugins = [
    new webpack.optimize.OccurrenceOrderPlugin(),

    /*
        new webpack.optimize.CommonsChunkPlugin({
          name: 'vendor',
          filename: 'vendor.js'
        }),
    */

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),

    /*
        new webpack.optimize.UglifyJsPlugin({
          sourceMap: true,
          compress: {
            warnings: false,
            screw_ie8: true
          }
        }),

    */
    new HtmlWebpackPlugin({
      title: applicationName,
      template: clientStart,
      mobile: true,
      inject: false
    }),

    new FaviconsWebpackPlugin(applicationLogo)
  ];
}
else {
  appEntry = [
    'babel-polyfill',
    'react-hot-loader/patch',
    path.join(__dirname, applicationEntry),
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server'
  ];

  devtool = 'cheap-module-source-map';

  plugins = [
    /*
        new webpack.optimize.CommonsChunkPlugin({name: 'vendor', filename: 'vendor.js'}),
    */

    new webpack.NoEmitOnErrorsPlugin(),

    new webpack.HotModuleReplacementPlugin(),

    new webpack.NamedModulesPlugin(),

    new webpack.DefinePlugin({
      __DEV__: true
    }),

    new HtmlWebpackPlugin({
      title: applicationName,
      template: './client/index.html',
      mobile: true,
      inject: false
    }),

    new FaviconsWebpackPlugin('./client/assets/logo.png')
  ];
}

module.exports = {
  entry: {
    app: appEntry,

    vendor: [
      'jquery',
      'bootstrap',
      'reactstrap',
      'react',
      'react-dom',
      'react-relay',
      'graphql',
      'graphql-relay',
      'elasticsearch',
      'hyperid',
      'js-base64',
      'ag-grid',
      'ag-grid-react',
    ]
  },

  output: {
    path: path.join(__dirname, 'build/app'),
    publicPath: '/',
    filename: '[name].js'
  },

  devtool,

  resolve: {
    alias: {
      assets: path.resolve(__dirname, 'client/assets/'),
      components: path.resolve(__dirname, 'client/components/'),
      pods: path.resolve(__dirname, 'client/pods/'),
      services: path.resolve(__dirname, 'client/services/'),
      widgets: path.resolve(__dirname, 'client/widgets/')
    }
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },

      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ],
      },

      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            /*
                        options: {
                          modules: true,
                          importLoaders: 1,
                          localIdentName: '[name]__[local]___[hash:base64:5]',
                        }
            */
          },
          {
            loader: 'sass-loader',
          }
        ]
      },

      {
        test: /\.(png|jpg|jpeg|gif|svg|eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1000,
              name: 'assets/[hash].[ext]'
            }
          }
        ]
      }
    ]
  },

  plugins
};
