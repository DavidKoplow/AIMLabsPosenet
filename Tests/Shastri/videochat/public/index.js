//client side
var socket = io.connect('http://localhost:5000'); 

var answersFrom = {}, offer;
var peerConnection = window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection ||
    window.msRTCPeerConnection;

var sessionDescription = window.RTCSessionDescription ||
    window.mozRTCSessionDescription ||
    window.webkitRTCSessionDescription ||
    window.msRTCSessionDescription;

    navigator.getUserMedia  = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

var pc = new peerConnection({
    iceServers: [{
        url: "stun:stun.services.mozilla.com",
        username: "somename",
        credential: "somecredentials"
    }]
});

pc.onaddstream = function (obj) {
    console.log('object', obj);
    console.log('socketid', obj.stream.id);
    var vid = document.createElement('video');
    vid.setAttribute('class', 'video-large');
    vid.setAttribute('autoplay', true);
    vid.setAttribute('id', obj.stream.id);
    document.getElementById('users-container').appendChild(vid);
    vid.srcObject = obj.stream;
}

navigator.getUserMedia({video: true, audio: true}, function (stream) {
    console.log('getting user media...')
    var vid = document.createElement('video');
    vid.setAttribute('class', 'video-large');
    vid.setAttribute('autoplay', true);
    vid.setAttribute('muted', false);
    vid.setAttribute('id', socket.id);
    document.getElementById('users-container').appendChild(vid);
    // var video = document.querySelector('video');
    vid.srcObject = stream;
    pc.addStream(stream);
}, error);


socket.on('add-users', function (data) {
    for (var i = 0; i < data.users.length; i++) {
        id = data.users[i];

        var btn = document.createElement("BUTTON");
        btn.setAttribute('id', id);
        btn.innerHTML = id;
        btn.addEventListener('click', function () {
            createOffer(id);
        });
        document.getElementById('users').appendChild(btn);
    }
});

socket.on('remove-user', function (id) {
    console.log('user disconnected!')
    var users = document.getElementById('users');
    btn = document.getElementById(id)
    users.removeChild(btn); //remove btn
});


socket.on('offer-made', function (data) {
    offer = data.offer;

    pc.setRemoteDescription(new sessionDescription(data.offer), function () {
        pc.createAnswer(function (answer) {
            pc.setLocalDescription(new sessionDescription(answer), function () {
                socket.emit('make-answer', {
                    answer: answer,
                    to: data.socket
                });
            }, error);
        }, error);
    }, error);

});

socket.on('answer-made', function (data) {
    pc.setRemoteDescription(new sessionDescription(data.answer), function () {
        document.getElementById(data.socket).setAttribute('class', 'active');
        if (!answersFrom[data.socket]) {
            createOffer(data.socket);
            answersFrom[data.socket] = true;
        }
    }, error);
});

function createOffer(id) {
    pc.createOffer(function (offer) {
        pc.setLocalDescription(new sessionDescription(offer), function () {
            socket.emit('make-offer', {
                offer: offer,
                to: id
            });
        }, error);
    }, error);
}

function error(err) {
    console.warn('Error', err);
}