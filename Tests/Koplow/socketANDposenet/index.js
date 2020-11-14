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
  this.player_positions = [];
  this.player_scores = [];
  this.winner = null
}

var hole=generateRandPos()


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
    playerRoom.player_scores.push(null)

    console.log('a user connected to '+playerRoom.name+" which now has:");
    console.log(playerRoom.players)

    socket.on('disconnect', () => {
        //remove player from registry
        let idx = playerRoom.players.indexOf(socket.id);
        playerRoom.players.splice(idx, 1);
        playerRoom.player_positions.splice(idx, 1);
        playerRoom.player_scores.splice(idx, 1);
        
        console.log('user disconnected from '+playerRoom.name+" which now has:");
        console.log(playerRoom.players)
    });
  
    var winner = 0;
    socket.on('senduserpos', (senduserpos) => {
      let idx = playerRoom.players.indexOf(socket.id);
      playerRoom.player_positions[idx]=senduserpos[0]
      playerRoom.player_scores[idx]=senduserpos[1] 

      if (playerRoom.player_scores.length==2){
      if (playerRoom.player_scores[0]!=null && playerRoom.player_scores[1]!=null){
        playerRoom.winner = playerRoom.player_scores.indexOf(Math.min.apply(Math, playerRoom.player_scores))+1;

          io.to(socket.id).emit('winner', playerRoom.winner);
          
          //console.log(winner); 
      }
      }
      if (playerRoom.player_scores.length==1){
        if (playerRoom.player_scores[0]!=null){
          playerRoom.winner = playerRoom.player_scores.indexOf(Math.min.apply(Math, playerRoom.player_scores))+1;
          io.to(socket.id).emit('winner', playerRoom.winner);
          //console.log(winner); 
      }
      }
      io.to(socket.id).emit('posrecived', true)

    });

    socket.on('getroomname', () => {
      io.to(socket.id).emit('roomname', [playerRoom.name,playerRoom.players.indexOf(socket.id)+1]);
    });


});

function generateRandPos(){
  //generate random position


  let hole=[
    {
      score: 0.997854471206665,
      part: 'nose',
      position: { x: 273.30447660809824, y: 218.66378012334326 }
    },
    {
      score: 0.9995414614677429,
      part: 'leftEye',
      position: { x: 296.14995459174366, y: 198.94808912091685 }
    },
    {
      score: 0.9904188513755798,
      part: 'rightEye',
      position: { x: 265.5430537717352, y: 201.28500511674105 }
    },
    {
      score: 0.9351797103881836,
      part: 'leftEar',
      position: { x: 337.0180668812318, y: 218.31939816011067 }
    },
    {
      score: 0.07328098267316818,
      part: 'rightEar',
      position: { x: 254.42494076977445, y: 213.22769818138983 }
    },
    {
      score: 0.9926152229309082,
      part: 'leftShoulder',
      position: { x: 398.32964247766637, y: 339.4576112027298 }
    },
    {
      score: 0.965318500995636,
      part: 'rightShoulder',
      position: { x: 211.50804690349892, y: 339.1268861525717 }
    },
    {
      score: 0.9304927587509155,
      part: 'leftElbow',
      position: { x: 542.4161110963339, y: 427.8702577821012 }
    },
    {
      score: 0.624074399471283,
      part: 'rightElbow',
      position: { x: 51.18601520701605, y: 394.3691307097558 }
    },
    {
      score: 0.8505564332008362,
      part: 'leftWrist',
      position: { x: 501.78288916205616, y: 233.40952535547638 }
    },
    {
      score: 0.6258065104484558,
      part: 'rightWrist',
      position: { x: 71.67409577722215, y: 217.41270072729208 }
    },
    {
      score: 0.0748775377869606,
      part: 'leftHip',
      position: { x: 385.07964969145183, y: 552.1364537101775 }
    },
    {
      score: 0.18049569427967072,
      part: 'rightHip',
      position: { x: 230.32427004803017, y: 561.6955545625798 }
    },
    {
      score: 0.010634002275764942,
      part: 'leftKnee',
      position: { x: 397.9059980444407, y: 523.032170158416 }
    },
    {
      score: 0.014222485944628716,
      part: 'rightKnee',
      position: { x: 190.44461558301163, y: 552.1907999357825 }
    },
    {
      score: 0.01490487065166235,
      part: 'leftAnkle',
      position: { x: 392.64645943845755, y: 555.1041551879408 }
    },
    {
      score: 0.006625391077250242,
      part: 'rightAnkle',
      position: { x: 195.3563028179718, y: 565.295788360477 }
    }
  ]

  return hole
}


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
  //var id = setTimeout(posingtime, 10);  
  var roomloop = setInterval(posingtime, 10);
  
  function posingtime() {
    io.to(rooms[i].name).emit('roomdata', [rooms[i],hole]);
  }


  
}


http.listen(3000, () => {
  console.log('listening on *:3000');
}); 