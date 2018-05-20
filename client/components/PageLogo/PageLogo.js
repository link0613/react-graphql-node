// @flow
import React from 'react';
import { Link } from 'found';
import logo from '../../assets/logo.png';

export default class PageLogo extends React.Component {
  render() {
    return (
      <div className='logo-w'>
        <Link className='logo' to='/'>
          <img src={logo} title='FireEye' alt='FireEye' />
        </Link>
      </div>
    );
  }
}
