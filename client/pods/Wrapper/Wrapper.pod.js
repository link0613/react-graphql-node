// @flow
/* eslint-disable global-require */
import React from 'react';

import Page from '../Page/Page.component';

export default class WrapperPodComponent extends React.Component {
  render() {
    return (
      <Page
        title={this.props.title}
      >
        {this.props.children}
      </Page>
    );
  }
}
