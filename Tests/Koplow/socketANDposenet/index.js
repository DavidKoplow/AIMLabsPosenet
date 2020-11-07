var express = require('express')
var app = express()
var ws = require('ws') 
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var numRooms = 5;
var rooms = []
var room = function(name){
  this.name = name;
  this.players = [];
  this.player_scores = [];
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
    playerRoom.player_scores.push(null)

    console.log('a user connected to '+playerRoom.name+" which now has:");
    console.log(playerRoom.players)

    socket.on('disconnect', () => {
        //remove player from registry
        let idx = playerRoom.players.indexOf(socket.id);
        playerRoom.players.splice(idx, 1);
        playerRoom.player_scores.splice(idx, 1);
        
        console.log('user disconnected from '+playerRoom.name+" which now has:");
        console.log(playerRoom.players)
    });
  
    var winner = 0;
    socket.on('senduserpos', (senduserpos) => {
      let idx = playerRoom.players.indexOf(socket.id);
      playerRoom.player_scores[idx]=senduserpos 
    if (playerRoom.player_scores.length==2){
     if (playerRoom.player_scores[0]!=null && playerRoom.player_scores[1]!=null){
        var winner = playerRoom.player_scores.indexOf(Math.min.apply(Math, playerRoom.player_scores));
        io.to(socket.id).emit('winner', winner);
        console.log(winner); 
     }
    }
    if (playerRoom.player_scores.length==1){
      if (playerRoom.player_scores[0]!=null){
        var winner = playerRoom.player_scores.indexOf(Math.min.apply(Math, playerRoom.player_scores));
        io.to(socket.id).emit('winner', winner);
        console.log(winner); 
     }
    }
    });

    socket.on('getroomname', () => {
      io.to(socket.id).emit('roomname', playerRoom.name);
    });


});
/*
for(let i = 0; i < numRooms; i++){
  setInterval(() => {
    io.to(rooms[i].name).emit('roomdata', rooms[i]);
  }, 10);
}
*/
//Periodically send out all posenet locations
for(let i = 0; i < numRooms; i++){
  //var elem = document.getElementById("myBar");
  var id = setTimeout(posingtime, 50000);   
  function posingtime() {
    io.to(rooms[i].name).emit('roomdata', rooms[i]);
  }
  clearInterval(id); 
}


http.listen(5000, () => {
  console.log('listening on *:5000');
}); 