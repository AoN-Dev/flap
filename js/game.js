/* ======================================================
   CONFIGURATION
====================================================== */
const CONFIG = {
  gravity: 0.5,
  lift: -9,
  pipeWidth: 70,
  pipeGap: 160,
  pipeInterval: 1500,
  moonRadius: 35,
  pipeSpeed: 3
};

/* ======================================================
   GAME CLASS
====================================================== */
class GalacticFlappy {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ui = ui;

    this.bird = {
      x: 100,
      y: 300,
      velocity: 0,
      radius: 20,
      avatar: null
    };

    this.pipes = [];
    this.score = 0;
    this.running = false;
    this.lastPipeTime = 0;

    this._bindEvents();
    this._loadAssets();
  }

  _bindEvents() {
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") this._flap();
    });

    this.canvas.addEventListener("click", () => this._flap());
  }

  _loadAssets() {
    this.earthImg = new Image();
    this.earthImg.src =
      "https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg";

    this.moonImg = new Image();
    this.moonImg.src =
      "https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg";
  }

  setAvatar(image) {
    this.bird.avatar = image;
  }

  start() {
    this.reset();
    this.running = true;
    this.ui.hideGameOver();
    requestAnimationFrame(this._loop.bind(this));
  }

  reset() {
    this.pipes = [];
    this.score = 0;
    this.bird.y = 300;
    this.bird.velocity = 0;
  }

  stop() {
    this.running = false;
    this.ui.showGameOver(this.score);
  }

  _flap() {
    if (!this.running) return;
    this.bird.velocity = CONFIG.lift;
  }

  _spawnPipe() {
    const topHeight =
      Math.random() *
        (this.canvas.height - CONFIG.pipeGap - 200) +
      50;

    this.pipes.push({
      x: this.canvas.width,
      top: topHeight,
      bottom: topHeight + CONFIG.pipeGap
    });
  }

  _update() {
    this.bird.velocity += CONFIG.gravity;
    this.bird.y += this.bird.velocity;

    if (Date.now() - this.lastPipeTime > CONFIG.pipeInterval) {
      this._spawnPipe();
      this.lastPipeTime = Date.now();
    }

    this.pipes.forEach((pipe) => {
      pipe.x -= CONFIG.pipeSpeed;

      if (!pipe.passed && pipe.x + CONFIG.pipeWidth < this.bird.x) {
        pipe.passed = true;
        this.score++;
      }
    });

    this._checkCollision();
  }

  _checkCollision() {
    if (this.bird.y > this.canvas.height || this.bird.y < 0) {
      this.stop();
      return;
    }

    this.pipes.forEach((pipe) => {
      const hitX =
        this.bird.x + this.bird.radius > pipe.x &&
        this.bird.x - this.bird.radius < pipe.x + CONFIG.pipeWidth;

      const hitY =
        this.bird.y - this.bird.radius < pipe.top ||
        this.bird.y + this.bird.radius > pipe.bottom;

      if (hitX && hitY) {
        this.stop();
      }
    });
  }

  _drawBackground() {
    this.ctx.drawImage(this.earthImg, 280, 450, 180, 180);
  }

  _drawBird() {
    if (this.bird.avatar) {
      this.ctx.drawImage(
        this.bird.avatar,
        this.bird.x - this.bird.radius,
        this.bird.y - this.bird.radius,
        this.bird.radius * 2,
        this.bird.radius * 2
      );
    } else {
      this.ctx.fillStyle = "#ffe81f";
      this.ctx.beginPath();
      this.ctx.arc(
        this.bird.x,
        this.bird.y,
        this.bird.radius,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }
  }

  _drawPipes() {
    this.pipes.forEach((pipe) => {
      this.ctx.drawImage(
        this.moonImg,
        pipe.x,
        pipe.top - CONFIG.moonRadius,
        CONFIG.pipeWidth,
        CONFIG.moonRadius
      );

      this.ctx.drawImage(
        this.moonImg,
        pipe.x,
        pipe.bottom,
        CONFIG.pipeWidth,
        CONFIG.moonRadius
      );
    });
  }

  _drawScore() {
    this.ctx.fillStyle = "white";
    this.ctx.font = "24px sans-serif";
    this.ctx.fillText(`Score: ${this.score}`, 20, 40);
  }

  _render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this._drawBackground();
    this._drawBird();
    this._drawPipes();
    this._drawScore();
  }

  _loop() {
    if (!this.running) return;
    this._update();
    this._render();
    requestAnimationFrame(this._loop.bind(this));
  }
}

/* ======================================================
   UI CONTROLLER
====================================================== */
class UIController {
  constructor(menu, gameOverScreen, finalScoreEl) {
    this.menu = menu;
    this.gameOverScreen = gameOverScreen;
    this.finalScoreEl = finalScoreEl;
  }

  showMenu() {
    this.menu.classList.remove("hidden");
  }

  hideMenu() {
    this.menu.classList.add("hidden");
  }

  showGameOver(score) {
    this.finalScoreEl.textContent = `Final Score: ${score}`;
    this.gameOverScreen.classList.remove("hidden");
  }

  hideGameOver() {
    this.gameOverScreen.classList.add("hidden");
  }
}

/* ======================================================
   INITIALIZATION
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const menu = document.getElementById("menu");
  const gameOverScreen = document.getElementById("gameOver");
  const finalScore = document.getElementById("finalScore");

  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");
  const exitBtn = document.getElementById("exitBtn");
  const modeToggle = document.getElementById("modeToggle");
  const avatarUpload = document.getElementById("avatarUpload");

  const ui = new UIController(menu, gameOverScreen, finalScore);
  const game = new GalacticFlappy(canvas, ui);

  startBtn.addEventListener("click", () => {
    ui.hideMenu();
    canvas.classList.remove("hidden");
    game.start();
  });

  restartBtn.addEventListener("click", () => {
    game.start();
  });

  exitBtn.addEventListener("click", () => {
    canvas.classList.add("hidden");
    ui.hideGameOver();
    ui.showMenu();
  });

  modeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
  });

  avatarUpload.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => game.setAvatar(img);
    };
    reader.readAsDataURL(file);
  });
});
