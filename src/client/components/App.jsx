import React from 'react';
import Room from './Room.jsx';
import RoomForm from './RoomForm.jsx';
import RoomList from './RoomList.jsx';

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
        if (roomId) {
            this.setState({
                isJoinRoom: true,
                currentRoom: roomId
            })
        } else {
            this.setState({
                isJoinRoom: false,
                currentRoom: ''
            })
        }

    }
    render() {
        return (
            <div className="app">
                <div className="sidebar">
                    <RoomForm
                        socket={this.props.socket}
                        onRoomSubmit={this.handleJoinRoom}
                    />
                    <RoomList
                        socket={this.props.socket}

                    />
                </div>
                <Room
                    roomId={this.state.currentRoom}
                    socket={this.props.socket}
                />
            </div>
        );
    }
}