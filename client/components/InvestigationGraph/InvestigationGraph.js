import React from 'react';

import vis from 'vis';
import uuid from 'uuid';

import { defaultsDeep, isEqual, differenceWith } from 'lodash';

class InvestigationGraph extends React.Component {
  constructor(props) {
    super(props);

    this.updateGraph = this.updateGraph.bind(this);

    const { identifier } = props;
    this.state = {
      identifier: (typeof identifier !== 'undefined') ? identifier : uuid.v4()
    };
  }

  componentDidMount() {
    const { graph } = this.props;

    this.edges = new vis.DataSet();
    this.edges.add(graph.edges);

    this.nodes = new vis.DataSet();
    this.nodes.add(graph.nodes);

    this.updateGraph();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { graph, options, events } = this.props;

    const nodesChange = !isEqual(graph.nodes, nextProps.graph.nodes);
    const edgesChange = !isEqual(graph.edges, nextProps.graph.edges);
    const optionsChange = !isEqual(options, nextProps.options);
    const eventsChange = !isEqual(events, nextProps.events);

    if (nodesChange) {
      const idIsEqual = (n1, n2) => n1.id === n2.id;

      const nodesRemoved = differenceWith(graph.nodes, nextProps.graph.nodes, idIsEqual);

      const nodesAdded = differenceWith(nextProps.graph.nodes, graph.nodes, idIsEqual);

      const nodesChanged = differenceWith(
        differenceWith(nextProps.graph.nodes, graph.nodes, isEqual),
        nodesAdded
      );

      this.patchNodes({ nodesRemoved, nodesAdded, nodesChanged });
    }

    if (edgesChange) {
      const edgesRemoved = differenceWith(this.props.graph.edges, nextProps.graph.edges, isEqual);

      const edgesAdded = differenceWith(nextProps.graph.edges, this.props.graph.edges, isEqual);

      const edgesChanged = differenceWith(
        differenceWith(nextProps.graph.edges, this.props.graph.edges, isEqual),
        edgesAdded
      );

      this.patchEdges({ edgesRemoved, edgesAdded, edgesChanged });
    }

    if (optionsChange) {
      this.Network.setOptions(nextProps.options);
    }

    if (eventsChange) {
      let events = this.props.events || {};
      for (const eventName of Object.keys(events)) {
        this.Network.off(eventName, events[eventName]);
      }

      events = nextProps.events || {};
      for (const eventName of Object.keys(events)) {
        this.Network.on(eventName, events[eventName]);
      }
    }

    return false;
  }

  componentDidUpdate() {
    this.updateGraph();
  }

  patchEdges({ edgesRemoved, edgesAdded, edgesChanged }) {
    this.edges.remove(edgesRemoved);
    this.edges.add(edgesAdded);
    this.edges.update(edgesChanged);
  }

  patchNodes({ nodesRemoved, nodesAdded, nodesChanged }) {
    this.nodes.remove(nodesRemoved);
    this.nodes.add(nodesAdded);
    this.nodes.update(nodesChanged);
  }

  updateGraph() {
    const container = document.getElementById(this.state.identifier);

    const defaultOptions = {
      physics: {
        stabilization: false
      },
      autoResize: false,
      edges: {
        smooth: false,
        color: '#000000',
        width: 0.5,
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 0.5
          }
        }
      }
    };

    const options = defaultsDeep(defaultOptions, this.props.options);

    this.Network = new vis.Network(
      container,
      Object.assign({}, this.props.graph, {
        edges: this.edges,
        nodes: this.nodes
      }),
      options
    );

    if (typeof this.props.getNetwork === 'function') {
      this.props.getNetwork(this.Network);
    }

    if (typeof this.props.getNodes === 'function') {
      this.props.getNodes(this.nodes);
    }

    if (typeof this.props.getEdges === 'function') {
      this.props.getEdges(this.edges);
    }

    const events = this.props.events || {};
    for (const eventName of Object.keys(events)) {
      this.Network.on(eventName, events[eventName]);
    }
  }

  render() {
    const { identifier } = this.state;
    const { style } = this.props;

    return React.createElement(
      'div',
      {
        id: identifier,
        style
      },
      identifier
    );
  }
}

InvestigationGraph.defaultProps = {
  graph: {},
  style: {
    background: '#fff',
    width: '100%',
    height: '100%'
  }
};

export default InvestigationGraph;
