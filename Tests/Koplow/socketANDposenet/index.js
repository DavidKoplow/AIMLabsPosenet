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
  
    var winner = 0;
    socket.on('senduserpos', (senduserpos) => {
      let idx = playerRoom.players.indexOf(socket.id);
      playerRoom.player_positions[idx]=senduserpos
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
      var compare = [
        310.19858393687684,    258.86038101136916,   350.37654357197687,
        207.21863386695952,     265.5267868338856,   210.91621250493984,
        396.66995705333665,    232.83750719597367,    205.5858092549246,
        240.95349931531382,     525.7820497505396,   447.94866539624877,
        132.91735697349222,     436.2560557205853,     643.420569868867,
         583.7161812986382,     12.90129309034533,    569.6126060634272,
         605.3867236185631,     575.2181294363296,     78.2689096769934,
         567.7709094095787,     481.8122278948238,    575.0237657123967,
         204.8157462628435,     578.1638416334813,    518.1952734772798,
         504.8221739535202,    196.38186948308686,    550.3378812441102,
         518.2974947472954,     557.9946899414062,   201.63538060763466,
         548.7780363921526,    0.9986155033111572,    0.999546468257904,
        0.9995778203010559,   0.47409936785697937,   0.8219367861747742,
        0.9470928907394409,    0.6319031119346619, 0.023077920079231262,
       0.01112033985555172,  0.002840963890776038, 0.003084269119426608,
      0.002529897727072239, 0.0030958964489400387, 0.001918445690535009,
      0.002215202199295163, 0.0036043543368577957, 0.001236633281223476,
         5.927495871204883
    ]
    var playerScores = [];
    if (playerRoom.player_positions.length==2){
     if (playerRoom.player_positions[0]!=null && playerRoom.player_positions[1]!=null){
        for (let i=0; i<playerRoom.player_positions.length; i++){
          let playerPose = createArray(i); 
          let score = weightedDistanceMatching(playerPose,compare); 
          playerScores.push(score);
        }
        var winner = playerScores.indexOf(Math.min.apply(Math, playerScores));
        io.to(socket.id).emit('winner', winner);
        console.log(winner); 
     }
    }
    if (playerRoom.player_positions.length==1){
      if (playerRoom.player_positions[0]!=null){
        for (let i=0; i<playerRoom.player_positions.length; i++){
          let playerPose = createArray(i); 
          let score = weightedDistanceMatching(playerPose,compare); 
          playerScores.push(score);
        }
        var winner = playerScores.indexOf(Math.min.apply(Math, playerScores));
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
  var width = 0;
  var id = setInterval(posingtime, 10); 
  function posingtime() {
    if (width == 5000) {
      clearInterval(id); 
    } else {
      io.to(rooms[i].name).emit('roomdata', rooms[i]);
      width++;
      
    }
  }
}


http.listen(5000, () => {
  console.log('listening on *:5000');
});