import React from 'react';
import MessageList from './MessageList.jsx';
import MessageForm from './MessageForm.jsx';

export default class Room extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: props.messages
        }
        this.handleSubmitMessage = this.handleSubmitMessage.bind(this);
    }

    handleSubmitMessage(text) {
        console.log(text);
    }

    render() {
        return (
            <div className="interact">
                <MessageList
                    messages={this.state.messages}
                />
                <MessageForm
                    onMessageSubmit={this.handleSubmitMessage}
                />
            </div>
        );
    }
}
