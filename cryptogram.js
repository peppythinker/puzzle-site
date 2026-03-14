const randomCryptogramTab = document.getElementById("randomCryptogramTab");
const customCryptogramTab = document.getElementById("customCryptogramTab");
const randomCryptogramControls = document.getElementById("randomCryptogramControls");
const customCryptogramControls = document.getElementById("customCryptogramControls");
const newCryptogramBtn = document.getElementById("newCryptogramBtn");
const generateCryptogramBtn = document.getElementById("generateCryptogramBtn");
const cryptogramPhraseInput = document.getElementById("cryptogramPhraseInput");
const cryptogramSection = document.getElementById("cryptogramSection");
const cryptogramBoard = document.getElementById("cryptogramBoard");
const cryptogramHint = document.getElementById("cryptogramHint");
const nextCryptogramBtn = document.getElementById("nextCryptogramBtn");
const checkCryptogramBtn = document.getElementById("checkCryptogramBtn");
const showCryptogramBtn = document.getElementById("showCryptogramBtn");
const cryptogramMessage = document.getElementById("cryptogramMessage");

const randomQuotes = [
  "KNOWLEDGE IS POWER",
  "PRACTICE MAKES PROGRESS",
  "SMALL STEPS EVERY DAY",
  "STAY CURIOUS",
  "PUZZLES TRAIN YOUR BRAIN",
  "CONSISTENCY BUILDS SKILL",
  "LEARNING NEVER STOPS"
];

let currentMode = "random";
let plainPhrase = "";
let cipherPhrase = "";
let cipherToPlain = {};
let currentInputs = [];

function sanitizePhrase(value) {
  return value.toUpperCase().replace(/[^A-Z ]/g, "").replace(/\s+/g, " ").trim();
}

function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function buildCipherMap() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  while (true) {
    const shuffled = shuffle(alphabet);
    const map = {};
    let valid = true;

    for (let i = 0; i < alphabet.length; i += 1) {
      const plain = alphabet[i];
      const cipher = shuffled[i];

      if (plain === cipher) {
        valid = false;
        break;
      }

      map[cipher] = plain;
    }

    if (valid) {
      return map;
    }
  }
}

function encryptPhrase(phrase, map) {
  const plainToCipher = {};

  Object.entries(map).forEach(([cipher, plain]) => {
    plainToCipher[plain] = cipher;
  });

  return phrase
    .split("")
    .map((char) => {
      if (char === " ") {
        return " ";
      }

      return plainToCipher[char];
    })
    .join("");
}

function setMode(mode) {
  currentMode = mode;
  randomCryptogramTab.classList.toggle("active", mode === "random");
  customCryptogramTab.classList.toggle("active", mode === "custom");

  randomCryptogramControls.classList.toggle("active", mode === "random");
  customCryptogramControls.classList.toggle("active", mode === "custom");

  nextCryptogramBtn.classList.toggle("hidden", mode !== "random");
  cryptogramSection.classList.add("hidden");
  cryptogramMessage.textContent = "";
  cryptogramMessage.className = "result-message";
}

function showMessage(text, type) {
  cryptogramMessage.textContent = text;
  cryptogramMessage.className = `result-message ${type}`;
}

function getDistinctEncryptedLetters() {
  return [...new Set(cipherPhrase.split("").filter((char) => /[A-Z]/.test(char)))];
}

function buildHint() {
  const distinct = getDistinctEncryptedLetters().length;
  const words = plainPhrase.split(" ").filter(Boolean).length;
  const lengths = plainPhrase
    .split(" ")
    .filter(Boolean)
    .map((word) => word.length)
    .join("-");

  cryptogramHint.textContent = `Hint: ${words} word${words === 1 ? "" : "s"} · pattern ${lengths} · ${distinct} unique encrypted letters`;
}

function renderBoard() {
  cryptogramBoard.innerHTML = "";
  cryptogramBoard.classList.remove("solved");
  currentInputs = [];

  cipherPhrase.split("").forEach((char, index) => {
    if (char === " ") {
      const spacer = document.createElement("div");
      spacer.className = "cryptogram-space";
      cryptogramBoard.appendChild(spacer);
      return;
    }

    const cell = document.createElement("div");
    cell.className = "cryptogram-cell";

    const cipherLabel = document.createElement("span");
    cipherLabel.className = "cryptogram-cipher";
    cipherLabel.textContent = char;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "cryptogram-input";
    input.maxLength = 1;
    input.autocomplete = "off";
    input.dataset.index = String(index);
    input.dataset.cipher = char;
    input.setAttribute("aria-label", `Decoded letter for encrypted ${char}`);

    input.addEventListener("input", (event) => {
      const entry = event.target;
      entry.value = entry.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 1);
      cryptogramMessage.textContent = "";
      cryptogramMessage.className = "result-message";
    });

    input.addEventListener("keydown", (event) => {
      if (event.key !== "Backspace" || event.target.value !== "") return;
      const idx = currentInputs.indexOf(event.target);
      if (idx > 0) {
        currentInputs[idx - 1].focus();
      }
    });

    currentInputs.push(input);
    cell.appendChild(cipherLabel);
    cell.appendChild(input);
    cryptogramBoard.appendChild(cell);
  });

  if (currentInputs[0]) {
    currentInputs[0].focus();
  }
}

function buildPuzzle(phrase) {
  plainPhrase = phrase;
  cipherToPlain = buildCipherMap();
  cipherPhrase = encryptPhrase(plainPhrase, cipherToPlain);

  renderBoard();
  buildHint();
  cryptogramSection.classList.remove("hidden");
  showMessage("Type your guesses below each encrypted letter.", "info");
}

function getAttempt() {
  return cipherPhrase
    .split("")
    .map((char, idx) => {
      if (char === " ") return " ";
      const matchingInput = currentInputs.find((entry) => Number(entry.dataset.index) === idx);
      return matchingInput ? matchingInput.value : "";
    })
    .join("");
}

function checkAnswer() {
  if (!plainPhrase) {
    showMessage("Start a puzzle first.", "error");
    return;
  }

  if (currentInputs.some((entry) => entry.value === "")) {
    showMessage("Fill all letter boxes before checking.", "error");
    return;
  }

  const attempt = getAttempt();

  if (attempt === plainPhrase) {
    cryptogramBoard.classList.add("solved");
    showMessage(`🎉 Correct! ${plainPhrase}`, "success");
    return;
  }

  showMessage("Not quite yet — keep decoding.", "error");
}

function showAnswer() {
  if (!plainPhrase) {
    showMessage("Start a puzzle first.", "error");
    return;
  }

  currentInputs.forEach((input) => {
    input.value = cipherToPlain[input.dataset.cipher] || "";
  });

  cryptogramBoard.classList.add("solved");
  showMessage(`Answer revealed: ${plainPhrase}`, "info");
}

function startRandomPuzzle() {
  const phrase = randomQuotes[Math.floor(Math.random() * randomQuotes.length)];
  buildPuzzle(phrase);
}

function startCustomPuzzle() {
  const phrase = sanitizePhrase(cryptogramPhraseInput.value);

  if (!phrase || phrase.length < 3) {
    showMessage("Use at least 3 letters for a custom phrase.", "error");
    return;
  }

  buildPuzzle(phrase);
}

randomCryptogramTab.addEventListener("click", () => setMode("random"));
customCryptogramTab.addEventListener("click", () => setMode("custom"));
newCryptogramBtn.addEventListener("click", startRandomPuzzle);
nextCryptogramBtn.addEventListener("click", startRandomPuzzle);
generateCryptogramBtn.addEventListener("click", startCustomPuzzle);
checkCryptogramBtn.addEventListener("click", checkAnswer);
showCryptogramBtn.addEventListener("click", showAnswer);

setMode("random");
