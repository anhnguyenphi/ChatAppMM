import express from 'express'
import config from '../../config.js'

var socket = require('./socket.js');

var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';
var ss = require('socket.io-stream');
ss.forceBase64 = true;
var path = require('path');
const fs = require('fs');
var decrypt = crypto.createDecipher(algorithm, password);

const app = express()
    // Set port
app.set('port', process.env.PORT || config.port)
    // Static files
app.use(express.static('public'))
const http = require('http').Server(app)
const io = require('socket.io')(http)
io.sockets.on('connection', socket);

var decrypt = crypto.createDecipher(algorithm, password);

io.of('/file').on('connection', function(socket) {
    ss(socket).on('file', function(stream, data) {
        var filename = path.basename(data.name);
        stream.pipe(fs.createWriteStream("data/" + filename));
    });
});

// Route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

http.listen(app.get('port'), () => {
    console.log('React Chat App listening on ' + app.get('port'))
})

export default app;