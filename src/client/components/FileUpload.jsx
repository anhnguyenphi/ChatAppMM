import React from 'react';
import SocketIOFileClient from 'socket.io-file-client';
const CryptoJS = require("crypto-js");

export default class FileUpload extends React.Component {
    constructor(props) {
        super(props);

        this.handleFileInput = this.handleFileInput.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);

        var socket = this.props.socket;

        var uploader = new SocketIOFileClient(socket);
        uploader.on('start', function (fileInfo) {
            console.log('Start uploading', fileInfo);
        });
        uploader.on('stream', function (fileInfo) {
            console.log('Streaming... sent ' + fileInfo.sent + ' bytes.');
        });
        uploader.on('complete', function (fileInfo) {
            console.log('Upload Complete', fileInfo);
        });
        uploader.on('error', function (err) {
            console.log('Error!', err);
        });
        uploader.on('abort', function (fileInfo) {
            console.log('Aborted: ', fileInfo);
        });

        this.state = { 
            uploader: uploader,
            file: null,
            keyE: this.props.keyE
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            keyE: nextProps.keyE
        })
    }

    handleFileInput(event) {
        var file = event.target.files[0];
        this.setState({
            file: file
        })
    }

    handleFormSubmit(event) {
        event.preventDefault();

        var file = this.state.file;
        var reader = new FileReader();
        var uploader = this.state.uploader;
        var socket = this.props.socket;
        var key = this.state.keyE;
        reader.onload = function(e){
            console.log("upload file");
            var encrypted = CryptoJS.AES.encrypt(e.target.result, key);
            socket.emit('file:upload', {encrypted: encrypted.toString(), name: file.name });
        }

        console.log(reader.readAsDataURL(file));

    }

    render() {
        return (
            <div className="chat-form">
                <form onSubmit={this.handleFormSubmit}>
                    <input
                        id="upload_file"
                        type="file"
                        onChange={this.handleFileInput}
                    />
                    <button type="submit"> send </button>
                </form>
            </div>
        );
    }
}
