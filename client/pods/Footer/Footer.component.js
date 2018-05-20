// @flow
import React from 'react';
import PropTypes from 'prop-types';

import { Collapse, Navbar, Nav, NavItem, NavLink } from 'reactstrap';

import styles from './Footer.scss';

export default class Footer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false
    };
  }

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
    const { version } = this.props;

    return (
      <Navbar color='light' light expand='xs' fixed='bottom' style={{ padding: '0 15px', fontSize: '10px', boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)' }} />
    );
  }
}
