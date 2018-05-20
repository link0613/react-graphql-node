/* eslint no-param-reassign: [2, { "props": false }] */

import run from './run';
import clean from './clean';
import startDevServers from './start-dev-servers';

async function start() {
  await run(clean);
  await run(startDevServers);
}

export default start;
