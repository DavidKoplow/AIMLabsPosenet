let video;
let poseNet;
let pose;
let skeleton;
let positions=[];
    function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.hide();
    options = {
        architecture: 'MobileNetV1',
        imageScaleFactor: 0.1,
        outputStride: 16,
        flipHorizontal: false,
        minConfidence: 0.5,
        maxPoseDetections: 5,
        scoreThreshold: 0.5,
        nmsRadius: 20,
        detectionType: 'multiple',
        inputResolution: 257,
        multiplier: 0.75,
        quantBytes: 2,
    }
    poseNet = ml5.poseNet(video, options, modelLoaded);
    poseNet.on('pose', gotPoses);
}

function gotPoses(poses) {
    if (poses.length > 0) {
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;
    }
}

function modelLoaded() {
    console.log('poseNet ready');
}

function draw() {
    image(video, 0, 0);
    if (pose) {
        socket.emit('pos', pose);
    }
    for(let i =0; i < positions.length; i+=1){
        var p = positions[i]

        if(p){
            let eyeR = p.rightEye;
            let eyeL = p.leftEye;
            let d = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
            fill(255, 0, 0);
            ellipse(p.nose.x, p.nose.y, d);
            fill(0, 0, 255);
            ellipse(p.rightWrist.x, p.rightWrist.y, 32);
            ellipse(p.leftWrist.x, p.leftWrist.y, 32);
            for (let i = 0; i < p.keypoints.length; i++) {
                let x = p.keypoints[i].position.x;
                let y = p.keypoints[i].position.y;
                fill(0, 255, 0);
                ellipse(x, y, 16, 16);
            }
        }
    }

}





