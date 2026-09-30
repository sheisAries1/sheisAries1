// The interactive identification key.

import { key, organisms, byId, leavesOf, routes } from "./data.js";
import { morphSVG, iconSVG } from "./draw.js";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

let path = []; // [{ node, opt }]
let autoplay = null;

const stage = $("#key-stage");
const trail = $("#trail");
const pool = $("#pool");

export function initKey() {
  pool.innerHTML = organisms
    .map((o) => `<li><button type="button" class="pool__item" data-id="${o.id}" title="Show the route to ${esc(o.name)}">
      <i class="dot dot--${o.gram}"></i><span>${esc(o.name)}</span></button></li>`)
    .join("");

  pool.addEventListener("click", (e) => {
    const b = e.target.closest(".pool__item");
    if (b) walkTo(b.dataset.id);
  });

  trail.addEventListener("click", (e) => {
    const b = e.target.closest("[data-back]");
    if (!b) return;
    stopAutoplay();
    path = path.slice(0, +b.dataset.back);
    render(-1);
  });

  stage.addEventListener("click", (e) => {
    const opt = e.target.closest("[data-opt]");
    if (opt) {
      stopAutoplay();
      choose(+opt.dataset.opt);
      return;
    }
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (act === "restart") { stopAutoplay(); path = []; render(-1); }
    if (act === "back") { stopAutoplay(); path.pop(); render(-1); }
    if (act === "study") document.dispatchEvent(new CustomEvent("gg:study", { detail: currentLeaf() }));
  });

  render(0);
}

const currentNode = () => (path.length ? path[path.length - 1].opt.next : key);
const currentLeaf = () => path[path.length - 1]?.opt.id;

function choose(i) {
  const node = currentNode();
  path.push({ node, opt: node.options[i] });
  render(1);
}

/** Replays the route to an organism, one step at a time. */
function walkTo(id) {
  stopAutoplay();
  const route = routes[id];
  path = [];
  render(-1);
  let i = 0;
  const tick = () => {
    if (i >= route.length) return (autoplay = null);
    path.push({ node: route[i].node, opt: route[i].opt });
    i++;
    render(1);
    autoplay = setTimeout(tick, 520);
  };
  autoplay = setTimeout(tick, 380);
  document.querySelector("#identify").scrollIntoView({ behavior: "smooth", block: "start" });
}

function stopAutoplay() {
  clearTimeout(autoplay);
  autoplay = null;
}

function render(dir) {
  const leaf = currentLeaf();
  const alive = new Set(leaf ? [leaf] : leavesOf(currentNode()));

  // Trail of answers
  trail.innerHTML = path.length
    ? path.map((p, i) => `<li><button type="button" data-back="${i}" aria-label="Go back to ${esc(p.node.step)}">
        <small>${esc(p.node.step)}</small>${esc(p.opt.label)}</button></li>`).join("")
    : `<li class="trail__empty">Your answers will line up here</li>`;

  // Candidate pool
  for (const b of pool.querySelectorAll(".pool__item")) {
    const on = alive.has(b.dataset.id);
    b.classList.toggle("is-out", !on);
    b.classList.toggle("is-match", !!leaf && on);
  }
  const first = pool.querySelector(".pool__item:not(.is-out)");
  if (first) pool.scrollTo({ top: first.offsetTop - pool.offsetTop - 4, behavior: "smooth" });
  $("#pool-count").textContent = alive.size;
  $("#pool-meter").style.transform = `scaleX(${alive.size / organisms.length})`;

  const html = leaf ? resultHTML(byId[leaf]) : questionHTML(currentNode());
  const el = document.createElement("div");
  el.className = "stage-pane";
  el.innerHTML = html;
  el.dataset.dir = dir;
  stage.replaceChildren(el);
}

function questionHTML(node) {
  const n = path.length + 1;
  return `
    <div class="q__meta"><span class="q__step">Step ${n}</span><span class="q__name">${esc(node.step)}</span></div>
    <h3 class="q__title">${esc(node.question)}</h3>
    <p class="q__how"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>${esc(node.how)}</p>
    <div class="opts opts--${node.options.length}">
      ${node.options.map((o, i) => {
        const left = o.id ? 1 : leavesOf(o.next).length;
        const mark = o.swatch
          ? `<span class="opt__swatch" style="--sw:${o.swatch}"></span>`
          : `<span class="opt__icon">${iconSVG(o.icon)}</span>`;
        return `<button type="button" class="opt" data-opt="${i}" style="--i:${i}">
          ${mark}
          <span class="opt__text"><b>${esc(o.label)}</b><small>${esc(o.sub)}</small></span>
          <span class="opt__left">${left === 1 ? "1 match" : `${left} left`}</span>
        </button>`;
      }).join("")}
    </div>
    ${path.length ? `<button type="button" class="link-btn" data-act="back">← Undo last answer</button>` : ""}`;
}

function resultHTML(o) {
  const tests = Object.entries(o.tests)
    .map(([k, v]) => `<li><span>${esc(k)}</span><b class="${/^\+|^Grows|^Sens|^Sol/.test(v) ? "pos" : /^−|^Res|^No/.test(v) ? "neg" : ""}">${esc(v)}</b></li>`)
    .join("");
  return `
    <div class="result">
      <div class="result__top">
        <div class="result__art">${morphSVG(o)}</div>
        <div>
          <p class="result__kicker">Identified in ${path.length} steps</p>
          <h3 class="result__name"><i>${esc(o.name)}</i></h3>
          <p class="result__alias">
            <span class="badge badge--${o.gram}">Gram-${o.gram === "pos" ? "positive" : "negative"}</span>
            ${o.alias ? `<span>${esc(o.alias)}</span>` : ""}
          </p>
        </div>
      </div>
      <p class="result__arr"><b>Microscopy:</b> ${esc(o.arrangement)}. <b>Culture:</b> ${esc(o.colony)}</p>
      <ul class="result__tests">${tests}</ul>
      <p class="result__clin">${esc(o.clinical)}</p>
      <p class="result__tip"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z"/></svg>${esc(o.tip)}</p>
      <div class="result__actions">
        <button type="button" class="btn btn--primary" data-act="restart">Identify another</button>
        <button type="button" class="btn btn--ghost" data-act="study">Study this card</button>
        <button type="button" class="link-btn" data-act="back">← Undo last answer</button>
      </div>
    </div>`;
}
