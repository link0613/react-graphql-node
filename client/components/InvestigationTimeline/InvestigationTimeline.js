import React from 'react';

import vis from 'vis/dist/vis-timeline-graph2d.min';
import 'vis/dist/vis-timeline-graph2d.min.css';

import { difference, intersection, each, assign, omit, keys } from 'lodash';

const noop = function () {};

const events = [
  'currentTimeTick',
  'click',
  'contextmenu',
  'doubleClick',
  'groupDragged',
  'changed',
  'rangechange',
  'rangechanged',
  'select',
  'timechange',
  'timechanged',
  'mouseOver',
  'mouseMove',
  'itemover',
  'itemout',
];

const eventDefaultProps = {};

each(events, (event) => {
  eventDefaultProps[`${event}Handler`] = noop;
});

export default class InvestigationTimeline extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      customTimes: [],
    };
  }

  componentDidMount() {
    const { container } = this.refs;

    this.$el = new vis.Timeline(container, undefined, this.props.options);

    events.forEach((event) => {
      this.$el.on(event, this.props[`${event}Handler`]);
    });

    this.init();
  }

  shouldComponentUpdate(nextProps) {
    const {
      items, groups, options, selection, customTimes
    } = this.props;

    const itemsChange = items !== nextProps.items;
    const groupsChange = groups !== nextProps.groups;
    const optionsChange = options !== nextProps.options;
    const customTimesChange = customTimes !== nextProps.customTimes;
    const selectionChange = selection !== nextProps.selection;

    return (
      itemsChange ||
      groupsChange ||
      optionsChange ||
      customTimesChange ||
      selectionChange
    );
  }

  componentDidUpdate() {
    this.init();
  }

  componentWillUnmount() {
    this.$el.destroy();
  }

  init() {
    const {
      items,
      groups,
      options,
      selection,
      selectionOptions = {},
      customTimes,
      animate = true,
      currentTime,
    } = this.props;

    let timelineOptions = options;

    if (animate) {
      // If animate option is set, we should animate the timeline to any new
      // start/end values instead of jumping straight to them
      timelineOptions = omit(options, 'start', 'end');

      this.$el.setWindow(options.start, options.end, {
        animation: animate,
      });
    }

    this.$el.setOptions(timelineOptions);

    if (groups.length > 0) {
      const groupsDataset = new vis.DataSet();
      groupsDataset.add(groups);
      this.$el.setGroups(groupsDataset);
    }

    this.$el.setItems(items);
    this.$el.setSelection(selection, selectionOptions);

    if (currentTime) {
      this.$el.setCurrentTime(currentTime);
    }

    const customTimeKeysPrev = keys(this.state.customTimes);
    const customTimeKeysNew = keys(customTimes);

    const customTimeKeysToAdd = difference(
      customTimeKeysNew,
      customTimeKeysPrev
    );

    const customTimeKeysToRemove = difference(
      customTimeKeysPrev,
      customTimeKeysNew
    );

    const customTimeKeysToUpdate = intersection(
      customTimeKeysPrev,
      customTimeKeysNew
    );

    each(customTimeKeysToRemove, (id) => {
      this.$el.removeCustomTime(id);
    });

    each(customTimeKeysToAdd, (id) => {
      const datetime = customTimes[id];
      this.$el.addCustomTime(datetime, id);
    });

    each(customTimeKeysToUpdate, (id) => {
      const datetime = customTimes[id];
      this.$el.setCustomTime(datetime, id);
    });

    this.setState({
      customTimes
    });
  }

  render() {
    return (
      <div ref='container' />
    );
  }
}

InvestigationTimeline.defaultProps = assign(
  {
    items: [],
    groups: [],
    options: {},
    selection: [],
    customTimes: {},
  },
  eventDefaultProps
);
