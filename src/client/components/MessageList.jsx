import React from 'react';
import Message from './Message.jsx';

export default class MessageList extends React.Component {  
    render() {
        return (
            <div className="messages-wrap">
                <h2>Messages:</h2>
                <div className="messages">
                    {
                        this.props.messages.map((message, i) => {
                            return (
                                <Message 
                                    key={i}
                                    user={message.user}
                                    text={message.text}
                                />
                            );
                        })
                    }
                </div>
            </div>
        );
    }
}