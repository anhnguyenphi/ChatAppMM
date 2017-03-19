import React from 'react';
import SocketIOFileClient from 'socket.io-file-client';
var crypto = require("crypto"),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';
var io = require('socket.io-client');
var ss = require('socket.io-stream');
var fs = require('fs');

export default class FileUpload extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          uploader: ''
      };

      this.handleUpFile = this.handleUpFile.bind(this);
    }

    componentDidMount() {
      var socket = this.props.socket;

      var uploader = new SocketIOFileClient(socket);
      uploader.on('start', function(fileInfo) {
          console.log('Start uploading', fileInfo);
      });
      uploader.on('stream', function(fileInfo) {
          console.log('Streaming... sent ' + fileInfo.sent + ' bytes.');
      });
      uploader.on('complete', function(fileInfo) {
          console.log('Upload Complete', fileInfo);
      });
      uploader.on('error', function(err) {
          console.log('Error!', err);
      });
      uploader.on('abort', function(fileInfo) {
          console.log('Aborted: ', fileInfo);
      });

      this.setState({ uploader: uploader });
    }

    handleUpFile() {
      var socket = this.props.socket;
      var fileEl = document.getElementById('upload_file');
      console.log(fileEl);
      // var uploadIds = this.state.uploader.upload(fileEl);
      var stream = ss.createStream();
      var filename = 'profile.jpg';
      var encrypt = crypto.createCipher(algorithm, password);

      ss(socket.connect('http://localhost:3000')).emit('profile-image', stream, { name: filename });
      fs.createReadStream(filename).pipe(encrypt).pipe(stream);
    }

    handleFormSubmit(event) {
      event.preventDefault();
    }

    render() {
      return (
        <div className="chat-form">
          <form>
              <input
                id="upload_file"
                type="file"
              />
              <button type="button" onClick={this.handleUpFile} > send </button>
          </form>
        </div>
      );
    }
}
