// Motion: scroll reveals, magnetic buttons, and tilt + light reflection on glass panels.
// Everything is skipped for people who prefer reduced motion, and the pointer effects
// only run on devices with a fine pointer (mouse or trackpad).

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

let observer;

function reveal(root) {
  const items = root.querySelectorAll('[data-reveal]');
  if (reduced.matches || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  observer?.disconnect();
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  items.forEach((el) => observer.observe(el));
}

// Buttons drift a few pixels toward the cursor, then settle back.
function magnetic(el) {
  const strength = 0.28;
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * strength;
    const y = (e.clientY - r.top - r.height / 2) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
}

// Panels tilt slightly and a soft highlight follows the cursor across the glass.
function tilt(el) {
  const panel = el.closest('.glass') || el;
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${(0.5 - py) * 6}deg`);
    el.style.setProperty('--ry', `${(px - 0.5) * 8}deg`);
    panel.style.setProperty('--mx', `${px * 100}%`);
    panel.style.setProperty('--my', `${py * 100}%`);
  });
  el.addEventListener('pointerleave', () => {
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  });
}

// Light reflection for every glass panel, without tilting.
function sheen(el) {
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  });
}

export function enhance(root = document) {
  reveal(root);
  if (reduced.matches || !finePointer.matches) return;
  root.querySelectorAll('[data-magnetic]').forEach(magnetic);
  root.querySelectorAll('[data-tilt]').forEach(tilt);
  root.querySelectorAll('.glass:has(> .glass__sheen)').forEach((el) => {
    if (!el.querySelector(':scope > [data-tilt]') && !el.matches('[data-tilt]')) sheen(el);
  });
}
