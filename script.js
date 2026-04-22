const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("best-score");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart-btn");
const themeToggleBtn = document.getElementById("theme-toggle-btn");
const pageTitleEl = document.getElementById("page-title");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const speedMs = 120;
const bestScoreKey = "snake_best_score";
const themeKey = "snake_theme";
const defaultTheme = "steampunk";

const themes = {
  steampunk: {
    pageTitle: "Стимпанк Змейка",
    toggleLabel: "Тема: Киберпанк",
    board: "#1a1411",
    grid: "rgba(215, 165, 95, 0.08)",
    foodFill: "#c9673a",
    foodStroke: "#f2c28a",
    snakeHead: "#d7a55f",
    snakeBody: "#b8863b",
    snakeStroke: "#5b3c1e",
  },
  cyberpunk: {
    pageTitle: "Киберпанк Змейка",
    toggleLabel: "Тема: Стимпанк",
    board: "#0d1230",
    grid: "rgba(117, 239, 255, 0.12)",
    foodFill: "#ff3fc7",
    foodStroke: "#ffd2f5",
    snakeHead: "#78f2ff",
    snakeBody: "#2ed8ff",
    snakeStroke: "#0c3f6f",
  },
};

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let bestScore = Number(localStorage.getItem(bestScoreKey)) || 0;
let gameStarted = false;
let gameOver = false;
let gameTimer;
let currentTheme = localStorage.getItem(themeKey) || defaultTheme;

bestScoreEl.textContent = String(bestScore);

function applyTheme(themeName) {
  currentTheme = themes[themeName] ? themeName : defaultTheme;
  const theme = themes[currentTheme];

  document.documentElement.dataset.theme = currentTheme === "cyberpunk" ? "cyberpunk" : "";
  document.title = theme.pageTitle;
  pageTitleEl.textContent = theme.pageTitle;
  themeToggleBtn.textContent = theme.toggleLabel;
  themeToggleBtn.setAttribute("aria-pressed", String(currentTheme === "cyberpunk"));

  localStorage.setItem(themeKey, currentTheme);

  draw();
}

function toggleTheme() {
  const nextTheme = currentTheme === "steampunk" ? "cyberpunk" : "steampunk";
  applyTheme(nextTheme);
}

function randomCell() {
  return Math.floor(Math.random() * tileCount);
}

function placeFood() {
  do {
    food = { x: randomCell(), y: randomCell() };
  } while (snake.some((part) => part.x === food.x && part.y === food.y));
}

function resetGame() {
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  gameStarted = false;
  gameOver = false;
  scoreEl.textContent = "0";
  statusEl.textContent = "Нажми любую стрелку или WASD, чтобы начать.";
  placeFood();
  draw();
}

function drawBoard() {
  const theme = themes[currentTheme];
  ctx.fillStyle = theme.board;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 1;
  for (let i = 0; i <= tileCount; i += 1) {
    const p = i * gridSize;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(canvas.width, p);
    ctx.stroke();
  }
}

function drawFood() {
  const theme = themes[currentTheme];
  const x = food.x * gridSize;
  const y = food.y * gridSize;
  ctx.fillStyle = theme.foodFill;
  ctx.fillRect(x, y, gridSize, gridSize);
  ctx.strokeStyle = theme.foodStroke;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
}

function drawSnake() {
  const theme = themes[currentTheme];
  snake.forEach((part, index) => {
    const x = part.x * gridSize;
    const y = part.y * gridSize;
    ctx.fillStyle = index === 0 ? theme.snakeHead : theme.snakeBody;
    ctx.fillRect(x, y, gridSize, gridSize);
    ctx.strokeStyle = theme.snakeStroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
  });
}

function draw() {
  drawBoard();
  drawFood();
  drawSnake();
}

function updateBestScore() {
  if (score > bestScore) {
    bestScore = score;
    bestScoreEl.textContent = String(bestScore);
    localStorage.setItem(bestScoreKey, String(bestScore));
  }
}

function endGame() {
  gameOver = true;
  gameStarted = false;
  statusEl.textContent = "Игра окончена! Нажми 'Новая игра'.";
  updateBestScore();
}

function isHitWall(head) {
  return (
    head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount
  );
}

function isHitSelf(head) {
  return snake.some((part) => part.x === head.x && part.y === head.y);
}

function tick() {
  if (!gameStarted || gameOver) {
    return;
  }

  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  if (isHitWall(head) || isHitSelf(head)) {
    endGame();
    return;
  }

  snake.unshift(head);

  const ateFood = head.x === food.x && head.y === food.y;
  if (ateFood) {
    score += 10;
    scoreEl.textContent = String(score);
    statusEl.textContent = "Отлично! Продолжай.";
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function setDirection(x, y) {
  const opposite =
    direction.x + x === 0 &&
    direction.y + y === 0 &&
    !(direction.x === 0 && direction.y === 0);

  if (opposite) {
    return;
  }

  nextDirection = { x, y };

  if (!gameStarted && !gameOver) {
    gameStarted = true;
    statusEl.textContent = "Игра идёт!";
  }
}

function handleKeydown(event) {
  const key = event.key.toLowerCase();

  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
  }

  if (key === "arrowup" || key === "w") setDirection(0, -1);
  if (key === "arrowdown" || key === "s") setDirection(0, 1);
  if (key === "arrowleft" || key === "a") setDirection(-1, 0);
  if (key === "arrowright" || key === "d") setDirection(1, 0);
}

document.addEventListener("keydown", handleKeydown);
restartBtn.addEventListener("click", resetGame);
themeToggleBtn.addEventListener("click", toggleTheme);

resetGame();
applyTheme(currentTheme);
gameTimer = setInterval(tick, speedMs);
