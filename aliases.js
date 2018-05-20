/* @flow */

const path = require('path');

module.exports = {
  client: path.resolve(__dirname, './client/'),
  server: path.resolve(__dirname, './server/'),
  shared: path.resolve(__dirname, './shared/'),
  pods: path.resolve(__dirname, './client/pods/'),
  components: path.resolve(__dirname, './client/components/'),
  routes: path.resolve(__dirname, './client/routes/'),
  services: path.resolve(__dirname, './client/pods/')
};
