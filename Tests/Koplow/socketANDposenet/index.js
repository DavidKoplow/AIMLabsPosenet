var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var players = []
var player_positions = []

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
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
    socket.on('chat message', (msg) => {
      
      console.log('message: ' + msg);
    });

    socket.on('pos', (pos) => {
      let idx = players.indexOf(socket.id);
      player_positions[idx]=pos
    });


    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
      });

  });
  setInterval(() => {
    io.emit('positions', player_positions);
   // console.log(player_positions)
  }, 10);



http.listen(3000, () => {
  console.log('listening on *:3000');
});