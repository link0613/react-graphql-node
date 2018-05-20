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
import LayoutSidebar from 'components/LayoutSidebar';
import LayoutWidget from 'components/LayoutWidget';
import Rxmq from 'rxmq';

class HostsPodComponent extends React.Component {
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
            query Hosts_host_Query($hostID: String!) {
              entity: host(id: $hostID) {
                _id
                hostname
                domain
                timezone
                primary_ip_address
                primary_mac
                agent_version
                excluded_from_containment
                containment_missing_software
                containment_queued
                containment_state
                last_audit_timestamp
                last_poll_timestamp
                last_poll_ip
                os
                stats
                sysinfo
                _actions
              }
            }
          `
        }
        variables={{
          hostID: this.state.sidebar.selection[0]
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
              >
                <LayoutWidget
                  type='internal.object-properties'
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
        title='Hosts'
        titleIcon='icon-screen-desktop'
        onRenderSidebar={this.renderSidebar}
      >
        <LayoutGrid rows={1} cols={1} isLoading={relay.isLoading}>
          <LayoutWidget
            type='internal.data-grid'
            data={entitiesList}
            metadata={_metadata}
            detailedFields={['primary_ip_address', 'timezone']}
            router={router}
            rowHeight={50}
            entityRoute='hosts'
            cellRender={{
              hostname: (source) => {
                let cell = '';

                if (source.data) {
                  cell = `<strong>${source.data.hostname}</strong><div class='datagrid-detailedfield-value'>${source.data.primary_ip_address}</div>`;
                }

                return cell;
              },
              domain: (source) => {
                let cell = '';

                if (source.data) {
                  cell = `${source.data.domain}<div class='datagrid-detailedfield-value'>${source.data.timezone}</div>`;
                }

                return cell;
              }
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
  HostsPodComponent,
  graphql`
    fragment Hosts_entitiesList on Host @relay(plural: true) {
      id
      _id
      hostname
      primary_ip_address
      domain
      timezone
      agent_version
      os
      stats
      _actions
    }
  `
);
