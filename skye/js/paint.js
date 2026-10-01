// Sky Painter: a simple drawing pad with colours, brush sizes and stickers.
(function () {
  const canvas = document.getElementById('paintCanvas');
  const ctx = canvas.getContext('2d');
  const swatchBox = document.getElementById('swatches');
  const sfx = (name) => { if (window.skyeSound) window.skyeSound(name); };

  const colours = [
    ['#2b1d16', 'Black'], ['#ffd93d', 'Yellow'], ['#ff8a3d', 'Orange'], ['#ff5c5c', 'Red'], ['#ff6fa8', 'Pink'],
    ['#a78bfa', 'Purple'], ['#4ea8ff', 'Blue'], ['#4ade80', 'Green'], ['#8b5a3c', 'Brown'], ['#ffffff', 'Eraser (white)']
  ];

  let colour = colours[0][0];
  let size = 10;
  let stamp = null;
  let drawing = false;
  let last = null;

  function fillWhite() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  fillWhite();

  colours.forEach(([hex, name], i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch' + (i === 0 ? ' active' : '');
    b.style.background = hex;
    b.setAttribute('aria-label', name);
    b.addEventListener('click', () => {
      colour = hex;
      stamp = null;
      sfx('click');
      document.querySelectorAll('.swatch, .stamp').forEach((el) => el.classList.remove('active'));
      b.classList.add('active');
    });
    swatchBox.appendChild(b);
  });

  document.querySelectorAll('.size').forEach((b) => {
    b.addEventListener('click', () => {
      size = Number(b.dataset.size);
      sfx('click');
      document.querySelectorAll('.size').forEach((el) => el.classList.remove('active'));
      b.classList.add('active');
    });
  });

  document.querySelectorAll('.stamp').forEach((b) => {
    b.addEventListener('click', () => {
      const on = stamp !== b.dataset.stamp;
      stamp = on ? b.dataset.stamp : null;
      sfx('click');
      document.querySelectorAll('.stamp').forEach((el) => el.classList.remove('active'));
      if (on) b.classList.add('active');
    });
  });

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height
    };
  }

  canvas.addEventListener('pointerdown', (e) => {
    const p = pos(e);
    if (stamp) {
      ctx.font = `${size * 4 + 24}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stamp, p.x, p.y);
      sfx('pop');
      return;
    }
    drawing = true;
    last = p;
    canvas.setPointerCapture(e.pointerId);
    ctx.beginPath();
    ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = colour;
    ctx.fill();
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const p = pos(e);
    ctx.strokeStyle = colour;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
  });

  const stop = () => { drawing = false; };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);

  document.getElementById('clearBtn').addEventListener('click', () => {
    if (confirm('Clear your picture?')) { fillWhite(); sfx('whoosh'); }
  });

  document.getElementById('saveBtn').addEventListener('click', () => {
    const a = document.createElement('a');
    sfx('sparkle');
    a.download = 'skyes-drawing.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  });
})();
