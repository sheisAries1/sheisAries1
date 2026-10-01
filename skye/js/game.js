// Star Catcher: move Skye left and right to catch falling stars.
(function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  const scoreEl = document.getElementById('score');
  const timeEl = document.getElementById('time');
  const bestEl = document.getElementById('best');
  const overlay = document.getElementById('gameOverlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayText = document.getElementById('overlayText');
  const startBtn = document.getElementById('startBtn');

  const sprite = new Image();
  sprite.src = 'images/skye.png';

  const ROUND = 30;
  const skye = { x: W / 2, w: 74, h: 115, speed: 7 };
  let items = [];
  let score = 0;
  let timeLeft = ROUND;
  let running = false;
  let lastTime = 0;
  let spawnTimer = 0;
  let flash = 0;
  let pops = [];
  const keys = { left: false, right: false };
  let dragX = null;

  let best = 0;
  try { best = Number(localStorage.getItem('skye-best')) || 0; } catch (e) { /* storage blocked */ }
  bestEl.textContent = best;

  function spawn() {
    const roll = Math.random();
    let type = 'star';
    if (roll > 0.9) type = 'heart';
    else if (roll > 0.75) type = 'rain';
    items.push({
      type,
      x: 30 + Math.random() * (W - 60),
      y: -30,
      vy: 2.2 + Math.random() * 1.8 + (ROUND - timeLeft) * 0.06,
      spin: Math.random() * Math.PI
    });
  }

  function drawStar(x, y, r, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 ? r * 0.45 : r;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fillStyle = '#ffd93d';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2b1d16';
    ctx.stroke();
    ctx.restore();
  }

  function drawHeart(x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, s * 0.35);
    ctx.bezierCurveTo(-s * 1.1, -s * 0.35, -s * 0.45, -s * 1.05, 0, -s * 0.45);
    ctx.bezierCurveTo(s * 0.45, -s * 1.05, s * 1.1, -s * 0.35, 0, s * 0.35);
    ctx.fillStyle = '#ff6fa8';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2b1d16';
    ctx.stroke();
    ctx.restore();
  }

  function drawRain(x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#9aa5b8';
    ctx.strokeStyle = '#2b1d16';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-12, 0, 13, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(0, -10, 15, Math.PI, 0);
    ctx.arc(14, 0, 12, Math.PI * 1.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#4ea8ff';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.ellipse(i * 10, 22, 3, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawGround() {
    const night = document.documentElement.dataset.theme === 'dark';
    ctx.fillStyle = night ? '#2e5a4a' : '#8fdc7e';
    ctx.strokeStyle = '#2b1d16';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, H - 22);
    ctx.quadraticCurveTo(W / 2, H - 46, W, H - 22);
    ctx.lineTo(W, H + 4);
    ctx.lineTo(-4, H + 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function drawSkye() {
    const y = H - skye.h - 14;
    if (flash > 0 && Math.floor(flash * 10) % 2) ctx.globalAlpha = 0.4;
    if (sprite.complete && sprite.naturalWidth) {
      ctx.drawImage(sprite, skye.x - skye.w / 2, y, skye.w, skye.h);
    } else {
      ctx.fillStyle = '#ffd93d';
      ctx.fillRect(skye.x - skye.w / 2, y, skye.w, skye.h);
    }
    ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawGround();
    for (const it of items) {
      if (it.type === 'star') drawStar(it.x, it.y, 18, it.spin);
      else if (it.type === 'heart') drawHeart(it.x, it.y, 20);
      else drawRain(it.x, it.y);
    }
    drawSkye();
    ctx.font = '600 26px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    for (const p of pops) {
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.strokeStyle = '#2b1d16';
      ctx.lineWidth = 4;
      ctx.strokeText(p.text, p.x, p.y);
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
  }

  function update(dt) {
    const step = dt * 60;
    if (dragX !== null) {
      skye.x += (dragX - skye.x) * Math.min(1, 0.25 * step);
    } else {
      if (keys.left) skye.x -= skye.speed * step;
      if (keys.right) skye.x += skye.speed * step;
    }
    skye.x = Math.max(skye.w / 2, Math.min(W - skye.w / 2, skye.x));

    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawn();
      spawnTimer = Math.max(0.35, 0.8 - (ROUND - timeLeft) * 0.012);
    }

    const top = H - skye.h - 14;
    items = items.filter((it) => {
      it.y += it.vy * step;
      it.spin += 0.04 * step;
      const hit = it.y > top + 10 && it.y < top + skye.h && Math.abs(it.x - skye.x) < skye.w / 2 + 12;
      if (hit) {
        if (it.type === 'star') { score += 1; pops.push({ x: it.x, y: it.y, text: '+1', color: '#ffd93d', life: 1 }); }
        else if (it.type === 'heart') { score += 5; pops.push({ x: it.x, y: it.y, text: '+5', color: '#ff6fa8', life: 1 }); }
        else { score = Math.max(0, score - 2); flash = 0.8; pops.push({ x: it.x, y: it.y, text: '-2', color: '#9aa5b8', life: 1 }); }
        scoreEl.textContent = score;
        return false;
      }
      return it.y < H + 40;
    });

    pops = pops.filter((p) => { p.y -= 1.2 * step; p.life -= dt * 1.4; return p.life > 0; });
    if (flash > 0) flash -= dt;

    timeLeft -= dt;
    timeEl.textContent = Math.max(0, Math.ceil(timeLeft));
    if (timeLeft <= 0) end();
  }

  function loop(t) {
    if (!running) return;
    const dt = Math.min((t - lastTime) / 1000, 0.05);
    lastTime = t;
    update(dt);
    draw();
    if (running) requestAnimationFrame(loop);
  }

  function start() {
    items = [];
    pops = [];
    score = 0;
    timeLeft = ROUND;
    spawnTimer = 0;
    flash = 0;
    skye.x = W / 2;
    scoreEl.textContent = '0';
    timeEl.textContent = ROUND;
    overlay.hidden = true;
    running = true;
    canvas.focus({ preventScroll: true });
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function end() {
    running = false;
    draw();
    let title = 'Great job!';
    if (score > best) {
      best = score;
      bestEl.textContent = best;
      try { localStorage.setItem('skye-best', String(best)); } catch (e) { /* storage blocked */ }
      title = 'New record! 🏆';
      const r = canvas.getBoundingClientRect();
      if (window.skyeBurst) window.skyeBurst(r.left + r.width / 2, r.top + r.height / 2);
    } else if (score >= 25) {
      title = 'Superstar! 🌟';
    }
    overlayTitle.textContent = title;
    overlayText.textContent = `Skye caught ${score} star point${score === 1 ? '' : 's'}!`;
    startBtn.textContent = '↻ Play again';
    overlay.hidden = false;
    startBtn.focus({ preventScroll: true });
  }

  startBtn.addEventListener('click', start);

  // Keyboard
  canvas.tabIndex = 0;
  window.addEventListener('keydown', (e) => {
    if (!running) return;
    if (e.key === 'ArrowLeft' || e.key === 'a') { keys.left = true; dragX = null; e.preventDefault(); }
    if (e.key === 'ArrowRight' || e.key === 'd') { keys.right = true; dragX = null; e.preventDefault(); }
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
  });

  // Mouse / touch drag
  function toCanvasX(clientX) {
    const r = canvas.getBoundingClientRect();
    return ((clientX - r.left) / r.width) * W;
  }
  canvas.addEventListener('pointerdown', (e) => { dragX = toCanvasX(e.clientX); canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse' || dragX !== null) dragX = toCanvasX(e.clientX);
  });
  canvas.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') dragX = null; });
  canvas.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') dragX = null; });

  // On-screen buttons for touch devices
  function hold(btn, dir) {
    const on = (e) => { e.preventDefault(); keys[dir] = true; dragX = null; };
    const off = () => { keys[dir] = false; };
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointerleave', off);
    btn.addEventListener('pointercancel', off);
  }
  hold(document.getElementById('padLeft'), 'left');
  hold(document.getElementById('padRight'), 'right');

  // Draw the idle scene behind the start screen
  sprite.onload = draw;
  document.addEventListener('themechange', () => { if (!running) draw(); });
  draw();
})();
