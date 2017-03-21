import React from 'react';

export default class RoomItem extends React.Component {
    render() {
        return (
            <div className="room">
                <a href="">{this.props.name}</a>
            </div>
        );
    }
}