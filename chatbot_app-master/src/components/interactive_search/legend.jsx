import React, { Component } from "react";
import Node from "./node";
import { NodePlusFill, XCircleFill } from "react-bootstrap-icons";

class Legend extends Component {
  state = {};
  render() {
    return (
      <div className="legend margin">
        <h3>Legend</h3>
        <div className="margin legendRow">
          <div
            className="margin"
            style={{ position: "relative", width: "10vw" }}
          >
            <Node
              node={{
                text: "Document",
                type_: "Document",
                neighbours_present: true,
                legend: true,
              }}
            />
          </div>
          <div
            className="margin"
            style={{ position: "relative", width: "10vw" }}
          >
            This represents a IIITD policy document.
          </div>
        </div>
        <div className="margin legendRow">
          <div
            className="margin"
            style={{ position: "relative", width: "10vw" }}
          >
            <Node
              node={{
                text: "Topic",
                type_: "Topic",
                neighbours_present: true,
                legend: true,
              }}
            />
          </div>
          <div
            className="margin"
            style={{ position: "relative", width: "10vw" }}
          >
            This represents a topic or subtopic present in a IIITD policy
            document.
          </div>
        </div>
        <div className="margin legendRow">
          <div
            className="margin"
            style={{ position: "relative", width: "10vw" }}
          >
            <Node
              node={{
                text: "Paragraph",
                type_: "Paragraph",
                neighbours_present: true,
                legend: true,
              }}
            />
          </div>
          <div
            className="margin"
            style={{ position: "relative", width: "10vw" }}
          >
            This represents a paragraph present in a IIITD policy document.
          </div>
        </div>
        <div className="margin legendRow">
          <div
            className="margin"
            style={{ position: "relative", width: "10vw" }}
          >
            <Node
              node={{
                text: "Sentence",
                type_: "Sentence",
                neighbours_present: true,
                legend: true,
              }}
            />
          </div>
          <div
            className="margin"
            style={{ position: "relative", width: "10vw" }}
          >
            This represents a sentence in a IIITD policy document.
          </div>
        </div>
        <div className="margin legendRow">
          <div
            className="margin"
            style={{ position: "relative", width: "10vw" }}
          >
            <Node
              node={{
                text: "Token",
                type_: "ExtEntity",
                neighbours_present: true,
                legend: true,
              }}
            />
          </div>
          <div
            className="margin"
            style={{ position: "relative", width: "10vw" }}
          >
            This represents a noun phrase in a IIITD policy document.
          </div>
        </div>
        <div className="margin legendRow">
          <div
            className="margin"
            style={{ position: "relative", width: "10vw" }}
          >
            <NodePlusFill className="icon" />
          </div>
          <div
            className="margin"
            style={{ position: "relative", width: "10vw" }}
          >
            Add neighbours of the current node to graph.
          </div>
        </div>
        <div className="margin legendRow">
          <div
            className="margin"
            style={{ position: "relative", width: "10vw" }}
          >
            <XCircleFill className="icon" />
          </div>
          <div
            className="margin"
            style={{ position: "relative", width: "10vw" }}
          >
            Remove node from graph. Neighbouring nodes with no other neighbours
            will also be removed.
          </div>
        </div>
      </div>
    );
  }
}

export default Legend;
