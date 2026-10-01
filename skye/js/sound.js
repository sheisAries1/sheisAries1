// Sound effects and a little background tune, made with the Web Audio API (no audio files).
(function () {
  let ctx = null;
  let master = null;
  let musicTimer = null;
  let musicBus = null;
  let musicOn = false;

  let soundOn = true;
  try { soundOn = localStorage.getItem('skye-sound') !== 'off'; } catch (e) { /* storage blocked */ }

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // One note: frequency, start offset (s), length (s), wave shape, volume, optional slide-to frequency.
  function tone(freq, at, dur, type, vol, slideTo, out) {
    const a = audio();
    if (!a) return;
    const t = a.currentTime + (at || 0);
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol || 0.3, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(out || master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  function noise(at, dur, vol, from, to) {
    const a = audio();
    if (!a) return;
    const t = a.currentTime + (at || 0);
    const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = a.createBufferSource();
    src.buffer = buf;
    const filter = a.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(from, t);
    filter.frequency.exponentialRampToValueAtTime(to, t + dur);
    const gain = a.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(t);
  }

  const sounds = {
    boing() { tone(180, 0, 0.35, 'sine', 0.4, 520); tone(520, 0.12, 0.25, 'triangle', 0.15, 300); },
    giggle() { [880, 990, 880, 1046].forEach((f, i) => tone(f, i * 0.07, 0.09, 'triangle', 0.15)); },
    sparkle() { [1318, 1568, 2093, 2637].forEach((f, i) => tone(f, i * 0.06, 0.3, 'sine', 0.12)); },
    star() { tone(1046, 0, 0.12, 'triangle', 0.22); tone(1568, 0.06, 0.18, 'triangle', 0.18); },
    heart() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.06, 0.2, 'square', 0.07)); },
    rain() { tone(220, 0, 0.3, 'sawtooth', 0.12, 110); noise(0, 0.3, 0.15, 800, 300); },
    start() { [523, 659, 784].forEach((f, i) => tone(f, i * 0.1, 0.16, 'triangle', 0.2)); },
    end() { [784, 659, 523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.2, 'triangle', 0.18)); },
    record() { [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone(f, i * 0.09, 0.22, 'square', 0.08)); },
    pop() { tone(600, 0, 0.1, 'sine', 0.3, 1200); },
    click() { tone(900, 0, 0.05, 'triangle', 0.12); },
    whoosh() { noise(0, 0.45, 0.25, 300, 3000); },
    day() { [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.07, 0.2, 'sine', 0.15)); },
    night() { [1046, 784, 659, 523].forEach((f, i) => tone(f, i * 0.09, 0.3, 'sine', 0.12)); }
  };

  window.skyeSound = function (name) {
    if (!soundOn || !sounds[name]) return;
    try { sounds[name](); } catch (e) { /* audio unavailable */ }
  };

  // ---- Background tune: a gentle "Twinkle Twinkle" loop ----
  const C = 523, D = 587, E = 659, F = 698, G = 784, A = 880;
  const melody = [C, C, G, G, A, A, G, 0, F, F, E, E, D, D, C, 0,
                  G, G, F, F, E, E, D, 0, G, G, F, F, E, E, D, 0];
  const BEAT = 0.42;

  function playLoop() {
    melody.forEach((f, i) => {
      if (f) tone(f, i * BEAT, BEAT * 0.9, 'sine', 0.08, null, musicBus);
      if (i % 4 === 0) tone(f ? f / 2 : C / 2, i * BEAT, BEAT * 1.8, 'triangle', 0.05, null, musicBus);
    });
    musicTimer = setTimeout(playLoop, melody.length * BEAT * 1000);
  }

  function startMusic() {
    const a = audio();
    if (!a) return;
    musicBus = a.createGain();
    musicBus.connect(master);
    playLoop();
  }

  function stopMusic() {
    clearTimeout(musicTimer);
    musicTimer = null;
    if (musicBus) {
      // Fade out, then disconnect so notes already scheduled stay silent.
      const bus = musicBus;
      const t = ctx.currentTime;
      bus.gain.setValueAtTime(1, t);
      bus.gain.linearRampToValueAtTime(0.0001, t + 0.2);
      setTimeout(() => bus.disconnect(), 250);
      musicBus = null;
    }
  }

  // ---- Buttons ----
  const soundBtn = document.getElementById('soundToggle');
  const musicBtn = document.getElementById('musicToggle');

  function renderSound() {
    soundBtn.textContent = soundOn ? '🔊' : '🔇';
    soundBtn.setAttribute('aria-pressed', String(soundOn));
    soundBtn.setAttribute('aria-label', soundOn ? 'Turn sound effects off' : 'Turn sound effects on');
  }
  function renderMusic() {
    musicBtn.classList.toggle('playing', musicOn);
    musicBtn.setAttribute('aria-pressed', String(musicOn));
    musicBtn.setAttribute('aria-label', musicOn ? 'Stop the music' : 'Play music');
  }

  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    try { localStorage.setItem('skye-sound', soundOn ? 'on' : 'off'); } catch (e) { /* storage blocked */ }
    renderSound();
    window.skyeSound('pop');
  });

  musicBtn.addEventListener('click', () => {
    musicOn = !musicOn;
    if (musicOn) startMusic();
    else stopMusic();
    renderMusic();
  });

  renderSound();
  renderMusic();
})();
