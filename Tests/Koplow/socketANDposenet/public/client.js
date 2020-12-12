function initClient(socket){

    $('form').submit(function(e) {
      e.preventDefault(); // prevents page reloading
      return false;
    });
    socket.on('roomdata', function(r){
      ROOM=r;
      HOLE=r.hole
    });
    socket.on('posrecived',function(b){
      send=b
    })
    socket.on('resetButton', function(r){
      var readyCheck = document.getElementById("readyCheck");
      readyCheck.checked=false;
    });
    socket.on('time', function(r){
      time=r;
      var Time=document.getElementById("time")
      if(time<0){
        Time.innerHTML = "Starting in: "+Math.abs(time);  
      } else {
        Time.innerHTML = "Pose in: "+(6-time);  
      }


    });

}
  
  
