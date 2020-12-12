var express = require('express');
const { endianness } = require('os');
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
  this.ready = [false,false]
  this.running = false

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
        playerRoom.ready[idx]=false;
        
        console.log('user disconnected from '+playerRoom.name+" which now has:");
        console.log(playerRoom.players)
    });
  
    socket.on('ready', (senduserpos) => {
      let idx = playerRoom.players.indexOf(socket.id);
      playerRoom.ready[idx]=true;
    }); 


    var winner = 0;
    io.to(socket.id).emit('roomname', [playerRoom.name,playerRoom.players.indexOf(socket.id)+1]);
    io.to(socket.id).emit('winner', " ");
    socket.on('senduserpos', (senduserpos) => {
      let idx = playerRoom.players.indexOf(socket.id);
      playerRoom.player_positions[idx]=senduserpos[0]
      playerRoom.player_scores[idx]=senduserpos[1] 
        if (playerRoom.player_scores.length==2 && playerRoom.running){
          if (playerRoom.player_scores[0]!=null && playerRoom.player_scores[1]!=null ){
              playerRoom.winner = playerRoom.player_scores.indexOf(Math.min.apply(Math, playerRoom.player_scores))+1;
              io.to(socket.id).emit('winner', playerRoom.winner);
             

          }
        }
        io.to(socket.id).emit('posrecived', true)
    });
});

function generateRandPos(){
  //generate random position

  var hole1=[ 
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
  var hole2 = [
    {
      score: 0.9791821837425232,
      part: 'nose',
      position: { x: 212.4483884818823, y: 35.82077115426267 }
    },
    {
      score: 0.9726691246032715,
      part: 'leftEye',
      position: { x: 255.87725331347278, y: 3.1937927958566377 }
    },
    {
      score: 0.9633320569992065,
      part: 'rightEye',
      position: { x: 159.8998582223974, y: -12.985531105605546 }
    },
    {
      score: 0.3469149172306061,
      part: 'leftEar',
      position: { x: 301.48379789716074, y: 31.06072036208809 }
    },
    {
      score: 0.7595075368881226,
      part: 'rightEar',
      position: { x: 69.11403433358159, y: 21.612611763208292 }
    },
    {
      score: 0.8845362067222595,
      part: 'leftShoulder',
      position: { x: 398.62149843446014, y: 303.7609186432241 }
    },
    {
      score: 0.3245816230773926,
      part: 'rightShoulder',
      position: { x: -30.453134974616976, y: 279.8639690829622 }
    },
    {
      score: 0.16367529332637787,
      part: 'leftElbow',
      position: { x: 549.4917148931481, y: 550.0426687990181 }
    },
    {
      score: 0.005642721429467201,
      part: 'rightElbow',
      position: { x: -12.679078810873662, y: 564.7868697467018 }
    },
    {
      score: 0.0030009460169821978,
      part: 'leftWrist',
      position: { x: 477.58175653242415, y: 477.15672177563386 }
    },
    {
      score: 0.0018567433580756187,
      part: 'rightWrist',
      position: { x: 35.11052024039777, y: 566.0000835967899 }
    },
    {
      score: 0.01214566733688116,
      part: 'leftHip',
      position: { x: 367.91000069347336, y: 570.6071038747112 }
    },
    {
      score: 0.02241980843245983,
      part: 'rightHip',
      position: { x: 77.76005637321028, y: 564.0506676106138 }
    },
    {
      score: 0.0024687969125807285,
      part: 'leftKnee',
      position: { x: 363.3055521449226, y: 547.6730417926951 }
    },
    {
      score: 0.00224827672354877,
      part: 'rightKnee',
      position: { x: 83.55323227463066, y: 567.5312953607581 }
    },
    {
      score: 0.003778039710596204,
      part: 'leftAnkle',
      position: { x: 358.8411253064523, y: 554.6933007147526 }
    },
    {
      score: 0.0016344732139259577,
      part: 'rightAnkle',
      position: { x: 114.97967582732323, y: 541.8461543576727 }
    }
  ]

  var hole3 = [
    {
      score: 0.9994639754295349,
      part: 'nose',
      position: { x: 232.86203584782345, y: 118.62191768007983 }
    },
    {
      score: 0.9976266026496887,
      part: 'leftEye',
      position: { x: 270.83885697539216, y: 70.39151380961971 }
    },
    {
      score: 0.9976453185081482,
      part: 'rightEye',
      position: { x: 169.8884255969571, y: 72.14987847591652 }
    },
    {
      score: 0.7027348279953003,
      part: 'leftEar',
      position: { x: 328.4179087835527, y: 112.23599504404032 }
    },
    {
      score: 0.39462345838546753,
      part: 'rightEar',
      position: { x: 110.12172357581468, y: 104.37331025238632 }
    },
    {
      score: 0.8888581991195679,
      part: 'leftShoulder',
      position: { x: 440.74954496747324, y: 350.5919620499073 }
    },
    {
      score: 0.14708012342453003,
      part: 'rightShoulder',
      position: { x: 7.1278209166768, y: 347.96071449606336 }
    },
    {
      score: 0.20249921083450317,
      part: 'leftElbow',
      position: { x: 575.197059245425, y: 562.2936771259234 }
    },
    {
      score: 0.006623457185924053,
      part: 'rightElbow',
      position: { x: -26.46600270549611, y: 586.1060710268725 }
    },
    {
      score: 0.010042097419500351,
      part: 'leftWrist',
      position: { x: 513.3769217168311, y: 527.9036858109648 }
    },
    {
      score: 0.0016283330041915178,
      part: 'rightWrist',
      position: { x: -8.212301647616732, y: 566.5943635576893 }
    },
    {
      score: 0.0015943720936775208,
      part: 'leftHip',
      position: { x: 359.53968478547927, y: 590.4929265716197 }
    },
    {
      score: 0.004022364504635334,
      part: 'rightHip',
      position: { x: 120.8380167029711, y: 582.9600459592352 }
    },
    {
      score: 0.0012024715542793274,
      part: 'leftKnee',
      position: { x: 363.4826716560334, y: 553.2181697504066 }
    },
    {
      score: 0.0016115811886265874,
      part: 'rightKnee',
      position: { x: 117.21536050046929, y: 553.2573990877501 }
    },
    {
      score: 0.0012717257486656308,
      part: 'leftAnkle',
      position: { x: 355.3571349266438, y: 558.8037783255373 }
    },
    {
      score: 0.0005611124797724187,
      part: 'rightAnkle',
      position: { x: 110.35364945111108, y: 554.9961327578771 }
    }
  ] 
  
  var allPoses = [hole1,hole2,hole3]


  let random = Math.floor(Math.random() * Math.floor(3));
  return hole1;
  //return allPoses[random];
  /*
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
  */
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
  rooms[i].running = false;
  var roomloop;

  var updateloop = setInterval(updates, 100);

  function updates(){
    if(rooms[i].ready[0]==true && rooms[i].ready[1]==true){
      startGame();
    }
  }
  function startGame(){
    if(rooms[i].running==false){
      rooms[i].running=true;
      console.log("starting")
      roomloop = setInterval(posingtime, 10);
    }
  }

  count=0
  function posingtime() {
    console.log("hello");
    io.to(rooms[i].name).emit('roomdata', [rooms[i],hole]);
    if(count>500){
      count=0;
      clearInterval(roomloop); 
      end()
    }
    count++;
  }

  function end() {
    io.to(rooms[i].name).emit('resetButton')
    rooms[i].ready=[false,false]
    rooms[i].running = false;
  }
  
}


http.listen(3000, () => {
  console.log('listening on *:3000');
}); 