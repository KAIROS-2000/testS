const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("best-score");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart-btn");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const speedMs = 120;
const bestScoreKey = "snake_best_score";

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let bestScore = Number(localStorage.getItem(bestScoreKey)) || 0;
let gameStarted = false;
let gameOver = false;
let gameTimer;

bestScoreEl.textContent = String(bestScore);

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
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawFood() {
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

function drawSnake() {
  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? "#22c55e" : "#16a34a";
    ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
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

resetGame();
gameTimer = setInterval(tick, speedMs);
