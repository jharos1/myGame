const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");

let playerX = gameArea.offsetWidth / 2 - 25; // موقع اللاعب
let score = 0;
let lives = 3;
let enemies = [];

player.style.left = playerX + "px";

// تحريك اللاعب بالجوال (لمس)
let startX = 0;
gameArea.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

gameArea.addEventListener("touchmove", e => {
  const touchX = e.touches[0].clientX;
  const delta = touchX - startX;
  playerX += delta;
  if (playerX < 0) playerX = 0;
  if (playerX > gameArea.offsetWidth - 50) playerX = gameArea.offsetWidth - 50;
  player.style.left = playerX + "px";
  startX = touchX;
});

// إنشاء الأعداء
function createEnemy() {
  const enemy = document.createElement("div");
  enemy.classList.add("enemy");
  enemy.x = Math.random() * (gameArea.offsetWidth - 40);
  enemy.y = 0;
  enemy.speed = 2 + Math.random() * 3;
  enemy.style.left = enemy.x + "px";
  enemy.style.top = enemy.y + "px";
  gameArea.appendChild(enemy);
  enemies.push(enemy);
}

// تحديث حركة الأعداء
function updateEnemies() {
  enemies.forEach((enemy, index) => {
    enemy.y += enemy.speed;
    enemy.style.top = enemy.y + "px";

    // كشف الاصطدام
    if (
      enemy.y + 40 >= gameArea.offsetHeight - 50 &&
      enemy.x + 40 > playerX &&
      enemy.x < playerX + 50
    ) {
      // خسر حياة
      lives--;
      livesDisplay.textContent = lives;
      gameArea.removeChild(enemy);
      enemies.splice(index, 1);

      if (lives <= 0) {
        alert("💀 انتهت اللعبة! نقاطك: " + score);
        location.reload();
      }
    }

    // إذا خرج العدو من الأسفل
    if (enemy.y > gameArea.offsetHeight) {
      score++;
      scoreDisplay.textContent = score;
      gameArea.removeChild(enemy);
      enemies.splice(index, 1);
    }
  });
}

// حلقة اللعبة
function gameLoop() {
  if (Math.random() < 0.02) createEnemy(); // فرصة ظهور العدو
  updateEnemies();
  requestAnimationFrame(gameLoop);
}

gameLoop();