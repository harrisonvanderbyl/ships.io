const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
   require("./public/helperfuncs.js")
   require("./public/actor.js")
   require("./public/ship.js")
   require("./public/sea.js")
var sea = new Sea();
app.use(express.static('public'));

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

io.on('connection', function(socket) {
  socket.on("hello world", function(msg) {
    io.emit("hello world", msg);
  });
  socket.on('chat message', function(msg) {
    io.emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});