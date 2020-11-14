
function initClient(socket){

    $('form').submit(function(e) {
      e.preventDefault(); // prevents page reloading
      return false;
    });
    socket.on('roomdata', function(r){
      ROOM=r[0];
      HOLE=r[1]
    });
    socket.on('posrecived',function(b){
      send=b
    })
}
  
  