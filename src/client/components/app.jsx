import React from 'react';
import Room from './Room.jsx';
import RoomForm from './RoomForm.jsx';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.handleJoinRoom = this.handleJoinRoom.bind(this);
    }
    handleJoinRoom(id) {
        console.log(`join room ${id}`);
    }
    render() {
        return (
            <div className="app">
                <div className="sidebar">
                    <RoomForm
                        onRoomSubmit={this.handleJoinRoom}
                    />
                </div>
                <Room 
                    messages={[]}
                />
            </div>
        );
    }
}