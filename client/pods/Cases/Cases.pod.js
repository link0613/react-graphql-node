// @flow
/* eslint-disable global-require */
import React from 'react';

import {
  createFragmentContainer,
  graphql,
  QueryRenderer
} from 'react-relay';

import Page from '../Page/Page.component';
import LayoutGrid from 'components/LayoutGrid';
import LayoutWidget from 'components/LayoutWidget';

class CasesPodComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const {
      entitiesList, _metadata, router, relay
    } = this.props;

    return (
      <Page
        title='Cases'
        titleIcon='icon-share'
      >
        <LayoutGrid rows={1} cols={1} isLoading={relay.isLoading}>
          <LayoutWidget
            type='internal.data-grid'
            data={entitiesList}
            metadata={_metadata}
            router={router}
            rows={1}
            cols={1}
            x={0}
            y={0}
          />
        </LayoutGrid>
      </Page>
    );
  }
}

export default createFragmentContainer(
  CasesPodComponent,
  graphql`
    fragment Cases_entitiesList on Case @relay(plural: true) {
      id
      _id
      creator
      reporter
      assignee
      summary
      priority
      status
      resolution
      created_date
      _actions
    }
  `
);
