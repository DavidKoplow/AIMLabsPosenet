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

function weightedDistanceMatching(poseVector1, poseVector2) {
  console.log(poseVector1);
  if (poseVector1==null || poseVector2==null){
    return 0;
  }
  let vector1PoseXY = poseVector1.slice(0, 34);
  let vector1Confidences = poseVector1.slice(34, 51);
  let vector1ConfidenceSum = poseVector1.slice(51, 52);
  
  let vector2PoseXY = poseVector2.slice(0, 34);

      // First summation
  let summation1 = 1 / vector1ConfidenceSum;

      // Second summation
  let summation2 = 0;
  for (let i = 0; i < vector1PoseXY.length; i++) {
    let tempConf = Math.floor(i / 2);
    let tempSum = vector1Confidences[tempConf] * Math.abs(vector1PoseXY[i] - vector2PoseXY[i]);
    summation2 = summation2 + tempSum;
  }

  return summation1 * summation2; 
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
    });
  

    socket.on('senduserpos', (senduserpos) => {
      let idx = playerRoom.players.indexOf(socket.id);
      playerRoom.player_positions[idx]=senduserpos
      var playerScores = []
      function createArray(p){
        let posevector1 = []
        var summ = 0;
        
        for (let i=0; i<playerRoom.player_positions[p].keypoints.length; i++){
          posevector1.push(playerRoom.player_positions[p].keypoints[i].position.x);
          posevector1.push(playerRoom.player_positions[p].keypoints[i].position.y);
        } 
        for (let i=0; i<playerRoom.player_positions[p].keypoints.length; i++){
          posevector1.push(playerRoom.player_positions[p].keypoints[i].score);
          summ+=playerRoom.player_positions[p].keypoints[i].score;
        }
        posevector1.push(summ);
        return posevector1;
      }
      var compare = Array.from(Array(52), () => 50)
      if (playerRoom.player_positions[0]!=null || playerRoom.player_positions[1]!=null){
        for (let i=0; i<playerRoom.player_positions.length; i++){
          let playerPose = createArray(i); 
          let score = weightedDistanceMatching(playerPose,compare); 
          playerScores.push(score);
        }
        var winner = playerScores.indexOf(Math.min.apply(Math, playerScores));
        console.log(winner); 
      }
    });

    socket.on('getroomname', () => {
      io.to(socket.id).emit('roomname', playerRoom.name);
    });


});

for(let i = 0; i < numRooms; i++){
  setInterval(() => {
    io.to(rooms[i].name).emit('roomdata', rooms[i]);
  }, 10);
}
/*
//Periodically send out all posenet locations
for(let i = 0; i < numRooms; i++){
  var elem = document.getElementById("myBar");
  var width = 0;
  var id = setInterval(posingtime, 100); 
  function posingtime() {
    if (width == 100) {
      clearInterval(id); 
    } else {
      width++;
      io.to(rooms[i].name).emit('roomdata', rooms[i]);
    }
  }
*/

http.listen(5000, () => {
  console.log('listening on *:5000');
});