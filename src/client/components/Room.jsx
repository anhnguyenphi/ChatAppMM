import React from 'react';
import MessageList from './MessageList.jsx';
import MessageForm from './MessageForm.jsx';
import FileUpload from './FileUpload.jsx';
const CryptoJS = require("crypto-js");
const NodeRSA = require('node-rsa');
const crypto = require("crypto");

class Download extends React.Component {
    render() {
        return (
            <a href={this.props.href} download={this.props.download}>{this.props.download}</a>
        );
    }
}

export default class Room extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            roomId: '',
            messages: [],
            users: [],
            user: '',
            keyRSA: null,
            keyAES: null,
            keyTDes: null,
        }
        this.handleSubmitMessage = this.handleSubmitMessage.bind(this);
        this._initialize = this._initialize.bind(this);
        this._userJoined = this._userJoined.bind(this);
        this._messageRecieve = this._messageRecieve.bind(this);
        this._userLeft = this._userLeft.bind(this);
        this._recieveKey = this._recieveKey.bind(this);
        this._receiveFile = this._receiveFile.bind(this);

        let socket = this.props.socket;
        socket.on('init', this._initialize);
        socket.on('key:recieve', this._recieveKey);
        socket.on('send:message', this._messageRecieve);
        socket.on('user:join', this._userJoined);
        socket.on('user:left', this._userLeft);
        socket.on('file:upload', this._receiveFile);
    }
    
    _receiveFile(data) {
        let { messages, keyAES } = this.state;
        var decrypted = CryptoJS.AES.decrypt(data.encrypted.toString(), keyAES)
                                    .toString(CryptoJS.enc.Latin1);
        if(!/^data:/.test(decrypted)){
            alert("Invalid pass phrase or file! Please try again.");
            return false;
        }
        messages.push({
            user: 'APPLICATION BOT',
            text: <Download href={decrypted} download={data.name} />
        });
        this.setState({
            messages: messages
        });
    }

    _initialize(data) {
        let socket = this.props.socket;
        let { users, name, roomId } = data;
        let key = new NodeRSA({b: 512});

        socket.emit('key:send', key.exportKey('pkcs8-public-pem'));
        this.setState({ 
            users: users,
            user: name,
            roomId: roomId,
            keyRSA: key
        });
    }

    _recieveKey(data) {
        let key = this.state.keyRSA;

        console.log(data);
        var buffer = new Buffer(data.AES, "base64");
        var AES = crypto.privateDecrypt(key.exportKey('pkcs8-private-pem'), buffer);

        var buffer = new Buffer(data.TDes, "base64");
        var TDes = crypto.privateDecrypt(key.exportKey('pkcs8-private-pem'), buffer);
        this.setState({
            keyAES: AES.toString("utf8"),
            keyTDes: TDes.toString("utf8")
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
        console.log('message recieve');
        let { messages, user, keyTDes } = this.state;
        let { hash, data } = message;
        console.log(message);
        // decrypt
        let bytes  = CryptoJS.TripleDES.decrypt(data, keyTDes);
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
        let { messages, user, keyTDes } = this.state;
        let object = {user: user, text: message};
        messages.push(object);
        this.setState({ messages });
        // encrypt
        let ciphertext = CryptoJS.TripleDES.encrypt(JSON.stringify(object), keyTDes).toString();
        let hashValue = CryptoJS.MD5(ciphertext).toString();
        ////
        socket.emit('send:message', {hash: hashValue, data: ciphertext});
    }

    render() {
        return (
            <div className="interact">
                <p>Your name: {this.state.user}</p>
                <MessageList
                    messages={this.state.messages}
                />
                <MessageForm
                    onMessageSubmit={this.handleSubmitMessage}
                />

                <FileUpload
                    socket={this.props.socket}
                    keyE={this.state.keyAES}
                />

            </div>
        );
    }
}
