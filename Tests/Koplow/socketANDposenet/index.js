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
  this.hole = []

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
  let width = 640;
  let height = 480;
  function sin(a){return Math.sin(-a);}
  function cos(a){return Math.cos(-a);}
  function rand(){return Math.random();}
  let pi = Math.PI;
  let scale = 0.9+0.4*rand();
  let cTS = (130-rand()*20)*scale;
  let cLS = (180-rand()*40)*scale;
  let cBS = (110-rand()*30)*scale;
  let theta = pi/3+pi*rand()/3; //rotation 
  let phi = theta-pi/2

  let c=[width/2,height/2]
  let shR = [c[0]+cLS/2*cos(theta)+cTS/2*cos(theta-pi/2),c[1]+cLS/2*sin(theta)+cTS/2*sin(theta-pi/2)]
  let shL = [c[0]+cLS/2*cos(theta)-cTS/2*cos(theta-pi/2),c[1]+cLS/2*sin(theta)-cTS/2*sin(theta-pi/2)]

  let waR = [c[0]-cLS/2*cos(theta)+cBS/2*cos(theta-pi/2),c[1]-cLS/2*sin(theta)+cBS/2*sin(theta-pi/2)]
  let waL = [c[0]-cLS/2*cos(theta)-cBS/2*cos(theta-pi/2),c[1]-cLS/2*sin(theta)-cBS/2*sin(theta-pi/2)]

  let elLR = pi+phi + rand()*2*pi/3-pi/3;
  let elLS = (80-rand()*40)*scale;
  let elL = [shL[0]+elLS*cos(elLR),shL[1]+elLS*sin(elLR)]
  let hLS = (80-rand()*40)*scale;
  let hLR = elLR + rand()*2*pi-pi;
  let hL = [elL[0]+hLS*cos(hLR),elL[1]+hLS*sin(hLR)]


  let elRR =phi + rand()*2*pi/3-pi/3;
  let elRS = (80-rand()*40)*scale;
  let elR = [shR[0]+elRS*cos(elRR),shR[1]+elRS*sin(elRR)]
  let hRS = (80-rand()*40)*scale;
  let hRR = elRR + rand()*2*pi-pi;
  let hR = [elR[0]+hRS*cos(hRR),elR[1]+hRS*sin(hRR)]

  let knRr = phi - pi/2 +2*rand()*pi/3-pi/3;
  let knRS = (110-rand()*60)*scale;
  let knR = [waR[0]+knRS*cos(knRr), waR[1]+knRS*sin(knRr)]
  let aRr = knRr + 0.1; 
  let aRS = (70-rand()*30)*scale;
  let aR = [knR[0]+aRS*cos(aRr), knR[1]+aRS*sin(aRr)]


  let knLr = pi+phi + pi/2 +2*rand()*pi/3-pi/3;
  let knLS = (110-rand()*60)*scale;
  let knL = [waL[0]+knLS*cos(knLr), waL[1]+knLS*sin(knLr)]
  let aLr = knLr + pi/2 +rand()*pi-pi/2; 
  let aLS = (70-rand()*30)*scale;
  let aL = [knL[0]+aLS*cos(aLr), knL[1]+aLS*sin(aLr)]


  let hr = theta+rand()*0.2-0.1
  let nS = 30*scale;
  let n = [c[0]+cLS/2*cos(theta)+nS*cos(hr),c[1]+cLS/2*sin(theta)+nS*sin(hr)]

  let eyD = 25*scale;
  let eyR = [n[0]+cos(hr-pi/4)*eyD,n[1]+sin(hr-pi/4)*eyD]
  let eyL = [n[0]+cos(hr+pi/4)*eyD,n[1]+sin(hr+pi/4)*eyD]

  let eaD = eyD+7*scale
  let ear = 0.5*scale;
  let eaR = [n[0]+cos(hr-pi/4-ear)*eaD,n[1]+sin(hr-pi/4-ear)*eaD]
  let eaL = [n[0]+cos(hr+pi/4+ear)*eaD,n[1]+sin(hr+pi/4+ear)*eaD]

  let hole=[
    {
      score: 1,
      part: 'nose',
      position: { x: n[0], y: n[1] }
    },
    {
      score: 1,
      part: 'leftEye',
      position: { x: eyL[0], y: eyL[1] }
    },
    {
      score: 1,
      part: 'rightEye',
      position: { x: eyR[0], y: eyR[1] }
    },
    {
      score: 1,
      part: 'leftEar',
      position: { x: eaL[0], y: eaL[1] }
    },
    {
      score: 1,
      part: 'rightEar',
      position: { x: eaR[0], y: eaR[1] }
    },
    {
      score: 1,
      part: 'leftShoulder',
      position: { x: shL[0], y: shL[1] }
    },
    {
      score: 1,
      part: 'rightShoulder',
      position: { x: shR[0], y: shR[1] }
    },
    {
      score: 1,
      part: 'leftElbow',
      position: { x: elL[0], y: elL[1] }
    },
    {
      score: 1,
      part: 'rightElbow',
      position: { x: elR[0], y: elR[1] }
    },
    {
      score: 1,
      part: 'leftWrist',
      position: { x: hL[0], y: hL[1] }
    },
    {
      score: 1,
      part: 'rightWrist',
      position: { x: hR[0], y: hR[1] }
    },
    {
      score: 1,
      part: 'leftHip',
      position: { x: waL[0], y: waL[1] }
    },
    {
      score: 1,
      part: 'rightHip',
      position: { x: waR[0], y: waR[1] }
    },
    {
      score: 1,
      part: 'leftKnee',
      position: { x: knL[0], y: knL[1] }
    },
    {
      score: 1,
      part: 'rightKnee',
      position: { x: knR[0], y: knR[1] }
    },
    {
      score: 1,
      part: 'leftAnkle',
      position: { x: aL[0], y: aL[1] }
    },
    {
      score: 1,
      part: 'rightAnkle',
      position: { x: aR[0], y: aR[1] }
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
      rooms[i].hole=generateRandPos()
      roomloop = setInterval(posingtime, 10);
    }
  }

  count=0;
  warning = 300;
  gametime = 600;
  function posingtime() {
    if(count%10==0){
      io.to(rooms[i].name).emit('time',Math.round((count-warning)/100));

    }

    if(count<warning){

    } else if(count<warning+gametime) {

      io.to(rooms[i].name).emit('roomdata', rooms[i]);

    } else {
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