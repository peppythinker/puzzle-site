const randomFallenTab = document.getElementById("randomFallenTab");
const customFallenTab = document.getElementById("customFallenTab");
const randomFallenControls = document.getElementById("randomFallenControls");
const customFallenControls = document.getElementById("customFallenControls");
const newFallenBtn = document.getElementById("newFallenBtn");
const nextFallenBtn = document.getElementById("nextFallenBtn");
const generateFallenBtn = document.getElementById("generateFallenBtn");
const fallenPhraseInput = document.getElementById("fallenPhraseInput");
const fallenSection = document.getElementById("fallenSection");
const fallenHint = document.getElementById("fallenHint");
const fallenColumns = document.getElementById("fallenColumns");
const fallenBoard = document.getElementById("fallenBoard");
const checkFallenBtn = document.getElementById("checkFallenBtn");
const showFallenBtn = document.getElementById("showFallenBtn");
const fallenMessage = document.getElementById("fallenMessage");

const BOARD_WIDTH = 12;
const randomPhrases = [
  "PRACTICE MAKES PROGRESS",
  "STAY CURIOUS",
  "SMALL STEPS EVERY DAY",
  "LOGIC BUILDS CONFIDENCE",
  "THINK BEFORE YOU GUESS",
  "SOLVE ONE CLUE AT A TIME",
  "PUZZLES TRAIN YOUR BRAIN"
];

let currentMode = "random";
let plainPhrase = "";
let slotChars = [];
let slotColumns = [];
let slotValues = [];
let columnPools = [];
let activeSlotIndex = -1;

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

function showMessage(text, type) {
  fallenMessage.textContent = text;
  fallenMessage.className = `result-message ${type}`;
}

function setMode(mode) {
  currentMode = mode;
  randomFallenTab.classList.toggle("active", mode === "random");
  customFallenTab.classList.toggle("active", mode === "custom");

  randomFallenControls.classList.toggle("active", mode === "random");
  customFallenControls.classList.toggle("active", mode === "custom");

  nextFallenBtn.classList.toggle("hidden", mode !== "random");
  fallenSection.classList.add("hidden");
  showMessage("", "");
}

function addLetterToSlot(slotIndex, letter) {
  const column = slotColumns[slotIndex];

  if (column === -1 || slotValues[slotIndex] !== "") {
    return;
  }

  const letterIndex = columnPools[column].indexOf(letter);

  if (letterIndex === -1) {
    return;
  }

  columnPools[column].splice(letterIndex, 1);
  slotValues[slotIndex] = letter;
  activeSlotIndex = -1;
  renderColumns();
  renderBoard();
}

function clearSlot(slotIndex) {
  if (slotColumns[slotIndex] === -1 || slotValues[slotIndex] === "") {
    return;
  }

  const column = slotColumns[slotIndex];
  columnPools[column].push(slotValues[slotIndex]);
  slotValues[slotIndex] = "";
  columnPools[column] = columnPools[column].sort();

  renderColumns();
  renderBoard();
}

function renderColumns() {
  fallenColumns.innerHTML = "";

  columnPools.forEach((pool, columnIndex) => {
    const column = document.createElement("div");
    column.className = "fallen-column";

    const title = document.createElement("div");
    title.className = "fallen-column-title";
    title.textContent = `Col ${columnIndex + 1}`;
    column.appendChild(title);

    const stack = document.createElement("div");
    stack.className = "fallen-stack";

    if (!pool.length) {
      const emptyText = document.createElement("span");
      emptyText.className = "fallen-empty";
      emptyText.textContent = "—";
      stack.appendChild(emptyText);
    }

    pool.forEach((letter) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "fallen-letter";
      button.textContent = letter;

      button.addEventListener("click", () => {
        if (activeSlotIndex === -1) {
          showMessage("Select a blank in the board first.", "error");
          return;
        }

        if (slotColumns[activeSlotIndex] !== columnIndex) {
          showMessage("Use a letter from the same column as the selected blank.", "error");
          return;
        }

        addLetterToSlot(activeSlotIndex, letter);
        showMessage("", "");
      });

      stack.appendChild(button);
    });

    column.appendChild(stack);
    fallenColumns.appendChild(column);
  });
}

function renderBoard() {
  fallenBoard.innerHTML = "";

  slotChars.forEach((char, index) => {
    if (char === " ") {
      const spacer = document.createElement("span");
      spacer.className = "fallen-space";
      fallenBoard.appendChild(spacer);
      return;
    }

    const slotBtn = document.createElement("button");
    slotBtn.type = "button";
    slotBtn.className = "fallen-slot";
    slotBtn.classList.toggle("active", activeSlotIndex === index);
    slotBtn.textContent = slotValues[index] || "_";
    slotBtn.setAttribute("aria-label", `Letter slot ${index + 1} in column ${slotColumns[index] + 1}`);

    slotBtn.addEventListener("click", () => {
      if (slotValues[index]) {
        clearSlot(index);
        showMessage("Cleared that slot and returned the letter to its column.", "info");
        return;
      }

      activeSlotIndex = index;
      renderBoard();
      showMessage(`Selected a blank in column ${slotColumns[index] + 1}.`, "info");
    });

    fallenBoard.appendChild(slotBtn);
  });
}

function buildPuzzle(phrase) {
  plainPhrase = phrase;
  slotChars = phrase.split("");
  slotValues = slotChars.map((char) => (char === " " ? " " : ""));

  let letterCount = 0;
  slotColumns = slotChars.map((char) => {
    if (char === " ") {
      return -1;
    }

    const column = letterCount % BOARD_WIDTH;
    letterCount += 1;
    return column;
  });

  columnPools = Array.from({ length: BOARD_WIDTH }, () => []);

  slotChars.forEach((char, index) => {
    const column = slotColumns[index];

    if (column !== -1) {
      columnPools[column].push(char);
    }
  });

  columnPools = columnPools.map((pool) => shuffle(pool));
  activeSlotIndex = -1;

  const wordLengths = phrase.split(" ").filter(Boolean).map((word) => word.length).join("-");
  fallenHint.textContent = `Hint: ${phrase.split(" ").length} words · pattern ${wordLengths} · click a filled blank to clear it.`;

  renderColumns();
  renderBoard();
  fallenSection.classList.remove("hidden");
  showMessage("Select a blank and then choose a letter from the matching column.", "info");
}

function checkAnswer() {
  if (!plainPhrase) {
    showMessage("Start a puzzle first.", "error");
    return;
  }

  if (slotValues.includes("")) {
    showMessage("Fill all blanks before checking.", "error");
    return;
  }

  const attempt = slotValues.join("");

  if (attempt === plainPhrase) {
    showMessage(`🎉 Correct! ${plainPhrase}`, "success");
    return;
  }

  showMessage("Not quite yet — keep rearranging letters.", "error");
}

function showAnswer() {
  if (!plainPhrase) {
    showMessage("Start a puzzle first.", "error");
    return;
  }

  slotValues = slotChars.map((char) => (char === " " ? " " : char));
  columnPools = columnPools.map(() => []);
  activeSlotIndex = -1;

  renderColumns();
  renderBoard();
  showMessage(`Answer revealed: ${plainPhrase}`, "info");
}

function startRandomPuzzle() {
  const phrase = randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
  buildPuzzle(phrase);
}

function startCustomPuzzle() {
  const phrase = sanitizePhrase(fallenPhraseInput.value);

  if (!phrase || phrase.length < 3) {
    showMessage("Use at least 3 letters for a custom phrase.", "error");
    return;
  }

  buildPuzzle(phrase);
}

randomFallenTab.addEventListener("click", () => setMode("random"));
customFallenTab.addEventListener("click", () => setMode("custom"));
newFallenBtn.addEventListener("click", startRandomPuzzle);
nextFallenBtn.addEventListener("click", startRandomPuzzle);
generateFallenBtn.addEventListener("click", startCustomPuzzle);
checkFallenBtn.addEventListener("click", checkAnswer);
showFallenBtn.addEventListener("click", showAnswer);

setMode("random");
