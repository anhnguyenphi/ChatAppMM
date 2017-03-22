const crypto = require("crypto");
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
    });
    return io;
}
