import React from 'react';
import SocketIOFileClient from 'socket.io-file-client';

export default class FileUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            uploader: ''
        };

        this.handleUpFile = this.handleUpFile.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        var socket = this.props.socket;

        if (socket) {
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

            this.setState({ uploader: uploader });
        }
    }

    handleUpFile() {
        var fileEl = document.getElementById('upload_file');
        console.log(fileEl);
        var uploadIds = this.state.uploader.upload(fileEl);
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
