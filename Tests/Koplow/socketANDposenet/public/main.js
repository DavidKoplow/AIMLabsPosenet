var ROOM = []
function joinGame(){

    //Removes title screen
    var element = document.getElementById("titlescreen");
    element.parentNode.removeChild(element);



    var socket = io();
    initClient(socket); //Defines types of outputs client can send to server
                    
    function pN(sketch){poseNet(sketch,socket);}
    //var runPosenet = new p5(pN); //Creates p5 canvas & runs posenet on camera input

    //create gameroom
    var element = document.getElementById("gameroom");
    var displayroom = document.createElement("h1");   
    var divs = ["left", "right"]; 

    //socket.emit('getroomname');
    socket.on('roomname', function(n){
        console.log(ROOM)
        console.log(ROOM.players)
        displayroom.innerHTML = "Room: "+n;  
        element.appendChild(displayroom);
    });
    
    socket.emit('refresh');
    socket.on('broadcast', function(data){
        $('main').empty();
        console.log('updating room...')
        console.log(data.description)
        console.log(ROOM.players);
        for(i=0; i<ROOM.players.length; i++){
            console.log('player:', ROOM.players[i]);
            new p5(pN,divs[i]);
        };   
    });
    
}