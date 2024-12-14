class BalloonGame {
  constructor() {
    this.container = document.getElementById("game-container");
    this.bgmVolume = 0.5;
    this.sfxVolume = 0.7;
    this.baseSpeed = 1;
    this.currentSpeed = 1;
    this.speedIncreaseInterval = 30000;
    this.colors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#FF8B94"];
    this.bgMusic = new Audio(
      "https://github.com/zeugmatographer/publicassets/blob/main/background-music.mp3.mp3?raw=true"
    );
    this.popSound = new Audio(
      "https://github.com/zeugmatographer/publicassets/blob/main/pop.mp3.mp3?raw=true"
    );
    this.spawnInterval = null;
    this.speedProgressionInterval = null;
    this.isGamePaused = false;
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    this.setupAudio();
    this.setupControls();
    this.startGame();

    document.body.addEventListener(
      "click",
      () => {
        if (this.bgMusic.paused) {
          this.bgMusic.play().catch(() => {});
        }
      },
      { once: true }
    );
  }

  setupAudio() {
    this.bgMusic.loop = true;
    this.bgMusic.volume = this.bgmVolume;

    this.bgMusic.play().catch(() => {
      console.log("Audio playback requires user interaction first");
    });

    document.addEventListener(
      "touchstart",
      () => {
        if (this.bgMusic.paused) {
          this.bgMusic.play().catch(() => {});
        }
      },
      { once: true }
    );
  }

  setupControls() {
    const volumeControlsContainer = document.getElementById("volume-controls");
    const speedControlContainer = document.getElementById("speed-control");

    if (this.isIOS) {
      if (volumeControlsContainer) {
        volumeControlsContainer.style.display = "none";
      }
    } else {
      if (volumeControlsContainer) {
        document.getElementById("bgm-volume").addEventListener("input", (e) => {
          this.bgmVolume = parseFloat(e.target.value);
          this.bgMusic.volume = this.bgmVolume;
        });

        document.getElementById("sfx-volume").addEventListener("input", (e) => {
          this.sfxVolume = parseFloat(e.target.value);
        });
      }
    }

    document.getElementById("balloon-speed").addEventListener("input", (e) => {
      this.baseSpeed = parseFloat(e.target.value);
      this.updateGameSpeed();
    });

    document.getElementById("pause-button").addEventListener("click", () => {
      this.togglePause();
    });
  }

  togglePause() {
    this.isGamePaused = !this.isGamePaused;
    const pauseButton = document.getElementById("pause-button");

    if (this.isGamePaused) {
      this.pauseGame();
      pauseButton.textContent = "Start";
      this.bgMusic.pause();
    } else {
      this.resumeGame();
      pauseButton.textContent = "Pause";
      this.bgMusic.play().catch(() => {});
    }
  }

  pauseGame() {
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }
    if (this.speedProgressionInterval) {
      clearInterval(this.speedProgressionInterval);
      this.speedProgressionInterval = null;
    }
    const balloons = document.querySelectorAll(".balloon");
    balloons.forEach((balloon) => {
      const animations = balloon.getAnimations();
      animations.forEach((animation) => animation.pause());
    });
  }

  resumeGame() {
    this.startSpawning();
    this.startSpeedProgression();
    const balloons = document.querySelectorAll(".balloon");
    balloons.forEach((balloon) => {
      const animations = balloon.getAnimations();
      animations.forEach((animation) => animation.play());
    });
  }

  startGame() {
    this.startSpawning();
    this.startSpeedProgression();
  }

  updateGameSpeed() {
    this.currentSpeed = this.baseSpeed;
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
    }
    if (!this.isGamePaused) {
      this.startSpawning();
    }
  }

  startSpeedProgression() {
    if (this.speedProgressionInterval) {
      clearInterval(this.speedProgressionInterval);
    }
    this.speedProgressionInterval = setInterval(() => {
      this.currentSpeed += 0.1;
      this.currentSpeed = Math.min(this.currentSpeed, 3);
      this.updateGameSpeed();
    }, this.speedIncreaseInterval);
  }

  createBalloon() {
    const balloon = document.createElement("div");
    balloon.className = "balloon";

    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    const size = 80 + Math.random() * 40;

    balloon.style.cssText = `
      left: ${Math.random() * (window.innerWidth - size)}px;
      bottom: -${size}px;
      width: ${size}px;
      height: ${size * 1.2}px;
      background: ${color};
      border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
      box-shadow: 
        inset -10px -10px 20px rgba(0,0,0,0.3),
        10px 10px 20px rgba(0,0,0,0.2);
      transform-style: preserve-3d;
    `;

    balloon.addEventListener("touchstart", (e) => this.popBalloon(balloon, e));
    balloon.addEventListener("click", (e) => this.popBalloon(balloon, e));

    this.container.appendChild(balloon);

    const baseDuration = 6000;
    const duration = baseDuration / this.currentSpeed;

    const animation = balloon.animate(
      [
        { transform: "translateY(0) rotate(0deg)" },
        {
          transform:
            "translateY(-" + (window.innerHeight + size) + "px) rotate(360deg)"
        }
      ],
      {
        duration: duration + Math.random() * 2000,
        easing: "linear"
      }
    );

    if (this.isGamePaused) {
      animation.pause();
    }

    animation.onfinish = () => balloon.remove();
  }

  createSparkle(x, y, color) {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";

    const particles = 8;
    const particleSize = 4;

    for (let i = 0; i < particles; i++) {
      const particle = document.createElement("div");
      const angle = (i / particles) * Math.PI * 2;
      const distance = 20;
      const randomOffset = Math.random() * 20 - 10;

      particle.style.cssText = `
        position: absolute;
        width: ${particleSize}px;
        height: ${particleSize}px;
        background: ${color};
        border-radius: 50%;
        left: ${Math.cos(angle) * distance + randomOffset}px;
        top: ${Math.sin(angle) * distance + randomOffset}px;
        animation: particleFly 0.5s ease-out forwards;
        opacity: 1;
      `;

      sparkle.appendChild(particle);
    }

    sparkle.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      pointer-events: none;
      z-index: 1000;
    `;

    this.container.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 500);
  }

  popBalloon(balloon, event) {
    if (this.isGamePaused) return;

    const rect = balloon.getBoundingClientRect();
    const color = getComputedStyle(balloon).backgroundColor;

    const popSound = this.popSound.cloneNode();
    popSound.volume = this.isIOS ? 1 : this.sfxVolume;
    popSound.play().catch(() => {});

    const sparkleX = event.clientX || rect.left + rect.width / 2;
    const sparkleY = event.clientY || rect.top + rect.height / 2;
    this.createSparkle(sparkleX, sparkleY, color);

    const popEffect = document.createElement("div");
    popEffect.className = "pop-effect";
    popEffect.style.cssText = `
      position: absolute;
      left: ${sparkleX - 25}px;
      top: ${sparkleY - 25}px;
      width: 50px;
      height: 50px;
      background: ${color};
      border-radius: 50%;
      animation: popAnimation 0.3s ease-out forwards;
      opacity: 0.7;
    `;

    this.container.appendChild(popEffect);
    setTimeout(() => popEffect.remove(), 300);

    balloon.remove();
  }

  startSpawning() {
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
    }
    const baseSpawnRate = 1000;
    const spawnRate = baseSpawnRate / this.currentSpeed;
    this.spawnInterval = setInterval(() => this.createBalloon(), spawnRate);
  }
}

window.onload = () => new BalloonGame();