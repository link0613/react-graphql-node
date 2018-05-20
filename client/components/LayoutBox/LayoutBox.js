import React from 'react';
import prefixAll from 'inline-style-prefixer/static';

import { omit } from 'lodash';

import {
  layoutBoxProps,
  layoutFlexProps,
  layoutLayoutProps
} from '../../core/LayoutProperties';

class LayoutBox extends React.PureComponent {
  render() {
    const props = this.props;
    const styles = {};

    // shortcut props
    if (props.fit) {
      styles.width = '100%';
      styles.height = '100%';
    }

    if (props.center) {
      styles.justifyContent = 'center';
      styles.alignItems = 'center';
    }

    if (props.overflow) {
      styles.overflow = 'auto';
    }

    if (props.overflowX) {
      styles.overflowX = 'auto';
      styles.overflowY = 'hidden';
    }

    if (props.overflowY) {
      styles.overflowX = 'hidden';
      styles.overflowY = 'auto';
    }

    // resolving inline-flex display style
    if (props.inline) {
      styles.display = `inline-${styles.display}`;
    }

    // resolving the flow properties flex-wrap and flex-direction
    if (props.wrap) {
      styles.flexWrap = 'wrap';

      if (props.wrap === 'reverse') {
        styles.flexWrap += '-reverse';
      }
    }

    if (props.column) {
      styles.flexDirection = 'column';
      if (props.reverse) {
        styles.flexDirection += '-reverse';
      }
    } else if (props.reverse) {
      styles.flexDirection = 'row-reverse';
    }

    // resolving all box properties
    layoutBoxProps.forEach((prop) => {
      if (props.hasOwnProperty(prop)) {
        styles[prop] = props[prop];
      }
    });

    // resolving flex properties and its shortcut
    layoutFlexProps.forEach((prop) => {
      if (props.hasOwnProperty(prop)) {
        styles[prop] = props[prop];
      }
    });

    // processing styles and normalizing flexbox specifications
    const prefixedStyles = prefixAll(styles);
    const className = `${(props.className || '')} layout--box`;
    const childProps = omit(props, layoutLayoutProps);

    return (
      <div
        {...childProps}
        className={className}
        style={{
          ...prefixedStyles,
          ...props.style
        }}
      >
        {props.children}
      </div>
    );
  }
}

export default LayoutBox;
