// @flow
/* eslint-disable global-require */
import React from 'react';
import { Link } from 'found';

import Page from '../Page/Page.component';

export default class NotImplementedPodComponent extends React.Component {
  render() {
    return (
      <Page
        title='Not Implemented'
      >
        <p>
          This section is not yet available.
        </p>

        <p>
          <Link to='/'>Go to homepage</Link>
        </p>
      </Page>
    );
  }
}
