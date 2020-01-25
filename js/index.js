let videoWidth, videoHeight;

// Statistical data
let totalPlay=0, totalPause=0, accuracy;


// whether streaming video from the camera.
let streaming = false;
let sampling=true;
let video = document.getElementById('video');
let canvasOutput = document.getElementById('canvasOutput');
let canvasOutputCtx = canvasOutput.getContext('2d');
let stream = null;
var myVideo = document.getElementById("myvideo");
let Lcircle = document.getElementById('Lcircle');
let Rcircle = document.getElementById('Rcircle');
// let videoContainer = document.getElementById('videoContainer');
// let videoCover = document.getElementById('videoCover');




// function to check whether the user has changed the tab or not


  
// "librairie" de gestion de la visibilité
//  var visible = vis(); // donne l'état courant
//  vis(function(){});   // définit un handler pour les changements de visibilité
var vis = (function(){
  var stateKey, eventKey, keys = {
    hidden: "visibilitychange",
    webkitHidden: "webkitvisibilitychange",
    mozHidden: "mozvisibilitychange",
    msHidden: "msvisibilitychange"
  };
  for (stateKey in keys) {
    if (stateKey in document) {
      eventKey = keys[stateKey];
      break;
    }
  }
  return function(c) {
    if (c) {
      document.addEventListener(eventKey, c);
      //document.addEventListener("blur", c);
      //document.addEventListener("focus", c);
    }
    return !document[stateKey];
  }
})();

// vis(function(){
//   // document.title = vis() ? 'Visible' : 'Not visible';
//   // console.log(new Date, 'visible ?', vis());
//   if(!vis()){
//     // prompt("You swtched to another tab");
//     // document.getElementById("heading").innerHTML = "You changed the tab!"

//   }
// });





////////////////////// 




 var tag = document.createElement('script');

      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // 3. This function creates an <iframe> (and YouTube player)
      //    after the API code downloads.
      var player;
      function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
          height: '390',
          width: '640',
          videoId: 'M7lc1UVf-VE',
          events: {
            'onReady': onPlayerReady,
          }
        });
      }

    var playButton = document.getElementById("play-button");
    var pauseButton = document.getElementById("pause-button");

      // 4. The API will call this function when the video player is ready.
      function onPlayerReady(event) {
    playButton.addEventListener("click", function() {
        player.playVideo();
    });

    pauseButton.addEventListener("click", function() {
        player.pauseVideo();
    });
      }




function changeColor(color){
  screenColor.style.background = color;
}

// stop playing the video
function stopPlaying(){
  stream.getTracks()[0].stop();
  sampling = false;
  accuracy = totalPlay/(totalPause+totalPlay);
  console.log(accuracy);
  document.getElementById("accuracy").innerHTML = accuracy;
  // myVideo.pause();

  // navigator.mediaDevices.getUserMedia({video: true, audio: false})
  //   .then(function(s) {
  //   video.pause();
  // })

}


function startCamera() {

  if (streaming) return;
  navigator.mediaDevices.getUserMedia({video: true, audio: false})
    .then(function(s) {
    stream = s;
    video.srcObject = s;
    video.play();
  })
    .catch(function(err) {
    console.log("An error occured! " + err);
  });

  // document.getElementById("")  


  video.addEventListener("canplay", function(ev){
    if (!streaming) {
      videoWidth = video.videoWidth;
      videoHeight = video.videoHeight;
      video.setAttribute("width", videoWidth);
      video.setAttribute("height", videoHeight);
      canvasOutput.width = videoWidth;
      canvasOutput.height = videoHeight;
      streaming = true;
    }
    startVideoProcessing();
  }, false);
}

let faceClassifier = null;
let eyeClassifier = null;

let src = null;
let dstC1 = null;
let dstC3 = null;
let dstC4 = null;

let canvasInput = null;
let canvasInputCtx = null;

let canvasBuffer = null;
let canvasBufferCtx = null;

function startVideoProcessing() {
  if (!streaming) { console.warn("Please startup your webcam"); return; }
  stopVideoProcessing();
  canvasInput = document.createElement('canvas');
  canvasInput.width = videoWidth;
  canvasInput.height = videoHeight;
  canvasInputCtx = canvasInput.getContext('2d');

  canvasBuffer = document.createElement('canvas');
  canvasBuffer.width = videoWidth;
  canvasBuffer.height = videoHeight;
  canvasBufferCtx = canvasBuffer.getContext('2d');

  srcMat = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4);
  grayMat = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC1);

  faceClassifier = new cv.CascadeClassifier();
  faceClassifier.load('haarcascade_frontalface_default.xml');

  eyeClassifier = new cv.CascadeClassifier();
  eyeClassifier.load('haarcascade_eye.xml');

  requestAnimationFrame(processVideo);
}

function processVideo() {
  if(sampling){
    stats.begin();
    canvasInputCtx.drawImage(video, 0, 0, videoWidth, videoHeight);
    let imageData = canvasInputCtx.getImageData(0, 0, videoWidth, videoHeight);
    srcMat.data.set(imageData.data);
    cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY);
    let faces = [];
    let eyes = [];
    let size;
    if (true) {
      let faceVect = new cv.RectVector();
      let faceMat = new cv.Mat();
      if (false) {
        cv.pyrDown(grayMat, faceMat);
        size = faceMat.size();
      } else {
        cv.pyrDown(grayMat, faceMat);
        cv.pyrDown(faceMat, faceMat);
        size = faceMat.size();
      }
      faceClassifier.detectMultiScale(faceMat, faceVect);
      for (let i = 0; i < faceVect.size(); i++) {
        let face = faceVect.get(i);
        faces.push(new cv.Rect(face.x, face.y, face.width, face.height));
        if (false) {
          let eyeVect = new cv.RectVector();
          let eyeMat = faceMat.getRoiRect(face);
          eyeClassifier.detectMultiScale(eyeMat, eyeVect);
          for (let i = 0; i < eyeVect.size(); i++) {
            let eye = eyeVect.get(i);
            eyes.push(new cv.Rect(face.x + eye.x, face.y + eye.y, eye.width, eye.height));
          }
          eyeMat.delete();
          eyeVect.delete();
        }
      }
      if (faceVect.size()>0){
        count(0);
      }
      else{
        count(1);
      }
      faceMat.delete();
      faceVect.delete();
    } else {
      if (false) {
        let eyeVect = new cv.RectVector();
        let eyeMat = new cv.Mat();
        cv.pyrDown(grayMat, eyeMat);
        size = eyeMat.size();
        eyeClassifier.detectMultiScale(eyeMat, eyeVect);
        for (let i = 0; i < eyeVect.size(); i++) {
          let eye = eyeVect.get(i);
          eyes.push(new cv.Rect(eye.x, eye.y, eye.width, eye.height));
        }
        eyeMat.delete();
        eyeVect.delete();
      }
    }
    // canvasOutputCtx.drawImage(canvasInput, 0, 0, videoWidth, videoHeight);
    // drawResults(canvasOutputCtx, faces, 'red', size);
    // drawResults(canvasOutputCtx, eyes, 'yellow', size);
    stats.end();
    requestAnimationFrame(processVideo);
  }
}

function drawResults(ctx, results, color, size) {
  for (let i = 0; i < results.length; ++i) {
    let rect = results[i];
    let xRatio = videoWidth/size.width;
    let yRatio = videoHeight/size.height;
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.strokeRect(rect.x*xRatio, rect.y*yRatio, rect.width*xRatio, rect.height*yRatio);
  }
}

var layout0 = {
  title: {
    text: 'Time vs Face Attention Span'
  }
}

// default graph plot
Plotly.plot('graph', [{
      y:[0],
      type:'line'
    }], layout0);


let counter=0;
async function count(x){
  if(x==0){
    console.log("Let it play.")
    counter=0;
    myVideo.play();
    Lcircle.setAttribute('fill', 'green');
    Rcircle.setAttribute('fill', 'green');
    totalPlay += 1;  
    // plot graph
    // await plotpoint(x)
    // console.log(x);
    if(sampling){
    Plotly.extendTraces('graph', { y:[[1]]}, [0]);
    }
  }
  else{
    counter+=x;
    if(counter>=8){
      console.log("pause");
      myVideo.pause();
      Lcircle.setAttribute('fill', 'red');
      Rcircle.setAttribute('fill', 'red');
      if(sampling){
        Plotly.extendTraces('graph', { y:[[0]]}, [0]);
      }
      totalPause += 1;
    }
    counter%=8;
    // await plotpoint(x)
  }

}


// function plotpoint(){
//   Plotly.extendTraces('graph', { y:[[x]]}, [0]);
//   return new Promise.resolve(true);
// }



function stopVideoProcessing() {
  if (src != null && !src.isDeleted()) src.delete();
  if (dstC1 != null && !dstC1.isDeleted()) dstC1.delete();
  if (dstC3 != null && !dstC3.isDeleted()) dstC3.delete();
  if (dstC4 != null && !dstC4.isDeleted()) dstC4.delete();
}

function stopCamera() {
  if (!streaming) return;
  stopVideoProcessing();
  document.getElementById("canvasOutput").getContext("2d").clearRect(0, 0, width, height);
  video.pause();
  video.srcObject=null;
  stream.getVideoTracks()[0].stop();
  streaming = false;
}

function initUI() {
  stats = new Stats();
  stats.showPanel(0);
  document.getElementById('container').appendChild(stats.dom);
}

function opencvIsReady() {
  console.log('OpenCV.js is ready');
  initUI();
  startCamera();
}





// noise detection

window.onload = function() {
  var context = new AudioContext();
  // Setup all nodes
var cont = 0;
var ampArr = [];
var points = 0;

  var layout = {
    title: 'Time vs Amplitude'
  }
  Plotly.plot('chart',[{
    y :[0],
    type: 'line'
  }], layout);


  function cmean(arr){

    mean = 0;

    for (var i = arr.length - 1; i >= 0; i--) {
      mean+=arr[i];
    }

    mean/=arr.length;

    return mean

  }


  function calc(){

    var mean = 0.0;
    var stdv = 0.0;

    for (var i = ampArr.length - 1; i >= 0; i--) {
      mean+=ampArr[i];
    }

    mean = mean/ampArr.length;

    for (var i =ampArr.length - 1; i >= 0; i--) {
     stdv += (ampArr[i] - mean)*(ampArr[i] - mean);
    }

    stdv/= ampArr.length;

    var diff = (cmean(ampArr.slice(Math.max(ampArr.length - 10, 0)))- mean);

    if(diff*diff >= stdv)points++;


  }

  function processAudio(e) {

  var buffer = e.inputBuffer.getChannelData(0);
  var out = e.outputBuffer.getChannelData(0);
  var amp = 0;

  // Iterate through buffer to get the max amplitude for this frame
  for (var i = 0; i < buffer.length; i++) {
    var loud = Math.abs(buffer[i]);
    if(loud > amp) {
      amp = loud;
    }
    // write input samples to output unchanged
    out[i] = buffer[i];
  }

  // set the svg circle's radius according to the audio's amplitude
  // circle.setAttribute('r',20 + (amp * 15*amp*amp));

  if(cont<215){

    cont++;

    Plotly.extendTraces('chart', { y:[[amp]] }, [0]);

    ampArr.push(amp);

    calc();


  }


  if(cont == 215){
    cont++;
    points/=ampArr.length;
     document.getElementById("audio_quality").innerHTML = points;

    console.log(points);
  }
 
  // set the circle's color according to the audio's amplitude
  // var color = Math.round(amp * 255);
  // color = 'rgb(' + color + ',' + 0 + ',' + color + ')';
  // circle.setAttribute('fill',color);
}


navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    const audioChunks = [];
    mediaRecorder.addEventListener("dataavailable", event => {
      audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", () => {
      const audioBlob = new Blob(audioChunks);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // var circle = document.getElementById('circle');

  // Add an audio element
  var audio = new Audio(audioUrl);
  audio.controls = true;
  audio.preload = true;
  document.body.appendChild(audio);


  audio.addEventListener('canplaythrough',function() {
    var node = context.createMediaElementSource(audio);

    // create a node that will handle the animation, but won't alter the audio
    // in any way
    var processor =  context.createScriptProcessor(2048, 1, 1);
    processor.onaudioprocess = processAudio;

    // connect the audio element to the node responsible for the animation
    node.connect(processor);

    // connect the "animation" node to the output
    processor.connect(context.destination);

    // play the sound
   audio.play();
  });



    });

    

    setTimeout(() => {
      mediaRecorder.stop();


    }, 9000);
  });


}



// Here's where most of the work happens



//////////////////////////////