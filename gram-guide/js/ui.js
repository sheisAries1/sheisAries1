// Page chrome: theme, navigation, reveal-on-scroll, counters, toast and
// the drifting microscope field in the hero.

const $ = (s) => document.querySelector(s);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

export function initTheme() {
  const root = document.documentElement;
  $("#theme-toggle").addEventListener("click", () => {
    const dark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("gg-theme", root.dataset.theme); } catch {}
  });
}

export function initNav() {
  const nav = $(".nav");
  const menu = $("#menu-toggle");
  const links = $("#nav-links");

  menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", open);
    nav.classList.toggle("is-open", open);
  });
  links.addEventListener("click", (e) => {
    if (!e.target.closest("a")) return;
    menu.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  });

  addEventListener("scroll", () => nav.classList.toggle("is-scrolled", scrollY > 12), { passive: true });

  // Highlight the section in view.
  const map = new Map([...links.querySelectorAll("a")].map((a) => [a.hash.slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      map.forEach((a) => a.classList.remove("is-active"));
      map.get(e.target.id)?.classList.add("is-active");
    }
  }, { rootMargin: "-45% 0px -50% 0px" });
  map.forEach((_, id) => io.observe(document.getElementById(id)));
}

export function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) return els.forEach((el) => el.classList.add("is-in"));
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    }
  }, { threshold: 0.12 });
  els.forEach((el) => io.observe(el));
}

export function countUp(el, to) {
  if (reduceMotion.matches) return (el.textContent = to);
  const t0 = performance.now();
  const dur = 1100;
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / dur);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

let toastTimer;
export function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("is-on"), 1800);
}

/** Fill the hero "microscope" with slowly drifting cells. */
export function initScope() {
  const field = $("#scope-field");
  // Small seeded PRNG so the field looks the same on every visit.
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  const cells = [];
  const add = (x, y, svg, gram) => {
    const d = 9 + rnd() * 9;
    cells.push(`<span class="cell cell--${gram}" style="left:${x}%;top:${y}%;--r:${Math.round(rnd() * 360)}deg;--dx:${(rnd() * 24 - 12).toFixed(1)}px;--dy:${(rnd() * 24 - 12).toFixed(1)}px;--d:${d.toFixed(1)}s;--delay:${(-rnd() * d).toFixed(1)}s">${svg}</span>`);
  };

  const cluster = '<svg viewBox="0 0 40 40"><circle cx="14" cy="14" r="6"/><circle cx="25" cy="12" r="6"/><circle cx="20" cy="22" r="6"/><circle cx="30" cy="23" r="5.5"/><circle cx="11" cy="26" r="5.5"/></svg>';
  const chain = '<svg viewBox="0 0 60 20"><circle cx="8" cy="10" r="5"/><circle cx="19" cy="9" r="5"/><circle cx="30" cy="10" r="5"/><circle cx="41" cy="11" r="5"/><circle cx="52" cy="10" r="5"/></svg>';
  const rod = '<svg viewBox="0 0 40 14"><rect x="2" y="2" width="36" height="10" rx="5"/></svg>';
  const diplo = '<svg viewBox="0 0 30 16"><ellipse cx="9" cy="8" rx="7" ry="6"/><ellipse cx="21" cy="8" rx="7" ry="6"/></svg>';
  const comma = '<svg viewBox="0 0 34 18"><path d="M4 14q13-16 26 0" fill="none" stroke-width="6" stroke-linecap="round"/></svg>';

  for (let i = 0; i < 26; i++) {
    const x = 6 + rnd() * 84;
    const y = 6 + rnd() * 84;
    // Keep things roughly inside the circle.
    if ((x - 50) ** 2 + (y - 50) ** 2 > 42 ** 2) { i--; continue; }
    const pos = x < 50 ? rnd() < 0.75 : rnd() < 0.25;
    const shape = pos ? [cluster, chain, rod][Math.floor(rnd() * 3)] : [rod, rod, diplo, comma][Math.floor(rnd() * 4)];
    add(x, y, shape, pos ? "pos" : "neg");
  }
  field.innerHTML = cells.join("");
}
