var ROOM = []
var HOLE = []
var compare = null
var send = true;
var teamColors = ["#FF0000","#00FF00"]
var pcolor = null;
var player = 0;

function joinGame(){

    //Removes title screen
    var element = document.getElementById("titlescreen");
    element.parentNode.removeChild(element);



    var socket = io();
    initClient(socket); //Defines types of outputs client can send to server
    

    function pN(sketch){poseNet(sketch,socket);} 
    var runPosenet = new p5(pN); //Creates p5 canvas & runs posenet on camera input
    
    function reference(sketch){drawReference(sketch,socket);}
    var myp5 = new p5(reference); 

    //create gameroom
    var element = document.getElementById("gameroom");
    element.innerHTML = `<div id="rmessage">Press When Ready: </div>`;

    var readyCheck = document.createElement("input");  
    var welcomeInstruction = document.createElement("h1"); 
    welcomeInstruction.innerHTML = "Match the Pose"
    welcomeInstruction.id = "welcomeInstruction"
    element.appendChild(welcomeInstruction);

    readyCheck.type="checkbox" 
    readyCheck.id="readyCheck"
    readyCheck.onclick=function(){
        ready()
    }
    element.appendChild(readyCheck); 

    function ready(){
          console.log("ready")
          socket.emit('ready');

      } 

    var displayroom = document.createElement("h1"); 
    displayroom.id = "displayroom"; 
    var winner = document.createElement("h1"); 
    winner.id = "winner";   

    socket.emit('getroomname');
    socket.on('roomname', function(n){
        console.log(ROOM)
        player=n[1]-1
        pcolor=teamColors[player]
        let str = "You are Player "+n[1] 
        str = str.fontcolor(pcolor); 
        displayroom.innerHTML = n[0]+", "+str;  
        
        element.appendChild(displayroom);
    });
    socket.on('winner', function(n1){
        winner.innerHTML = "Player " + n1 + " Won!";  
        element.appendChild(winner); 
    });

    //var c = document.getElementById("myCanvas");
    //var ctx = c.getContext("2d");
    //var img = document.getElementById("scream");
    //ctx.drawImage(img, 10, 10, 150, 180);
}