// Motion and interaction: scroll reveals, magnetic buttons, glass reflections,
// the sticky nav and the "how it works" progress line.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

export function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('is-in');
      io.unobserve(el);
      // Once shown, hand control back to the element's own hover transitions.
      el.addEventListener('transitionend', (ev) => {
        if (ev.target === el && ev.propertyName === 'transform') el.removeAttribute('data-reveal');
      });
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  items.forEach((el) => io.observe(el));
}

// Buttons drift a little toward the pointer, then settle back.
export function initMagnetic() {
  if (reduceMotion.matches || !finePointer.matches) return;
  document.addEventListener('pointermove', (e) => {
    const el = e.target.closest?.('[data-magnetic]');
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / r.width;
    const y = (e.clientY - (r.top + r.height / 2)) / r.height;
    el.style.setProperty('--tx', `${(x * 10).toFixed(1)}px`);
    el.style.setProperty('--ty', `${(y * 8).toFixed(1)}px`);
  });
  document.addEventListener('pointerout', (e) => {
    const el = e.target.closest?.('[data-magnetic]');
    if (el && !el.contains(e.relatedTarget)) {
      el.style.setProperty('--tx', '0px');
      el.style.setProperty('--ty', '0px');
    }
  });
}

// A soft highlight that follows the pointer across glass panels.
export function initSheen() {
  if (!finePointer.matches) return;
  document.addEventListener('pointermove', (e) => {
    const el = e.target.closest?.('[data-sheen]');
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });
}

export function initNav() {
  const nav = document.querySelector('[data-nav]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const links = document.querySelector('[data-nav-links]');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
}

// Fills the line behind the steps as the section scrolls past.
export function initStepLine() {
  const list = document.querySelector('[data-steps]');
  if (!list) return;
  const update = () => {
    const r = list.getBoundingClientRect();
    const start = window.innerHeight * 0.75;
    const p = Math.min(1, Math.max(0, (start - r.top) / r.height));
    list.style.setProperty('--progress', p.toFixed(3));
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

export function initPricingToggle() {
  const toggle = document.querySelector('[data-billing]');
  if (!toggle) return;
  toggle.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-period]');
    if (!btn) return;
    const period = btn.dataset.period;
    toggle.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    toggle.dataset.period = period;
    document.querySelectorAll('[data-price]').forEach((el) => {
      el.textContent = `£${el.dataset[period]}`;
      el.classList.remove('is-ticking');
      void el.offsetWidth; // restart the animation
      el.classList.add('is-ticking');
    });
    document.querySelectorAll('[data-billing-note]').forEach((el) => {
      el.textContent = period === 'yearly' ? 'billed yearly' : 'billed monthly';
    });
  });
}

// Only one FAQ open at a time. `name` on <details> does this natively; this covers older browsers.
export function initFaq() {
  const items = document.querySelectorAll('.faq');
  items.forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) items.forEach((o) => { if (o !== d) o.open = false; });
  }));
}
