import React from 'react';

import ReactLoading from 'react-loading';
import Route from 'found/lib/Route';
import LayoutBox from 'components/LayoutBox';

export default class AsyncRoute extends Route {
  render({ Component, props }) {
    return (Component && props) ?
      (
        <Component
          {...props}
        />
      ) : (
        <LayoutBox flex={1} center='true'>
          <ReactLoading
            type='cylon'
            color='#047bf8'
          />
        </LayoutBox>
      );
  }
}
