import React, { Component } from "react";
import Node from "./node";
import { NodePlus } from "react-bootstrap-icons";

class InfoBox extends Component {
  state = {};
  render() {
    return (
      <div className="infoBox margin">
        <div>
          {console.log(this.props)}
          {this.props.selectedNode ? (
            <div className="infoBoxContent margin">
              <h4>Selected Node</h4>
              {/* <Node node={this.props.selectedNode} /> */}
              <p>
                <b>Node ID: </b> {this.props.selectedNode.id}
              </p>
              <p>
                <b>Node Type: </b> {this.props.selectedNode.type_}
              </p>
              <p>
                <b>Node Text: </b> {this.props.selectedNode.text}
              </p>
              <span>Add its neighbours: </span>
              <NodePlus
                onClick={() =>
                  this.props.getNeighbours([this.props.selectedNode])
                }
                type="button"
                className="margin icon"
              />
            </div>
          ) : (
            <div className="infoBoxContent">Click on a Node</div>
          )}
        </div>
      </div>
    );
  }
}

export default InfoBox;
