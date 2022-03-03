import React, { Component } from "react";
import Chatbot from "./chatbot/chatbot";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import "../stylesheets/app.css";
import InteractiveSearch from "./interactive_search/interactiveSearch";

class App extends Component {
  state = {};
  render() {
    return (
      <Tabs
        defaultActiveKey="chatbot"
        id="chatbot"
        style={{ height: "7vh", "font-size": "2.5vh" }}
      >
        <Tab eventKey="chatbot" style={{ height: "4vh" }} title="Chatbot">
          <Chatbot />
        </Tab>
        <Tab eventKey="kg" title="Knowledge Graph">
          <InteractiveSearch />
        </Tab>
      </Tabs>
    );
  }
}

export default App;
