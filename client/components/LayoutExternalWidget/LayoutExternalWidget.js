// @flow
import React from 'react';

import { omit } from 'lodash';

import LayoutBoxVertical from 'components/LayoutBoxVertical';

import WidgetsRegistry from 'services/WidgetsRegistry';
import { isReactComponent } from 'services/ComponentSpec';

export default class LayoutExternalWidget extends React.Component {
  constructor(props) {
    super(props);

    const widgetSpec = WidgetsRegistry.getComponentBySpec(props.type);
    this.widget = new widgetSpec();

    if (typeof this.widget.widgetCreate === 'function') {
      this.widget.widgetCreate(props);
    }
  }

  componentWillMount() {
    if (typeof this.widget.widgetWillMount === 'function') {
      this.widget.widgetWillMount();
    }
  }

  componentDidMount() {
    if (typeof this.widget.widgetDidMount === 'function') {
      this.widget.element = this.widgetContainer;

      this.widget.widgetDidMount(this.widgetContainer);

      if (this.widget.element) {
        this.widget.render();
      }
    }
  }

  componentWillUpdate(nextProps) {
    if (typeof this.widget.widgetWillUpdate === 'function') {
      this.widget.widgetWillUpdate(nextProps);
    }
  }

  componentDidUpdate(prevProps) {
    if (typeof this.widget.widgetDidUpdate === 'function') {
      this.widget.props = this.props;
      this.widget.widgetDidUpdate(prevProps);
    }
  }

  componentWillUnmount() {
    if (typeof this.widget.widgetWillUnmount === 'function') {
      this.widget.widgetWillUnmount();
    }
  }

  render() {
    if (typeof this.widget.render === 'function') {
      if (this.widgetContainer) {
        this.widget.render();
      }
    }

    return (
      <div ref={(element) => { this.widgetContainer = element; }} />
    );
  }
}
