// @flow
/* eslint-disable global-require */
import React from 'react';

import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';

import Page from '../Page/Page.component';
import LayoutGrid from 'components/LayoutGrid';
import LayoutBoxVertical from 'components/LayoutBoxVertical';
import LayoutWidget from 'components/LayoutWidget';
import uuid from 'uuid';

import Rxmq from 'rxmq';

import {
  createFragmentContainer,
  graphql,
  QueryRenderer
} from 'react-relay';

export default class PodCaseDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 'tabGraph'
    };

    const subscription = Rxmq.channel('graph').observe('selection')
      .subscribe((data) => {
        this.setState({
          sidebar: data
        });

        Rxmq.channel('sidebar').subject('entities').next(data);
      });
  }

  activateTab(tabId) {
    this.setState({
      activeTab: tabId
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
        query={graphql`
          query CaseDetails_host_Query($hostID: String!) {
            entity: host(id: $hostID) {
              _id
              __typename
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
      `}
        variables={{
          hostID: this.state.sidebar.selection[0]
        }}
        render={({ error, props }) => {
          if (error) {
            return null;
          }
          if (!props) {
            return null;
          }

          return (
            <LayoutSidebar
              data={props.entity}
            >
              <LayoutGrid
                rows={2}
                cols={1}
                isLoading={!props}
              >
                <LayoutWidget
                  type='internal.object-properties'
                  data={props.entity}
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
      entity, relay, _metadata, router
    } = this.props;

    return (
      <Page
        title={`Case Details: ${entity ? entity.summary : ''}`}
        onRenderSidebar={this.renderSidebar}
      >
        <LayoutBoxVertical fit>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={this.state.activeTab === 'tabGraph' ? 'active' : null}
                onClick={() => {
                  this.activateTab('tabGraph');
                }}
              >
                Graph
              </NavLink>
            </NavItem>

            <NavItem>
              <NavLink
                className={this.state.activeTab === 'tabLog' ? 'active' : null}
                onClick={() => {
                  this.activateTab('tabLog');
                }}
              >
                Activity Log
              </NavLink>
            </NavItem>
          </Nav>

          <TabContent activeTab={this.state.activeTab} style={{ display: 'flex', flex: '1 1 100%' }}>
            <TabPane tabId='tabGraph' style={{ flex: '1 1 100%', position: 'relative' }}>
              <LayoutGrid
                rows={4}
                cols={1}
              >
                <LayoutWidget
                  type='internal.investigation-timeline'
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
                <LayoutWidget
                  type='internal.investigation-graph'
                  data={entity}
                  metadata={_metadata}
                  router={router}
                  includeProperties={[]}
                  excludeProperties={[]}
                  rows={3}
                  cols={1}
                  x={0}
                  y={1}
                />
              </LayoutGrid>
            </TabPane>

            <TabPane tabId='tabLog' style={{ flex: '1 1 100%', position: 'relative' }}>
              <LayoutGrid
                rows={1}
                cols={1}
              >
                <LayoutWidget
                  type='internal.investigation-log'
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
            </TabPane>
          </TabContent>
        </LayoutBoxVertical>
      </Page>
    );
  }
}
