// @flow
import React from 'react';
import { Link } from 'found';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';
import LayoutBox from 'components/LayoutBox';
import PageHeader from 'components/PageHeader';
import PageLogo from 'components/PageLogo';

import './Header.scss';

const menu = [
  {
    title: 'Alerts',
    path: '/alerts',
    icon: 'icon-bell',
    submenu: [
      {
        title: 'All Alerts',
        path: '',
      },
    ]
  },
  {
    title: 'Hosts',
    path: '/hosts',
    icon: 'icon-screen-desktop',
    submenu: [
      {
        title: 'All Hosts',
        path: '/hosts',
      },
      {
        title: 'Hosts with Alerts',
        path: '/hosts',
      }
    ]
  },
  {
    title: 'Cases',
    path: '/cases',
    icon: 'icon-share',
    submenu: [
      {
        title: 'All Cases',
        path: '/cases',
      },
      {
        title: 'My Cases',
        path: '/cases?assignee=andrey&status=open',
      },
    ]
  },
  {
    title: 'Search',
    path: '/search',
    icon: 'icon-magnifier',
    submenu: [
      {
        title: 'Active Searches',
        path: '/search/active',
      }
    ]
  },
  {
    title: 'Acquisitions',
    path: '/acquisitions',
    icon: 'icon-cloud-download',
    submenu: [
      {
        title: 'File',
        path: '/acquisitions/file',
      },
      {
        title: 'Quarantine',
        path: '/acquisitions/quarantine',
      },
      {
        title: 'Triage',
        path: '/acquisitions/triage',
      },
      {
        title: 'Data',
        path: '/acquisitions/data',
      },
      {
        title: 'Agent Diagnostics',
        path: '/acquisitions/agent',
      }
    ]
  },
  {
    title: 'Indicators',
    path: '/indicators',
    icon: 'icon-tag',
    submenu: [
      {
        title: 'False Positives',
        path: '/indicators/fp',
      }
    ]
  },
  {
    title: 'Scripts',
    path: '/scripts',
    icon: 'icon-docs',
    submenu: [
      {
        title: 'All Scripts',
        path: '/scripts',
      }
    ]
  }
];

export default class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  buildMenu = (menu) => {
    if (menu && Array.isArray(menu) && menu.length) {
      return menu.map(menuItem => (
        <li key={menuItem.path} className={`${menuItem.submenu ? 'has-sub-menu' : ''}${(this.props.location.pathname && this.props.location.pathname.startsWith(menuItem.path)) ? ' selected' : ''}`}>
          <Link to={menuItem.path}>
            {menuItem.icon && (
              <div className='icon-w'>
                <div className={menuItem.icon} />
              </div>
            )}
            <span>{menuItem.title}</span>
          </Link>

          {menuItem.submenu && (
            <div className='sub-menu-w'>
              <div className='sub-menu-header'>
                {menuItem.title}
              </div>
              {menuItem.icon && (
                <div className='sub-menu-icon'>
                  <i className={menuItem.icon} />
                </div>
              )}
              <div className='sub-menu-i'>
                <ul className='sub-menu'>
                  {menuItem.submenu.map((submenuItem, index) => (
                    <li key={index}>
                      <Link to={submenuItem.path}>{submenuItem.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </li>
      ));
    }

    return null;
  }

  render() {
    const navClassName = `menu-w color-scheme-light color-style-default menu-position-top menu-layout-compact sub-menu-style-over selected-menu-color-bright menu-activated-on-hover${(this.props.location.pathname !== '/') ? ' menu-has-selected-link' : ''}`;

    return (
      <LayoutBox>
        <Navbar className={navClassName}>
          <PageLogo />

          <PageHeader />

          <ul className='main-menu'>
            <li className='sub-header'>
              <span>Entities</span>
            </li>

            {this.buildMenu(menu)}
          </ul>
        </Navbar>
      </LayoutBox>
    );
  }
}
