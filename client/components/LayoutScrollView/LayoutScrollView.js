import React from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';

import { omit } from 'lodash';

import LayoutBox from '../LayoutBox';

const scrollViewProps = [
  'horizontal',
  'initialScrollPos'
];

/**
 * Scrollable Container
 */
export default class LayoutScrollView extends React.PureComponent {
  static defaultProps = {
    horizontal: false,
    initialScrollPos: 0
  };

  static propTypes = {
    width: PropTypes.any,
    height: PropTypes.any,
    horizontal: PropTypes.bool,
    initialScrollPos: PropTypes.number
  }

  constructor(props, context) {
    super(props, context);

    this.state = {
      scrollPos: props.initialScrollPos
    };
  }

  componentWillUpdate = () => {
    const { scrollPos } = this.state;

    if (scrollPos === 'end') {
      const DOMNode = findDOMNode(this);

      if (this.props.horizontal) {
        DOMNode.scrollLeft = DOMNode.scrollWidth - DOMNode.offsetWidth;
        this.scrollTo(DOMNode.scrollLeft);
      } else {
        DOMNode.scrollTop = DOMNode.scrollHeight - DOMNode.offsetHeight;
        this.scrollTo(DOMNode.scrollTop);
      }
    } else if (scrollPos === 'start') {
      const DOMNode = findDOMNode(this);

      if (this.props.horizontal) {
        DOMNode.scrollLeft = 0;
      } else {
        DOMNode.scrollTop = 0;
      }

      this.scrollTo(0);
    }
  };

  getScrollPosition = () => this.state.scrollPos;

  handleOnScroll = (event) => {
    const scrollPos = this.props.horizontal ? event.currentTarget.scrollLeft : event.currentTarget.scrollTop;

    // fire a custom onScroll if provided
    if (this.props.onScroll) {
      this.props.onScroll(scrollPos);
    }

    this.scrollTo(scrollPos);
  };

  scrollTo = (scrollPosition) => {
    this.setState({
      scrollPos: scrollPosition
    });
  };

  scrollToStart = () => {
    this.scrollTo('start');
  };

  scrollToEnd = () => {
    this.scrollTo('end');
  };

  render() {
    const props = this.props;

    const styles = {
      overflowY: props.horizontal ? 'hidden' : 'auto',
      overflowX: props.horizontal ? 'auto' : 'hidden'
    };

    const childProps = omit(props, scrollViewProps);

    return (
      <LayoutBox
        {...childProps}
        column={!props.horizontal}
        style={{ ...styles, ...props.style }}
        onScroll={this.handleOnScroll}
      />
    );
  }
}
