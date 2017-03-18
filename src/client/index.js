import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.jsx';
import io from 'socket.io-client'

var socket = io.connect();

ReactDOM.render(
    <App
        socket={socket}
    />,
    document.getElementById('root')
);
