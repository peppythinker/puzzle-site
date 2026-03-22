const GRID_SIZE = 12;
const MAX_WORDS_PER_PUZZLE = 6;
const FILLER_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const DEFAULT_WORD_SETS = [
  ["APPLE", "BERRY", "GRAPE", "LEMON", "MANGO", "PEACH"],
  ["CAT", "DOG", "MOUSE", "BIRD", "HORSE", "SHEEP"],
  ["MATH", "LOGIC", "NUMBER", "COUNT", "SHAPE", "GRAPH"],
  ["OCEAN", "RIVER", "CLOUD", "STORM", "WIND", "RAIN"],
  ["BOOK", "PENCIL", "PAPER", "CLASS", "STUDENT", "TEACHER"]
];

const DIRECTIONS = [
  { dx: 1, dy: 0 },   // right
  { dx: 0, dy: 1 },   // down
  { dx: 1, dy: 1 },   // down-right
  { dx: -1, dy: 1 }   // down-left
];

const gridEl = document.getElementById("wordSearchGrid");
const wordListEl = document.getElementById("wordList");
const customWordsInput = document.getElementById("customWordsInput");
const buildCustomPuzzleBtn = document.getElementById("buildCustomPuzzleBtn");
const resetWordSearchBtn = document.getElementById("resetWordSearchBtn");
const messageEl = document.getElementById("wordSearchMessage");

let currentGrid = [];
let currentWords = [];
let foundWords = new Set();
let isSelecting = false;
let selectionCells = [];
let activePointerId = null;

function normalizeWord(rawWord) {
  return rawWord.replace(/[^A-Za-z]/g, "").toUpperCase();
}

function parseCustomWords(value) {
  const parts = value
    .split(/[\s,\n]+/)
    .map(normalizeWord)
    .filter(Boolean);

  const uniqueWords = [...new Set(parts)];

  return uniqueWords.filter((word) => word.length >= 3 && word.length <= GRID_SIZE);
}

function getRandomWordSet() {
  const set = DEFAULT_WORD_SETS[Math.floor(Math.random() * DEFAULT_WORD_SETS.length)];
  return [...set];
}

function createEmptyGrid() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(""));
}

function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function canPlaceWord(grid, word, startRow, startCol, direction) {
  for (let i = 0; i < word.length; i += 1) {
    const row = startRow + direction.dy * i;
    const col = startCol + direction.dx * i;

    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
      return false;
    }

    const cellValue = grid[row][col];
    if (cellValue !== "" && cellValue !== word[i]) {
      return false;
    }
  }

  return true;
}

function placeWord(grid, word, startRow, startCol, direction) {
  for (let i = 0; i < word.length; i += 1) {
    const row = startRow + direction.dy * i;
    const col = startCol + direction.dx * i;
    grid[row][col] = word[i];
  }
}

function fillEmptyCells(grid) {
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (!grid[row][col]) {
        const randomLetter =
          FILLER_ALPHABET[Math.floor(Math.random() * FILLER_ALPHABET.length)];
        grid[row][col] = randomLetter;
      }
    }
  }
}

function buildPuzzle(words) {
  const sortedWords = [...words].sort((a, b) => b.length - a.length);

  for (let attempt = 0; attempt < 150; attempt += 1) {
    const grid = createEmptyGrid();
    let allPlaced = true;

    for (const word of sortedWords) {
      const candidates = [];

      for (let row = 0; row < GRID_SIZE; row += 1) {
        for (let col = 0; col < GRID_SIZE; col += 1) {
          for (const direction of DIRECTIONS) {
            if (canPlaceWord(grid, word, row, col, direction)) {
              candidates.push({ row, col, direction });
            }
          }
        }
      }

      if (candidates.length === 0) {
        allPlaced = false;
        break;
      }

      const choice = candidates[Math.floor(Math.random() * candidates.length)];
      placeWord(grid, word, choice.row, choice.col, choice.direction);
    }

    if (allPlaced) {
      fillEmptyCells(grid);
      currentGrid = grid;
      currentWords = sortedWords;
      foundWords = new Set();
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

function clearSelectionClasses() {
  const selectedCells = gridEl.querySelectorAll(".word-cell.selected");
  selectedCells.forEach((cell) => cell.classList.remove("selected"));
}

function renderGrid() {
  gridEl.innerHTML = "";
  gridEl.style.gridTemplateColumns = `repeat(${GRID_SIZE}, minmax(30px, 48px))`;

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "word-cell";
      cell.textContent = currentGrid[row][col];
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);
      cell.setAttribute("aria-label", `Row ${row + 1} Column ${col + 1}: ${currentGrid[row][col]}`);

      gridEl.appendChild(cell);
    }
  }

  updateFoundCells();
}

function getCellElement(row, col) {
  return gridEl.querySelector(`.word-cell[data-row="${row}"][data-col="${col}"]`);
}

function getCellCoords(cell) {
  return {
    row: Number(cell.dataset.row),
    col: Number(cell.dataset.col)
  };
}

function getLineCells(start, end) {
  const rowDiff = end.row - start.row;
  const colDiff = end.col - start.col;

  const stepRow = Math.sign(rowDiff);
  const stepCol = Math.sign(colDiff);

  const absRow = Math.abs(rowDiff);
  const absCol = Math.abs(colDiff);

  const isHorizontal = rowDiff === 0 && colDiff !== 0;
  const isVertical = colDiff === 0 && rowDiff !== 0;
  const isDiagonal = absRow === absCol && absRow !== 0;
  const isSingle = rowDiff === 0 && colDiff === 0;

  if (!(isHorizontal || isVertical || isDiagonal || isSingle)) {
    return [];
  }

  const steps = Math.max(absRow, absCol);
  const cells = [];

  for (let i = 0; i <= steps; i += 1) {
    cells.push({
      row: start.row + stepRow * i,
      col: start.col + stepCol * i
    });
  }

  return cells;
}

function paintSelection(cells) {
  clearSelectionClasses();

  cells.forEach(({ row, col }) => {
    const cell = getCellElement(row, col);
    if (cell && !cell.classList.contains("found")) {
      cell.classList.add("selected");
    }
  });
}

function getWordFromCells(cells) {
  return cells.map(({ row, col }) => currentGrid[row][col]).join("");
}

function updateFoundCells() {
  const allCells = gridEl.querySelectorAll(".word-cell");
  allCells.forEach((cell) => cell.classList.remove("found"));

  currentWords.forEach((word) => {
    if (!foundWords.has(word)) {
      return;
    }

    const matches = findWordCoordinates(word);
    matches.forEach(({ row, col }) => {
      const cell = getCellElement(row, col);
      if (cell) {
        cell.classList.add("found");
      }
    });
  });
}

function findWordCoordinates(word) {
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      for (const direction of DIRECTIONS) {
        const coords = [];

        for (let i = 0; i < word.length; i += 1) {
          const nextRow = row + direction.dy * i;
          const nextCol = col + direction.dx * i;

          if (
            nextRow < 0 ||
            nextRow >= GRID_SIZE ||
            nextCol < 0 ||
            nextCol >= GRID_SIZE ||
            currentGrid[nextRow][nextCol] !== word[i]
          ) {
            coords.length = 0;
            break;
          }

          coords.push({ row: nextRow, col: nextCol });
        }

        if (coords.length === word.length) {
          return coords;
        }
      }
    }
  }

  return [];
}

function setMessage(text, type = "info") {
  messageEl.textContent = text;
  messageEl.className = `result-message ${type}`;
}

function checkSelection() {
  if (selectionCells.length === 0) {
    return;
  }

  const selectedWord = getWordFromCells(selectionCells);
  const reversedWord = selectedWord.split("").reverse().join("");

  let matchedWord = null;

  if (currentWords.includes(selectedWord) && !foundWords.has(selectedWord)) {
    matchedWord = selectedWord;
  } else if (currentWords.includes(reversedWord) && !foundWords.has(reversedWord)) {
    matchedWord = reversedWord;
  }

  if (matchedWord) {
    foundWords.add(matchedWord);
    renderWordList();
    updateFoundCells();

    if (foundWords.size === currentWords.length) {
      setMessage("Great job! You found all the words.", "success");
    } else {
      setMessage(`Nice! You found ${matchedWord}.`, "success");
    }
  } else {
    setMessage("Not a puzzle word. Try again.", "error");
  }

  selectionCells = [];
  clearSelectionClasses();
}

function startSelection(cell, pointerId = null) {
  isSelecting = true;
  activePointerId = pointerId;

  const start = getCellCoords(cell);
  selectionCells = [start];
  paintSelection(selectionCells);
}

function extendSelection(cell) {
  if (!isSelecting || selectionCells.length === 0) {
    return;
  }

  const start = selectionCells[0];
  const end = getCellCoords(cell);
  const lineCells = getLineCells(start, end);

  if (lineCells.length === 0) {
    return;
  }

  selectionCells = lineCells;
  paintSelection(selectionCells);
}

function endSelection() {
  if (!isSelecting) {
    return;
  }

  isSelecting = false;
  activePointerId = null;
  checkSelection();
}

function createPuzzle(words) {
  const cleanedWords = words
    .map(normalizeWord)
    .filter((word) => word.length >= 3 && word.length <= GRID_SIZE)
    .slice(0, MAX_WORDS_PER_PUZZLE);

  if (cleanedWords.length === 0) {
    setMessage(`Enter ${MAX_WORDS_PER_PUZZLE} words or fewer, each 3-${GRID_SIZE} letters.`, "error");
    return;
  }

  if (!buildPuzzle(cleanedWords)) {
    setMessage("Couldn't build that puzzle. Try fewer or shorter words.", "error");
    return;
  }

  renderGrid();
  renderWordList();
  clearSelectionClasses();
  selectionCells = [];
  setMessage("Start selecting letters.", "info");
}

function buildCustomPuzzle() {
  const customWords = parseCustomWords(customWordsInput.value);

  if (customWords.length === 0) {
    setMessage(`Enter ${MAX_WORDS_PER_PUZZLE} words or fewer, each 3-${GRID_SIZE} letters.`, "error");
    return;
  }

  if (customWords.length > MAX_WORDS_PER_PUZZLE) {
    setMessage(`Please use ${MAX_WORDS_PER_PUZZLE} words or fewer.`, "error");
    return;
  }

  createPuzzle(customWords);
}

function resetPuzzle() {
  customWordsInput.value = "";
  createPuzzle(getRandomWordSet());
}

gridEl.addEventListener("pointerdown", (event) => {
  const cell = event.target.closest(".word-cell");
  if (!cell) {
    return;
  }

  event.preventDefault();
  startSelection(cell, event.pointerId);
  cell.setPointerCapture?.(event.pointerId);
});

gridEl.addEventListener("pointerenter", (event) => {
  const cell = event.target.closest(".word-cell");
  if (!cell || !isSelecting) {
    return;
  }

  extendSelection(cell);
}, true);

gridEl.addEventListener("pointermove", (event) => {
  if (!isSelecting) {
    return;
  }

  const element = document.elementFromPoint(event.clientX, event.clientY);
  const cell = element?.closest?.(".word-cell");

  if (cell) {
    extendSelection(cell);
  }
});

window.addEventListener("pointerup", (event) => {
  if (activePointerId !== null && event.pointerId !== activePointerId) {
    return;
  }

  endSelection();
});

window.addEventListener("pointercancel", () => {
  isSelecting = false;
  activePointerId = null;
  selectionCells = [];
  clearSelectionClasses();
});

buildCustomPuzzleBtn.addEventListener("click", buildCustomPuzzle);
resetWordSearchBtn.addEventListener("click", resetPuzzle);

customWordsInput.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    buildCustomPuzzle();
  }
});

resetPuzzle();
