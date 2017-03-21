import React from 'react';
import SocketIOFileClient from 'socket.io-file-client';
const CryptoJS = require("crypto-js");

export default class FileUpload extends React.Component {
    constructor(props) {
        super(props);

        this.handleFileInput = this.handleFileInput.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);

        var socket = this.props.socket;

        socket.on('file:upload', this._receiveFile);

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
            file: null
        };
    }

    _receiveFile(data) {
        console.log("receive file");
        var decrypted = CryptoJS.AES.decrypt(data.encrypted.toString(), '11111')
                                    .toString(CryptoJS.enc.Latin1);
        if(!/^data:/.test(decrypted)){
            alert("Invalid pass phrase or file! Please try again.");
            return false;
        }
        var a = document.getElementById("download");
        a.setAttribute("href", decrypted);
        a.setAttribute('download', data.name);
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
        reader.onload = function(e){
            console.log("upload file");
            var encrypted = CryptoJS.AES.encrypt(e.target.result, '11111');
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
                <a href="" id="download">Download</a>
            </div>
        );
    }
}
