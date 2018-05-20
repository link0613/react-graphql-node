// @flow
import React from 'react';

import { omit } from 'lodash';

import LayoutBoxVertical from 'components/LayoutBoxVertical';
import LayoutExternalWidget from 'components/LayoutExternalWidget';

import WidgetsRegistry from 'services/WidgetsRegistry';
import { isReactComponent } from 'services/ComponentSpec';

const EXCLUDE_WIDGET_PROPS = [
  'type',
  'datasource',
  'bindings'
];

export default class LayoutWidget extends React.Component {
  render() {
    const widgetSpec = WidgetsRegistry.getComponentBySpec(this.props.type);

    const props = omit(this.props, EXCLUDE_WIDGET_PROPS) || {};

    let widgetElement;

    if (isReactComponent(widgetSpec)) {
      widgetElement = React.createElement(
        widgetSpec,
        props
      );
    } else {
      widgetElement = (
        <LayoutExternalWidget
          {...this.props}
        />
      );
    }

    return (
      <LayoutBoxVertical flex={1} overflowY='true'>
        {widgetElement}
      </LayoutBoxVertical>
    );
  }
}
