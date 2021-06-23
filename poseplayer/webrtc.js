const express = require('express'),
    ws = require('ws'),
    http = require('http'),
    app = express();
// use express static to deliver resources HTML, CSS, JS, etc)
// from the public folder
app.use(express.static('public'));


var httpServer = http.createServer(app).listen(3355);
console.log("The HTTP server is up and running");
var wsServer = new ws.Server({server: httpServer});
ws.on('connection', function (client) {
    console.log("A new client was connected.");
    client.on('message', function (message) { // incoming client
        ws.broadcast(message, client);
});
});
// Define a method to broadcast to all clients
ws.broadcast = function (data, exclude) {
    var i = 0, n = this.clients ? this.clients.length : 0, client = null;
    if (n<1) return;
    /*
    for (; i &lt; n; i++) {
        client = this.clients[i];
        if (client === exclude) continue;
        if (client.readyState === client.OPEN) client.send(data);
        else console.error('Error: the client state is ' +     client.readyState);
    */
};

function pageReady() {
    // check browser WebRTC availability
        if(navigator.getUserMedia) {
            videoCallButton = document.getElementById("videoCallButton");
            endCallButton = document.getElementById("endCallButton");
            localVideo = document.getElementById('localVideo');
            remoteVideo = document.getElementById('remoteVideo');
            videoCallButton.removeAttribute("disabled");
            videoCallButton.addEventListener("click", initiateCall);
            endCallButton.addEventListener("click", function (evt){       wsc.send(JSON.stringify({"closeConnection": true }));
        });
     } else {
        alert("Sorry, your browser does not support WebRTC!")
     }
    };

    navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
    window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;