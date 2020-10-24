var socket = io();
$(function () {

    $('form').submit(function(e) {
      e.preventDefault(); // prevents page reloading
      return false;
    });
    socket.on('positions', function(player_positions){
      positions=player_positions;
    });
  
  });
  
  