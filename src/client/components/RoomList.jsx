import React from 'react';
import Message from './RoomItem.jsx';

export default class RoomList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rooms: []
        }
        this._roomReceive = this._roomReceive.bind(this);
        
        let socket = this.props.socket;
        socket.on('room:list', this._roomReceive);
    }

    _roomReceive(rooms) {
        this.setState({
            rooms: rooms
        });
    }

    render() {
        return (
            <div className="rooms-wrap">
                <h2>List room:</h2>
                <div className="rooms">
                    {
                        this.state.rooms.map((room, i) => {
                            return (
                                <Message 
                                    key={i}
                                    name={room}
                                />
                            );
                        })
                    }
                </div>
            </div>
        );
    }
}