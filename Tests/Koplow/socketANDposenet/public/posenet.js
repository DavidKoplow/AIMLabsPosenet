
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
    function weightedDistanceMatching(poseVector1, poseVector2) {
        if (poseVector1==null || poseVector2==null){
          return 0;
        }
        let vector1PoseXY = poseVector1.slice(0, 34);
        let vector1Confidences = poseVector1.slice(34, 51);
        let vector1ConfidenceSum = poseVector1.slice(51, 52);
        
        let vector2PoseXY = poseVector2.slice(0, 34);
      
            // First summation
        let summation1 = 1 / vector1ConfidenceSum;
      
            // Second summation
        let summation2 = 0;
        for (let i = 0; i < vector1PoseXY.length; i++) {
          let tempConf = Math.floor(i / 2);
          let tempSum = vector1Confidences[tempConf] * Math.abs(vector1PoseXY[i] - vector2PoseXY[i]);
          summation2 = summation2 + tempSum;
        }
      
        return summation1 * summation2; 
    }

    function createArray(keypoints){
        let posevector1 = []
        var summ = 0;
        
        for (let i=0; i<keypoints.length; i++){ 
          posevector1.push(keypoints[i].position.x); 
          posevector1.push(keypoints[i].position.y);
        } 
        for (let i=0; i<keypoints.length; i++){
          posevector1.push(keypoints[i].score);
          summ+=keypoints[i].score; 
        }
        posevector1.push(summ);
        return posevector1;
      } 


    function modelLoaded() {
        console.log('poseNet ready');
    }
    //Draw dots at certian positions
    sketch.draw = function() {
        sketch.image(video, 0, 0); 
        if (pose) {
            let playerPose = createArray(pose.keypoints);  
            let score = weightedDistanceMatching(playerPose,compare);  
            socket.emit('senduserpos', [pose,score]); 
           
        }
        // calculate pose
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

        if(HOLE){
            compare = createArray(HOLE)

            for(var i = 0; i < HOLE.length; i++){
                let x = HOLE[i].position.x;
                let y = HOLE[i].position.y;
                sketch.fill(255, 255, 0);
                sketch.ellipse(x, y, 16, 16);    
            }
        }


    }

}


