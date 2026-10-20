
const $ = (selector) => document.querySelector(selector);

const welcome = $("#welcome");
const room = $("#room");

// Enter and leave the party room.
$("#enter").addEventListener("click", () => {
  welcome.hidden = true;
  room.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

$("#back").addEventListener("click", () => {
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

balloonButtons.forEach((balloon, index) => {
  balloon.addEventListener("click", () => {
    if (balloon.classList.contains("popped")) return;

    balloon.classList.add("popped");
    balloon.disabled = true;
    balloonMessage.textContent = birthdayMessages[index];

    if (balloonButtons.every((b) => b.classList.contains("popped"))) {
      balloonMessage.textContent += " All the balloons are popped! 🎉";
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
    ? "wish made! may all your little dreams come true ✨"
    : "the candles are back! make another wish ♡";

  cake.querySelectorAll(".candles i").forEach((candle) => {
    candle.textContent = candlesBlown ? "🕯️" : "🕯️";
    candle.style.visibility = candlesBlown ? "hidden" : "visible";
  });
});

// The party cat.
const catMessages = [
  "meow! happy birthday! 🐾",
  "pspsps... you are my favorite human",
  "purrrr... make a little wish ♡",
  "the birthday kitty sends kisses!",
  "meow meow! stay a little longer"
];

let catClicks = 0;

$("#cat").addEventListener("click", () => {
  $("#cat-message").textContent =
    catMessages[catClicks % catMessages.length];
  catClicks++;
});

// Sticky notes saved in this browser.
const notesKey = "little-party-room-notes";
const notesContainer = $("#notes");
const noteForm = $("#note-form");
const noteInput = $("#note");

function loadNotes() {
  try {
    const saved = JSON.parse(localStorage.getItem(notesKey) || "[]");
    return Array.isArray(saved)
      ? saved.filter((note) => typeof note === "string").slice(-30)
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
    // Notes remain visible for this session if storage is unavailable.
  }

  renderNotes();
  noteInput.value = "";
  noteInput.focus();
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

startCameraButton.addEventListener("click", async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraMessage.textContent =
      "Camera access needs HTTPS or localhost and a supported browser.";
    return;
  }

  startCameraButton.disabled = true;
  cameraMessage.textContent = "asking for camera permission…";

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });

    video.srcObject = cameraStream;
    await video.play();

    video.hidden = false;
    photo.hidden = true;
    placeholder.hidden = true;
    takePhotoButton.hidden = false;
    startCameraButton.textContent = "restart camera";
    cameraMessage.textContent = "ready? smile for your birthday photo! ♡";
  } catch (error) {
    cameraMessage.textContent =
      error.name === "NotAllowedError"
        ? "Camera permission was denied. You can allow it in your browser settings."
        : "Couldn't open the camera. Check your camera and try again.";
  } finally {
    startCameraButton.disabled = false;
  }
});

takePhotoButton.addEventListener("click", () => {
  if (!video.videoWidth || !video.videoHeight) {
    cameraMessage.textContent = "The camera is still getting ready. Try again!";
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

  // Add a small birthday caption to the saved photo.
  const captionHeight = Math.max(54, canvas.width * 0.12);
  context.fillStyle = "#fff8ef";
  context.fillRect(0, canvas.height - captionHeight, canvas.width, captionHeight);
  context.fillStyle = "#a34a2e";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `600 ${Math.max(18, canvas.width * 0.035)}px sans-serif`;
  context.fillText(
    "happy birthday ♡",
    canvas.width / 2,
    canvas.height - captionHeight / 2,
    canvas.width - 20
  );

  canvas.toBlob((blob) => {
    if (!blob) {
      cameraMessage.textContent = "Couldn't save that photo. Please try again.";
      return;
    }

    if (photoUrl) URL.revokeObjectURL(photoUrl);
    photoUrl = URL.createObjectURL(blob);

    photo.src = photoUrl;
    photo.hidden = false;
    video.hidden = true;
    downloadButton.hidden = false;
    downloadButton.href = photoUrl;
    downloadButton.download = "little-party-room-birthday.png";
    cameraMessage.textContent = "a little memory, just for you ♡";
  }, "image/png");
});

downloadButton.addEventListener("click", () => {
  if (!photoUrl) return;
  downloadButton.href = photoUrl;
});

// Release the camera when the visitor leaves the page.
window.addEventListener("pagehide", () => {
  cameraStream?.getTracks().forEach((track) => track.stop());
  if (photoUrl) URL.revokeObjectURL(photoUrl);
});
