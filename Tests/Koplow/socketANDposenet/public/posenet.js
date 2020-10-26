
function poseNet(sketch, socket){


    let video;
    let poseNet;
    let pose;
    let skeleton;
    sketch.setup = function() {
        sketch.createCanvas(640, 480);
        video = sketch.createCapture(sketch.VIDEO);
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
    //Draw dots at certian positions
    sketch.draw = function() {
        sketch.image(video, 0, 0);
        if (pose) {
            socket.emit('senduserpos', pose);
        }
        if(ROOM.player_positions){
            for(let i =0; i < ROOM.player_positions.length; i+=1){
                var p = ROOM.player_positions[i]

                if(p){
                    let eyeR = p.rightEye;
                    let eyeL = p.leftEye;
                    let d = sketch.dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
                    sketch.fill(255, 0, 0);
                    sketch.ellipse(p.nose.x, p.nose.y, d);
                    sketch.fill(0, 0, 255);
                    sketch.ellipse(p.rightWrist.x, p.rightWrist.y, 32);
                    sketch.ellipse(p.leftWrist.x, p.leftWrist.y, 32);
                    for (let i = 0; i < p.keypoints.length; i++) {
                        let x = p.keypoints[i].position.x;
                        let y = p.keypoints[i].position.y;
                        sketch.fill(0, 255, 0);
                        sketch.ellipse(x, y, 16, 16);
                    }
                }
            }

        }
    }
}



