const width = 500;
const height = 500;

const scene = new THREE.Scene();

const camera = new THREE.OrthographicCamera(0,width,0,height, 0.1, 1000);
camera.position.z = 500;

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( width, height );
renderer.setClearColor(000000, 1 );

const container = document.getElementById( 'main' );
container.appendChild( renderer.domElement );

const hemiLight = new THREE.HemisphereLight('#EFF6EE', '#EFF6EE', 0 );
hemiLight.position.set( 0, 0, 0 );
scene.add( hemiLight );


const group = new THREE.Group();

function Tracker(geometry = 'sphere'){
  this.position = new THREE.Vector3();
  if (geometry!='sphere'){
    geometry = new THREE.DodecahedronBufferGeometry(16);//8, 32, 16);
  }else{
    geometry = new THREE.SphereBufferGeometry(8, 32, 16);
  }
  var material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    opacity: 0.5,
    transparent: true,
    refractionRatio: 0.9
   });

  const sphere = new THREE.Mesh(geometry, material);
  group.add(sphere);

  this.initialise = function() {
    this.position.x = 0;
    this.position.y = 0;
    this.position.z = 0;
  }

  this.update = function(x,y,z){
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
  }

  this.display = function() {
    sphere.position.x = this.position.x;
    sphere.position.y = this.position.y;
    sphere.position.z = this.position.z;

    //console.log(sphere.position);
  }
}


scene.add( group );

const prevFog = true;


function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isMobile() {
  return isAndroid() || isiOS();
}

async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
  }

  const video = document.getElementById('video');
  video.width = width;
  video.height = height;

  const mobile = isMobile();
  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
      width: mobile ? undefined : width,
      height: mobile ? undefined : height,
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function loadVideo() {
  const video = await setupCamera();
  video.play();

  return video;
}

let net;

let trackers = [];

for (let i=0; i<17; i++){
  let tracker;
   if (i==9 || i ==10){ //special for wrists
    tracker = new Tracker('dod');
  }else{
    tracker = new Tracker('sphere');
  }
  tracker.initialise();
  tracker.display();
  trackers.push(tracker);
}


function render(video, net) {
  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');

  // Flip the webcam image to get it right
  const flipHorizontal = true;

  canvas.width = width;
  canvas.height = height;

  async function detect() {

    const imageScaleFactor = 1;
    const outputStride = 32;

    let poses = [];
    let minPoseConfidence;
    let minPartConfidence;

    const pose = await net.estimateSinglePose(video, imageScaleFactor, flipHorizontal, outputStride);
    poses.push(pose);

    minPoseConfidence = 0.1;
    minPartConfidence = 0.2;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    const showVideo = true;

    if (showVideo) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-width, 0);
      ctx.drawImage(video, 0, 0, width, height);
      ctx.restore();
    }

    poses.forEach(({score, keypoints}) => {
      if (score >= minPoseConfidence) {
        keypoints.forEach((d,i)=>{
          if(d.score>minPartConfidence){
            //console.log(d.part);
          
            trackers[i].update(d.position.x, d.position.y, 0);
            trackers[i].display();
          }
          else if(d.score<minPartConfidence){
            trackers[i].update(-10,-10,0);
            trackers[i].display();
          }
        })
      }
    });

    renderer.render( scene, camera );
    requestAnimationFrame(detect);
  }

  detect();

}


async function main() {
  
  const net = await posenet.load({
    architecture: 'MobileNetV1',
    outputStride: 16,
    inputResolution: 480,
    multiplier: 0.75
  });
  
  /* slow but more acc
  const net = await posenet.load({
    architecture: 'ResNet50',
    outputStride: 32,
    inputResolution: { width: 257, height: 200 },
    quantBytes: 2
  });
  */
  document.getElementById('main').style.display = 'block';
  let video;

  try {
    video = await loadVideo();
  } catch (e) {
    let info = document.getElementById('info');
    info.textContent = 'this browser does not support video capture,' +
        'or this device does not have a camera';
    info.style.display = 'block';
    throw e;
  }

  render(video, net);
}

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;


main();
