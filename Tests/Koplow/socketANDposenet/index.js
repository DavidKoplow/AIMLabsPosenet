//server side
var express = require('express')
var app = express()
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var numRooms = 5;
var rooms = []
var room = function(name){
  this.name = name;
  this.players = [];
  this.player_positions = [];
}
for(let i = 1; i <= numRooms; i++){
  rooms.push(new room("Room "+i))
}

app.use(express.static('public'))

io.on('connection', (socket) => {

    //place player into a room
    var playerRoom;
    for(let i = 0; i < numRooms; i++){
      if(rooms[i].players.length<2){
        playerRoom=rooms[i];
        break;
      }
    }
    socket.join(playerRoom.name)
      
    //add player to serverside registry 
    playerRoom.players.push(socket.id)
    playerRoom.player_positions.push(null)
    
    console.log('a user connected to '+playerRoom.name+" which now has:");
    console.log(playerRoom.players)

    socket.on('disconnect', () => {
        //remove player from registry
        let idx = playerRoom.players.indexOf(socket.id);
        playerRoom.players.splice(idx, 1);
        playerRoom.player_positions.splice(idx, 1);
        
        console.log('user disconnected from '+playerRoom.name+" which now has:");
        console.log(playerRoom.players)
        
        //this.io.emit('remove-user', socket.id);
    });
  

    socket.on('senduserpos', (senduserpos) => {
      let idx = playerRoom.players.indexOf(socket.id);
      playerRoom.player_positions[idx]=senduserpos
    });

    socket.on('getroomname', () => {
      io.to(socket.id).emit('roomname', playerRoom.name);
    });
    socket.on('refresh', () => {
      console.log('refreshing...')
      io.sockets.emit('broadcast',{newplayer: socket.id, description: socket.id + ' client connected!', room: playerRoom.name, player: socket.id});
      //io.to(playerRoom).emit('updateroom', playerRoom.name);
    });
    socket.on('make-offer', (data) => {
      socket.to(data.to).emit('offer-made', {
          offer: data.offer,
          socket: socket.id
      });
    });

    socket.on('make-answer', (data) => {
        socket.to(data.to).emit('answer-made', {
            socket: socket.id,
            answer: data.answer
        });
    });


});

//Periodically send out all posenet locations
for(let i = 0; i < numRooms; i++){
  setInterval(() => {
    io.to(rooms[i].name).emit('roomdata', rooms[i]);
  }, 10);
}

http.listen(3000, () => {
  console.log('listening on *:3000');
});