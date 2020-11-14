var ROOM = []
var HOLE = []
var compare = null
var send = true;

function joinGame(){

    //Removes title screen
    var element = document.getElementById("titlescreen");
    element.parentNode.removeChild(element);



    var socket = io();
    initClient(socket); //Defines types of outputs client can send to server
                    
    function pN(sketch){poseNet(sketch,socket);}
    var runPosenet = new p5(pN); //Creates p5 canvas & runs posenet on camera input

    //create gameroom
    var element = document.getElementById("gameroom");
    var displayroom = document.createElement("h1");   
    var winner = document.createElement("h1");   

    socket.emit('getroomname');
    socket.on('roomname', function(n){
        console.log(ROOM)
        displayroom.innerHTML = n[0]+", Player "+n[1];  
        element.appendChild(displayroom);
    });
    socket.on('winner', function(n1){
        winner.innerHTML = "Winner: "+n1;  
        element.appendChild(winner); 
    });
    //var c = document.getElementById("myCanvas");
    //var ctx = c.getContext("2d");
    //var img = document.getElementById("scream");
    //ctx.drawImage(img, 10, 10, 150, 180);
}