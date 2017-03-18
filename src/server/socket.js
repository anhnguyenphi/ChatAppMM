var crypto = require("crypto");

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

const SocketIOFile = require('socket.io-file');

// export function for listening to the socket
module.exports = function (socket) {
    var name = userNames.getGuestName();

    // send the new user their name and a list of users
    socket.emit('init', {
        name: name,
        users: userNames.get(),
        sessionId: socket.id
    });

    // notify other clients that a new user has joined
    socket.emit('user:join', {
        name: name
    });

    //
    socket.on('key:send', function (key) {
        var buffer = new Buffer('abc');
        var encrypted = crypto.publicEncrypt(key, buffer);
        socket.emit('key:recieve', encrypted);
    });

    // broadcast a user's message to other users
    socket.on('send:message', function (data) {
        console.log(data);
        socket.broadcast.emit('send:message', data);
    });

    // validate a user's name change, and broadcast it on success
    socket.on('change:name', function (data, fn) {
        if (userNames.claim(data.name)) {
            var oldName = name;
            userNames.free(oldName);

            name = data.name;

            socket.broadcast.emit('change:name', {
                oldName: oldName,
                newName: name
            });

            fn(true);
        } else {
            fn(false);
        }
    });

    // clean up when a user leaves, and broadcast it to other users
    socket.on('disconnect', function () {
        socket.broadcast.emit('user:left', {
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

};