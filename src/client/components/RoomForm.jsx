import React from 'react';
import io from 'socket.io-client';

export default class RoomForm extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            input: '',
            roomId: '',
            isJoined: false
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleOut = this.handleOut.bind(this);
        this._open = this._open.bind(this);
        this._close = this._close.bind(this);
    }

    componentDidMount() {
        let socket = this.props.socket;
        socket.on('room:open', this._open);
        socket.on('room:close', this._close);
    }

    _open(data) {
        if (data){
            this.props.onRoomSubmit(this.state.roomId);
            this.setState({
                isJoined: true
            })
        }        
    }

    _close(data) {
        if (date){
            this.setState({
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
        const roomId = this.state.roomId;

        socket.emit('room:open', roomId); 
        this.setState({input: ''});
    }

    handleOut(event) {
        event.preventDefault();
        let socket = this.props.socket;
        const roomId = this.state.roomId;
        socket.emit('room:close', roomId); 
    }

    render() {
        return (
            <div className="room-form">
                <h3>Create a room:</h3>
                <form onSubmit={this.handleSubmit}>
                    <input
                        type="text"
                        disabled={this.roomId}
                        value={this.state.input}
                        onChange={this.handleChange}
                    />
                    <input
                        type="submit"
                        value="Join"
                    />
                </form>
                { this.state.isJoined && (
                    <form onSubmit={this.handleOut}>
                        <p>Joined Room: {this.roomId}</p>
                        <input
                            type="submit"
                            value="Out"
                        />
                    </form>
                )}
            </div>
        );
    }
}