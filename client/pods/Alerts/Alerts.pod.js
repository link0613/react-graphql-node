// @flow
/* eslint-disable global-require */
import React from 'react';
import _ from 'underscore';

import {
  createFragmentContainer,
  graphql,
  QueryRenderer
} from 'react-relay';

import Page from '../Page/Page.component';
import LayoutGrid from 'components/LayoutGrid';
import LayoutSidebar from 'components/LayoutSidebar';
import LayoutWidget from 'components/LayoutWidget';
import Rxmq from 'rxmq';

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

class AlertsPodComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    const subscription = Rxmq.channel('data.grid').observe('selection')
      .subscribe((data) => {
        this.setState({
          sidebar: data
        });

        Rxmq.channel('sidebar').subject('entities').next(data);
      });
  }

  isSidebarAvailable = () => {
    const { sidebar } = this.state;
    return sidebar && Array.isArray(sidebar.selection) && (sidebar.length > 0);
  };

  renderSidebar = () => {
    if (!this.isSidebarAvailable()) {
      return null;
    }

    return (
      <QueryRenderer
        environment={this.props.relay.environment}
        query={
          graphql`
            query Alerts_alert_Query($alertID: String!) {
              entity: alert(id: $alertID) {
                _id
                event_at
                event_id
                event_type
                event_values
                resolution
                source
                agent
                condition
                reported_at
                matched_at
                matched_source_alerts
                url
                host
                _actions
              }
            }
          `
        }
        variables={{
          alertID: this.state.sidebar.selection[0]
        }}
        render={({ props, error, retry }) => {
          if (error) {
            return null;
          }
          const entity = props ? { ...props.entity } : null;

          return (
            <LayoutSidebar data={entity} isLoading={!props}>
              <LayoutGrid
                rows={1}
                cols={1}
                isLoading={!props}
                lastExpand
              >
                <LayoutWidget
                  type='internal.alert-details'
                  excludeProperties={['agent', 'host']}
                  data={entity}
                  rows={2}
                  cols={1}
                  x={0}
                  y={0}
                />
              </LayoutGrid>
            </LayoutSidebar>
          );
        }}
      />
    );
  }

  render() {
    const {
      entitiesList, _metadata, router, relay
    } = this.props;

    return (
      <Page
        title='Alerts'
        titleIcon='icon-bell'
        onRenderSidebar={this.renderSidebar}
      >
        <LayoutGrid rows={1} cols={1} isLoading={relay.isLoading}>
          <LayoutWidget
            type='internal.data-grid'
            data={entitiesList}
            metadata={_metadata}
            router={router}
            includeFields={[
              'host',
              'hostDomain',
            ]}
            excludeFields={[
              '__dataID__',
              'id',
              '_id',
              '_actions',
              'event_values',
              'matched_at',
              'source',
              'resolution'
            ]}
            entityRoute='alerts'
            detailedFields={['host.domain', 'reported_at']}
            rowHeight={50}
            cellRender={{
              host: (source) => {
                let cell = '';

                if (source.data.host) {
                  cell = `<strong>${source.data.host.hostname}</strong><div class='datagrid-detailedfield-value'>${source.data.host.primary_ip_address}</div>`;
                }

                return cell;
              },
              hostDomain: (source) => {
                let cell = '';

                if (source.data.host) {
                  cell = `${source.data.host.domain}<div class='datagrid-detailedfield-value'>${source.data.host.timezone}</div>`;
                }

                return cell;
              },
              title: (source) => {
                let cell = '';
                let cellDetails = '';

                if (source) {
                  if (source.data.title) {
                    cell = source.data.title;
                  }

                  if (source.data.resolution === 'BLOCK') {
                    cellDetails = `${cellDetails}<span class='badge badge-danger'>BLK</span> `;
                  } else if (source.data.resolution === 'PARTIAL_BLOCK') {
                    cellDetails = `${cellDetails}<span class='badge badge-warning'>PRT</span> `;
                  }

                  if (source.data.source) {
                    cellDetails = `${cellDetails}<span class='badge badge-info'>${source.data.source}</span> `;
                  }

                  if (cellDetails) {
                    cellDetails = `<div class='datagrid-detailedfield-value'>${cellDetails}</div>`;
                  }
                }

                return cell + cellDetails;
              },
              event_at: (source) => {
                let cell = '';

                if (source.data) {
                  cell = `${source.data.event_at}<div class='datagrid-detailedfield-value'>Reported: ${source.data.reported_at}</div>`;
                }

                return cell;
              },
            }}
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
  AlertsPodComponent,
  graphql`
    fragment Alerts_entitiesList on Alert @relay(plural: true) {
      id
      _id
      title
      host
      hostDomain: host
      resolution
      source
      event_at
      reported_at
      event_values
      _actions
    }
  `
);
