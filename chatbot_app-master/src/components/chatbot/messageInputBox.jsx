import React, { Component } from "react";
import sendIcon from "../../assets/sendIcon.webp";
class MessageInputBox extends Component {
  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.send = this.send.bind(this);
  }
  state = {
    message: {
      text: "",
      author: "user",
    },
  };
  render() {
    return (
      <React.Fragment>
        <div className="messageBox">
          <input
            type="text"
            value={this.state.message.text}
            className="messageInputBox margin"
            onChange={this.handleInputChange}
            placeholder="enter question"
          />
          <img
            src={sendIcon}
            onClick={this.send}
            type="button"
            className="icon"
          />
        </div>
      </React.Fragment>
    );
  }
  handleInputChange(event) {
    this.setState({
      message: { text: event.target.value, author: "user", type: "question" },
    });
  }
  send() {
    console.log(this.state.message);
    this.props.newUserMessage(this.state.message);
    this.setState({ message: { text: "", author: "user" } });
  }
}

export default MessageInputBox;
