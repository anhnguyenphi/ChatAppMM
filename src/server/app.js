import express from 'express'
import config from '../../config.js'

var socket = require('./socket.js');

const app = express()
// Set port
app.set('port', process.env.PORT || config.port)
// Static files
app.use(express.static('public'))
const http = require('http').Server(app)
const io = socket(http);
// Route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

http.listen(app.get('port'), () => {
  console.log('React Chat App listening on ' + app.get('port'))
})
