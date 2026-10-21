
const $ = (selector) => document.querySelector(selector);

const welcome = $("#welcome");
const room = $("#room");

// Retro game progress.
let discoveries = 0;
const discoveredObjects = new Set();

const gameHud = document.createElement("div");
gameHud.id = "game-hud";
gameHud.setAttribute("role", "status");
gameHud.setAttribute("aria-live", "polite");
gameHud.style.cssText = `
  padding: 12px;
  margin: 0 0 14px;
  background: #160b13;
  color: #ff5277;
  border: 3px solid #713047;
  box-shadow: 4px 4px 0 #09070c;
  font: 10px/2 "Press Start 2P", monospace;
  text-align: center;
`;
gameHud.textContent = "♥ BIRTHDAY QUEST: 0 / 4 DISCOVERIES";

room.querySelector(".room-scene").prepend(gameHud);

function discover(id, message) {
  if (!discoveredObjects.has(id)) {
    discoveredObjects.add(id);
    discoveries++;
    gameHud.textContent =
      `♥ BIRTHDAY QUEST: ${discoveries} / 4 DISCOVERIES`;

    if (discoveries === 4) {
      gameHud.textContent = "★ QUEST COMPLETE! YOU ARE AMAZING! ★";
      celebrate();
    }
  }

  if (message) {
    gameHud.title = message;
  }
}

function celebrate() {
  const scene = $(".room-scene");

  for (let i = 0; i < 18; i++) {
    const spark = document.createElement("span");
    spark.textContent = ["♥", "✦", "★", "✧"][i % 4];
    spark.setAttribute("aria-hidden", "true");
    spark.style.cssText = `
      position: absolute;
      z-index: 5;
      left: ${5 + Math.random() * 90}%;
      top: ${10 + Math.random() * 70}%;
      color: ${i % 2 ? "#ff304f" : "#ffd166"};
      font-size: ${16 + Math.random() * 18}px;
      pointer-events: none;
      animation: pixel-float 1.2s steps(4, end) both;
    `;

    scene.appendChild(spark);
    window.setTimeout(() => spark.remove(), 1400);
  }
}

// Enter and leave the party room.
$("#enter").addEventListener("click", () => {
  welcome.hidden = true;
  room.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

$("#back").addEventListener("click", () => {
  stopCamera();
  room.hidden = true;
  welcome.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Balloon surprises.
const birthdayMessages = [
  "you deserve all the happiness in the world ♡",
  "may this year bring you little miracles ✨",
  "you make the world a little brighter!",
  "sending you the biggest birthday hug 💌",
  "never forget how loved you are ♡"
];

const balloonButtons = [...document.querySelectorAll(".balloon")];
const balloonMessage = $("#balloon-message");
let poppedBalloons = 0;

balloonButtons.forEach((balloon, index) => {
  balloon.addEventListener("click", () => {
    if (balloon.classList.contains("popped")) return;

    balloon.classList.add("popped");
    balloon.disabled = true;
    poppedBalloons++;

    balloonMessage.textContent = birthdayMessages[index];

    if (poppedBalloons === balloonButtons.length) {
      balloonMessage.textContent =
        "★ ALL BALLOONS POPPED! YOU WIN A BIG BIRTHDAY HUG! ★";
      discover("balloons", "All balloons popped!");
      celebrate();
    }
  });
});

// Birthday cake.
let candlesBlown = false;

$("#cake").addEventListener("click", () => {
  const cake = $("#cake");
  const message = $("#cake-message");

  candlesBlown = !candlesBlown;
  cake.classList.toggle("is-blown", candlesBlown);
  cake.setAttribute("aria-pressed", String(candlesBlown));

  message.textContent = candlesBlown
    ? "★ WISH UNLOCKED! MAY YOUR DREAMS COME TRUE! ★"
    : "the candles are back! make another wish ♡";

  cake.querySelectorAll(".candles i").forEach((candle) => {
    candle.style.visibility = candlesBlown ? "hidden" : "visible";
  });

  if (candlesBlown) {
    discover("cake", "Birthday wish unlocked!");
    celebrate();
  }
});

// Birthday cat.
const catMessages = [
  "meow! happy birthday! 🐾",
  "pspsps... you are my favorite human",
  "purrrr... make a little wish ♡",
  "the birthday kitty sends kisses!",
  "meow meow! stay a little longer",
  "♥ SECRET CAT MESSAGE: YOU ARE LOVED ♥"
];

let catClicks = 0;

$("#cat").addEventListener("click", () => {
  $("#cat-message").textContent =
    catMessages[catClicks % catMessages.length];

  catClicks++;

  discover("cat", "You befriended the birthday kitty!");

  if (catClicks % catMessages.length === 0) {
    $("#cat-message").textContent =
      "★ CAT LEVEL COMPLETE! PURRRRFECT! ★";
    celebrate();
  }
});

// Love notes saved in this browser.
const notesKey = "little-party-room-notes";
const notesContainer = $("#notes");
const noteForm = $("#note-form");
const noteInput = $("#note");

function loadNotes() {
  try {
    const saved = JSON.parse(localStorage.getItem(notesKey) || "[]");

    return Array.isArray(saved)
      ? saved
          .filter((note) => typeof note === "string")
          .slice(-30)
      : [];
  } catch {
    return [];
  }
}

let notes = loadNotes();

function renderNotes() {
  notesContainer.replaceChildren();

  notes.forEach((text) => {
    const card = document.createElement("div");
    card.className = "note-card";
    card.textContent = text;
    notesContainer.appendChild(card);
  });
}

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = noteInput.value.trim();
  if (!text) return;

  notes.push(text);
  notes = notes.slice(-30);

  try {
    localStorage.setItem(notesKey, JSON.stringify(notes));
  } catch {
    // Notes remain visible for this session.
  }

  renderNotes();
  noteInput.value = "";
  noteInput.focus();

  discover("notes", "A little love note was left!");
  $("#balloon-message").textContent =
    "♥ YOUR MESSAGE HAS BEEN PINNED! ♥";
});

renderNotes();

// Optional photo booth.
const video = $("#video");
const canvas = $("#canvas");
const photo = $("#photo");
const placeholder = $("#photo-placeholder");
const startCameraButton = $("#start-camera");
const takePhotoButton = $("#take-photo");
const downloadButton = $("#download-photo");
const cameraMessage = $("#camera-message");

let cameraStream = null;
let photoUrl = null;

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }

  video.srcObject = null;
  video.hidden = true;
  takePhotoButton.hidden = true;
}

startCameraButton.addEventListener("click", async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraMessage.textContent =
      "Camera access needs HTTPS or localhost and a supported browser.";
    return;
  }

  startCameraButton.disabled = true;
  cameraMessage.textContent = "REQUESTING CAMERA ACCESS...";

  try {
    stopCamera();

    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });

    video.srcObject = cameraStream;
    await video.play();

    video.hidden = false;
    photo.hidden = true;
    placeholder.hidden = true;
    downloadButton.hidden = true;
    takePhotoButton.hidden = false;

    startCameraButton.textContent = "RESTART CAMERA";
    cameraMessage.textContent = "READY PLAYER ONE? SAY CHEESE! ♥";
  } catch (error) {
    stopCamera();

    cameraMessage.textContent =
      error.name === "NotAllowedError"
        ? "Camera permission denied. Check your browser settings."
        : "Couldn't open the camera. Please check it and try again.";
  } finally {
    startCameraButton.disabled = false;
  }
});

takePhotoButton.addEventListener("click", () => {
  if (!video.videoWidth || !video.videoHeight) {
    cameraMessage.textContent =
      "CAMERA LOADING... TRY AGAIN IN A MOMENT!";
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext("2d");

  // Mirror the preview for a selfie.
  context.translate(canvas.width, 0);
  context.scale(-1, 1);
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  context.setTransform(1, 0, 0, 1, 0, 0);

  // Black and red birthday caption.
  const captionHeight = Math.max(64, canvas.width * 0.14);

  context.fillStyle = "#160b13";
  context.fillRect(
    0,
    canvas.height - captionHeight,
    canvas.width,
    captionHeight
  );

  context.fillStyle = "#ff5277";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font =
    `bold ${Math.max(18, canvas.width * 0.035)}px monospace`;

  context.fillText(
    "HAPPY BIRTHDAY! ♥",
    canvas.width / 2,
    canvas.height - captionHeight / 2,
    canvas.width - 20
  );

  canvas.toBlob((blob) => {
    if (!blob) {
      cameraMessage.textContent =
        "Couldn't save that photo. Please try again.";
      return;
    }

    if (photoUrl) URL.revokeObjectURL(photoUrl);

    photoUrl = URL.createObjectURL(blob);
    photo.src = photoUrl;
    photo.hidden = false;
    video.hidden = true;
    downloadButton.hidden = false;
    downloadButton.href = photoUrl;
    downloadButton.download = "birthday-pixel-memory.png";

    cameraMessage.textContent = "♥ MEMORY SAVED! LOOKING AMAZING! ♥";

    discover("photo", "Birthday photo captured!");
  }, "image/png");
});

downloadButton.addEventListener("click", () => {
  if (photoUrl) {
    downloadButton.href = photoUrl;
  }
});

// Release the camera when the visitor leaves the page.
window.addEventListener("pagehide", () => {
  stopCamera();

  if (photoUrl) {
    URL.revokeObjectURL(photoUrl);
    photoUrl = null;
  }
});
