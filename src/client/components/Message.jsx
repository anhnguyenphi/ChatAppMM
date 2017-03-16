import React from 'react';

export default class Message extends React.Component {
    render() {
        return (
            <div className="message">
                <strong>{this.props.user}:</strong>
                <span>{this.props.text}</span>
            </div>
        );
    }
}