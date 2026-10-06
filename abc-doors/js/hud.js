// 2D overlay drawn on a 1080x1920 canvas and composited over the 3D frame:
// word labels, scene wipes, the goodbye card and the logo.

const RAINBOW = ['#ff3b5c', '#ff8a1f', '#ffc61f', '#22b55a', '#2f7cf6', '#a45bff'];
const FONT = '"Fredoka", "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';

export function createHud(W, H, waveImg) {
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  function outlinedText(txt, x, y, size, fill, o = {}) {
    ctx.font = `700 ${size}px ${FONT}`;
    ctx.textAlign = o.align ?? 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.save();
    ctx.shadowColor = 'rgba(60, 20, 80, 0.35)';
    ctx.shadowOffsetY = size * 0.08;
    ctx.shadowBlur = size * 0.12;
    ctx.lineWidth = size * 0.2;
    ctx.strokeStyle = o.stroke ?? '#ffffff';
    ctx.strokeText(txt, x, y);
    ctx.restore();
    ctx.fillStyle = fill;
    ctx.fillText(txt, x, y);
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // "A - APPLE": big coloured letter, rainbow word, bouncy entrance.
  function label(letter, word, color, k, t) {
    if (k <= 0) return;
    const cx = W / 2, cy = 250;
    ctx.save();
    ctx.translate(cx, cy + (1 - Math.min(1, k)) * -60);
    ctx.scale(k, k);
    ctx.rotate(Math.sin(t * 2.2) * 0.02);
    const size = word.length > 6 ? 118 : 136;
    ctx.font = `700 ${size}px ${FONT}`;
    const parts = [letter, ' - ', ...word.split('')];
    const widths = parts.map((p) => ctx.measureText(p).width);
    const total = widths.reduce((a, b) => a + b, 0);
    const pw = total + 110, ph = size * 1.45;
    ctx.save();
    ctx.shadowColor = 'rgba(80, 30, 120, 0.25)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    roundRect(-pw / 2, -ph / 2, pw, ph, ph / 2);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fill();
    ctx.restore();
    ctx.lineWidth = 10; ctx.strokeStyle = color;
    roundRect(-pw / 2, -ph / 2, pw, ph, ph / 2); ctx.stroke();
    let x = -total / 2;
    parts.forEach((p, i) => {
      const fill = i === 0 ? color : i === 1 ? '#8a7aa8' : RAINBOW[(i - 2) % RAINBOW.length];
      const bob = i >= 2 ? Math.sin(t * 5 - i * 0.6) * 8 : 0;
      outlinedText(p, x + widths[i] / 2, bob + 6, size, fill, { stroke: i === 0 ? '#ffffff' : '#ffffff' });
      x += widths[i];
    });
    ctx.restore();
  }

  // Bubble wipe: a candy-coloured disc that grows to cover the frame (cover 0→1) then shrinks away.
  function wipe(cover, color) {
    if (cover <= 0) return;
    const maxR = Math.hypot(W, H) / 2 + 40;
    const r = maxR * cover;
    ctx.save();
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let y = 0; y < H; y += 120) for (let x = (y / 120) % 2 ? 60 : 0; x < W; x += 120) {
      ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
    ctx.lineWidth = 26; ctx.strokeStyle = '#ffffff'; ctx.stroke();
  }

  function logo(cx, cy, s) {
    ctx.save();
    ctx.translate(cx, cy); ctx.scale(s, s);
    ctx.save();
    ctx.shadowColor = 'rgba(80, 30, 120, 0.25)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
    roundRect(-330, -95, 660, 190, 60); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.restore();
    const blocks = [['A', '#ff3b5c', -0.12], ['B', '#2f7cf6', 0.06], ['C', '#22b55a', -0.05]];
    blocks.forEach(([l, c, rot], i) => {
      ctx.save();
      ctx.translate(-250 + i * 82, -2);
      ctx.rotate(rot);
      roundRect(-36, -36, 72, 72, 16); ctx.fillStyle = c; ctx.fill();
      ctx.font = `700 54px ${FONT}`; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(l, 0, 3);
      ctx.restore();
    });
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.font = `700 58px ${FONT}`; ctx.fillStyle = '#6b3fd1';
    ctx.fillText('Little', -5, -30);
    ctx.fillStyle = '#ff5aa5';
    ctx.fillText('Learners', -5, 32);
    ctx.restore();
  }

  function bye(k, t) {
    if (k <= 0) return;
    const word = 'Bye-Bye';
    ctx.save();
    ctx.translate(W / 2 - 70, 330);
    ctx.scale(k, k);
    const size = 172;
    ctx.font = `700 ${size}px ${FONT}`;
    const widths = word.split('').map((c) => ctx.measureText(c).width);
    const total = widths.reduce((a, b) => a + b, 0);
    let x = -total / 2;
    word.split('').forEach((c, i) => {
      const bob = Math.sin(t * 5 - i * 0.7) * 16;
      outlinedText(c, x + widths[i] / 2, bob, size, RAINBOW[i % RAINBOW.length]);
      x += widths[i];
    });
    if (waveImg) {
      ctx.save();
      ctx.translate(total / 2 + 105, 0);
      ctx.rotate(Math.sin(t * 8) * 0.35);
      ctx.drawImage(waveImg, -80, -80, 160, 160);
      ctx.restore();
    }
    ctx.restore();
  }

  return {
    canvas,
    draw(state) {
      ctx.clearRect(0, 0, W, H);
      if (state.label) label(state.label.letter, state.label.word, state.label.color, state.label.k, state.t);
      if (state.bye !== undefined) { bye(state.bye, state.t); logo(W / 2, H - 250, 1.3 * Math.min(1, state.logo ?? 0)); }
      if (state.wipe) wipe(state.wipe.cover, state.wipe.color);
    },
  };
}
