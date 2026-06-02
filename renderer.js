const video = document.getElementById('camera');
const PREVIEW_WIDTH = 800;
const PREVIEW_HEIGHT = 600;
const SCALE = 3;

// start camera
function startCamera() {
  const video = document.getElementById('camera');

  navigator.mediaDevices.getUserMedia({
    video: {
      aspectRatio: 4 / 3,
      width: { ideal: 1920 },
      height: { ideal: 1440 }
    }
  })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => {
      console.error("Camera error:", err);
    });
}

let sessionDuration = 0;
let remainingTime = 0;
let timerInterval;
let sessionName = "";
let capturedImage = null;


function checkCameraAndStart() {
  const status = document.getElementById("loadingStatus");

  status.innerText = "Accessing camera...";

  navigator.mediaDevices.getUserMedia({
    video: {
      aspectRatio: 4 / 3,
      width: { ideal: 1920 },
      height: { ideal: 1440 }
    }
  })
    .then(stream => {
      status.innerText = "Camera ready";

      const video = document.getElementById("camera");
      video.srcObject = stream;

      // wait a moment to make sure it's fully ready
      setTimeout(() => {
        document.getElementById("loadingScreen").style.display = "none";
        document.getElementById("cameraSection").style.display = "block";

        generateSessionName();
        startTimer();
      }, 1000);
    })
    .catch(err => {
      showError("Camera cannot be accessed.\n\nPossibilities:\n- Camera is not connected\n- Camera permission denied\n- Camera is being used by another application");

      document.getElementById("loadingScreen").style.display = "none";
      document.getElementById("menu").style.display = "block";

      console.error(err);
    });
}

function generateSessionName() {
  const now = new Date();

  const date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  sessionName = `Session ${date} ${time}`;

  document.getElementById("sessionName").innerText = sessionName;
}

function startSession() {
  const durationSelect = document.getElementById("duration");
  sessionDuration = parseInt(durationSelect.value);
  remainingTime = sessionDuration;

  // display loading screen
  document.getElementById("menu").style.display = "none";
  document.getElementById("loadingScreen").style.display = "flex";

  checkCameraAndStart();
}

function startTimer() {
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    remainingTime--;

    console.log("Remaining:", remainingTime); // debug

    updateTimerDisplay();

    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      location.reload();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  document.getElementById("timer").innerText =
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function addTime() {
  remainingTime += 300; // add 5 minutes
}

// capture function
function takePhoto() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  if (video.videoWidth === 0) {
    showError("Camera is not ready to be used yet.\n\nPossible causes:\n- Camera is still loading\n- Camera is being used by another application\n- Camera permission has not been granted");
      return;
  }

  canvas.width = PREVIEW_WIDTH * SCALE;
  canvas.height = PREVIEW_HEIGHT * SCALE;

  // mirror the photo
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);

  ctx.drawImage(
    video,
    0,
    0,
    video.videoWidth,
    video.videoHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  function pad(n) {
    return n.toString().padStart(2, '0');
  }

  const now = new Date();

  const image = canvas.toDataURL("image/png");
  const filename = `photo_${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.png`;


  // save image reference
  capturedImage = image;

  // display in preview
  const previewCanvas = document.getElementById('previewCanvas');
  const previewCtx = previewCanvas.getContext('2d');

  previewCanvas.width = PREVIEW_WIDTH;
  previewCanvas.height = PREVIEW_HEIGHT;

  const img = new Image();
  img.onload = () => {
    previewCtx.save();

    previewCtx.translate(PREVIEW_WIDTH, 0);
    previewCtx.scale(-1, 1);

    previewCtx.drawImage(
      video,
      0,
      0,
      video.videoWidth,
      video.videoHeight,
      0,
      0,
      PREVIEW_WIDTH,
      PREVIEW_HEIGHT
    );

    previewCtx.restore();
  };
  img.src = image;
}

// save button function
function savePhoto() {
  if (!capturedImage) return;

  function pad(n) {
    return n.toString().padStart(2, '0');
  }

  const now = new Date();

  const filename = `photo_${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.png`;

  const link = document.createElement("a");
  link.href = capturedImage;
  link.download = filename;
  link.click();

  capturedImage = null;
}

function retakePhoto() {
  const previewCanvas = document.getElementById('previewCanvas');
  const ctx = previewCanvas.getContext('2d');

  ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

  capturedImage = null;
}

function endSession() {
  clearInterval(timerInterval);
  location.reload();
}

function backToMenu() {
  clearInterval(timerInterval);

  document.getElementById("cameraSection").style.display = "none";
  document.getElementById("menu").style.display = "block";
}

// popup functions
function openAddModal() {
  document.getElementById("addSessionModal").style.display = "flex";
}

function closeAddModal() {
  document.getElementById("addSessionModal").style.display = "none";
}

function confirmAddTime() {
  const addDuration = parseInt(document.getElementById("addDuration").value);

  remainingTime += addDuration;

  closeAddModal();
}

// show error function
function showError(message) {
  document.getElementById("errorMessage").innerText = message;
  document.getElementById("errorModal").style.display = "flex";
}

function handleErrorClose() {
  document.getElementById("errorModal").style.display = "none";

  // return to menu
  clearInterval(timerInterval);

  document.getElementById("cameraSection").style.display = "none";
  document.getElementById("menu").style.display = "block";
}