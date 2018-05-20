// @flow
import React from 'react';

import InvestigationTimeline from 'components/InvestigationTimeline';

export default class InvestigationTimelineWidget extends React.Component {
  getItems(data) {
    if (data.nodes) {
      return data.nodes.map(node => ({
        start: node.timestamp,
        end: node.timestamp + 1000,
        content: node.title
      }));
    }

    return [];
  }

  render() {
    const {
      data, parent, title, includeProperties, excludeProperties
    } = this.props;

    if (!data) {
      return null;
    }

    const options = {
      width: '100%',
      height: '100px',
      stack: true,
      showMajorLabels: true,
      showCurrentTime: true,
      zoomMin: 1000000,
      type: 'background',
      format: {
        minorLabels: {
          minute: 'h:mma',
          hour: 'ha'
        }
      }
    };

    return (
      <InvestigationTimeline
        options={options}
        items={this.getItems(data)}
      />
    );
  }
}
