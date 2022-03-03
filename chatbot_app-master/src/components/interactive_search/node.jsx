import React, { Component } from "react";
import { NodePlusFill, XCircleFill } from "react-bootstrap-icons";
import "../../stylesheets/node.css";

class Node extends Component {
  state = {
    showOptions: false,
  };
  render() {
    let options = (
      <div className="options">
        {this.state.showOptions && !this.props.node.legend ? (
          <div>
            {this.props.node.neighbours_present ? null : (
              <NodePlusFill
                onClick={() => this.props.getNeighbours([this.props.node])}
                type="button"
                className="addNeighboursIcon"
              />
            )}
            <XCircleFill
              onClick={() => this.props.removeNode(this.props.node)}
              type="button"
              className="removeNodeIcon"
            />
          </div>
        ) : null}
      </div>
    );
    return (
      <div
        style={{ left: this.props.node.x, top: this.props.node.y }}
        onMouseEnter={() => this.setState({ showOptions: true })}
        onMouseLeave={() => this.setState({ showOptions: false })}
        onClick={() => this.props.onClickNode(this.props.node)}
        className="nodeBody"
      >
        {options}
        <div className="mainBody">
          <div className={this.props.node.type_}>
            <div className="nodeText">
              {this.props.node.text.length > 20
                ? this.props.node.text.slice(0, 20) + "..."
                : this.props.node.text}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Node;
