
/* ==========================================
   BDAY-MOTO — BIRTHDAY ROOM GAME
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector) => document.querySelector(selector);

  const welcome = $("#welcome");
  const room = $("#room");
  const enterButton = $("#enter");
  const backButton = $("#back");
  const world = $(".game-world");
  const player = $("#player");
  const prompt = $("#interaction-prompt");

  const messagePanel = $("#message-panel");
  const panelTitle = $("#panel-title");
  const panelContent = $("#panel-content");
  const closePanel = $("#close-panel");

  const questCount = $("#quest-count");
  const questProgress = $("#quest-progress");
  const questItems = {
    balloons: $("#quest-balloons"),
    cake: $("#quest-cake"),
    gift: $("#quest-gift"),
    cat: $("#quest-cat"),
    notes: $("#quest-notes")
  };

  const objects = [
    {
      id: "balloon-object",
      name: "Balloons",
      quest: "balloons",
      title: "A ROOM FULL OF BALLOONS",
      message:
        "Every balloon carries a little wish for you. 🎈\n\nMay your days be filled with happiness, laughter, and beautiful surprises."
    },
    {
      id: "cake-object",
      name: "Birthday Cake",
      quest: "cake",
      title: "MAKE A BIRTHDAY WISH",
      message:
        "The candles are glowing just for you. 🎂\n\nClose your eyes, make a wish, and remember that you deserve all the good things coming your way.\n\nHappy Birthday! ❤️"
    },
    {
      id: "gift-object",
      name: "Gift",
      quest: "gift",
      title: "A LITTLE PRESENT",
      message:
        "You found your birthday present! 🎁\n\nInside is a reminder that you are special, appreciated, and loved.\n\nMay this new chapter bring you countless reasons to smile."
    },
    {
      id: "cat-object",
      name: "Birthday Cat",
      quest: "cat",
      title: "MEET THE BIRTHDAY CAT",
      message:
        "Meow! 🐈 The birthday cat has chosen you as its favorite human.\n\nYour reward: unlimited imaginary cuddles and extra birthday luck."
    }
  ];

  const completed = new Set();
  let playerX = 48;
  let playerY = 57;
  let facing = "down";
  let cameraStream = null;
  let nearbyObject = null;

  const clamp = (value, min, max) =>
    Math.max(min, Math.min(max, value));

  function showPanel(title, message) {
    if (!messagePanel) return;

    if (panelTitle) panelTitle.textContent = title;
    if (panelContent) panelContent.textContent = message;

    messagePanel.hidden = false;
  }

  function hidePanel() {
    if (messagePanel) messagePanel.hidden = true;
  }

  function updatePlayer() {
    if (!player) return;

    player.style.left = `${playerX}%`;
    player.style.top = `${playerY}%`;
    player.dataset.facing = facing;
  }

  function updateQuest() {
    const total = Object.keys(questItems).length;
    const count = completed.size;

    if (questCount) {
      questCount.textContent = `${count}/${total}`;
    }

    if (questProgress) {
      const bar = questProgress.firstElementChild || questProgress;
      bar.style.width = `${(count / total) * 100}%`;

      if (questProgress.firstElementChild) {
        questProgress.setAttribute(
          "aria-valuenow",
          String(count)
        );
      }
    }

    Object.entries(questItems).forEach(([key, item]) => {
      if (!item) return;

      item.classList.toggle("done", completed.has(key));
      item.setAttribute(
        "aria-label",
        `${key}: ${completed.has(key) ? "completed" : "not completed"}`
      );
    });

    if (count === total) {
      showPrompt("Birthday quest complete! ❤️");
    }
  }

  function showPrompt(message) {
    if (prompt) prompt.textContent = message;
  }

  function completeQuest(key) {
    if (!key || completed.has(key)) return;

    completed.add(key);
    updateQuest();
  }

  function openObject(object) {
    if (!object) return;

    completeQuest(object.quest);

    let message = object.message;

    if (object.quest === "cake") {
      message += "\n\n🎉 Your birthday wish has been made!";
    }

    showPanel(object.title, message);
  }

  function getObjectCenter(element) {
    const worldRect = world.getBoundingClientRect();
    const objectRect = element.getBoundingClientRect();

    return {
      x:
        ((objectRect.left + objectRect.width / 2 - worldRect.left) /
          worldRect.width) *
        100,
      y:
        ((objectRect.top + objectRect.height / 2 - worldRect.top) /
          worldRect.height) *
        100
    };
  }

  function findNearestObject() {
    if (!world || !player) return null;

    let nearest = null;
    let nearestDistance = Infinity;

    objects.forEach((object) => {
      const element = document.getElementById(object.id);
      if (!element) return;

      const center = getObjectCenter(element);
      const dx = center.x - playerX;
      const dy = center.y - playerY;
      const distance = Math.hypot(dx, dy);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = object;
      }
    });

    return { object: nearest, distance: nearestDistance };
  }

  function updateNearbyObject() {
    const result = findNearestObject();

    if (!result || result.distance > 20) {
      nearbyObject = null;
      showPrompt("Move around and explore your birthday room!");
      return;
    }

    nearbyObject = result.object;
    showPrompt(`Press E or tap ${nearbyObject.name} to interact`);
  }

  function movePlayer(dx, dy) {
    if (!world || !player || !room || room.hidden) return;

    if (dx !== 0) facing = dx < 0 ? "left" : "right";
    else if (dy !== 0) facing = dy < 0 ? "up" : "down";

    playerX = clamp(playerX + dx, 3, 93);
    playerY = clamp(playerY + dy, 5, 85);

    updatePlayer();
    updateNearbyObject();
  }

  function interactNearby() {
    const result = findNearestObject();

    if (result && result.distance <= 20) {
      openObject(result.object);
    } else {
      showPanel(
        "EXPLORE YOUR ROOM",
        "Walk closer to the balloons, birthday cake, gift, or cat. Then press E to interact! ❤️"
      );
    }
  }

  /* ENTER AND EXIT THE GAME */

  if (enterButton) {
    enterButton.addEventListener("click", () => {
      if (welcome) welcome.hidden = true;
      if (room) room.hidden = false;

      updatePlayer();
      updateNearbyObject();
    });
  }

  if (backButton) {
    backButton.addEventListener("click", () => {
      if (room) room.hidden = true;
      if (welcome) welcome.hidden = false;
      hidePanel();
    });
  }

  /* CLICKABLE BIRTHDAY OBJECTS */

  objects.forEach((object) => {
    const element = document.getElementById(object.id);
    if (!element) return;

    element.addEventListener("click", () => {
      openObject(object);
    });

    element.addEventListener("focus", () => {
      nearbyObject = object;
      showPrompt(`Tap or press Enter to explore ${object.name}`);
    });
  });

  /* KEYBOARD CONTROLS */

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const tag = target && target.tagName
      ? target.tagName.toLowerCase()
      : "";

    if (
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      (target && target.isContentEditable)
    ) {
      return;
    }

    const key = event.key.toLowerCase();
    const step = event.shiftKey ? 4 : 2;

    const movement = {
      arrowup: [0, -step],
      w: [0, -step],
      arrowdown: [0, step],
      s: [0, step],
      arrowleft: [-step, 0],
      a: [-step, 0],
      arrowright: [step, 0],
      d: [step, 0]
    };

    if (movement[key]) {
      event.preventDefault();
      movePlayer(...movement[key]);
      return;
    }

    if (key === "e" || key === "enter") {
      if (room && !room.hidden && !messagePanel?.hidden) {
        return;
      }

      if (room && !room.hidden) {
        event.preventDefault();
        interactNearby();
      }
    }

    if (key === "escape") {
      hidePanel();
    }
  });

  /* MOBILE MOVEMENT BUTTONS */

  document.querySelectorAll("[data-move]").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.move;
      const step = 5;

      const movement = {
        up: [0, -step],
        down: [0, step],
        left: [-step, 0],
        right: [step, 0]
      };

      if (movement[direction]) {
        movePlayer(...movement[direction]);
      }
    });
  });

  /* POP-UP CLOSE BUTTON */

  if (closePanel) {
    closePanel.addEventListener("click", hidePanel);
  }

  if (messagePanel) {
    messagePanel.addEventListener("click", (event) => {
      if (event.target === messagePanel) hidePanel();
    });
  }

  /* BIRTHDAY NOTES */

  const noteForm = $("#note-form");
  const noteInput = $("#note");
  const notesList = $("#notes");

  if (noteForm && noteInput && notesList) {
    noteForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const text = noteInput.value.trim();
      if (!text) {
        noteInput.focus();
        return;
      }

      const item = document.createElement("li");
      item.textContent = text;
      notesList.appendChild(item);

      noteInput.value = "";
      completeQuest("notes");

      showPanel(
        "YOUR LOVE NOTE ❤️",
        "Your message has been added to the birthday wall!\n\n" +
          text
      );
    });
  }

  /* OPTIONAL CAMERA AND PHOTO BOOTH */

  const video = $("#video");
  const canvas = $("#canvas");
  const photo = $("#photo");
  const placeholder = $("#photo-placeholder");
  const startCamera = $("#start-camera");
  const takePhoto = $("#take-photo");
  const downloadPhoto = $("#download-photo");
  const cameraMessage = $("#camera-message");

  function setCameraMessage(message) {
    if (cameraMessage) cameraMessage.textContent = message;
  }

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      cameraStream = null;
    }

    if (video) video.srcObject = null;
  }

  if (startCamera) {
    startCamera.addEventListener("click", async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraMessage(
          "Camera access is not supported here. Open the website using HTTPS in a supported browser."
        );
        return;
      }

      try {
        stopCamera();

        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false
        });

        if (video) {
          video.srcObject = cameraStream;
          video.hidden = false;
          await video.play();
        }

        if (placeholder) placeholder.hidden = true;
        if (photo) photo.hidden = true;

        setCameraMessage(
          "Camera is ready! Smile, then select Take Photo. 📸"
        );
      } catch (error) {
        setCameraMessage(
          "Camera could not start. Check your browser's camera permission and try again."
        );
      }
    });
  }

  if (takePhoto) {
    takePhoto.addEventListener("click", () => {
      if (!video || !canvas || !video.videoWidth) {
        setCameraMessage(
          "Start the camera first, or allow camera access in your browser."
        );
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      if (!context) {
        setCameraMessage("Sorry, the photo could not be created.");
        return;
      }

      context.save();
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      context.restore();

      const imageData = canvas.toDataURL("image/png");

      if (photo) {
        photo.src = imageData;
        photo.hidden = false;
      }

      setCameraMessage("Photo captured! You can download it below. ❤️");
    });
  }

  if (downloadPhoto) {
    downloadPhoto.addEventListener("click", () => {
      if (!photo || photo.hidden || !photo.src) {
        setCameraMessage("Take a photo first, then download it.");
        return;
      }

      const link = document.createElement("a");
      link.href = photo.src;
      link.download = "BDAY-MOTO-photo.png";
      document.body.appendChild(link);
      link.click();
      link.remove();

      setCameraMessage("Your birthday photo download has started!");
    });
  }

  window.addEventListener("pagehide", stopCamera);

  /* STARTING STATE */

  if (messagePanel) messagePanel.hidden = true;
  if (room) room.hidden = true;
  if (welcome) welcome.hidden = false;

  updatePlayer();
  updateQuest();
});
