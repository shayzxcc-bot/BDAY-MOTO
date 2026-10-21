
(() => {
  "use strict";

  const room = document.getElementById("partyRoom");
  const backButton = document.getElementById("backButton");

  if (!room || !backButton) return;

  const STORAGE_KEY = "bday-moto-gifts-v1";
  const style = document.createElement("style");

  style.textContent = `
    .gift-area {
      max-width: 760px;
      margin: 28px auto;
      padding: 22px;
      border: 2px dashed #d6a9bf;
      border-radius: 20px;
      background: #fff9f5;
      color: #68465e;
    }
    .gift-area h3 {
      font-size: 28px;
      font-weight: normal;
      margin: 0 0 8px;
    }
    .gift-intro { line-height: 1.7; }
    .gift-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 14px;
      margin-top: 22px;
    }
    .gift-box {
      min-width: 0;
      min-height: 130px;
      border: 1px solid #e9c7d8;
      border-radius: 12px;
      background: #fff0f5;
      color: #68465e;
      padding: 12px;
      overflow-wrap: anywhere;
      transition: transform .2s;
    }
    .gift-box:hover { transform: translateY(-4px); }
    .gift-icon { display: block; font-size: 44px; }
    .gift-name { display: block; margin-top: 8px; font-weight: bold; }
    .gift-button {
      margin: 8px 5px 0 0;
      border: 0;
      border-radius: 24px;
      padding: 11px 17px;
      background: #c17e9e;
      color: white;
      cursor: pointer;
    }
    .gift-button:focus-visible,
    .gift-box:focus-visible,
    .gift-form input:focus-visible,
    .gift-form textarea:focus-visible,
    .gift-form select:focus-visible {
      outline: 3px solid #8b5577;
      outline-offset: 3px;
    }
    .gift-form {
      display: grid;
      gap: 12px;
      margin-top: 18px;
      text-align: left;
    }
    .gift-form label { display: grid; gap: 6px; }
    .gift-form input, .gift-form textarea, .gift-form select {
      width: 100%;
      padding: 11px;
      border: 1px solid #d9b8ca;
      border-radius: 8px;
      background: white;
      color: #68465e;
      font: inherit;
    }
    .gift-detail {
      margin-top: 18px;
      padding: 18px;
      border-radius: 12px;
      background: #f9e9f0;
      overflow-wrap: anywhere;
      text-align: left;
    }
    .gift-detail img {
      display: block;
      max-width: 100%;
      max-height: 360px;
      margin-top: 12px;
      border-radius: 10px;
    }
    .gift-detail a { overflow-wrap: anywhere; }
    .gift-status { min-height: 1.5em; }
  `;

  document.head.appendChild(style);

  const section = document.createElement("section");
  section.className = "gift-area";
  section.setAttribute("aria-labelledby", "gift-heading");

  section.innerHTML = `
    <h3 id="gift-heading">🎁 Little presents for you</h3>
    <p class="gift-intro">
      Every present holds a little something special.
      Pick one to unwrap it. ♡
    </p>
    <p class="gift-status" id="gift-status" aria-live="polite"></p>
    <div class="gift-grid" id="gift-grid"></div>
    <button class="gift-button" id="gift-add" type="button">
      + Wrap a present
    </button>
    <form class="gift-form" id="gift-form" hidden>
      <h4>Wrap a little surprise</h4>
      <label>
        Gift name
        <input name="name" maxlength="50"
          placeholder="A little something ♡" required>
      </label>
      <label>
        What's inside?
        <select name="kind">
          <option value="letter">A letter 💌</option>
          <option value="photo">A photo 🖼️</option>
          <option value="video">A video 🎬</option>
        </select>
      </label>
      <label>
        Message or HTTPS media link
        <textarea name="content" maxlength="3000" rows="4"
          placeholder="Write your letter, or paste a photo/video URL..."
          required></textarea>
      </label>
      <button class="gift-button" type="submit">Wrap it up ♡</button>
      <button class="gift-button" id="gift-cancel" type="button">
        Cancel
      </button>
      <p id="gift-error" role="alert"></p>
    </form>
    <article class="gift-detail" id="gift-detail" hidden
      aria-live="polite"></article>
  `;

  room.insertBefore(section, backButton);

  const grid = section.querySelector("#gift-grid");
  const form = section.querySelector("#gift-form");
  const detail = section.querySelector("#gift-detail");
  const status = section.querySelector("#gift-status");
  const error = section.querySelector("#gift-error");
  const kindInput = form.elements.kind;
  let gifts = loadGifts();

  function loadGifts() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(value)
        ? value.filter((g) =>
            g &&
            typeof g.id === "string" &&
            typeof g.name === "string" &&
            typeof g.kind === "string" &&
            typeof g.content === "string"
          ).slice(0, 40)
        : [];
    } catch {
      return [];
    }
  }

  function saveGifts() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gifts));
      return true;
    } catch {
      status.textContent =
        "Browser storage is full or unavailable. Your new gift wasn't saved.";
      return false;
    }
  }

  function validMediaUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:";
    } catch {
      return false;
    }
  }

  function render() {
    grid.replaceChildren();

    if (!gifts.length) {
      const empty = document.createElement("p");
      empty.textContent = "Your presents will appear here. 🎀";
      grid.appendChild(empty);
    }

    gifts.forEach((gift) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gift-box";

      const icon = document.createElement("span");
      icon.className = "gift-icon";
      icon.textContent = "🎁";

      const name = document.createElement("span");
      name.className = "gift-name";
      name.textContent = gift.name;

      button.append(icon, name);
      button.addEventListener("click", () => openGift(gift));
      grid.appendChild(button);
    });

    status.textContent = `${gifts.length} / 40 presents wrapped`;
  }

  function openGift(gift) {
    detail.replaceChildren();
    detail.hidden = false;

    const heading = document.createElement("h4");
    heading.textContent = `🎀 ${gift.name}`;
    detail.appendChild(heading);

    if (gift.kind === "letter") {
      const letter = document.createElement("p");
      letter.style.whiteSpace = "pre-wrap";
      letter.textContent = gift.content;
      detail.appendChild(letter);
    } else if (validMediaUrl(gift.content)) {
      const link = document.createElement("a");
      link.href = gift.content;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Open the original media in a new tab";
      detail.appendChild(link);

      if (gift.kind === "photo") {
        const image = document.createElement("img");
        image.src = gift.content;
        image.alt = `Photo from ${gift.name}`;
        image.loading = "lazy";
        image.referrerPolicy = "no-referrer";
        detail.appendChild(image);
      }
    } else {
      const message = document.createElement("p");
      message.textContent =
        "This media link isn't a valid HTTPS URL. Edit the gift and try again.";
      detail.appendChild(message);
    }

    const close = document.createElement("button");
    close.type = "button";
    close.className = "gift-button";
    close.textContent = "Close present";
    close.addEventListener("click", () => {
      detail.hidden = true;
    });
    detail.appendChild(close);

    detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  section.querySelector("#gift-add").addEventListener("click", () => {
    error.textContent = "";
    form.hidden = !form.hidden;
    detail.hidden = true;
    if (!form.hidden) form.elements.name.focus();
  });

  section.querySelector("#gift-cancel").addEventListener("click", () => {
    form.reset();
    form.hidden = true;
    error.textContent = "";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    error.textContent = "";

    if (gifts.length >= 40) {
      error.textContent = "This room has reached its 40-present limit.";
      return;
    }

    const name = form.elements.name.value.trim();
    const content = form.elements.content.value.trim();
    const kind = kindInput.value;

    if (!name || !content) {
      error.textContent = "Please fill in both fields.";
      return;
    }

    if (kind !== "letter" && !validMediaUrl(content)) {
      error.textContent = "Please enter a valid HTTPS media URL.";
      return;
    }

    const gift = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      kind,
      content
    };

    gifts.push(gift);

    if (!saveGifts()) {
      gifts.pop();
      return;
    }

    form.reset();
    form.hidden = true;
    render();
    openGift(gift);
  });

  render();
})();
