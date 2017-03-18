import React from 'react';
import MessageList from './MessageList.jsx';
import MessageForm from './MessageForm.jsx';

export default class Room extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            users: [],
            user: ''
        }
        this.handleSubmitMessage = this.handleSubmitMessage.bind(this);
        this._initialize = this._initialize.bind(this);
        this._userJoined = this._userJoined.bind(this);
        this._messageRecieve = this._messageRecieve.bind(this);
        this._userLeft = this._userLeft.bind(this);
    }

    componentDidMount() {
        var socket = this.props.socket;
        socket.on('init', this._initialize);
        socket.on('send:message', this._messageRecieve);
        socket.on('user:join', this._userJoined);
        socket.on('user:left', this._userLeft);
    }

    _initialize(data) {
        var { users, name } = data;
        this.setState({ users, user: name });
    }

    _userJoined(data) {
        var { users, messages } = this.state;
        var { name } = data;
        users.push(name);
        messages.push({
            user: 'APPLICATION BOT',
            text: name + ' Joined'
        });
        this.setState({ users, messages });
    }

    _userLeft(data) {
        var {users, messages} = this.state;
		var {name} = data;
		var index = users.indexOf(name);
		users.splice(index, 1);
		messages.push({
			user: 'APPLICATION BOT',
			text : name +' Left'
		});
		this.setState({users, messages});  
    }

    _messageRecieve(data) {
        var { messages, user } = this.state;
        messages.push({user: data.user, text: data.text});
        this.setState({ messages });
    }

    handleSubmitMessage(message) {
        var socket = this.props.socket;
        var { messages, user } = this.state;
        messages.push({user: user, text: message});
        this.setState({ messages });
        socket.emit('send:message', {user: user, text: message});
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
