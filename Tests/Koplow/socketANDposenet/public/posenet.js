function drawReference(sketch,socket){


}
function poseNet(sketch, socket){
    let video;
    let poseNet;
    let pose;
    let skeleton;
    let swidth = 640;
    sketch.setup = function() {
        let cnv = sketch.createCanvas(1280, 480);
        cnv.position(0,200);
        video = sketch.createCapture(sketch.VIDEO);
        video.size(640, 480);
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
        if (pose && send) {
        
            let playerPose = createArray(pose.keypoints);  
            let score = weightedDistanceMatching(playerPose,compare);  
            socket.emit('senduserpos', [pose,score]); 
            send=false;
        }
        sketch.fill(200,200,200)
        sketch.rect(swidth,0,swidth,480)
        // calculate pose
        if(ROOM.player_positions){
            for(let i =0; i < ROOM.player_positions.length; i+=1){
                var p = ROOM.player_positions[i]
                if(p){
                    let offset = 0
                    if(ROOM.players[i]!=socket.id){
                        offset=swidth
                    }

                    let eyeR = p.rightEye;
                    let eyeL = p.leftEye;
                    let d = sketch.dist(eyeR.x+offset, eyeR.y, eyeL.x+offset, eyeL.y);
                    
                    sketch.fill(255, 0, 0);
                    sketch.ellipse(p.nose.x+offset, p.nose.y, d);
                    sketch.fill(0, 0, 255);
                    sketch.ellipse(p.rightWrist.x+offset, p.rightWrist.y, 32);
                    sketch.ellipse(p.leftWrist.x+offset, p.leftWrist.y, 32);
                    sketch.fill(teamColors[i]);

                    for (let j = 0; j < p.keypoints.length; j++) {
                        let x = p.keypoints[j].position.x;
                        let y = p.keypoints[j].position.y;
                        sketch.ellipse(x+offset, y, 16, 16);
                    }
     
                
                let skeleton = genskeleton(p.keypoints)
                sketch.stroke(teamColors[i])
                sketch.strokeWeight(5)
            
                for(let j = 0; j<skeleton.length;j++){
                    pnts=skeleton[j][1]
                    sketch.line(pnts[0]+offset,pnts[1],pnts[2]+offset,pnts[3])
                }
                sketch.noStroke()
                sketch.strokeWeight(1)
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
                sketch.ellipse(x+swidth, y, 16, 16);    

            }

            let skeleton = genskeleton(HOLE)
            sketch.stroke(255,255,0)
            sketch.strokeWeight(5)
        
            for(let j = 0; j<skeleton.length;j++){
                pnts=skeleton[j][1]
                sketch.line(pnts[0],pnts[1],pnts[2],pnts[3])
                sketch.line(pnts[0]+swidth,pnts[1],pnts[2]+swidth,pnts[3])

            }
            sketch.noStroke()
            sketch.strokeWeight(1)
        }

}
}
function genskeleton(keypoints){
    skeleton=[]
    thresh=0.1
    for(var i = 0; i<keypoints.length; i++){
        let p1 = keypoints[i]
        if(p1.score>thresh){
            for(var j = 0; j<keypoints.length; j++){
                let p2=keypoints[j]
                if(p2.score>thresh){

                    switch(p1.part){

                        case 'leftShoulder':
                            if(p2.part=='rightShoulder' || p2.part=='leftElbow' || p2.part=='leftHip'){
                                skeleton.push(["",[p1.position.x,p1.position.y,p2.position.x,p2.position.y]])
                            }
                        break;

                        case 'rightHip':
                            if(p2.part=='leftHip' || p2.part=='rightShoulder' || p2.part=='rightKnee'){
                                skeleton.push(["",[p1.position.x,p1.position.y,p2.position.x,p2.position.y]])
                            }
                        break;
                        case 'leftKnee':
                            if(p2.part=='leftAnkle' || p2.part=='leftHip'){
                                skeleton.push(["",[p1.position.x,p1.position.y,p2.position.x,p2.position.y]])
                            }
                        break;
                        case 'rightElbow':
                            if(p2.part=='rightShoulder' || p2.part=='rightWrist'){
                                skeleton.push(["",[p1.position.x,p1.position.y,p2.position.x,p2.position.y]])
                            }
                        break;

                        case 'leftElbow':
                            if(p2.part=='leftWrist'){
                                skeleton.push(["",[p1.position.x,p1.position.y,p2.position.x,p2.position.y]])
                            }
                        break;
                        
                        case 'rightAnkle':
                            if(p2.part=='rightKnee'){
                                skeleton.push(["",[p1.position.x,p1.position.y,p2.position.x,p2.position.y]])
                            }
                        break;

                        default:

                        break;

                    }

                }
            }   
        }
    }
    return skeleton
}

