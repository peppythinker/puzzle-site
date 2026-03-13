const GRID_SIZE = 10;
const DEFAULT_WORDS_PER_PUZZLE = 6;
const MIN_WORD_LENGTH = 2;
const MAX_WORDS_PER_PUZZLE = 8;

const WORD_BANK = [
  "PUZZLE",
  "CODE",
  "MATH",
  "LOGIC",
  "BRAIN",
  "SEARCH",
  "ALPHA",
  "BETA",
  "GAMMA",
  "DELTA",
  "NUMBER",
  "LETTER",
  "HIDDEN",
  "RANDOM",
  "FOCUS",
  "THINK",
  "LEARN",
  "SOLVE",
  "QUEST",
  "PIXEL"
];

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, -1],
  [-1, 1]
];

const gridEl = document.getElementById("wordSearchGrid");
const wordListEl = document.getElementById("wordList");
const resetBtn = document.getElementById("resetWordSearchBtn");
const buildCustomPuzzleBtn = document.getElementById("buildCustomPuzzleBtn");
const customWordsInput = document.getElementById("customWordsInput");
const messageEl = document.getElementById("wordSearchMessage");

let isSelecting = false;
let selectedCells = [];
let selectedWord = "";
let currentWords = [];
let currentGrid = [];
let activeWordPool = [];
const foundWords = new Set();

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function chooseWords(pool) {
  const wordCount = Math.min(DEFAULT_WORDS_PER_PUZZLE, pool.length);
  return shuffle(pool).slice(0, wordCount);
}

function makeEmptyGrid() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(""));
}

function inBounds(row, col) {
  return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
}

function canPlaceWord(grid, word, row, col, rowStep, colStep) {
  for (let i = 0; i < word.length; i += 1) {
    const nextRow = row + rowStep * i;
    const nextCol = col + colStep * i;

    if (!inBounds(nextRow, nextCol)) {
      return false;
    }

    const existing = grid[nextRow][nextCol];
    if (existing !== "" && existing !== word[i]) {
      return false;
    }
  }

  return true;
}

function placeWord(grid, word) {
  const options = [];

  for (const [rowStep, colStep] of DIRECTIONS) {
    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        if (canPlaceWord(grid, word, row, col, rowStep, colStep)) {
          options.push({ row, col, rowStep, colStep });
        }
      }
    }
  }

  if (options.length === 0) {
    return false;
  }

  const choice = options[Math.floor(Math.random() * options.length)];
  for (let i = 0; i < word.length; i += 1) {
    const nextRow = choice.row + choice.rowStep * i;
    const nextCol = choice.col + choice.colStep * i;
    grid[nextRow][nextCol] = word[i];
  }

  return true;
}

function fillEmptyCells(grid) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (!grid[row][col]) {
        grid[row][col] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }
}

function buildPuzzle(words) {
  const candidateWords = shuffle(words).sort((a, b) => b.length - a.length);

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const grid = makeEmptyGrid();

    let allPlaced = true;
    for (const word of candidateWords) {
      if (!placeWord(grid, word)) {
        allPlaced = false;
        break;
      }
    }

    if (allPlaced) {
      fillEmptyCells(grid);
      currentWords = candidateWords;
      currentGrid = grid;
      return true;
    }
  }

  return false;
}

function renderWordList() {
  wordListEl.innerHTML = "";

  currentWords.forEach((word) => {
    const item = document.createElement("li");
    item.textContent = word;
    item.dataset.word = word;

    if (foundWords.has(word)) {
      item.classList.add("found");
    }

    wordListEl.appendChild(item);
  });
}

function renderGrid() {
  gridEl.innerHTML = "";

  currentGrid.forEach((row, rowIndex) => {
    row.forEach((letter, colIndex) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "word-cell";
      cell.textContent = letter;
      cell.dataset.row = String(rowIndex);
      cell.dataset.col = String(colIndex);
      cell.dataset.letter = letter;

      cell.addEventListener("mousedown", handlePointerStart);
      cell.addEventListener("mouseenter", handlePointerMove);
      cell.addEventListener("mouseup", handlePointerEnd);

      gridEl.appendChild(cell);
    });
  });
}

function clearTransientSelection() {
  selectedCells.forEach((cell) => {
    if (!cell.classList.contains("found")) {
      cell.classList.remove("selected");
    }
  });

  selectedCells = [];
  selectedWord = "";
}

function handlePointerStart(event) {
  if (foundWords.size === currentWords.length) return;

  clearTransientSelection();
  isSelecting = true;

  const cell = event.currentTarget;
  selectedCells = [cell];
  selectedWord = cell.dataset.letter;
  cell.classList.add("selected");
}

function isStraightLine(fromCell, toCell) {
  const rowA = Number(fromCell.dataset.row);
  const colA = Number(fromCell.dataset.col);
  const rowB = Number(toCell.dataset.row);
  const colB = Number(toCell.dataset.col);

  const rowDelta = rowB - rowA;
  const colDelta = colB - colA;

  return rowDelta === 0 || colDelta === 0 || Math.abs(rowDelta) === Math.abs(colDelta);
}

function handlePointerMove(event) {
  if (!isSelecting) return;

  const cell = event.currentTarget;
  if (selectedCells.includes(cell)) return;

  const firstCell = selectedCells[0];
  if (!isStraightLine(firstCell, cell)) return;

  clearTransientSelection();

  const rowA = Number(firstCell.dataset.row);
  const colA = Number(firstCell.dataset.col);
  const rowB = Number(cell.dataset.row);
  const colB = Number(cell.dataset.col);

  const rowStep = Math.sign(rowB - rowA);
  const colStep = Math.sign(colB - colA);

  let row = rowA;
  let col = colA;

  while (true) {
    const next = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    selectedCells.push(next);
    next.classList.add("selected");

    if (row === rowB && col === colB) break;
    row += rowStep;
    col += colStep;
  }

  selectedWord = selectedCells.map((entry) => entry.dataset.letter).join("");
}

function findMatchedWord(candidate) {
  const reversed = candidate.split("").reverse().join("");

  return currentWords.find((word) => word === candidate || word === reversed);
}

function markWordAsFound(word) {
  foundWords.add(word);
  selectedCells.forEach((cell) => {
    cell.classList.remove("selected");
    cell.classList.add("found");
  });

  const item = wordListEl.querySelector(`[data-word="${word}"]`);
  if (item) {
    item.classList.add("found");
  }
}

function handlePointerEnd() {
  if (!isSelecting) return;
  isSelecting = false;

  const matchedWord = findMatchedWord(selectedWord);

  if (matchedWord && !foundWords.has(matchedWord)) {
    markWordAsFound(matchedWord);
    messageEl.textContent = `Nice! You found ${matchedWord}.`;
    messageEl.className = "result-message success";

    if (foundWords.size === currentWords.length) {
      messageEl.textContent = "🎉 You found every word!";
    }
  } else {
    clearTransientSelection();
    messageEl.textContent = "Keep searching...";
    messageEl.className = "result-message info";
  }
}

function parseCustomWords(rawText) {
  const tokens = rawText
    .toUpperCase()
    .split(/[\s,]+/)
    .map((word) => word.replace(/[^A-Z]/g, ""))
    .filter(Boolean);

  const uniqueWords = [];
  for (const word of tokens) {
    if (
      word.length >= MIN_WORD_LENGTH
      && word.length <= GRID_SIZE
      && !uniqueWords.includes(word)
    ) {
      uniqueWords.push(word);
    }
  }

  return uniqueWords.slice(0, MAX_WORDS_PER_PUZZLE);
}

function applyPuzzleFromPool(words, successMessage) {
  foundWords.clear();

  if (!buildPuzzle(words)) {
    messageEl.textContent = "Couldn't build that puzzle. Try fewer or shorter words.";
    messageEl.className = "result-message error";
    return;
  }

  renderGrid();
  renderWordList();
  clearTransientSelection();
  messageEl.textContent = successMessage;
  messageEl.className = "result-message info";
}

function loadRandomPuzzle() {
  activeWordPool = [...WORD_BANK];
  const chosenWords = chooseWords(activeWordPool);
  applyPuzzleFromPool(chosenWords, "Random puzzle loaded. Start selecting letters.");
}

function loadCustomPuzzle() {
  const customWords = parseCustomWords(customWordsInput.value);

  if (customWords.length < 3) {
    messageEl.textContent = "Enter at least 3 words (2-10 letters each).";
    messageEl.className = "result-message error";
    return;
  }

  activeWordPool = customWords;
  applyPuzzleFromPool(activeWordPool, "Custom puzzle loaded. Start selecting letters.");
}

function resetPuzzle() {
  const sourceWords = activeWordPool.length ? activeWordPool : chooseWords(WORD_BANK);
  applyPuzzleFromPool(sourceWords, "New puzzle loaded. Start selecting letters.");
}

window.addEventListener("mouseup", () => {
  if (isSelecting) {
    handlePointerEnd();
  }
});

buildCustomPuzzleBtn.addEventListener("click", loadCustomPuzzle);
resetBtn.addEventListener("click", resetPuzzle);
customWordsInput.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    loadCustomPuzzle();
  }
});

loadRandomPuzzle();
