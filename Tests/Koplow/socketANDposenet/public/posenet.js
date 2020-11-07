
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

    function createArray(pose){
        let posevector1 = []
        var summ = 0;
        
        for (let i=0; i<pose.keypoints.length; i++){ 
          posevector1.push(pose.keypoints[i].position.x); 
          posevector1.push(pose.keypoints[i].position.y);
        } 
        for (let i=0; i<pose.keypoints.length; i++){
          posevector1.push(pose.keypoints[i].score);
          summ+=pose.keypoints[i].score; 
        }
        posevector1.push(summ);
        return posevector1;
      } 
      var compare = [
        310.19858393687684,    258.86038101136916,   350.37654357197687,
        207.21863386695952,     265.5267868338856,   210.91621250493984,
        396.66995705333665,    232.83750719597367,    205.5858092549246,
        240.95349931531382,     525.7820497505396,   447.94866539624877,
        132.91735697349222,     436.2560557205853,     643.420569868867,
         583.7161812986382,     12.90129309034533,    569.6126060634272,
         605.3867236185631,     575.2181294363296,     78.2689096769934,
         567.7709094095787,     481.8122278948238,    575.0237657123967,
         204.8157462628435,     578.1638416334813,    518.1952734772798,
         504.8221739535202,    196.38186948308686,    550.3378812441102,
         518.2974947472954,     557.9946899414062,   201.63538060763466,
         548.7780363921526,    0.9986155033111572,    0.999546468257904,
        0.9995778203010559,   0.47409936785697937,   0.8219367861747742,
        0.9470928907394409,    0.6319031119346619, 0.023077920079231262,
       0.01112033985555172,  0.002840963890776038, 0.003084269119426608,
      0.002529897727072239, 0.0030958964489400387, 0.001918445690535009,
      0.002215202199295163, 0.0036043543368577957, 0.001236633281223476,
         5.927495871204883
    ] 
    
    function modelLoaded() {
        console.log('poseNet ready');
    }
    //Draw dots at certian positions
    sketch.draw = function() {
        sketch.image(video, 0, 0); 
        if (pose) {
            let playerPose = createArray(pose);  
            let score = weightedDistanceMatching(playerPose,compare);  
            socket.emit('senduserpos', score); 
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
    }

}


