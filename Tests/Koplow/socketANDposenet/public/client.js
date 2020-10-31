
function initClient(socket){

    $('form').submit(function(e) {
      e.preventDefault(); // prevents page reloading
      return false;
    });
    socket.on('roomdata', function(r){
      ROOM=r;
    });
}
  
  