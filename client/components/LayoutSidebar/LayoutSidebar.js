// @flow
import React from 'react';
import ReactLoading from 'react-loading';
import LayoutBox from 'components/LayoutBox';
import Rxmq from 'rxmq';
import { Button } from 'reactstrap';
import _ from 'lodash';

import './LayoutSidebar.scss';

export default class LayoutSidebar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  handleActionClick = (ev) => {
    const { data } = this.props;

    ev.preventDefault();

    if (data && data._actions) {
      const filteredActions = data._actions.filter(r => r.key === ev.currentTarget.value)[0];

      if (filteredActions.params) {
        Rxmq.channel('invoke.action').subject('configure').next({
          action: filteredActions,
          context: data._id
        });
      } else {
        Rxmq.channel('invoke.action').subject('start').next({
          action: filteredActions,
          context: data._id
        });
      }
    }
  }

  handleCloseClick = (ev) => {
    ev.preventDefault();
    Rxmq.channel('sidebar').subject('entities').next(null);
  }

  render() {
    const { data, isLoading } = this.props;

    let actions;
    let groups;

    if (data && data._actions) {
      actions = data._actions;
      groups = _.uniqBy(actions, 'groupName');
    }

    return (
      <div className='layout-sidebar'>
        <LayoutBox
          fit='true'
          column='true'
        >
          <div className='layout-sidebar-title'>
            Properties

            <Button color='link' onClick={this.handleCloseClick}>
              <div className='icon-w'>
                <div className='icon-close' />
              </div>
            </Button>

            {actions && (
              <div style={{ float: 'right' }}>
                <select className='form-control form-control-sm rounded bright' onChange={this.handleActionClick}>
                  <option> Actions</option>
                  {groups && groups.map((group, index) => (
                    <optgroup label={group.groupName} key={index}>
                      {actions.filter(action => action.groupName === group.groupName).map((action, actionIndex) => (
                        <option value={action.key} disabled={!!action.disabled} key={actionIndex}> {action.title}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}
          </div>

          {!isLoading && (
            <LayoutBox flex={1} className='layout-sidebar-body'>
              {this.props.children}
            </LayoutBox>
          )}

          {isLoading && (
            <LayoutBox flex={1} className='layout-sidebar-body'>
              <ReactLoading
                type='cylon'
                color='#047bf8'
              />
            </LayoutBox>
          )}
        </LayoutBox>
      </div>
    );
  }
}
