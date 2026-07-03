/* ==========================================================================
   ROMANTIC ANNIVERSARY GAME - GAMEPLAY LOGIC & ANIMATIONS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- Game State & Data ---
  const quizData = [
    {
      question: "Did we first meet on May 24, 2024, during our college admission interview? 🎓❤️",
      message: "❤️ Yay! You remembered our beautiful beginning."
    },
    {
      question: "Were we just friends during our first year, only to fall deeply in love in our second year? 🏫💕",
      message: "💕 Every memory with you is my favorite."
    },
    {
      question: "Did I propose to my beautiful princess on July 4, 2025? 💍✨",
      message: "🥹 You always make my heart smile."
    },
    {
      question: "Did I fulfill your dream with a beach proposal, a red bouquet, and a gorgeous ring? 🌊🌹",
      message: "🌹 My forever starts with you."
    },
    {
      question: "Will our love story continue to grow and last forever and ever? ♾️💖",
      message: "💖 I love you more every single day."
    }
  ];

  let currentQuestionIndex = 0;
  let heartIntervalId = null;

  // --- Runaway No Button Physics State ---
  let noBtnX = 0;
  let noBtnY = 0;
  let noBtnVx = 0;
  let noBtnVy = 0;
  let noBtnW = 120;
  let noBtnH = 48;
  let noBtnInitialized = false;
  let noBtnBouncingActive = false;

  // --- DOM Elements ---
  const loveLoader = document.getElementById('love-loader');
  const loaderFill = document.getElementById('loader-fill');
  const loaderText = document.getElementById('loader-text');
  const loaderPercent = document.getElementById('loader-percent');
  
  const bgMusic = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');
  
  const welcomeScreen = document.getElementById('welcome-screen');
  const quizScreen = document.getElementById('quiz-screen');
  const celebrationScreen = document.getElementById('celebration-screen');
  
  const startBtn = document.getElementById('start-btn');
  const yesBtn = document.getElementById('yes-btn');
  const noBtn = document.getElementById('no-btn');
  
  const questionText = document.getElementById('question-text');
  const progressText = document.getElementById('progress-text');
  const progressFill = document.getElementById('progress-fill');
  
  const popupOverlay = document.getElementById('popup-overlay');
  const popupMessage = document.getElementById('popup-message');
  const popupBurst = document.getElementById('popup-burst');
  
  const heartParticles = document.getElementById('heart-particles');
  const celebrationCanvas = document.getElementById('celebration-canvas');
  
  const giftBoxContainer = document.getElementById('gift-box-container');
  const giftBox = document.getElementById('gift-box');
  const photoRevealContainer = document.getElementById('photo-reveal-container');

  // --- 1. LOVE LOADER SEQUENCE ---
  function runLoveLoader() {
    let progress = 0;
    const duration = 2800; // Total loading time 2.8s
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = 100 / steps;
    
    const loaderPhrases = [
      { max: 25, text: "Assembling sweet memories... 🌸" },
      { max: 55, text: "Measuring heartbeats... 💓" },
      { max: 80, text: "Synchronizing life journeys... 🧑‍🤝‍🧑" },
      { max: 100, text: "Ready to start forever... ✨" }
    ];

    const interval = setInterval(() => {
      progress += increment;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        completeLoader();
      }
      
      // Update loader UI
      const displayVal = Math.floor(progress);
      loaderPercent.innerText = `${displayVal}%`;
      loaderFill.style.height = `${displayVal}%`;
      
      // Update text phrases
      const phrase = loaderPhrases.find(p => displayVal <= p.max);
      if (phrase) {
        loaderText.innerText = phrase.text;
      }
    }, stepTime);
  }

  function completeLoader() {
    setTimeout(() => {
      loveLoader.classList.add('hidden');
      welcomeScreen.classList.add('active');
    }, 400);
  }

  // Run loader on startup
  runLoveLoader();

  // --- 2. BACKGROUND PARTICLES ---
  function initBackgroundParticles() {
    const emojis = ['❤️', '💖', '💕', '✨', '🌸', '🎈'];
    const count = 25;
    
    for (let i = 0; i < count; i++) {
      createBackgroundParticle(emojis);
    }

    // Spawning interval to keep background active
    setInterval(() => {
      if (document.querySelectorAll('.bg-particle').length < 35) {
        createBackgroundParticle(emojis);
      }
    }, 2000);
  }

  function createBackgroundParticle(emojis) {
    const particle = document.createElement('div');
    particle.className = 'bg-particle';
    particle.innerText = emojis[Math.floor(Math.random() * emojis.length)];
    
    const size = Math.random() * 20 + 15; // 15px to 35px
    const left = Math.random() * 100;
    const duration = Math.random() * 8 + 8;
    const delay = Math.random() * 5;
    const swingDist = Math.random() * 40 + 20;
    
    particle.style.fontSize = `${size}px`;
    particle.style.left = `${left}%`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `-${delay}s`;
    particle.style.setProperty('--swing-dist', `${swingDist}px`);
    
    particle.addEventListener('animationend', () => {
      particle.remove();
    });
    
    heartParticles.appendChild(particle);
  }

  // --- 3. AUDIO PLAYER CONTROLS ---
  function toggleMusic() {
    if (bgMusic.paused) {
      bgMusic.play()
        .then(() => {
          musicToggle.classList.remove('paused');
        })
        .catch(err => {
          console.log("Autoplay policy blocked audio play.", err);
        });
    } else {
      bgMusic.pause();
      musicToggle.classList.add('paused');
    }
  }

  musicToggle.addEventListener('click', toggleMusic);

  startBtn.addEventListener('click', () => {
    // Attempt play on user interaction
    bgMusic.play()
      .then(() => {
        musicToggle.classList.remove('paused');
      })
      .catch(err => {
        console.log("Audio play blocked.", err);
      });
      
    welcomeScreen.classList.remove('active');
    setTimeout(() => {
      quizScreen.classList.add('active');
      loadQuestion();
    }, 400);
  });

  // --- 4. QUIZ LOGIC ---
  function loadQuestion() {
    const currentQuestion = quizData[currentQuestionIndex];
    questionText.innerText = currentQuestion.question;
    
    // Make sure button is visible and in layout flow temporarily to measure it
    noBtn.style.display = 'inline-block';
    noBtn.style.position = '';
    noBtn.style.left = '';
    noBtn.style.top = '';
    noBtn.style.margin = '';
    noBtn.style.transition = '';
    
    // Measure coordinates in viewport
    const rect = noBtn.getBoundingClientRect();
    noBtnW = rect.width || 120;
    noBtnH = rect.height || 48;
    noBtnX = rect.left;
    noBtnY = rect.top;
    
    // Switch to fixed position so JS physics update coordinates from this spot
    noBtn.style.position = 'fixed';
    noBtn.style.zIndex = '1000';
    noBtn.style.margin = '0';
    noBtn.style.left = `${noBtnX}px`;
    noBtn.style.top = `${noBtnY}px`;
    
    // Initialize speeds if they are not already initialized
    if (!noBtnInitialized) {
      const speed = Math.random() * 1.5 + 1.2; // 1.2 to 2.7 px/frame
      const angle = Math.random() * Math.PI * 2;
      noBtnVx = Math.cos(angle) * speed;
      noBtnVy = Math.sin(angle) * speed;
      noBtnInitialized = true;
    }
    
    // Trigger bounce loop
    if (!noBtnBouncingActive) {
      noBtnBouncingActive = true;
      requestAnimationFrame(updateNoButtonBounce);
    }
    
    progressText.innerText = `Question ${currentQuestionIndex + 1} / ${quizData.length}`;
    const progressPercent = ((currentQuestionIndex + 1) / quizData.length) * 100;
    progressFill.style.width = `${progressPercent}%`;
  }

  yesBtn.addEventListener('mouseenter', startFloatingHeartsOnButton);
  yesBtn.addEventListener('mouseleave', stopFloatingHeartsOnButton);

  function startFloatingHeartsOnButton() {
    if (heartIntervalId) clearInterval(heartIntervalId);
    
    heartIntervalId = setInterval(() => {
      const rect = yesBtn.getBoundingClientRect();
      const heart = document.createElement('div');
      heart.className = 'yes-floating-heart';
      heart.innerText = ['❤️', '💖', '💕', '✨'][Math.floor(Math.random() * 4)];
      
      const rx = Math.random() * rect.width;
      const ry = Math.random() * rect.height;
      
      heart.style.left = `${rect.left + rx}px`;
      heart.style.top = `${rect.top + ry}px`;
      heart.style.position = 'fixed';
      
      const tx = (Math.random() - 0.5) * 100;
      const ty = -(Math.random() * 80 + 40);
      const rot = Math.random() * 360;
      
      heart.style.setProperty('--tx', `${tx}px`);
      heart.style.setProperty('--ty', `${ty}px`);
      heart.style.setProperty('--rot', `${rot}deg`);
      
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 1000);
    }, 120);
  }

  function stopFloatingHeartsOnButton() {
    if (heartIntervalId) {
      clearInterval(heartIntervalId);
      heartIntervalId = null;
    }
  }

  yesBtn.addEventListener('click', () => {
    stopFloatingHeartsOnButton();
    const currentQuestion = quizData[currentQuestionIndex];
    
    popupMessage.innerText = currentQuestion.message;
    popupOverlay.classList.add('active');
    triggerPopupHeartsBurst();
    
    setTimeout(() => {
      popupOverlay.classList.remove('active');
      popupBurst.innerHTML = '';
      
      currentQuestionIndex++;
      if (currentQuestionIndex < quizData.length) {
        loadQuestion();
      } else {
        showCelebrationScreen();
      }
    }, 2000);
  });

  function triggerPopupHeartsBurst() {
    const count = 30;
    const emojis = ['❤️', '💖', '💕', '🌸', '✨'];
    
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('span');
      heart.className = 'yes-floating-heart';
      heart.innerText = emojis[Math.floor(Math.random() * emojis.length)];
      
      heart.style.left = '50%';
      heart.style.top = '50%';
      heart.style.position = 'fixed';
      
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 150 + 80;
      const tx = Math.cos(angle) * speed;
      const ty = Math.sin(angle) * speed - 50;
      const rot = Math.random() * 360;
      
      heart.style.setProperty('--tx', `${tx}px`);
      heart.style.setProperty('--ty', `${ty}px`);
      heart.style.setProperty('--rot', `${rot}deg`);
      
      popupBurst.appendChild(heart);
      setTimeout(() => heart.remove(), 1000);
    }
  }

  // --- 5. RUNAWAY NO BUTTON MECHANICS & PHYSICS ---
  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Continuous physics bouncing updates
  function updateNoButtonBounce() {
    if (!noBtnBouncingActive || !quizScreen.classList.contains('active')) {
      noBtnBouncingActive = false;
      return;
    }

    // Move button coordinates
    noBtnX += noBtnVx;
    noBtnY += noBtnVy;

    // Viewport bounds parameters with safety margins
    const pad = 20;
    const minX = pad;
    const maxX = window.innerWidth - noBtnW - pad;
    const minY = pad;
    const maxY = window.innerHeight - noBtnH - pad;

    // Collide and bounce off boundaries
    if (noBtnX < minX) {
      noBtnX = minX;
      noBtnVx = Math.abs(noBtnVx); // Bounce right
    } else if (noBtnX > maxX) {
      noBtnX = maxX;
      noBtnVx = -Math.abs(noBtnVx); // Bounce left
    }

    if (noBtnY < minY) {
      noBtnY = minY;
      noBtnVy = Math.abs(noBtnVy); // Bounce down
    } else if (noBtnY > maxY) {
      noBtnY = maxY;
      noBtnVy = -Math.abs(noBtnVy); // Bounce up
    }

    // Apply inline coordinates
    noBtn.style.left = `${noBtnX}px`;
    noBtn.style.top = `${noBtnY}px`;

    // Perform desktop proximity check
    evadeCheck();

    requestAnimationFrame(updateNoButtonBounce);
  }

  function evadeCheck() {
    const btnCenterX = noBtnX + noBtnW / 2;
    const btnCenterY = noBtnY + noBtnH / 2;
    
    const dx = mouseX - btnCenterX;
    const dy = mouseY - btnCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Proximity triggers evasion: 115px
    if (distance < 115) {
      evade(false); // Teleport and bounce in random direction
    }
  }

  function evade(teleport = false) {
    // Spawn puff at current position
    createNoButtonPuff(noBtnX + noBtnW / 2, noBtnY + noBtnH / 2);

    const pad = 60; // Extra boundary pad for evasion teleport
    const maxW = window.innerWidth - noBtnW - pad;
    const maxH = window.innerHeight - noBtnH - pad;
    
    let targetX = 0;
    let targetY = 0;
    let attempts = 0;
    let safeDistance = false;
    
    // Find safe coordinates far from mouse
    while (!safeDistance && attempts < 15) {
      targetX = Math.random() * (maxW - pad) + pad;
      targetY = Math.random() * (maxH - pad) + pad;
      
      const dxMouse = targetX + noBtnW / 2 - mouseX;
      const dyMouse = targetY + noBtnH / 2 - mouseY;
      const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
      
      if (distMouse > 180) {
        safeDistance = true;
      }
      attempts++;
    }
    
    // Snappily move button coordinates
    noBtnX = targetX;
    noBtnY = targetY;

    // Reset speed with random angle vector to bounce in a new direction
    const speed = Math.random() * 1.5 + 1.2; // Keep speeds playable
    const angle = Math.random() * Math.PI * 2;
    noBtnVx = Math.cos(angle) * speed;
    noBtnVy = Math.sin(angle) * speed;

    // Apply immediately
    noBtn.style.left = `${noBtnX}px`;
    noBtn.style.top = `${noBtnY}px`;
  }

  function createNoButtonPuff(x, y) {
    const emojis = ['💔', '💨', '❤️', '🎈'];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'no-puff-heart';
      p.innerText = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      p.style.position = 'fixed';
      
      const dx = (Math.random() - 0.5) * 80;
      const dy = (Math.random() - 0.5) * 80;
      p.style.setProperty('--dx', `${dx}px`);
      p.style.setProperty('--dy', `${dy}px`);
      
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 800);
    }
  }

  // Evasion click/touch actions
  noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    evade(true);
  });
  
  noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    evade(true);
  });

  // --- 6. FINAL CELEBRATION & FIREWORK CANVAS ---
  let canvasCtx = null;
  let bgParticles = [];
  let explosionParticles = [];
  let celebrationActive = false;

  function showCelebrationScreen() {
    quizScreen.classList.remove('active');
    setTimeout(() => {
      celebrationScreen.classList.add('active');
      
      // Init canvas for falling petals/hearts
      canvasCtx = celebrationCanvas.getContext('2d');
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      celebrationActive = true;
      createDriftParticles();
      requestAnimationFrame(updateCelebrationFrame);
      
      // Ensure music starts playing
      if (bgMusic.paused) {
        bgMusic.play().catch(e => console.log("Music play blocked", e));
      }
    }, 400);
  }

  function resizeCanvas() {
    if (celebrationCanvas) {
      const rect = celebrationScreen.querySelector('.final-card').getBoundingClientRect();
      celebrationCanvas.width = rect.width;
      celebrationCanvas.height = rect.height;
    }
  }

  // Gift Box Click: TRIGGERS GRAND REVEAL
  giftBox.addEventListener('click', () => {
    // 1. Camera Flash Screen Effect
    const flash = document.createElement('div');
    flash.className = 'camera-flash flash-active';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 850);
    
    // 2. Hide Gift Box and show final letter and photo
    giftBoxContainer.style.display = 'none';
    photoRevealContainer.classList.remove('hidden');
    
    // 3. Trigger giant firework explosion on canvas!
    triggerMassiveCanvasFireworks();
  });

  // Particle System Definitions
  class DriftParticle {
    constructor(w, h) {
      this.w = w;
      this.h = h;
      this.reset();
    }

    reset() {
      this.x = Math.random() * this.w;
      this.y = Math.random() * -60 - 10;
      this.size = Math.random() * 8 + 6;
      this.type = Math.floor(Math.random() * 3); // 0: Confetti, 1: Rose Petal, 2: Heart
      this.speedY = Math.random() * 2 + 1.2;
      this.speedX = Math.sin(Math.random() * Math.PI) * 0.7;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 2 - 1;
      
      const colors = ['#ff1493', '#ff69b4', '#ffb6c1', '#ffd1dc', '#d8bfd8', '#ffffff', '#e6e6fa'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotationSpeed;
      
      if (this.y > this.h) this.reset();
      if (this.x < -10) this.x = this.w + 10;
      if (this.x > this.w + 10) this.x = -10;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;

      if (this.type === 0) {
        ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
      } else if (this.type === 1) {
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size / 2, this.size / 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        const d = this.size;
        ctx.moveTo(0, -d / 4);
        ctx.bezierCurveTo(-d / 2, -d / 2, -d, -d / 4, -d, d / 4);
        ctx.bezierCurveTo(-d, d * 0.6, -d / 4, d * 0.8, 0, d);
        ctx.bezierCurveTo(d / 4, d * 0.8, d, d * 0.6, d, d / 4);
        ctx.bezierCurveTo(d, -d / 4, d / 2, -d / 2, 0, -d / 4);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Firework explosion particle
  class FireworkParticle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 1.5; // Slight upward bias
      
      this.alpha = 1;
      this.gravity = 0.08;
      this.decay = Math.random() * 0.015 + 0.01;
      this.size = Math.random() * 4 + 2;
    }

    update() {
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function createDriftParticles() {
    const density = 50;
    bgParticles = [];
    for (let i = 0; i < density; i++) {
      bgParticles.push(new DriftParticle(celebrationCanvas.width, celebrationCanvas.height));
    }
  }

  function triggerMassiveCanvasFireworks() {
    const colors = ['#ff1493', '#ff69b4', '#ffd700', '#9b5de5', '#00f5ff', '#ff5722', '#ffffff'];
    const centers = [
      { x: celebrationCanvas.width * 0.25, y: celebrationCanvas.height * 0.3 },
      { x: celebrationCanvas.width * 0.75, y: celebrationCanvas.height * 0.35 },
      { x: celebrationCanvas.width * 0.5, y: celebrationCanvas.height * 0.45 },
      { x: celebrationCanvas.width * 0.35, y: celebrationCanvas.height * 0.6 },
      { x: celebrationCanvas.width * 0.65, y: celebrationCanvas.height * 0.55 }
    ];
    
    // Spawn 120 explosion particles per core center
    centers.forEach(c => {
      const color1 = colors[Math.floor(Math.random() * colors.length)];
      const color2 = colors[Math.floor(Math.random() * colors.length)];
      
      for (let i = 0; i < 60; i++) {
        explosionParticles.push(new FireworkParticle(c.x, c.y, i % 2 === 0 ? color1 : color2));
      }
    });

    // Periodically spawn small fireworks in the background to keep the celebration grand
    const loopInterval = setInterval(() => {
      if (!celebrationActive || photoRevealContainer.classList.contains('hidden')) {
        clearInterval(loopInterval);
        return;
      }
      
      const px = Math.random() * celebrationCanvas.width;
      const py = Math.random() * (celebrationCanvas.height * 0.6) + 50;
      const pColor = colors[Math.floor(Math.random() * colors.length)];
      
      for (let i = 0; i < 30; i++) {
        explosionParticles.push(new FireworkParticle(px, py, pColor));
      }
    }, 1800);
  }

  function updateCelebrationFrame() {
    if (!celebrationActive) return;
    
    canvasCtx.clearRect(0, 0, celebrationCanvas.width, celebrationCanvas.height);
    
    // 1. Update & Draw falling drift particles
    bgParticles.forEach(p => {
      p.update();
      p.draw(canvasCtx);
    });
    
    // 2. Update & Draw explosion particles (fireworks)
    for (let i = explosionParticles.length - 1; i >= 0; i--) {
      const p = explosionParticles[i];
      p.update();
      if (p.alpha <= 0) {
        explosionParticles.splice(i, 1);
      } else {
        p.draw(canvasCtx);
      }
    }
    
    requestAnimationFrame(updateCelebrationFrame);
  }

  // --- Initialize Background Sparkles ---
  initBackgroundParticles();
});
