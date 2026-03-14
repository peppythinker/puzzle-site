const boardEl = document.getElementById("sudokuBoard");
const difficultyEl = document.getElementById("sudokuDifficulty");
const newBtn = document.getElementById("newSudokuBtn");
const checkBtn = document.getElementById("checkSudokuBtn");
const solveBtn = document.getElementById("solveSudokuBtn");
const messageEl = document.getElementById("sudokuMessage");

const SIZE = 9;
const BOX = 3;
const cluesByDifficulty = {
  easy: 42,
  medium: 34,
  hard: 28
};

let puzzleGrid = [];
let solutionGrid = [];

function makeEmptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function cloneGrid(grid) {
  return grid.map((row) => [...row]);
}

function shuffle(values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function isPlacementValid(grid, row, col, value) {
  for (let index = 0; index < SIZE; index += 1) {
    if (grid[row][index] === value || grid[index][col] === value) {
      return false;
    }
  }

  const startRow = Math.floor(row / BOX) * BOX;
  const startCol = Math.floor(col / BOX) * BOX;

  for (let boxRow = startRow; boxRow < startRow + BOX; boxRow += 1) {
    for (let boxCol = startCol; boxCol < startCol + BOX; boxCol += 1) {
      if (grid[boxRow][boxCol] === value) {
        return false;
      }
    }
  }

  return true;
}

function fillGrid(grid, position = 0) {
  if (position === SIZE * SIZE) {
    return true;
  }

  const row = Math.floor(position / SIZE);
  const col = position % SIZE;

  if (grid[row][col] !== 0) {
    return fillGrid(grid, position + 1);
  }

  const candidates = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  for (const value of candidates) {
    if (!isPlacementValid(grid, row, col, value)) {
      continue;
    }

    grid[row][col] = value;
    if (fillGrid(grid, position + 1)) {
      return true;
    }

    grid[row][col] = 0;
  }

  return false;
}

function createPuzzleFromSolution(solution, clueCount) {
  const puzzle = cloneGrid(solution);
  const cells = [];

  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      cells.push({ row, col });
    }
  }

  const removable = SIZE * SIZE - clueCount;
  const shuffledCells = shuffle(cells);

  for (let i = 0; i < removable; i += 1) {
    const { row, col } = shuffledCells[i];
    puzzle[row][col] = 0;
  }

  return puzzle;
}

function showMessage(text, type = "info") {
  messageEl.textContent = text;
  messageEl.className = `result-message ${type}`;
}

function buildBoard() {
  boardEl.innerHTML = "";

  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const value = puzzleGrid[row][col];
      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "numeric";
      input.autocomplete = "off";
      input.maxLength = 1;
      input.className = "sudoku-cell";
      input.dataset.row = String(row);
      input.dataset.col = String(col);
      input.setAttribute("aria-label", `Row ${row + 1}, Column ${col + 1}`);

      if (value !== 0) {
        input.value = String(value);
        input.readOnly = true;
        input.classList.add("fixed");
      }

      if ((col + 1) % BOX === 0 && col !== SIZE - 1) {
        input.classList.add("box-right");
      }
      if ((row + 1) % BOX === 0 && row !== SIZE - 1) {
        input.classList.add("box-bottom");
      }

      input.addEventListener("input", handleInput);
      input.addEventListener("keydown", handleMoveKey);
      boardEl.appendChild(input);
    }
  }
}

function handleInput(event) {
  const input = event.target;
  const value = input.value.replace(/[^1-9]/g, "").slice(0, 1);
  input.value = value;

  if (!value) {
    input.classList.remove("invalid");
    showMessage("Keep going.", "info");
    return;
  }

  const row = Number(input.dataset.row);
  const col = Number(input.dataset.col);

  if (Number(value) !== solutionGrid[row][col]) {
    input.classList.add("invalid");
    showMessage("Some entries are incorrect.", "error");
  } else {
    input.classList.remove("invalid");
    showMessage("Nice!", "success");
  }
}

function handleMoveKey(event) {
  const input = event.target;
  const row = Number(input.dataset.row);
  const col = Number(input.dataset.col);
  let nextRow = row;
  let nextCol = col;

  if (event.key === "ArrowUp") nextRow -= 1;
  if (event.key === "ArrowDown") nextRow += 1;
  if (event.key === "ArrowLeft") nextCol -= 1;
  if (event.key === "ArrowRight") nextCol += 1;

  if (nextRow < 0 || nextRow >= SIZE || nextCol < 0 || nextCol >= SIZE) {
    return;
  }

  if (nextRow !== row || nextCol !== col) {
    event.preventDefault();
    const next = boardEl.querySelector(`[data-row="${nextRow}"][data-col="${nextCol}"]`);
    if (next) {
      next.focus();
      next.select();
    }
  }
}

function checkBoard() {
  const inputs = boardEl.querySelectorAll(".sudoku-cell");
  let hasEmpty = false;
  let hasWrong = false;

  inputs.forEach((input) => {
    if (input.readOnly) {
      input.classList.remove("invalid");
      return;
    }

    const row = Number(input.dataset.row);
    const col = Number(input.dataset.col);
    const value = Number(input.value);

    if (!value) {
      hasEmpty = true;
      input.classList.remove("invalid");
      return;
    }

    if (value !== solutionGrid[row][col]) {
      hasWrong = true;
      input.classList.add("invalid");
    } else {
      input.classList.remove("invalid");
    }
  });

  if (hasWrong) {
    showMessage("Not solved yet — fix highlighted cells.", "error");
    return;
  }

  if (hasEmpty) {
    showMessage("Looking good. Fill all cells to complete the puzzle.", "info");
    return;
  }

  showMessage("🎉 You solved the Sudoku!", "success");
}

function showSolution() {
  const inputs = boardEl.querySelectorAll(".sudoku-cell");

  inputs.forEach((input) => {
    const row = Number(input.dataset.row);
    const col = Number(input.dataset.col);
    input.value = String(solutionGrid[row][col]);
    input.classList.remove("invalid");
  });

  showMessage("Solution revealed.", "info");
}

function startNewPuzzle() {
  const difficulty = difficultyEl.value;
  const clueCount = cluesByDifficulty[difficulty] || cluesByDifficulty.medium;

  const solved = makeEmptyGrid();
  fillGrid(solved);

  solutionGrid = solved;
  puzzleGrid = createPuzzleFromSolution(solutionGrid, clueCount);

  buildBoard();
  showMessage(`New ${difficulty} puzzle ready.`, "info");
}

newBtn.addEventListener("click", startNewPuzzle);
checkBtn.addEventListener("click", checkBoard);
solveBtn.addEventListener("click", showSolution);

startNewPuzzle();
