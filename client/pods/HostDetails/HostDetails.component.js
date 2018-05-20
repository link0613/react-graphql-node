// @flow
/* eslint-disable global-require */
import React from 'react';

import Page from '../Page/Page.component';
import LayoutGrid from 'components/LayoutGrid';
import LayoutWidget from 'components/LayoutWidget';

import './HostDetails.scss';

export default class PodHostDetails extends React.Component {
  render() {
    const {
      entity, relay, _metadata, router
    } = this.props;

    return (
      <Page
        title={`Host Details: ${entity ? entity.hostname : ''}`}
        entityID={entity ? entity._id : null}
        actions={entity ? entity._actions : null}
      >
        <LayoutGrid
          className='host-details-properties'
          rows={1}
          cols={1}
          lastExpand
        >
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
