// @flow
/* eslint-disable global-require */
import React from 'react';
import { Link } from 'found';

import {
  createFragmentContainer,
  graphql
} from 'react-relay';

import Page from '../Page/Page.component';
import LayoutGrid from 'components/LayoutGrid';
import LayoutSidebar from 'components/LayoutSidebar';
import LayoutWidget from 'components/LayoutWidget';

class VersionPodComponent extends React.Component {
  render() {
    const {
      entity, _metadata, router, relay
    } = this.props;

    return (
      <Page
        title='Version'
      >
        <LayoutGrid rows={1} cols={1} isLoading={relay.isLoading}>
          <LayoutWidget
            type='internal.object-properties'
            data={entity}
            metadata={_metadata}
            router={router}
            includeProperties={[]}
            excludeProperties={[]}
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
  VersionPodComponent,
  graphql`
    fragment Version_entity on Version {
      applianceId
      msoVersion
      version
    }
  `
);
