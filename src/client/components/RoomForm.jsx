import React from 'react';
import io from 'socket.io-client';

export default class RoomForm extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            id: ''
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({id: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        
        const id = this.state.id;

        this.props.onRoomSubmit(id);
        this.setState({id: ''});
    }

    render() {
        return (
            <div className="room-form">
                <h3>Input room number:</h3>
                <form onSubmit={this.handleSubmit}>
                    <input
                        type="text"
                        value={this.state.id}
                        onChange={this.handleChange}
                    />
                </form>
            </div>
        );
    }
}