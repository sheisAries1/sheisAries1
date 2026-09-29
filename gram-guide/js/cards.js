// Flashcard deck: flip, swipe, and remember which cards you know.

import { organisms, byId, routes } from "./data.js";
import { morphSVG } from "./draw.js";
import { toast } from "./ui.js";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

const STORE = "gg-known";
const state = {
  filter: "all",
  profileFirst: false,
  order: organisms.map((o) => o.id),
  i: 0,
  flipped: false,
  known: load(),
};

function load() {
  try { return new Set(JSON.parse(localStorage.getItem(STORE)) || []); } catch { return new Set(); }
}
function save() {
  try { localStorage.setItem(STORE, JSON.stringify([...state.known])); } catch {}
}

const flash = $("#flash");
const inner = $("#flash-inner");

function deck() {
  return state.order.filter((id) => {
    const o = byId[id];
    if (state.filter === "pos" || state.filter === "neg") return o.gram === state.filter;
    if (state.filter === "learning") return !state.known.has(id);
    return true;
  });
}

export function initCards() {
  $("#deck-filter").addEventListener("click", (e) => {
    const b = e.target.closest("[data-filter]");
    if (!b) return;
    for (const x of e.currentTarget.children) x.setAttribute("aria-checked", x === b);
    state.filter = b.dataset.filter;
    state.i = 0;
    show(0);
  });

  $("#deck-mode").addEventListener("click", (e) => {
    state.profileFirst = !state.profileFirst;
    e.currentTarget.setAttribute("aria-pressed", state.profileFirst);
    e.currentTarget.querySelector("span").textContent = state.profileFirst ? "Profile first" : "Name first";
    show(0);
  });

  $("#deck-shuffle").addEventListener("click", () => {
    const a = state.order;
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    state.i = 0;
    show(1);
    toast("Deck shuffled");
  });

  $("#deck-prev").addEventListener("click", () => step(-1));
  $("#deck-next").addEventListener("click", () => step(1));
  $("#deck-got").addEventListener("click", () => mark(true));
  $("#deck-again").addEventListener("click", () => mark(false));

  flash.addEventListener("click", () => {
    if (!swiped) flip();
  });

  document.addEventListener("keydown", (e) => {
    if (!inView() || e.target.closest("input, textarea, select")) return;
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key.toLowerCase() === "k") mark(true);
    else if (e.key === " " && e.target === document.body) { e.preventDefault(); flip(); }
  });

  swipe();

  document.addEventListener("gg:study", (e) => {
    const id = e.detail;
    state.filter = "all";
    for (const x of $("#deck-filter").children) x.setAttribute("aria-checked", x.dataset.filter === "all");
    state.i = Math.max(0, deck().indexOf(id));
    show(0);
    $("#flashcards").scrollIntoView({ behavior: "smooth" });
  });

  show(0);
}

function inView() {
  const r = $("#flashcards").getBoundingClientRect();
  return r.top < innerHeight * 0.6 && r.bottom > innerHeight * 0.4;
}

function flip() {
  if (!deck().length) return;
  state.flipped = !state.flipped;
  inner.classList.toggle("is-flipped", state.flipped);
}

function step(d) {
  const n = deck().length;
  if (!n) return;
  state.i = (state.i + d + n) % n;
  show(d);
}

function mark(known) {
  const d = deck();
  const id = d[state.i];
  if (!id) return;
  known ? state.known.add(id) : state.known.delete(id);
  save();
  toast(known ? `${byId[id].name} marked as known` : "Kept in your learning pile");
  // In the "still learning" pile a known card leaves the deck, so the
  // next card slides into the same index.
  if (state.filter === "learning" && known) {
    state.i = Math.min(state.i, Math.max(0, deck().length - 1));
    show(1);
  } else step(1);
}

function show(dir) {
  const d = deck();
  const empty = !d.length;
  $("#deck-empty").hidden = !empty;
  flash.hidden = empty;
  document.querySelectorAll(".card-shadow").forEach((s) => (s.hidden = empty || d.length < 2));
  $("#deck-pos").textContent = empty ? "0 / 0" : `${state.i + 1} / ${d.length}`;
  $("#deck-bar").style.transform = `scaleX(${empty ? 0 : (state.i + 1) / d.length})`;
  $("#deck-known").textContent = state.known.size;
  if (empty) return;

  const o = byId[d[state.i]];
  const paint = () => {
    state.flipped = false;
    inner.classList.remove("is-flipped");
    const [front, back] = state.profileFirst ? [profileFace(o), nameFace(o, true)] : [nameFace(o), detailFace(o)];
    $("#flash-front").innerHTML = front;
    $("#flash-back").innerHTML = back;
    flash.setAttribute("aria-label", `Flashcard ${state.i + 1} of ${d.length}. Press to flip.`);
    flash.dataset.known = state.known.has(o.id);
  };

  if (!dir || reduceMotion.matches) return paint();
  const out = flash.animate(
    [{ transform: "none", opacity: 1 }, { transform: `translateX(${-dir * 60}px) rotate(${-dir * 4}deg)`, opacity: 0 }],
    { duration: 170, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" }
  );
  out.onfinish = () => {
    paint();
    out.cancel();
    flash.animate(
      [{ transform: `translateX(${dir * 60}px) rotate(${dir * 4}deg)`, opacity: 0 }, { transform: "none", opacity: 1 }],
      { duration: 320, easing: "cubic-bezier(.2,.8,.2,1.1)" }
    );
  };
}

const gramBadge = (o) => `<span class="badge badge--${o.gram}">Gram-${o.gram === "pos" ? "positive" : "negative"}</span>`;

function nameFace(o, answer = false) {
  return `
    <span class="face__top">${gramBadge(o)}<span class="face__genus">${esc(o.genus)}</span></span>
    <span class="face__art">${morphSVG(o)}</span>
    <span class="face__name"><i>${esc(o.name)}</i></span>
    ${o.alias ? `<span class="face__alias">${esc(o.alias)}</span>` : ""}
    ${answer
      ? `<span class="face__tip">${esc(o.tip)}</span>`
      : `<span class="face__hint">Tap to see the profile</span>`}`;
}

function detailFace(o) {
  const rows = Object.entries(o.tests).slice(0, 6)
    .map(([k, v]) => `<span class="kv"><span>${esc(k)}</span><b>${esc(v)}</b></span>`).join("");
  return `
    <span class="face__top">${gramBadge(o)}<span class="face__genus">${esc(o.arrangement)}</span></span>
    <span class="kvs">${rows}</span>
    <span class="face__clin">${esc(o.clinical)}</span>
    <span class="face__tip">${esc(o.tip)}</span>`;
}

function profileFace(o) {
  return `
    <span class="face__top"><span class="face__genus">Which organism is…</span></span>
    <span class="face__art face__art--sm">${morphSVG(o)}</span>
    <span class="facts">${routes[o.id].map((r) => `<span class="fact"><small>${esc(r.step)}</small>${esc(r.fact)}</span>`).join("")}</span>
    <span class="face__hint">Tap to reveal</span>`;
}

// Drag the card sideways to move through the deck. A short tap still flips.
let swiped = false;
function swipe() {
  let x0 = null;
  let id = null;
  flash.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    x0 = e.clientX;
    id = e.pointerId;
  });
  flash.addEventListener("pointermove", (e) => {
    if (x0 === null || e.pointerId !== id) return;
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 6) flash.style.transform = `translateX(${dx * 0.6}px) rotate(${dx * 0.03}deg)`;
  });
  const end = (e) => {
    if (x0 === null || e.pointerId !== id) return;
    const dx = e.clientX - x0;
    x0 = null;
    flash.style.transform = "";
    if (Math.abs(dx) > 60) {
      swiped = true;
      setTimeout(() => (swiped = false), 60);
      step(dx < 0 ? 1 : -1);
    }
  };
  flash.addEventListener("pointerup", end);
  flash.addEventListener("pointercancel", end);
}
