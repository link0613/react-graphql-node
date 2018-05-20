// @flow
import React from 'react';

import { omit } from 'lodash';

import {
  layoutContainerProps,
  layoutBorderShortcutProps
} from '../../core/LayoutProperties';

import LayoutBox from '../LayoutBox';

const containerLayoutProps = [
  ...layoutContainerProps,
  ...layoutBorderShortcutProps
];

/**
 * Container Component
 */
class LayoutContainer extends React.PureComponent {
  render() {
    const props = this.props;
    const styles = {};

    if (props.fixed) {
      styles.position = 'fixed';
    }

    if (props.absolute) {
      styles.position = 'absolute';
    }

    // resolving all container properties
    layoutContainerProps.forEach((prop) => {
      if (props.hasOwnProperty(prop)) {
        styles[prop] = props[prop];
      }
    });

    // resolving the border shortcuts
    layoutBorderShortcutProps.forEach((prop) => {
      if (props[prop] === true) {
        styles[`${prop}Width`] = props.borderWidth || 1;
      }
    });

    const childProps = omit(props, containerLayoutProps);
    return (
      <LayoutBox
        {...childProps}

        style={{
          ...styles,
          ...props.style
        }}
      />
    );
  }
}

export default LayoutContainer;
