// @flow

import 'bootstrap/dist/css/bootstrap.css';

import './scss/main.scss';

import 'ag-grid/dist/styles/_ag-theme-common.css';
import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid/dist/styles/ag-theme-bootstrap.css';
import 'ag-grid/dist/styles/theme-bootstrap.css';
import 'ag-grid/dist/styles/compiled-icons.css';

import React from 'react';
import ReactDOM from 'react-dom';

import { Context } from 'relay-context';
import { Resolver } from 'found-relay';
import { RootRouter } from './root';

import { Environment, Network, RecordSource, Store } from 'relay-runtime';

import 'normalize.css/normalize.css';
import initWidgets from 'widgets';


// Define a function that fetches the results of an operation (query/mutation/etc)
// and returns its results as a Promise:
function fetchQuery(
  operation,
  variables,
  cacheConfig,
  uploadables,
) {
  // console.log('query', operation.text);
  return fetch('/graphql', {
    method: 'POST',
    headers: {
      // Add authentication and other headers here
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      query: operation.text, // GraphQL text from input
      variables,
    }),
  }).then(response => response.json());
}

// Create a network layer from the fetch function
const source = new RecordSource();
const store = new Store(source);
const network = Network.create(fetchQuery);

const environment = new Environment({
  network,
  store
});

const rootNode = document.createElement('div');
rootNode.className = 'app-mount';

if (document.body) {
  document.body.appendChild(rootNode);
}

const resolver = new Resolver(environment);

const root = (
  <Context environmentRegistry={{ default: environment }} defaultEnvironment='default'>
    <RootRouter resolver={resolver} />
  </Context>
);

initWidgets();

ReactDOM.render(
  root,
  rootNode
);

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./root', () => {
    ReactDOM.render(
      root,
      rootNode
    );
  });
}
