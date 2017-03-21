import React from 'react';
import io from 'socket.io-client';

export default class RoomForm extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            input: '',
            roomId: '',
            isJoined: true
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this._open = this._open.bind(this);
        this._close = this._close.bind(this);
    }

    componentDidMount() {
        let socket = this.props.socket;
        socket.on('room:open', this._open);
        socket.on('room:close', this._close);
    }

    _open(roomId) {
        if (roomId){
            let socket = this.props.socket;
            this.props.onRoomSubmit(roomId);
            socket.emit('init', true);
            this.setState({
                roomId: roomId,
                isJoined: true
            })
        }        
    }

    _close(roomId) {
        if (roomId){
            this.props.onRoomSubmit(null);
            this.setState({
                roomId: null,
                isJoined: false
            })
        }
    }

    handleChange(event) {
        this.setState({input: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        let socket = this.props.socket;
        const roomId = this.state.input;
        socket.emit('room:open', roomId); 
        this.setState({input: ''});
    }

    render() {
        return (
            <div className="room-form">
                <h3>Create a room:</h3>
                <form onSubmit={this.handleSubmit}>
                    <input
                        type="text"
                        disabled={this.isJoined}
                        value={this.state.input}
                        onChange={this.handleChange}
                    />
                    <input
                        type="submit"
                        value="Join"
                    />
                </form>
                { this.state.isJoined && (
                    <p>Joined Room: {this.state.roomId}</p>
                )}
            </div>
        );
    }
}