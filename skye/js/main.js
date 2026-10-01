// Theme (day / night sky), Skye's speech bubble and sparkle words.
(function () {
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage blocked */ }
  }
  function read(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function setTheme(theme) {
    root.dataset.theme = theme;
    const night = theme === 'dark';
    toggle.setAttribute('aria-pressed', String(night));
    toggle.setAttribute('aria-label', night ? 'Switch to daytime sky' : 'Switch to night sky');
    document.dispatchEvent(new CustomEvent('themechange'));
  }

  const saved = read('skye-theme');
  const prefersNight = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(saved || (prefersNight ? 'dark' : 'light'));

  toggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    store('skye-theme', next);
  });

  // ---- Little bursts of hearts and stars ----
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.skyeBurst = function (x, y, symbols) {
    if (reduceMotion) return;
    const set = symbols || ['💛', '⭐', '✨', '💖', '🌟'];
    for (let i = 0; i < 10; i++) {
      const el = document.createElement('span');
      el.className = 'burst';
      el.textContent = set[i % set.length];
      const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.5;
      const dist = 70 + Math.random() * 70;
      el.style.left = x - 14 + 'px';
      el.style.top = y - 14 + 'px';
      el.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      el.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      el.style.setProperty('--r', (Math.random() * 120 - 60) + 'deg');
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1000);
    }
  };

  // ---- Say hi to Skye ----
  const greetings = [
    "Hi! I'm Skye! 👋",
    'Do you like my curls? 🌀',
    'Yellow is my favourite! 💛',
    "Let's catch some stars! ⭐",
    'Wanna draw with me? 🎨',
    'You make me smile! 😊',
    'Boing boing! 🐰',
    "I'm as big as the sky! ☁️",
    'High five! ✋',
    'Dance party! 💃🏾'
  ];
  let g = 0;
  const skyeBtn = document.getElementById('skyeBtn');
  const bubble = document.getElementById('bubble');

  skyeBtn.addEventListener('click', (e) => {
    g = (g + 1) % greetings.length;
    bubble.textContent = greetings[g];
    bubble.style.animation = 'none';
    void bubble.offsetWidth;
    bubble.style.animation = '';
    skyeBtn.classList.remove('jump');
    void skyeBtn.offsetWidth;
    skyeBtn.classList.add('jump');
    const r = skyeBtn.getBoundingClientRect();
    const x = e.clientX || r.left + r.width / 2;
    const y = e.clientY || r.top + r.height / 3;
    window.skyeBurst(x, y);
  });

  // ---- Sparkle words ----
  const words = [
    'You are amazing!', 'You are so kind!', 'You are super brave!', 'You are a superstar!',
    'You are clever!', 'You are loved!', 'You can do anything!', 'Your smile is sunshine!',
    'You are a great friend!', 'You are one of a kind!', 'Your curls are magic!', 'You shine so bright!'
  ];
  const wordEl = document.getElementById('sparkleWord');
  const sparkleBtn = document.getElementById('sparkleBtn');
  let last = 0;
  sparkleBtn.addEventListener('click', () => {
    let n;
    do { n = Math.floor(Math.random() * words.length); } while (n === last);
    last = n;
    wordEl.textContent = words[n];
    wordEl.classList.remove('pop');
    void wordEl.offsetWidth;
    wordEl.classList.add('pop');
    const r = sparkleBtn.getBoundingClientRect();
    window.skyeBurst(r.left + r.width / 2, r.top, ['✨', '🌟', '💫']);
  });
})();
