// Ten-round quiz built from the identification key. Wrong options are
// picked from close relatives, so the answer can't be guessed from the
// Gram stain alone.

import { organisms, byId, routes } from "./data.js";
import { morphSVG } from "./draw.js";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const ROUNDS = 10;
const box = document.querySelector("#quiz-box");

let q = null;

export function initQuiz() {
  box.addEventListener("click", (e) => {
    const pick = e.target.closest("[data-pick]");
    if (pick && !q.answered) return answer(pick.dataset.pick);
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (act === "next") next();
    if (act === "start") start();
  });
  intro();
}

function intro() {
  box.innerHTML = `
    <div class="quiz__intro">
      <div class="quiz__stack" aria-hidden="true">
        ${["saureus", "ecoli", "vcholerae"].map((id) => `<span>${morphSVG(byId[id])}</span>`).join("")}
      </div>
      <h3>Ready for ten?</h3>
      <p>You'll see a route through the key. Pick the organism at the end of it.</p>
      <button type="button" class="btn btn--primary" data-act="start">Start the quiz</button>
    </div>`;
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const shared = (a, b) => {
  let n = 0;
  while (n < a.length && n < b.length && a[n].opt === b[n].opt) n++;
  return n;
};

function start() {
  q = { rounds: shuffle(organisms.map((o) => o.id)).slice(0, ROUNDS), i: 0, score: 0, answered: false };
  round();
}

function round() {
  q.answered = false;
  const id = q.rounds[q.i];
  const route = routes[id];
  const others = organisms
    .filter((o) => o.id !== id)
    .map((o) => ({ id: o.id, w: shared(route, routes[o.id]) + Math.random() * 1.5 }))
    .sort((a, b) => b.w - a.w)
    .slice(0, 3)
    .map((o) => o.id);
  q.choices = shuffle([id, ...others]);

  box.innerHTML = `
    <div class="quiz__head">
      <span class="quiz__round">Round ${q.i + 1} <small>of ${ROUNDS}</small></span>
      <div class="quiz__pips">${q.rounds.map((_, i) => `<i class="${i < q.i ? "done" : i === q.i ? "now" : ""}"></i>`).join("")}</div>
      <span class="quiz__score">${q.score} pts</span>
    </div>
    <ol class="quiz__route">
      ${route.map((r, i) => `<li style="--i:${i}"><small>${esc(r.step)}</small>${esc(r.fact)}</li>`).join("")}
    </ol>
    <p class="quiz__ask">Which organism fits?</p>
    <div class="quiz__choices">
      ${q.choices.map((c, i) => `<button type="button" class="choice" data-pick="${c}" style="--i:${i}">
        <span class="choice__key">${"ABCD"[i]}</span><i>${esc(byId[c].name)}</i></button>`).join("")}
    </div>
    <div class="quiz__feedback" id="quiz-feedback"></div>`;
}

function answer(pick) {
  q.answered = true;
  const id = q.rounds[q.i];
  const right = pick === id;
  if (right) q.score++;

  for (const b of box.querySelectorAll(".choice")) {
    b.disabled = true;
    if (b.dataset.pick === id) b.classList.add("is-right");
    else if (b.dataset.pick === pick) b.classList.add("is-wrong");
  }
  box.querySelector(".quiz__score").textContent = `${q.score} pts`;

  let why = "";
  if (!right) {
    const a = routes[id];
    const b = routes[pick];
    const n = shared(a, b);
    why = n < a.length && n < b.length
      ? `They split at <b>${esc(a[n].step)}</b>: <i>${esc(byId[id].name)}</i> is ${esc(a[n].fact)}, but <i>${esc(byId[pick].name)}</i> is ${esc(b[n].fact)}.`
      : "";
  }

  const last = q.i === ROUNDS - 1;
  box.querySelector("#quiz-feedback").innerHTML = `
    <div class="fb ${right ? "fb--ok" : "fb--no"}">
      <span class="fb__art">${morphSVG(byId[id])}</span>
      <div>
        <p class="fb__title">${right ? "Correct!" : "Not quite."} <i>${esc(byId[id].name)}</i></p>
        <p>${why || esc(byId[id].tip)}</p>
      </div>
      <button type="button" class="btn btn--primary" data-act="next">${last ? "See results" : "Next round"}</button>
    </div>`;
  box.querySelector("[data-act=next]").focus({ preventScroll: true });
}

function next() {
  if (++q.i < ROUNDS) return round();
  const pct = q.score / ROUNDS;
  const C = 2 * Math.PI * 52;
  const verdict = pct === 1 ? "Flawless. Ready for the practical."
    : pct >= 0.7 ? "Strong result. A couple of tests to revisit."
    : pct >= 0.4 ? "Getting there. Run a few through the key."
    : "Early days. Try the flashcards, then come back.";
  box.innerHTML = `
    <div class="quiz__end">
      <div class="ring-wrap">
        <svg class="ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="52" class="ring__track"/>
          <circle cx="60" cy="60" r="52" class="ring__fill" style="--c:${C};--off:${C * (1 - pct)}"/>
        </svg>
        <p class="quiz__big"><b>${q.score}</b>/${ROUNDS}</p>
      </div>
      <h3>${verdict}</h3>
      <button type="button" class="btn btn--primary" data-act="start">Play again</button>
    </div>`;
}
