// @flow
import React from 'react';

import InvestigationGraph from 'components/InvestigationGraph';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import Rxmq from 'rxmq';

export default class InvestigationGraphWidget extends React.Component {
  buildNodes(nodes) {
    return nodes.map(node => ({
      id: node.id,
      label: node.title,
      color: '#e09c41',
      shape: 'hexagon',
      labelHighlightBold: false
    }));
    /*
      [
      {id: 1, label: "Node 1", color: "#e04141", shape: 'hexagon', labelHighlightBold: false},
      {id: 2, label: "Node 2", color: "#e09c41", shape: 'hexagon', labelHighlightBold: false},
      {id: 3, label: "Node 3", color: "#e0df41", shape: 'hexagon', labelHighlightBold: false},
      {id: 4, label: "Node 4", color: "#7be041", shape: 'hexagon'},
      {id: 5, label: 'Node 5', shape: 'hexagon'}
    ];
*/
  }

  buildEdges(edges) {
    return edges.map(edge => ({
      from: edge.from,
      to: edge.to
    }));
  }

  render() {
    const {
      data, parent, title, includeProperties, excludeProperties
    } = this.props;

    if (!data) {
      return null;
    }

    const graph = {
      nodes: this.buildNodes(data.nodes),
      edges: this.buildEdges(data.edges)
    };

    const options = {
      layout: {
        improvedLayout: true,
        hierarchical: {
          enabled: false,
          levelSeparation: 150,
          nodeSpacing: 100,
          treeSpacing: 200,
          blockShifting: true,
          edgeMinimization: true,
          parentCentralization: true,
          direction: 'UD',
          sortMethod: 'directed'
        }
      },
      interaction: {
        dragNodes: false,
        dragView: true,
        hideEdgesOnDrag: false,
        hideNodesOnDrag: false,
        hover: false,
        hoverConnectedEdges: true,
        keyboard: {
          enabled: false,
          speed: {
            x: 10,
            y: 10,
            zoom: 0.02
          },
          bindToWindow: true
        },
        multiselect: false,
        navigationButtons: true,
        selectable: true,
        selectConnectedEdges: true,
        tooltipDelay: 300,
        zoomView: true
      },
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 95,
          springConstant: 0.04,
          damping: 0.09,
          avoidOverlap: 0
        },
        forceAtlas2Based: {
          gravitationalConstant: -50,
          centralGravity: 0.01,
          springConstant: 0.08,
          springLength: 100,
          damping: 0.4,
          avoidOverlap: 0
        },
        repulsion: {
          centralGravity: 0.2,
          springLength: 200,
          springConstant: 0.05,
          nodeDistance: 100,
          damping: 0.09
        },
        hierarchicalRepulsion: {
          centralGravity: 0.0,
          springLength: 100,
          springConstant: 0.01,
          nodeDistance: 120,
          damping: 0.09
        },
        maxVelocity: 50,
        minVelocity: 0.1,
        solver: 'hierarchicalRepulsion',
        stabilization: {
          enabled: true,
          iterations: 1000,
          updateInterval: 100,
          onlyDynamicEdges: false,
          fit: true
        },
        timestep: 0.5,
        adaptiveTimestep: true
      },
      edges: {
        color: '#000000'
      }
    };

    const events = {
      selectNode: (event) => {
        const { nodes, edges, items } = event;
        Rxmq.channel('graph').subject('selection').next(nodes);
      },
      doubleClick: (event) => {
        const { nodes, edges, items } = event;
        NotificationManager.info(
          `Expanding outgoing relationships for ${nodes.join(',')}`,
          'Expand Outgoing Links',
          5000
        );
      }
    };

    return (
      <InvestigationGraph
        graph={graph}
        options={options}
        events={events}
      />
    );
  }
}
