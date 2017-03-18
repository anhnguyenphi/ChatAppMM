import React from 'react';
import Room from './Room.jsx';
import RoomForm from './RoomForm.jsx';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isJoinRoom: false,
            currentRoom: null
        }
        this.handleJoinRoom = this.handleJoinRoom.bind(this);
    }
    handleJoinRoom(roomId) {
        this.setState({
            isJoinRoom: true,
            currentRoom: roomId
        })
    }
    render() {
        return (
            <div className="app">
                <div className="sidebar">
                    <RoomForm
                        socket={this.props.socket}
                        onRoomSubmit={this.handleJoinRoom}
                    />
                </div>
                {this.state.isJoinRoom ? (
                    <Room
                        roomId={this.state.currentRoom}
                        socket={this.props.socket}
                    />
                ) : (
                    <Room
                        roomId={this.state.currentRoom}
                        socket={null}
                    />
                )}
                
            </div>
        );
    }
}