const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");
const generateMazeBtn = document.getElementById("generateMazeBtn");
const difficultySelect = document.getElementById("difficultySelect");
const styleSelect = document.getElementById("styleSelect");

let rows = 18;
let cols = 18;
let grid = [];
let cellSize = 30;
let currentStyle = "random";

class Cell {
  constructor(r, c) {
    this.r = r;
    this.c = c;
    this.visited = false;
    this.walls = [true, true, true, true]; // top, right, bottom, left
  }
}

function setDifficulty() {
  const difficulty = difficultySelect.value;

  if (difficulty === "easy") {
    rows = 10;
    cols = 10;
  } else if (difficulty === "medium") {
    rows = 18;
    cols = 18;
  } else {
    rows = 26;
    cols = 26;
  }
}

function createGrid() {
  grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push(new Cell(r, c));
    }
    grid.push(row);
  }
}

function getUnvisitedNeighbors(cell) {
  const list = [];
  const { r, c } = cell;

  if (r > 0 && !grid[r - 1][c].visited) list.push(grid[r - 1][c]);
  if (c < cols - 1 && !grid[r][c + 1].visited) list.push(grid[r][c + 1]);
  if (r < rows - 1 && !grid[r + 1][c].visited) list.push(grid[r + 1][c]);
  if (c > 0 && !grid[r][c - 1].visited) list.push(grid[r][c - 1]);

  return list;
}

function chooseNextNeighbor(current, neighbors) {
  if (neighbors.length === 0) return null;

  if (currentStyle === "random") {
    return neighbors[Math.floor(Math.random() * neighbors.length)];
  }

  if (currentStyle === "horizontal") {
    const preferred = neighbors.filter(n => n.r === current.r);
    return preferred.length
      ? preferred[Math.floor(Math.random() * preferred.length)]
      : neighbors[Math.floor(Math.random() * neighbors.length)];
  }

  if (currentStyle === "vertical") {
    const preferred = neighbors.filter(n => n.c === current.c);
    return preferred.length
      ? preferred[Math.floor(Math.random() * preferred.length)]
      : neighbors[Math.floor(Math.random() * neighbors.length)];
  }

  if (currentStyle === "checkerboard") {
    const preferred = neighbors.filter(n => (n.r + n.c) % 2 === 0);
    return preferred.length
      ? preferred[Math.floor(Math.random() * preferred.length)]
      : neighbors[Math.floor(Math.random() * neighbors.length)];
  }

  return neighbors[Math.floor(Math.random() * neighbors.length)];
}

function removeWalls(a, b) {
  const dx = a.c - b.c;
  const dy = a.r - b.r;

  if (dx === 1) {
    a.walls[3] = false;
    b.walls[1] = false;
  } else if (dx === -1) {
    a.walls[1] = false;
    b.walls[3] = false;
  }

  if (dy === 1) {
    a.walls[0] = false;
    b.walls[2] = false;
  } else if (dy === -1) {
    a.walls[2] = false;
    b.walls[0] = false;
  }
}

function generateMaze() {
  setDifficulty();
  currentStyle = styleSelect.value;
  createGrid();

  const stack = [];
  const start = grid[0][0];
  start.visited = true;
  stack.push(start);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(current);
    const next = chooseNextNeighbor(current, neighbors);

    if (next) {
      next.visited = true;
      removeWalls(current, next);
      stack.push(next);
    } else {
      stack.pop();
    }
  }

  grid[0][0].walls[0] = false;
  grid[rows - 1][cols - 1].walls[2] = false;

  drawMaze();
}

function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawStartAndFinish() {
  const padding = cellSize * 0.18;

  ctx.fillStyle = "#2d9c42";
  ctx.fillRect(
    padding,
    padding,
    cellSize - padding * 2,
    cellSize - padding * 2
  );

  ctx.fillStyle = "#d9534f";
  ctx.fillRect(
    (cols - 1) * cellSize + padding,
    (rows - 1) * cellSize + padding,
    cellSize - padding * 2,
    cellSize - padding * 2
  );

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.max(10, cellSize * 0.22)}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText("S", cellSize / 2, cellSize / 2);
  ctx.fillText(
    "F",
    (cols - 1) * cellSize + cellSize / 2,
    (rows - 1) * cellSize + cellSize / 2
  );
}

function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  cellSize = Math.floor(Math.min(canvas.width / cols, canvas.height / rows));

  const mazeWidth = cellSize * cols;
  const mazeHeight = cellSize * rows;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(
    (canvas.width - mazeWidth) / 2,
    (canvas.height - mazeHeight) / 2
  );

  ctx.strokeStyle = "#222";
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      const x = c * cellSize;
      const y = r * cellSize;

      if (cell.walls[0]) drawLine(x, y, x + cellSize, y);
      if (cell.walls[1]) drawLine(x + cellSize, y, x + cellSize, y + cellSize);
      if (cell.walls[2]) drawLine(x, y + cellSize, x + cellSize, y + cellSize);
      if (cell.walls[3]) drawLine(x, y, x, y + cellSize);
    }
  }

  drawStartAndFinish();
  ctx.restore();
}

generateMazeBtn.addEventListener("click", generateMaze);

generateMaze();
