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

let mazeOffsetX = 0;
let mazeOffsetY = 0;

let player = {
  x: 0,
  y: 0,
  radius: 8,
  active: false,
  won: false
};

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
    const preferred = neighbors.filter((n) => n.r === current.r);
    return preferred.length
      ? preferred[Math.floor(Math.random() * preferred.length)]
      : neighbors[Math.floor(Math.random() * neighbors.length)];
  }

  if (currentStyle === "vertical") {
    const preferred = neighbors.filter((n) => n.c === current.c);
    return preferred.length
      ? preferred[Math.floor(Math.random() * preferred.length)]
      : neighbors[Math.floor(Math.random() * neighbors.length)];
  }

  if (currentStyle === "checkerboard") {
    const preferred = neighbors.filter((n) => (n.r + n.c) % 2 === 0);
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

  resetPlayer();
  drawMaze();
}

function resetPlayer() {
  player.x = cellSize / 2;
  player.y = cellSize / 2;
  player.radius = Math.max(5, cellSize * 0.22);
  player.active = false;
  player.won = false;
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

function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = player.won ? "#f0ad4e" : "#2d9c42";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();
}

function drawWinMessage() {
  if (!player.won) return;

  ctx.save();
  ctx.resetTransform();

  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 28px Arial";
  ctx.fillText("You solved it!", canvas.width / 2, canvas.height / 2 - 10);

  ctx.font = "16px Arial";
  ctx.fillText("Click Generate Maze to play again", canvas.width / 2, canvas.height / 2 + 24);
  ctx.restore();
}

function drawMaze() {
  cellSize = Math.floor(Math.min(canvas.width / cols, canvas.height / rows));
  player.radius = Math.max(5, cellSize * 0.22);

  const mazeWidth = cellSize * cols;
  const mazeHeight = cellSize * rows;

  mazeOffsetX = (canvas.width - mazeWidth) / 2;
  mazeOffsetY = (canvas.height - mazeHeight) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(mazeOffsetX, mazeOffsetY);

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
  drawPlayer();
  ctx.restore();

  drawWinMessage();
}

function getMousePositionOnCanvas(event) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function getLocalMazePosition(event) {
  const mouse = getMousePositionOnCanvas(event);

  return {
    x: mouse.x - mazeOffsetX,
    y: mouse.y - mazeOffsetY
  };
}

function isInsideMaze(x, y) {
  return x >= 0 && y >= 0 && x <= cols * cellSize && y <= rows * cellSize;
}

function getCellAtPosition(x, y) {
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);

  if (row < 0 || row >= rows || col < 0 || col >= cols) return null;
  return { row, col };
}

function pointHitsWall(x, y) {
  const pos = getCellAtPosition(x, y);
  if (!pos) return true;

  const cell = grid[pos.row][pos.col];
  const localX = x - pos.col * cellSize;
  const localY = y - pos.row * cellSize;
  const buffer = player.radius + 1;

  if (cell.walls[0] && localY <= buffer) return true;
  if (cell.walls[1] && localX >= cellSize - buffer) return true;
  if (cell.walls[2] && localY >= cellSize - buffer) return true;
  if (cell.walls[3] && localX <= buffer) return true;

  return false;
}

function canMoveTo(x, y) {
  if (!isInsideMaze(x, y)) return false;
  if (pointHitsWall(x, y)) return false;
  return true;
}

function movePlayerToward(targetX, targetY) {
  const dx = targetX - player.x;
  const dy = targetY - player.y;
  const distance = Math.hypot(dx, dy);

  if (distance < 0.001) return;

  const stepSize = Math.max(1.5, cellSize * 0.12);
  const steps = Math.ceil(distance / stepSize);

  let lastSafeX = player.x;
  let lastSafeY = player.y;

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const testX = player.x + dx * t;
    const testY = player.y + dy * t;

    if (canMoveTo(testX, testY)) {
      lastSafeX = testX;
      lastSafeY = testY;
    } else {
      break;
    }
  }

  player.x = lastSafeX;
  player.y = lastSafeY;
}

function isPlayerInFinish() {
  const finishLeft = (cols - 1) * cellSize;
  const finishTop = (rows - 1) * cellSize;
  const finishRight = finishLeft + cellSize;
  const finishBottom = finishTop + cellSize;

  return (
    player.x > finishLeft + cellSize * 0.15 &&
    player.x < finishRight - cellSize * 0.15 &&
    player.y > finishTop + cellSize * 0.15 &&
    player.y < finishBottom - cellSize * 0.15
  );
}

function handlePointerStart(event) {
  if (player.won) return;

  const local = getLocalMazePosition(event);
  const distToPlayer = Math.hypot(local.x - player.x, local.y - player.y);

  if (distToPlayer <= Math.max(player.radius * 2.2, 18)) {
    player.active = true;
    drawMaze();
  }
}

function handlePointerMove(event) {
  if (!player.active || player.won) return;

  const local = getLocalMazePosition(event);
  movePlayerToward(local.x, local.y);

  if (isPlayerInFinish()) {
    player.won = true;
    player.active = false;
  }

  drawMaze();
}

function handlePointerEnd() {
  player.active = false;
  drawMaze();
}

canvas.addEventListener("mousedown", handlePointerStart);
canvas.addEventListener("mousemove", handlePointerMove);
window.addEventListener("mouseup", handlePointerEnd);

canvas.addEventListener("touchstart", (event) => {
  event.preventDefault();
  handlePointerStart(event.touches[0]);
}, { passive: false });

canvas.addEventListener("touchmove", (event) => {
  event.preventDefault();
  handlePointerMove(event.touches[0]);
}, { passive: false });

window.addEventListener("touchend", handlePointerEnd);

generateMazeBtn.addEventListener("click", generateMaze);

generateMaze();
