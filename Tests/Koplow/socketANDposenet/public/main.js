var ROOM = []
var HOLE = []
var compare = null
var send = true;
var teamColors = ["#FF0000","#00FF00"]
var pcolor = null;
var player = 0;
var winners = {};
var count =0;
var end = false;
var started = false;
function joinGame(){

    //Removes title screen
    var element = document.getElementById("titlescreen");
    element.parentNode.removeChild(element);

   
    
    

    var socket = io();
    initClient(socket); //Defines types of outputs client can send to server
    

    
    //create gameroom
    var element = document.getElementById("gameroom");
    

    


        
    
    
    
    element.innerHTML = `<div id="rmessage" style="font-size:10px">Press When Ready</div>`;

    var readyCheck = document.createElement("input");  
    var welcomeInstruction = document.createElement("h1"); 
    welcomeInstruction.innerHTML = "Match the Pose"
    welcomeInstruction.id = "welcomeInstruction"

    var gameInstruction = document.createElement("p");
    gameInstruction.innerHTML = "<b>Instructions </b> <br /> <br /> You've entered the game room. <br /> <br />The goal of the game is to match the pose on the right within 3 seconds. Whichever player best matches the pose wins. <br /> <br />To start a round, both you and your partner must click the blue button on your screen (Press when you're ready). <br />To play another round you can press again. <br /> <br />To end the game you click the end game button and the winners for each round will appear on the right<br /><br />";
    gameInstruction.id = "gameInstructions";
    element.appendChild(gameInstruction);
    var ok = document.createElement("BUTTON");
    ok.innerHTML = "Start game";
    ok.id = "ok";
    element.appendChild(ok);
    ok.onclick=function(){
        ok.style.visibility = "hidden";
        gameInstructions.style.visibility = "hidden";
        function pN(sketch){poseNet(sketch,socket);} 
        var runPosenet = new p5(pN); //Creates p5 canvas & runs posenet on camera input
        function reference(sketch){drawReference(sketch,socket);}
        var myp5 = new p5(reference); 
        started = true;
    }

    element.appendChild(welcomeInstruction);
    var allWinners = document.createElement("p");
    readyCheck.type="radio" 
    readyCheck.id="readyCheck"
    readyCheck.onclick=function(){
        ready()
        if (end){
            allWinners.innerHTML = ""
            end= false;
        }
        var endGame = document.createElement("BUTTON");
        endGame.innerHTML = "End Game"
        endGame.id = "endgame"
        element.appendChild(endGame);
        endGame.onclick = function(){
            
            allWinners.id = "allwinners"
            var listWinners = ""
            for(var key in winners){
                listWinners+="Round " + key + ": Player " + winners[key] + "<br />" 
                
            }
            allWinners.innerHTML = listWinners
            element.appendChild(allWinners);
            count=0
            winners = {}
            end = true;

        }
    }
    element.appendChild(readyCheck); 

    function ready(){
          console.log("ready")
          socket.emit('ready');
          count+=1;

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
        if (started){
            winner.innerHTML = "Player " + n1 + " Won!";  
            element.appendChild(winner); 
            winners[count]=n1;
        }
    });

   

    //var c = document.getElementById("myCanvas");
    //var ctx = c.getContext("2d");
    //var img = document.getElementById("scream");
    //ctx.drawImage(img, 10, 10, 150, 180);
}