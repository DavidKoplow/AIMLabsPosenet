var express = require('express')
var app = express()
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var players = []
var player_positions = []
var rooms = []

app.use(express.static('public'))

io.on('connection', (socket) => {
    console.log('a user connected');
    players.push(socket.id)
    player_positions.push(null)
    console.log(players)

    socket.on('disconnect', () => {
        let idx = players.indexOf(socket.id);
        players.splice(idx, 1);
        player_positions.splice(idx, 1);
        console.log('user disconnected');
        console.log(players)
    });
  

    socket.on('pos', (pos) => {
      let idx = players.indexOf(socket.id);
      player_positions[idx]=pos
    });


  });
  setInterval(() => {
    io.emit('positions', player_positions);
  }, 10);



http.listen(3000, () => {
  console.log('listening on *:3000');
});