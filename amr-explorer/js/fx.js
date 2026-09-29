// Cursor-tracking and scroll effects. Everything here is decoration:
// the page is complete without it, and it switches off for touch
// devices and for people who prefer reduced motion.

const finePointer = matchMedia("(pointer: fine)");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const motionOK = () => !reduceMotion.matches;
const lerp = (a, b, t) => a + (b - a) * t;

export function initFx() {
  spotlight();
  tilt();
  cursorOrb();
  parallax();
  scrollProgress();
}

/** Glass sheen: `.fx-glow` elements get --mx/--my at the pointer position. */
function spotlight() {
  let target = null;
  document.addEventListener("pointermove", (e) => {
    const el = e.target.closest?.(".fx-glow");
    if (target && target !== el) target.classList.remove("is-lit");
    target = el;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
    el.classList.add("is-lit");
  }, { passive: true });
  document.addEventListener("pointerleave", () => target?.classList.remove("is-lit"));
}

/** Gentle 3D tilt toward the pointer for `.fx-tilt` cards. */
function tilt() {
  document.addEventListener("pointermove", (e) => {
    if (!finePointer.matches || !motionOK()) return;
    const el = e.target.closest?.(".fx-tilt");
    if (!el || el.classList.contains("no-tilt")) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-py * 3).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(px * 4).toFixed(2)}deg`);
    el.classList.add("is-tilting");
    el.onpointerleave = () => {
      el.classList.remove("is-tilting");
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
  }, { passive: true });
}

/** A small glass lens that trails the cursor and swells over anything clickable. */
function cursorOrb() {
  const orb = document.getElementById("cursor-orb");
  if (!orb) return;
  let x = -100, y = -100, tx = -100, ty = -100, raf = 0, visible = false;
  const INTERACTIVE = "a, button, select, input, label, [role='radio'], .has-data, .dot, .bar-row, .heat-cell, .dot-point, [data-orb]";

  function frame() {
    x = lerp(x, tx, 0.18);
    y = lerp(y, ty, 0.18);
    orb.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    raf = Math.abs(x - tx) + Math.abs(y - ty) > 0.3 ? requestAnimationFrame(frame) : 0;
  }
  document.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || !finePointer.matches || !motionOK()) {
      if (visible) { orb.classList.remove("is-visible"); visible = false; }
      return;
    }
    tx = e.clientX;
    ty = e.clientY;
    if (!visible) { x = tx; y = ty; orb.classList.add("is-visible"); visible = true; }
    orb.classList.toggle("is-hover", !!e.target.closest?.(INTERACTIVE));
    orb.classList.toggle("is-text", !!e.target.closest?.("input[type='search'], p, h1, h2, h3") && !e.target.closest?.(INTERACTIVE));
    if (!raf) raf = requestAnimationFrame(frame);
  }, { passive: true });
  document.addEventListener("pointerdown", () => orb.classList.add("is-down"));
  document.addEventListener("pointerup", () => orb.classList.remove("is-down"));
  document.documentElement.addEventListener("pointerleave", () => { orb.classList.remove("is-visible"); visible = false; });
}

/** Layers inside `[data-parallax]` drift with the pointer (depth via --depth). */
function parallax() {
  for (const zone of document.querySelectorAll("[data-parallax]")) {
    let px = 0, py = 0, tx = 0, ty = 0, raf = 0;
    const frame = () => {
      px = lerp(px, tx, 0.08);
      py = lerp(py, ty, 0.08);
      zone.style.setProperty("--px", px.toFixed(3));
      zone.style.setProperty("--py", py.toFixed(3));
      raf = Math.abs(px - tx) + Math.abs(py - ty) > 0.001 ? requestAnimationFrame(frame) : 0;
    };
    zone.addEventListener("pointermove", (e) => {
      if (!finePointer.matches || !motionOK()) return;
      const r = zone.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      zone.style.setProperty("--sx", `${e.clientX - r.left}px`);
      zone.style.setProperty("--sy", `${e.clientY - r.top}px`);
      if (!raf) raf = requestAnimationFrame(frame);
    });
    zone.addEventListener("pointerleave", () => {
      tx = 0;
      ty = 0;
      if (!raf) raf = requestAnimationFrame(frame);
    });
  }
}

/** Reading-progress bar. CSS scroll timelines drive it where supported; JS elsewhere. */
function scrollProgress() {
  if (CSS.supports?.("animation-timeline: scroll()")) return;
  const bar = document.getElementById("scroll-progress");
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
  update();
}
