import React, { Component } from "react";
import { Graph } from "react-d3-graph";
import Node from "./node";
import "../../stylesheets/kg.css";

class KG extends Component {
  state = {};
  constructor(props) {
    super(props);
    this.calculatePositions = this.calculatePositions.bind(this);
  }
  shouldComponentUpdate(nextProps) {
    return nextProps.graph !== this.props.graph;
  }
  render() {
    this.calculatePositions();
    return (
      <div className="kg">
        <svg width={window.innerWidth * 0.8} height={window.innerHeight * 0.8}>
          {this.props.graph.links.map((link) => (
            <line
              x1={link.x1}
              y1={link.y1}
              x2={link.x2}
              y2={link.y2}
              style={{
                stroke: "rgb(200,200,200)",
                strokeWidth: 2,
              }}
            />
          ))}
        </svg>
        {this.props.graph.nodes.map((node) => (
          <Node
            node={node}
            getNeighbours={this.props.getNeighbours}
            removeNode={this.props.removeNode}
            onClickNode={this.props.onClickNode}
          />
        ))}
      </div>
    );
  }
  calculatePositions() {
    var topic_tree = this.props.graph.nodes
      .filter((node) => node.type_ == "Topic" || node.type_ == "Document")
      .map((element) => element.id)
      .filter((value, index, self) => {
        return self.indexOf(value) === index;
      });

    console.log(topic_tree);

    // create adjacency list and parent list
    var adj_list = {};
    var parent = {};
    topic_tree.forEach((element) => {
      adj_list[element] = [];
      parent[element] = undefined;
    });
    this.props.graph.links.forEach((element) => {
      if (
        adj_list.hasOwnProperty(element.target) &&
        adj_list.hasOwnProperty(element.source)
      ) {
        adj_list[element.target].push(element.source);
        parent[element.source] = element.target;
      }
    });

    // BFS to identify levels of Topics
    var queue = topic_tree
      .filter((element) => parent[element] == undefined)
      .filter((value, index, self) => {
        return self.indexOf(value) === index;
      });
    console.log(adj_list);
    var depth = {};
    var max_depth = 1;
    queue.forEach((node) => (depth[node] = 1));
    while (queue.length) {
      var curr = queue.shift();
      adj_list[curr].forEach((x) => {
        queue.push(x);
        depth[x] = depth[curr] + 1;
        max_depth = depth[x];
      });
    }

    // craete layers
    var layers = [];
    for (var i = 0; i < max_depth; ++i) {
      layers.push([]);
    }
    topic_tree.forEach((node) => {
      layers[depth[node] - 1].push(node);
    });
    layers = [
      ...layers,
      this.props.graph.nodes
        .filter((node) => node.type_ == "Paragraph")
        .map((element) => element.id)
        .filter((value, index, self) => {
          return self.indexOf(value) === index;
        }),
      this.props.graph.nodes
        .filter((node) => node.type_ == "Sentence")
        .map((element) => element.id)
        .filter((value, index, self) => {
          return self.indexOf(value) === index;
        }),
      this.props.graph.nodes
        .filter((node) => node.type_ == "ExtEntity")
        .map((element) => element.id)
        .filter((value, index, self) => {
          return self.indexOf(value) === index;
        }),
    ];

    // Assign position to each node in a level
    var positions = {};
    for (var i = 0; i < layers.length; ++i) {
      var s = "";
      for (var j = 0; j < layers[i].length; ++j) {
        positions[layers[i][j]] = { x: j, y: i };
        s += layers[i][j] + " ";
      }
    }
    this.props.graph.nodes.forEach((node) => {
      node.x =
        positions[node.id].x * window.innerWidth * 0.066 +
        window.innerWidth * 0.05;
      node.y =
        positions[node.id].y * window.innerHeight * 0.12 +
        window.innerHeight * 0.05;
    });
    this.props.graph.links.forEach((link) => {
      link.x1 =
        positions[link.source].x * window.innerWidth * 0.066 +
        window.innerWidth * 0.08;
      link.y1 =
        positions[link.source].y * window.innerHeight * 0.12 +
        window.innerHeight * 0.1;
      link.x2 =
        positions[link.target].x * window.innerWidth * 0.066 +
        window.innerWidth * 0.08;
      link.y2 =
        positions[link.target].y * window.innerHeight * 0.12 +
        window.innerHeight * 0.1;
    });
  }
}

export default KG;
