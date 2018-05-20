// @flow
import React from 'react';

import LayoutBox from 'components/LayoutBox';
import LayoutBoxVertical from 'components/LayoutBoxVertical';
import LayoutSidebar from 'components/LayoutSidebar';
import { Nav, NavItem, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, NavLink } from 'reactstrap';

import _ from 'lodash';

import Rxmq from 'rxmq';

import './Page.scss';

export default class Page extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    Rxmq.channel('sidebar').observe('entities')
      .subscribe((data) => {
        this.setState({
          sidebar: data
        });
      });
  }

  toggleDropdown = (item) => {
    if (this.state.actionKey === item) {
      this.setState({
        actionKey: null
      });
    } else {
      this.setState({
        actionKey: item
      });
    }
  }

  handleActionClick = (ev, data) => {
    const { actions, entityID } = this.props;

    ev.preventDefault();

    if (actions && entityID) {
      const filteredActions = actions.filter(r => r.key === data)[0];

      if (filteredActions.params) {
        Rxmq.channel('invoke.action').subject('configure').next({
          action: filteredActions,
          context: entityID
        });
      } else {
        Rxmq.channel('invoke.action').subject('start').next({
          action: filteredActions,
          context: entityID
        });
      }
    }
  }

  render() {
    const { sidebar } = this.state;
    const { actions, entityID, box, title, titleIcon, onRenderSidebar } = this.props;

    let groupsList = [];

    if (actions && actions.length) {
      groupsList = _.uniqBy(actions, 'groupName');
    }

    const isSidebarAvailable = sidebar && Array.isArray(sidebar.selection) && (sidebar.length > 0);
    const isSidebarRenderAvailable = typeof onRenderSidebar === 'function';

    return (
      <LayoutBoxVertical flex={1} className='element-wrapper none pt-2'>
          <LayoutBox>
            <div className='element-header'>
              {titleIcon && (
                <span className='icon-w'>
                  <span className={titleIcon} />
                </span>
              )}

              <h1>{title}</h1>
            </div>

            {actions && (
              <Nav pills className='element-actions-bar'>
                {groupsList.map(group => (
                  <Dropdown nav key={group.key} isOpen={this.state.actionKey === group.key} toggle={() => this.toggleDropdown(group.key)}>
                    <DropdownToggle nav caret>
                      {group.groupName}
                    </DropdownToggle>

                    <DropdownMenu>
                      {actions.filter(action => action.groupName === group.groupName).map((action, actionIndex) => (
                        <DropdownItem
                          disabled={!!action.disabled}
                          onClick={ev => this.handleActionClick(ev, action.key)}
                          key={actionIndex}
                        >{action.title}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                ))}
              </Nav>
            )}
          </LayoutBox>

          <LayoutBox flex={1} className={box ? 'element-box' : null}>
            {this.props.children}
          </LayoutBox>

          {isSidebarAvailable && isSidebarRenderAvailable && (
            onRenderSidebar()
          )}
      </LayoutBoxVertical>
    );
  }
}
