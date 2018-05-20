// @flow
/* eslint-disable no-console, no-shadow */
const startApp = require('./core/start');

startApp().then( (root) => {
  if (root) {
    root.logger.info('Started root process');
  }
});
