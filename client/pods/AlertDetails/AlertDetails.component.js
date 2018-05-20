// @flow
/* eslint-disable global-require */
import React from 'react';

import Page from '../Page/Page.component';
import LayoutGrid from 'components/LayoutGrid';
import LayoutWidget from 'components/LayoutWidget';

import _ from 'underscore';
import './AlertDetails.scss';


function flatten(obj) {
  if (_.isObject(obj)) {
    const keys = _.keys(obj);
    let result = {};
    _.each(keys, (key) => {
      const val = obj[key];
      if (_.isObject(val)) {
        result = _.extend(result, flatten(val));
      } else {
        result[key] = val;
      }
    });

    return result;
  }

  return obj;
}

export default class AlertDetails extends React.Component {
  render() {
    const {
      entity, relay, _metadata, router
    } = this.props;

    let entityTitle = '';
    if (entity) {
      entityTitle = entity.title ? entity.title : entity._id;
    }
    const pageTitle = entity ? `Alert Details: ${entityTitle}` : 'Alert Details';

    return (
      <Page
        title={pageTitle}
        entityID={entity ? entity._id : null}
        actions={entity ? entity._actions : null}
        box
      >
        <LayoutGrid
          className='alert-details-properties'
          rows={1}
          cols={1}
          lastExpand
        >
          <LayoutWidget
            type='internal.alert-details'
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
