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
    

 


   // element.innerHTML = `<div id="rmessage" style="background-color: #FFFFFF; padding: 50px; color: #000000; font-size:10px">Press When Ready</div>`;

    var readyCheck = document.createElement("input");  
    var welcomeInstruction = document.createElement("h1"); 
    welcomeInstruction.innerHTML = "Match the Pose"
    welcomeInstruction.id = "welcomeInstruction"
    var box = document.createElement("h1");
    box.id = "box";
    element.appendChild(box);
    box.style.visibility = "hidden";

    var rmessage = document.createElement("p");  
    //rmessage.style="background-color: #FFFFFF; padding: 20px; color: #000000; font-size:10px; position: absolute; top: 430px; left: 690px; z-index: 1000"
    rmessage.id = "rmessage"
    rmessage.style.visibility = "hidden";
    rmessage.innerHTML="Press When Ready<br />"
    element.appendChild(rmessage);

    var gameInstruction = document.createElement("p");
    gameInstruction.innerHTML = "<b>Instructions </b> <br /> <br /> You've entered the game room. <br /> <br />The goal of the game is to match the pose on the right within 3 seconds. Whichever player best matches the pose wins. <br /> <br />To start a round, both you and your partner must click the blue button on your screen (Press when you're ready). <br />To play another round you can press again. <br /> <br />To end the game you click the end game button and the winners for each round will appear on the right<br /> First round is the practice round. <br />";
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
        rmessage.style.visibility = "visible";
        box.style.visibility="visible";
        started = true;
        count=1;
    }

    element.appendChild(welcomeInstruction);
    var allWinners = document.createElement("p");
    allWinners.style.visibility= "hidden";
   

    

    readyCheck.type="radio" 
    readyCheck.id="readyCheck"
    readyCheck.style="margin-top: 40px;"
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
            allWinners.style.visibility = "visible";
            allWinners.id = "allwinners"
            var listWinners = "<b>Leader Board</b> <br />"
            for(var key in winners){
                listWinners+="Round " + key + ": Player " + winners[key] + "<br />" 
            
            }
            allWinners.innerHTML = listWinners
            element.appendChild(allWinners);
            count=1
            winners = {}
            end = true;

        }
        count+=1
        
    }
    rmessage.appendChild(readyCheck); 

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
        player=n[1]-1
        pcolor=teamColors[player]
        let str = "You are Player "+n[1] 
        str = str.fontcolor(pcolor); 
        displayroom.innerHTML = n[0]+", "+str;  
        
        element.appendChild(displayroom);
    });
    socket.on('winner', function(n1){
        if (started){
        
            winner.innerHTML = "Current winner is player" + n1;  
            element.appendChild(winner); 
            winners[count]=n1;
        }
    });

    var Time = document.createElement("h1");  
    Time.id = "time";  
    Time.innerHTML = "Time: 0";  
    element.appendChild(Time)

   

    //var c = document.getElementById("myCanvas");
    //var ctx = c.getContext("2d");
    //var img = document.getElementById("scream");
    //ctx.drawImage(img, 10, 10, 150, 180);
}