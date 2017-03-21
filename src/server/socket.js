const crypto = require("crypto");
const SocketIOFile = require('socket.io-file');
const Array = require('lodash/array');

// Keep track of which names are used so that there are no duplicates
var userNames = (function () {
    var names = {};

    var claim = function (name) {
        if (!name || names[name]) {
            return false;
        } else {
            names[name] = true;
            return true;
        }
    };

    // find the lowest unused "guest" name and claim it
    var getGuestName = function () {
        var name,
            nextUserId = 1;

        do {
            name = 'Guest ' + nextUserId;
            nextUserId += 1;
        } while (!claim(name));

        return name;
    };

    // serialize claimed names as an array
    var get = function () {
        var res = [];
        for (let u in names) {
            res.push(u);
        }

        return res;
    };

    var free = function (name) {
        if (names[name]) {
            delete names[name];
        }
    };

    return {
        claim: claim,
        free: free,
        get: get,
        getGuestName: getGuestName
    };
}());

const keyAES = crypto.randomBytes(8).toString('hex');
const keyTD = crypto.randomBytes(10).toString('hex');
var rooms = ['Lobby'];

module.exports = function ioInit(http) {
    var io = require('socket.io')(http);
    io.sockets.on('connection', function(socket) {
        var name = userNames.getGuestName();

        socket.emit('room:list', rooms);

        socket.room = 'Lobby';
        socket.join('Lobby');
        socket.emit('room:open', 'Lobby');
        console.log(`Join room: Lobby`);

        // send the new user their name and a list of users
        socket.on('room:open', function(room) {
            if (Array.indexOf(rooms, room)  < 0) {
                rooms.push(room);
            }
            socket.leave(socket.room);
            socket.broadcast.to(socket.room).emit('user:left', {
                name: name
            });

            socket.room = room;
            socket.join(room);
            socket.emit('room:open', room);
            socket.emit('room:list', rooms);
            console.log(`Join room: ${room}`);
        });
        // send the new user their name and a list of users
        socket.on('init', function(data) {
            socket.username = name;
            socket.emit('init', {
                roomId: socket.room,
                name: name,
                users: userNames.get()
            })
        });

        // notify other clients that a new user has joined
        socket.on('user:join', function(data) {
            console.log(socket.room);
            socket.broadcast.to(socket.room).emit('user:join', {name: name});
        });

        //
        socket.on('key:send', function (key) {
            var buffer = new Buffer(keyAES);
            var AES = crypto.publicEncrypt(key, buffer);
            var buffer = new Buffer(keyTD);
            var TDes = crypto.publicEncrypt(key, buffer);
            socket.emit('key:recieve', {AES: AES, TDes: TDes});
        });

        // broadcast a user's message to other users
        socket.on('send:message', function (data) {
            console.log(socket.room);
            console.log(data);
            socket.broadcast.to(socket.room).emit('send:message', data);
        });

        // send file
        socket.on('file:upload', function(data) {
            console.log("send file");
            socket.broadcast.to(socket.room).emit('file:upload', data);
        });

        // clean up when a user leaves, and broadcast it to other users
        socket.on('disconnect', function () {
            console.log(socket.room);
            socket.broadcast.to(socket.room).emit('user:left', {
                name: name
            });
            userNames.free(name);
        });


        // Upload file
        var uploader = new SocketIOFile(socket, {
            // uploadDir: {         // multiple directories
            //  music: 'data/music',
            //  document: 'data/document'
            // },
            uploadDir: 'data',                          // simple directory
            // accepts: ['audio/mpeg', 'audio/mp3'],       // chrome and some of browsers checking mp3 as 'audio/mp3', not 'audio/mpeg'
            maxFileSize: 4194304,                       // 4 MB. default is undefined(no limit)
            chunkSize: 10240,                           // default is 10240(1KB)
            transmissionDelay: 0,                       // delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay)
            overwrite: true                             // overwrite file if exists, default is true.
        });
        uploader.on('start', (fileInfo) => {
            console.log('Start uploading');
            console.log(fileInfo);
        });
        uploader.on('stream', (fileInfo) => {
            console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
        });
        uploader.on('complete', (fileInfo) => {
            console.log('Upload Complete.');
            console.log(fileInfo);
        });
        uploader.on('error', (err) => {
            console.log('Error!', err);
        });
        uploader.on('abort', (fileInfo) => {
            console.log('Aborted: ', fileInfo);
        });

    });
    return io;
}
