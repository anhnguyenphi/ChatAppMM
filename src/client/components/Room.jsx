import React from 'react';
import MessageList from './MessageList.jsx';
import MessageForm from './MessageForm.jsx';
import FileUpload from './FileUpload.jsx';
const CryptoJS = require("crypto-js");
const NodeRSA = require('node-rsa');
const crypto = require("crypto");

export default class Room extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            roomId: '',
            messages: [],
            users: [],
            user: '',
            keyRSA: new NodeRSA({b: 512}),
            keyAES: null,
        }
        this.handleSubmitMessage = this.handleSubmitMessage.bind(this);
        this._initialize = this._initialize.bind(this);
        this._userJoined = this._userJoined.bind(this);
        this._messageRecieve = this._messageRecieve.bind(this);
        this._userLeft = this._userLeft.bind(this);
        this._recieveKey = this._recieveKey.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        console.log('daa');
        let socket = this.props.socket;
        socket.on('init', this._initialize);
        socket.on('key:recieve', this._recieveKey);
        socket.on('send:message', this._messageRecieve);
        socket.on('user:join', this._userJoined);
        socket.on('user:left', this._userLeft);
        this.setState({
            messages: [],
            users: [],
            roomId: nextProps.roomId
        })
    }

    _initialize(data) {
        let socket = this.props.socket;
        let { users, name } = data;
        let key = this.state.keyRSA;

        socket.emit('key:send', key.exportKey('pkcs8-public-pem'));
        this.setState({ users, user: name });
    }

    _recieveKey(data) {
        let key = this.state.keyRSA;

        var buffer = new Buffer(data, "base64");
        var decrypted = crypto.privateDecrypt(key.exportKey('pkcs8-private-pem'), buffer);
        this.setState({
            keyAES: decrypted.toString("utf8")
        });
    }

    _userJoined(data) {
        let { users, messages } = this.state;
        let { name } = data;
        users.push(name);
        messages.push({
            user: 'APPLICATION BOT',
            text: name + ' Joined'
        });
        this.setState({ users, messages });
    }

    _userLeft(data) {
        let {users, messages} = this.state;
		let {name} = data;
		let index = users.indexOf(name);
		users.splice(index, 1);
		messages.push({
			user: 'APPLICATION BOT',
			text : name +' Left'
		});
		this.setState({users, messages});
    }

    _messageRecieve(message) {
        let { messages, user, keyAES } = this.state;
        let { hash, data } = message;
        console.log(message);
        // decrypt
        let bytes  = CryptoJS.AES.decrypt(data, keyAES);
        let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        let hashValue = CryptoJS.MD5(data).toString();

        if (hash == hashValue) {
            messages.push(decryptedData);
            this.setState({ messages });
        } else {
            messages.push({
                user: 'APPLICATION BOT',
                text : 'Message recieve fail!'
            });
            this.setState({ messages });
        }
    }

    handleSubmitMessage(message) {
        let socket = this.props.socket;
        let { messages, user, keyAES } = this.state;
        let object = {user: user, text: message};
        messages.push(object);
        this.setState({ messages });
        // encrypt
        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(object), keyAES).toString();
        let hashValue = CryptoJS.MD5(ciphertext).toString();
        ////
        socket.emit('send:message', {hash: hashValue, data: ciphertext});
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

                <FileUpload
                    socket={this.props.socket}
                />

            </div>
        );
    }
}
