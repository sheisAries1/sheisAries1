// Shared chrome: toast messages, slide-out drawers (cart + menu) and the theme toggle.

let toastTimer;
export function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

let openId = null;
let lastFocus = null;

export function openDrawer(id) {
  if (openId === id) return;
  if (openId) closeDrawer({ restore: false });
  const d = document.getElementById(id);
  lastFocus = document.activeElement;
  openId = id;
  d.hidden = false;
  // Only animate in if nothing closed it before the next frame.
  requestAnimationFrame(() => openId === id && d.classList.add('open'));
  document.body.classList.add('locked');
  document.querySelector(`[aria-controls="${id}"]`)?.setAttribute('aria-expanded', 'true');
  d.querySelector('.drawer-close').focus();
}

export function closeDrawer({ restore = true } = {}) {
  if (!openId) return;
  const d = document.getElementById(openId);
  document.querySelector(`[aria-controls="${openId}"]`)?.setAttribute('aria-expanded', 'false');
  openId = null;
  d.classList.remove('open');
  document.body.classList.remove('locked');
  setTimeout(() => { if (!d.classList.contains('open')) d.hidden = true; }, 250);
  if (restore) lastFocus?.focus?.();
}

export const openCart = () => openDrawer('cartDrawer');

export function initDrawers() {
  // Any route change (links, back/forward) closes an open drawer.
  addEventListener('hashchange', () => closeDrawer({ restore: false }));
  document.querySelectorAll('.drawer').forEach((d) =>
    d.addEventListener('click', (e) => {
      if (e.target === d || e.target.closest('.drawer-close')) closeDrawer();
      else if (e.target.closest('a[href]')) closeDrawer({ restore: false });
    })
  );
  addEventListener('keydown', (e) => {
    if (!openId) return;
    const d = document.getElementById(openId);
    if (e.key === 'Escape') closeDrawer();
    if (e.key === 'Tab') {
      const f = [...d.querySelectorAll('a[href], button:not([disabled])')];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

export function initTheme() {
  const btn = document.getElementById('themeToggle');
  let saved = null;
  try { saved = localStorage.getItem('pb-theme'); } catch { /* ignore */ }
  const apply = (t) => {
    if (t) document.documentElement.dataset.theme = t;
    const dark = t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    btn.setAttribute('aria-pressed', String(dark));
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  };
  apply(saved);
  btn.addEventListener('click', () => {
    const next = btn.getAttribute('aria-pressed') === 'true' ? 'light' : 'dark';
    try { localStorage.setItem('pb-theme', next); } catch { /* ignore */ }
    apply(next);
  });
}
