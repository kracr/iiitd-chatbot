import React, { Component } from "react";
import { Search } from "react-bootstrap-icons";
import KG from "./kg";
import Node from "./node";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Legend from "./legend";
import InfoBox from "./infoBox";
import "../../stylesheets/interactiveSearch.css";
// import { tree } from "./tree.jsx";

class InteractiveSearch extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.getGraph = this.getGraph.bind(this);
    this.getNeighbours = this.getNeighbours.bind(this);
    this.removeNode = this.removeNode.bind(this);
    this.onClickNode = this.onClickNode.bind(this);
  }
  state = {
    query: "admission",
    graph: {
      nodes: [],
      links: [],
    },
    loading: false,
    selectedNode: null,
  };
  neighbours_present = new Set();

  render() {
    this.graph_config = {
      config: {
        staticGraphWithDragAndDrop: true,
        height: 0.8 * window.innerHeight,
        width: 0.8 * window.innerWidth,

        d3: {
          gravity: (-5000 * 1) / (this.state.graph.nodes.length + 1),
        },
        node: {
          viewGenerator: (node) => {
            return (
              <Node
                node={node}
                getNeighbours={this.getNeighbours}
                removeNode={this.removeNode}
              />
            );
          },
          renderLabel: false,
          size: 1.2 * window.innerHeight,
        },
      },
    };
    return (
      <div className="page">
        <div className="interactiveSearchBody">
          <div className="searchBar">
            <input
              type="text"
              value={this.state.query}
              className="messageInputBox margin"
              onChange={this.handleInputChange}
              placeholder="Search"
            />
            <Search
              onClick={() => this.getGraph()}
              type="button"
              className="margin icon"
            />
          </div>
          <div className="graph">
            {this.state.graph.nodes.length == 0 ? (
              <div className="kgMessage margin"> Please enter query </div>
            ) : (
              <KG
                graph={this.state.graph}
                config={this.graph_config.config}
                onClickNode={this.onClickNode}
                getNeighbours={this.getNeighbours}
                removeNode={this.removeNode}
              />
            )}
          </div>
        </div>
        <div className="sideBar">
          <Tabs
            defaultActiveKey="legend"
            id="sidebar"
            style={{ height: "7vh", "font-size": "2.5vh" }}
          >
            <Tab eventKey="infoBox" title="InfoBox">
              {console.log(this.state.selectedNode)}
              <InfoBox
                selectedNode={this.state.selectedNode}
                getNeighbours={this.getNeighbours}
              />
            </Tab>
            <Tab eventKey="legend" title="Legend">
              <Legend />
            </Tab>
          </Tabs>
        </div>
      </div>
    );
  }

  async getGraph() {
    this.neighbours_present = new Set();
    let requestOptions = {
      method: "POST",
      body: JSON.stringify({
        query: this.state.query,
        threshold: 0,
      }),
    };
    let response = await fetch(
      "http://localhost:8080/get_closest_entities",
      requestOptions
    );
    let data = await response.json();
    this.setState({
      graph: {
        nodes: data["closest_entities"].map((node) => {
          return {
            id: String(node["entity"][0]),
            text: node["entity"][1],
            type_: node["entity"][2],
            neighbours_present: false,
            legend: false,
          };
        }),
        links: [],
      },
    });
    this.getNeighbours();
  }

  async getNeighbours(nbr_of_nodes = null) {
    if (nbr_of_nodes == null) {
      nbr_of_nodes = this.state.graph.nodes;
    }
    nbr_of_nodes = nbr_of_nodes.map((node) => node.id);
    this.neighbours_present = new Set([
      ...this.neighbours_present,
      ...nbr_of_nodes,
    ]);
    let requestOptions = {
      method: "POST",
      body: JSON.stringify({
        nodes: this.state.graph.nodes.map((node) => parseInt(node.id)),
        nbr_of_nodes: nbr_of_nodes.map((id) => parseInt(id)),
      }),
    };
    let response = await fetch(
      "http://localhost:8080/get_graph_with_neighbours",
      requestOptions
    );
    let data = await response.json();
    this.setState(
      {
        graph: {
          nodes: [
            ...new Set(
              data["nodes"].map((node) => {
                return {
                  id: String(node[0]),
                  text: node[1],
                  type_: node[2],
                  neighbours_present: this.neighbours_present.has(
                    String(node[0])
                  ),
                  legend: false,
                };
              })
            ),
          ],
          links: data["edges"].map((edge) => {
            return {
              source: String(edge[0]),
              target: String(edge[2]),
              type: edge[1],
            };
          }),
        },
      },
      () => console.log(this.state.graph)
    );
  }

  removeNode(node) {
    this.neighbours_present.delete(node);
    this.state.graph.links.forEach((link) => {
      if (link.source == node.id) {
        this.neighbours_present.delete(link.target);
      } else if (link.target == node.id) {
        this.neighbours_present.delete(link.source);
      }
    });
    let links = this.state.graph.links.filter(
      (link) => link.source != node.id && link.target != node.id
    );
    let node_ids = new Set([
      ...links.map((link) => link.source),
      ...links.map((link) => link.target),
    ]);
    let nodes = [
      ...this.state.graph.nodes
        .filter((node) => node_ids.has(node.id))
        .map((node) => {
          node.neighbours_present = this.neighbours_present.has(node[0]);
          return node;
        }),
    ];
    this.setState({
      graph: {
        nodes: nodes,
        links: links,
      },
    });
  }

  async onClickNode(node) {
    const nodeData = [
      ...this.state.graph.nodes.filter((item) => {
        return node.id === item.id;
      }),
    ][0];
    console.log(node);
    console.log(nodeData);
    nodeData.x = 1000;
    nodeData.y = 100;
    this.setState({ selectedNode: nodeData });
  }

  handleInputChange(event) {
    this.setState({ query: event.target.value });
  }
}

export default InteractiveSearch;
