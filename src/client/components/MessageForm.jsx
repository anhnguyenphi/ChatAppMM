import React from 'react';

export default class MessageForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: ''
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({text: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();

        const text = this.state.text;
        this.props.onMessageSubmit(text);
        this.setState({text: ''});
    }

    render() {
        return (
            <div className="chat-form">
                <form onSubmit={this.handleSubmit}>
                    <input
                        type="text"
                        value={this.state.text}
                        onChange={this.handleChange}
                    />
                </form>
            </div>
        );
    }
}