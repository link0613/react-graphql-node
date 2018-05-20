

import React from 'react';
import ReactDOM from 'react-dom';

import { Resolver } from 'found-relay';
import routeConfig from './routes/Route';

import createFarceRouter from 'found/lib/createFarceRouter';
import createRender from 'found/lib/createRender';

import queryMiddleware from 'farce/lib/queryMiddleware';
import HashProtocol from 'farce/lib/HashProtocol';

export const RootRouter = createFarceRouter({
  historyProtocol: new HashProtocol(),
  historyMiddlewares: [queryMiddleware],
  routeConfig,
  render: createRender({})
});
