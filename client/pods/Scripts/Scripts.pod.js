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

class ScriptsPodComponent extends React.Component {
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
            query Scripts_script_Query($scriptID: String!) {
              entity: script(id: $scriptID) {
                _id
                last_used_at
                url
                download
                content
                _actions
              }
            }
          `
        }
        variables={{
          scriptID: this.state.sidebar.selection[0]
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
        title='Scripts'
        titleIcon='icon-docs'
        onRenderSidebar={this.renderSidebar}
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
  ScriptsPodComponent,
  graphql`
    fragment Scripts_entitiesList on Script @relay(plural: true) {
      id
      _id
      last_used_at
      url
      _actions
    }
  `
);
