/* ===========================
   Helpers
=========================== */
const $ = (id) => document.getElementById(id);

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(num, max));
}

/* ===========================
   Data
=========================== */
const DATA = window.VAL_DATA;

/* ===========================
   Elements
=========================== */
const steps = {
  start: $("step-start"),
  rose: $("step-rose"),
  letter: $("step-letter"),
  game: $("step-game"),
  propose: $("step-propose"),
  gift: $("step-gift"),
};

const startLine = $("startLine");
const startBtn = $("startBtn");

const rose = $("rose");
const heartbeat = $("heartbeat");
const ecgLine = $("ecgLine");

const openLetterBtn = $("openLetterBtn");
const letterBox = $("letterBox");
const letterHint = $("letterHint");
const letterTapWrap = $("letterTapWrap");

const letterEl = $("letter");

const back1 = $("back1");
const back2 = $("back2");
const back3 = $("back3");
const next1 = $("next1");
const next2 = $("next2");
const next3 = $("next3");

const gameArea = $("gameArea");
const gameBtn = $("gameBtn");
const scoreEl = $("score");
const timeLeftEl = $("timeLeft");

const yesBtn = $("yesBtn");
const noBtn = $("noBtn");
const finalLine = $("finalLine");

const revealPhotoBtn = $("revealPhotoBtn");
const photoWrap = $("photoWrap");

const music = $("music");
const musicBtn = $("musicBtn");
const musicIcon = $("musicIcon");

const floatLayer = $("float-layer");

/* ===========================
   Init content
=========================== */
startLine.textContent = DATA.startLine;

/* ===========================
   Step navigation
=========================== */
let currentStep = "start";

function showStep(stepName) {
  Object.values(steps).forEach((s) => s.classList.remove("active"));
  steps[stepName].classList.add("active");
  currentStep = stepName;
}

startBtn.addEventListener("click", () => showStep("rose"));

back1.addEventListener("click", () => showStep("start"));
next1.addEventListener("click", () => showStep("letter"));

back2.addEventListener("click", () => showStep("rose"));
next2.addEventListener("click", () => showStep("game"));

back3.addEventListener("click", () => showStep("letter"));
// next3 is controlled by game unlock

/* ===========================
   Background floating icons
=========================== */
const floatIcons = ["💗", "❤️", "🌹", "💖", "💞"];

function spawnFloat() {
  const el = document.createElement("div");
  el.className = "float";
  el.textContent = floatIcons[Math.floor(Math.random() * floatIcons.length)];

  el.style.left = rand(-5, 105) + "vw";
  el.style.fontSize = rand(42, 96) + "px";
  el.style.opacity = rand(0.14, 0.32);

  const duration = rand(10, 18);
  el.style.animationDuration = duration + "s";

  floatLayer.appendChild(el);
  setTimeout(() => el.remove(), duration * 1000);
}

// initial and continuous
for (let i = 0; i < 16; i++) setTimeout(spawnFloat, i * 260);
setInterval(spawnFloat, 700);

/* ===========================
   Music
=========================== */
let isPlaying = false;

function updateMusicUI() {
  musicIcon.textContent = isPlaying ? "🎵" : "🔇";
  musicBtn.classList.toggle("playing", isPlaying);
}

musicBtn.addEventListener("click", async () => {
  try {
    if (!isPlaying) {
      await music.play();
      isPlaying = true;
    } else {
      music.pause();
      isPlaying = false;
    }
    updateMusicUI();
  } catch (err) {
    console.log("Music blocked:", err);
  }
});
updateMusicUI();

/* ===========================
   Micro effects
=========================== */
function heartBurst(x, y) {
  const count = 12;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.textContent = "💗";
    p.style.position = "fixed";
    p.style.left = x + "px";
    p.style.top = y + "px";
    p.style.fontSize = rand(14, 28) + "px";
    p.style.zIndex = 999;
    p.style.pointerEvents = "none";
    document.body.appendChild(p);

    const dx = rand(-140, 140);
    const dy = rand(-180, -40);

    p.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(1.4)`, opacity: 0 }
      ],
      { duration: 900, easing: "cubic-bezier(.2,.9,.2,1)" }
    );

    setTimeout(() => p.remove(), 920);
  }
}

function confettiBlast() {
  const pieces = 110;
  for (let i = 0; i < pieces; i++) {
    const c = document.createElement("div");
    c.style.position = "fixed";
    c.style.left = rand(0, 100) + "vw";
    c.style.top = rand(-20, -5) + "vh";
    c.style.width = rand(8, 12) + "px";
    c.style.height = rand(10, 16) + "px";
    c.style.borderRadius = "4px";
    c.style.opacity = "0.95";
    c.style.zIndex = 999;
    c.style.pointerEvents = "none";
    c.style.background = `hsl(${Math.floor(rand(0, 360))}, 90%, 72%)`;
    document.body.appendChild(c);

    c.animate(
      [
        { transform: "translateY(0) rotate(0deg)" },
        { transform: `translateY(120vh) rotate(${rand(600, 1200)}deg)` }
      ],
      { duration: rand(2600, 4200), easing: "linear" }
    );

    setTimeout(() => c.remove(), 4500);
  }
}

/* ===========================
   Rose + Infinite REAL-TIME ECG Heartbeat
=========================== */
let hbRunning = false;
let ecgTimer = null;

// ECG generator setup
let ecgX = 0;
const W = 600;
const H = 120;
const mid = 70;

// points buffer
let points = [];
const maxPoints = 160;

// waveform state machine
let phase = "flat";
let phaseTicks = 0;

function nextECGSample(){
  if(phaseTicks <= 0){
    if(phase === "flat"){
      phase = "bump";
      phaseTicks = 6 + Math.floor(rand(0,3));
    }else if(phase === "bump"){
      phase = "qrs";
      phaseTicks = 5;
    }else if(phase === "qrs"){
      phase = "recover";
      phaseTicks = 10 + Math.floor(rand(0,4));
    }else{
      phase = "flat";
      phaseTicks = 38 + Math.floor(rand(0,22));
    }
  }
  phaseTicks--;

  let y = mid;

  if(phase === "flat"){
    y = mid + rand(-1.4, 1.4);
  } else if(phase === "bump"){
    y = mid - 6 + rand(-1.2, 1.2);
  } else if(phase === "qrs"){
    const t = 5 - phaseTicks;
    if(t === 1) y = mid - 34;
    else if(t === 2) y = mid + 44;
    else y = mid + rand(-2, 2);
  } else if(phase === "recover"){
    y = mid - 10 + rand(-1.5, 1.5);
  }

  return clamp(y, 10, H - 10);
}

function renderECG(){
  if(!ecgLine) return;

  // move forward
  ecgX += 6; // speed
  if(ecgX > W) ecgX = W;

  const y = nextECGSample();

  points.push([ecgX, y]);

  // keep buffer small
  if(points.length > maxPoints) points.shift();

  // shift left (scroll)
  const firstX = points[0][0];
  const shift = firstX;

  const pts = points.map(([x, yy]) => `${(x - shift).toFixed(1)},${yy.toFixed(1)}`).join(" ");
  ecgLine.setAttribute("points", pts);

  // reset after shift large
  if(shift > 40){
    points = points.map(([x, yy]) => [x - shift, yy]);
    ecgX = ecgX - shift;
  }
}

function startHeartbeat(){
  if(hbRunning) return;
  hbRunning = true;

  heartbeat.classList.add("running");

  // reset
  points = [];
  ecgX = 0;
  phase = "flat";
  phaseTicks = 20;

  // seed initial baseline
  for(let i=0;i<40;i++){
    points.push([i*6, mid]);
    ecgX = i*6;
  }

  // 30fps real-time ECG
  ecgTimer = setInterval(renderECG, 33);
}

function stopHeartbeat(){
  hbRunning = false;

  if(ecgTimer) clearInterval(ecgTimer);
  ecgTimer = null;

  heartbeat.classList.remove("running");
}

let roseTaps = 0;        // how many times rose is clicked
const requiredTaps = 5;  // after 5 taps show Next

next1.classList.remove("show");

rose.addEventListener("click", (e) => {
  rose.animate(
    [
      { transform: "scale(1) rotate(0deg)" },
      { transform: "scale(1.25) rotate(-7deg)" },
      { transform: "scale(1.10) rotate(6deg)" },
      { transform: "scale(1) rotate(0deg)" }
    ],
    { duration: 650, easing: "cubic-bezier(.2,.9,.2,1)" }
  );

  heartBurst(e.clientX, e.clientY);

  roseTaps++;
  if (roseTaps >= requiredTaps) {
    next1.classList.add("show");
  }

  startHeartbeat();
});

/* stop heartbeat when leaving rose step */
next1.addEventListener("click", () => stopHeartbeat());
back1.addEventListener("click", () => stopHeartbeat());

/* ===========================
   Love letter typewriter
=========================== */
let typedOnce = false;

function typewriter(text, el, speed = 22, onDone = null) {
  el.textContent = "";
  let i = 0;

  const tick = () => {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(tick, speed);
    } else {
      if (typeof onDone === "function") onDone();
    }
  };
  tick();
}

function openLetter() {
  if (typedOnce) return;
  typedOnce = true;

  next2.classList.remove("show");

  // 1) animate the button nicely
  openLetterBtn.classList.add("hideBtn");

  openLetterBtn.animate(
    [
      { transform: "scale(1) rotate(0deg)", opacity: 1 },
      { transform: "scale(0.92) rotate(-4deg)", opacity: 1 },
      { transform: "scale(0.55) rotate(-12deg)", opacity: 0 }
    ],
    { duration: 520, easing: "cubic-bezier(.2,.9,.2,1)", fill: "forwards" }
  );

  // 2) hide the whole wrapper (hint + icon)
  setTimeout(() => {
    if (letterTapWrap) letterTapWrap.classList.add("hide");
  }, 220);

  // 3) show letter box with smooth entrance
  setTimeout(() => {
    letterBox.classList.remove("hidden");
    letterBox.classList.add("open");
  }, 520);

  // 4) start typing slightly after the box appears
  setTimeout(() => {
    typewriter(DATA.letter, letterEl, 35, () => {
      next2.classList.add("show");   // reveal unlock game button
    });
  }, 760);
}

if(openLetterBtn){
  openLetterBtn.addEventListener("click", openLetter);
}

/* ===========================
   GAME: Catch Hearts (15 sec, medium)
=========================== */
let gameRunning = false;
let score = 0;
let timeLeft = 15;
let gameTick = null;
let spawnTick = null;

function resetGameUI() {
  score = 0;
  timeLeft = 15;
  scoreEl.textContent = score;
  timeLeftEl.textContent = timeLeft;
  next3.disabled = true;
  next3.textContent = "Go next 💘";
  gameArea.innerHTML = "";
}

function placeHeart() {
  const heart = document.createElement("div");
  heart.className = "heartTarget";
  heart.textContent = "💗";

  const padding = 30;
  const rect = gameArea.getBoundingClientRect();

  const x = rand(padding, rect.width - padding - 40);
  const y = rand(padding, rect.height - padding - 40);

  heart.style.left = x + "px";
  heart.style.top = y + "px";

  heart.addEventListener("click", (e) => {
    e.stopPropagation();
    score++;
    scoreEl.textContent = score;

    heart.animate(
      [
        { transform: "scale(1)", opacity: 1 },
        { transform: "scale(1.5)", opacity: 0 }
      ],
      { duration: 220, easing: "ease-out" }
    );

    setTimeout(() => heart.remove(), 200);
  });

  gameArea.appendChild(heart);

  setTimeout(() => {
    if (heart.isConnected) heart.remove();
  }, rand(1200, 1700));
}

function startGame() {
  if (gameRunning) return;
  gameRunning = true;

  resetGameUI();
  gameBtn.textContent = "Playing... 💗";
  gameBtn.disabled = true;

  spawnTick = setInterval(() => placeHeart(), 420);

  gameTick = setInterval(() => {
    timeLeft--;
    timeLeftEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  gameRunning = false;
  clearInterval(gameTick);
  clearInterval(spawnTick);

  gameBtn.textContent = "Play again";
  gameBtn.disabled = false;

  const target = 30;                  //No of hearts to be catched

  if (score >= target) {
    next3.disabled = false;
    next3.textContent = "Unlocked ✅ Next →";
  } else {
    next3.disabled = true;
    next3.textContent = `Need ${target}+ score 😭`;
  }
}

gameBtn.addEventListener("click", startGame);

next3.addEventListener("click", () => {
  if (next3.disabled) return;
  showStep("propose");
});

back3.addEventListener("click", () => {
  resetGameUI();
});

/* Reset game whenever entering it */
const oldShowStep2 = showStep;
showStep = function(stepName){
  oldShowStep2(stepName);
  if(stepName === "game") resetGameUI();
};

/* ===========================
   Proposal (YES/NO) - SMOOTH NO BUTTON
=========================== */
let noEscapes = 0;
let noLocked = false;
let noX = 0;
let noY = 0;
let lastMoveAt = 0;

function shakeNoButton() {
  noBtn.animate(
    [
      { transform: `translate(${noX}px, ${noY}px)` },
      { transform: `translate(${noX - 8}px, ${noY}px)` },
      { transform: `translate(${noX + 8}px, ${noY}px)` },
      { transform: `translate(${noX - 6}px, ${noY}px)` },
      { transform: `translate(${noX + 6}px, ${noY}px)` },
      { transform: `translate(${noX}px, ${noY}px)` }
    ],
    { duration: 260, easing: "ease-out" }
  );
}

function escapeNo() {
  if (noLocked) return;

  // throttle so it doesn't spam and feel glitchy
  const now = performance.now();
  if (now - lastMoveAt < 120) return;
  lastMoveAt = now;

  shakeNoButton();

  // move in steps (feels playful, not teleporty)
  noX += rand(-90, 90);
  noY += rand(-25, 25);

  // clamp so it stays near buttons and doesn't go crazy
  noX = clamp(noX, -140, 140);
  noY = clamp(noY, -35, 35);

  // smooth move (CSS transition)
  noBtn.style.transform = `translate(${noX}px, ${noY}px)`;

  noEscapes++;

  // text change immediately (no late updates)
  if (noEscapes === 3) noBtn.textContent = "NO 😳";
  if (noEscapes === 5) noBtn.textContent = "NO 🙄";
  if (noEscapes === 7) noBtn.textContent = "NO 😭";

  if (noEscapes >= 9) {
    noLocked = true;
    noBtn.textContent = "PLS YES 😭";

    // return to center smoothly
    noX = 0;
    noY = 0;
    setTimeout(() => {
      noBtn.style.transform = `translate(0px, 0px)`;
    }, 150);
  }
}

/* Desktop */
noBtn.addEventListener("mouseenter", escapeNo);
noBtn.addEventListener("mouseover", escapeNo);

/* Mobile */
noBtn.addEventListener("touchstart", escapeNo, { passive: true });

/* clicking NO */
noBtn.addEventListener("click", () => {
  finalLine.textContent = DATA.noMessage;
});

yesBtn.addEventListener("click", (e) => {
  heartBurst(e.clientX, e.clientY);
  confettiBlast();
  finalLine.textContent = DATA.yesMessage;

  setTimeout(() => {
    showStep("gift");
  }, 1100);
});


/* ===========================
   Gift reveal photo
=========================== */
revealPhotoBtn.textContent = DATA.giftRevealButton;

function sparkleBurst(el){
  const rect = el.getBoundingClientRect();
  const centerX = rect.left + rect.width/2;
  const centerY = rect.top + rect.height/2;

  const sparkles = ["✨","💖","🌟","💗"];
  for(let i=0;i<18;i++){
    const s = document.createElement("div");
    s.textContent = sparkles[Math.floor(Math.random()*sparkles.length)];
    s.style.position="fixed";
    s.style.left=centerX+"px";
    s.style.top=centerY+"px";
    s.style.fontSize=rand(14,26)+"px";
    s.style.zIndex=999;
    s.style.pointerEvents="none";
    document.body.appendChild(s);

    const dx = rand(-180,180);
    const dy = rand(-160,40);

    s.animate(
      [
        { transform:"translate(0,0) scale(1)", opacity:1 },
        { transform:`translate(${dx}px, ${dy}px) scale(1.3)`, opacity:0 }
      ],
      { duration: 950, easing:"cubic-bezier(.2,.9,.2,1)" }
    );

    setTimeout(()=>s.remove(), 980);
  }
}

revealPhotoBtn.addEventListener("click", () => {
  photoWrap.classList.add("show");

  // grand sparkle burst
  sparkleBurst(photoWrap);

  // button animation
  revealPhotoBtn.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(0.96)" },
      { transform: "scale(1.05)" },
      { transform: "scale(1)" }
    ],
    { duration: 380, easing: "cubic-bezier(.2,.9,.2,1)" }
  );
});

/* ===========================
   Final Init
=========================== */
showStep("start");