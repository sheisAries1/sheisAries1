import { ORGANISMS, byId, KEY, TESTS } from "./data.js";
import { field, glyph, swatch } from "./micro.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// Swap content with a small fade-up, so changes feel deliberate rather than jumpy.
function swap(el, html, { dir = 0 } = {}) {
  el.innerHTML = html;
  if (reduced) return;
  el.animate(
    [{ opacity: 0, transform: `translate(${dir * 18}px, ${dir ? 0 : 10}px)` }, { opacity: 1, transform: "none" }],
    { duration: 380, easing: "cubic-bezier(.2,.7,.2,1)" }
  );
}

// Italicise binomials only: "Shigella spp." keeps "spp." upright, "Viridans streptococci" is not a species name.
const italic = (name) =>
  / spp\.$/.test(name) ? name.replace(/^(\w+)/, "<i>$1</i>")
  : /^[A-Z][a-z]+ [a-z]+$/.test(name) && !name.startsWith("Viridans") ? `<i>${name}</i>`
  : name;

// "Staphylococcus aureus" -> "S. aureus" for compact chips.
const short = (name) => (/^[A-Z][a-z]+ [a-z]+$/.test(name) && !name.startsWith("Viridans") ? `<i>${name.replace(/^([A-Z])[a-z]+/, "$1.")}</i>` : italic(name));

function profile(o, { heading = "h3" } = {}) {
  const rows = o.tests.map(([t, r]) => `<div class="kv"><dt>${t}</dt><dd>${r}</dd></div>`).join("");
  return `
    <div class="profile">
      <div class="profile__fov">${field(o)}</div>
      <div class="profile__body">
        <p class="tag">${o.gram === "+" ? "Gram-positive" : "Gram-negative"} · ${o.shape}</p>
        <${heading} class="profile__name" id="modal-title">${italic(o.name)}</${heading}>
        <p class="profile__morph">${o.morph}</p>
        <dl class="kvs">${rows}</dl>
        <p class="profile__note">${o.note}</p>
        <p class="profile__tip"><span>Remember</span>${o.tip}</p>
      </div>
    </div>`;
}

/* ---------- theme ---------- */
$("#theme").addEventListener("click", () => {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("ss-theme", root.dataset.theme); } catch {}
});

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("is-in"), io.unobserve(e.target))),
  { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
);
$$("[data-reveal]").forEach((el) => io.observe(el));

$("#stat-orgs").textContent = ORGANISMS.length;
$("#stat-tests").textContent = TESTS.length;

/* ---------- modal ---------- */
const modal = $("#modal");
function openOrg(id) {
  $("#modal-body").innerHTML = profile(byId[id], { heading: "h2" });
  modal.showModal();
}
$("#modal-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", (e) => e.target === modal && modal.close());
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-org]");
  if (b) openOrg(b.dataset.org);
});

/* ---------- 01 Gram stain ---------- */
(() => {
  const stage = $("#stain-stage"), why = $("#stain-why"), btns = $$("#stain-steps button");
  const WHY = [
    "Both cell types are colourless. The smear is heat-fixed so the cells stay on the slide.",
    "Crystal violet floods every cell. At this point everything is purple.",
    "Iodine locks crystal violet into a large CV–I complex inside every cell. Still all purple.",
    "The decolouriser dissolves the Gram-negative outer membrane and the dye washes out of the thin wall. The thick Gram-positive wall dehydrates and tightens, trapping the dye.",
    "Safranin stains the now-colourless Gram-negatives pink. Gram-positives are already full of violet, so they stay purple.",
  ];

  // Scatter a few cocci and rods on each smear.
  for (const sm of $$(".smear", stage)) {
    let s = sm.classList.contains("smear--pos") ? 7 : 3;
    const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 14; i++) {
      const c = document.createElement("span");
      c.className = r() > 0.5 ? "c c--rod" : "c";
      c.style.cssText = `left:${6 + r() * 82}%;top:${10 + r() * 72}%;--rot:${Math.round(r() * 180)}deg;--d:${i * 30}ms`;
      sm.appendChild(c);
    }
  }

  let step = 0, timer = null;
  const set = (n) => {
    step = Math.max(0, Math.min(4, n));
    stage.dataset.step = step;
    btns.forEach((b, i) => { b.classList.toggle("is-on", i === step); b.classList.toggle("is-done", i < step); b.setAttribute("aria-pressed", i === step); });
    why.textContent = WHY[step];
    if (!reduced) why.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
  };
  const stop = () => { clearInterval(timer); timer = null; $("#stain-play").textContent = step === 4 ? "Run it again" : "Run the stain"; };

  btns.forEach((b) => b.addEventListener("click", () => { stop(); set(+b.dataset.step); }));
  $("#stain-prev").addEventListener("click", () => { stop(); set(step - 1); });
  $("#stain-next").addEventListener("click", () => { stop(); set(step + 1); });
  $("#stain-play").addEventListener("click", () => {
    if (timer) return stop();
    set(0);
    $("#stain-play").textContent = "Pause";
    timer = setInterval(() => (step >= 4 ? stop() : set(step + 1)), 1700);
  });
  set(0);
})();

/* ---------- 02 Identification key ---------- */
(() => {
  const stage = $("#key-stage"), trail = $("#key-trail");
  let path = []; // [{ node, pick }]

  const renderTrail = () => {
    trail.innerHTML = path.length
      ? path.map((p, i) => `<li><button type="button" data-back="${i}"><small>${KEY[p.node].step}</small>${KEY[p.node].options[p.pick].label}</button></li>`).join("")
      : `<li class="muted">Nothing yet. Start with the Gram stain.</li>`;
  };

  const optionHtml = (o, i) => `
    <button class="opt" type="button" data-pick="${i}" style="--d:${i * 60}ms">
      <span class="opt__icon">${o.swatch ? swatch(o.swatch) : glyph(o.glyph)}</span>
      <span class="opt__txt"><b>${o.label}</b>${o.sub ? `<small>${o.sub}</small>` : ""}</span>
      <span class="opt__go" aria-hidden="true">→</span>
    </button>`;

  const render = (dir = 1) => {
    renderTrail();
    const last = path[path.length - 1];
    const next = last ? KEY[last.node].options[last.pick] : { to: "start" };

    if (next.org) {
      const o = byId[next.org];
      swap(stage, `
        <div class="result">
          <p class="eyebrow">Identified in ${path.length} steps</p>
          ${profile(o)}
          <div class="result__ctrl">
            <button class="btn" type="button" data-again>Identify another</button>
            <button class="btn btn--ghost" type="button" data-card="${o.id}">Open its flashcard</button>
          </div>
        </div>`, { dir });
      return;
    }
    const n = KEY[next.to];
    swap(stage, `
      <p class="eyebrow">Step ${path.length + 1} · ${n.step}</p>
      <h3 class="key__q">${n.q}</h3>
      <p class="key__help">${n.help}</p>
      <div class="opts${n.options.length > 3 ? " opts--4" : ""}">${n.options.map(optionHtml).join("")}</div>
      ${path.length ? `<button class="link" type="button" data-up>← Back a step</button>` : ""}`, { dir });
    stage.dataset.node = next.to;
  };

  stage.addEventListener("click", (e) => {
    const pick = e.target.closest("[data-pick]");
    if (pick) { path.push({ node: stage.dataset.node, pick: +pick.dataset.pick }); return render(1); }
    if (e.target.closest("[data-up]")) { path.pop(); return render(-1); }
    if (e.target.closest("[data-again]")) { path = []; return render(-1); }
    const card = e.target.closest("[data-card]");
    if (card) { window.dispatchEvent(new CustomEvent("show-card", { detail: card.dataset.card })); document.getElementById("cards").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); }
  });
  trail.addEventListener("click", (e) => {
    const b = e.target.closest("[data-back]");
    if (b) { path = path.slice(0, +b.dataset.back); render(-1); }
  });
  $("#key-reset").addEventListener("click", () => { path = []; render(-1); });
  render(0);
})();

/* ---------- 03 Flashcards ---------- */
(() => {
  const card = $("#flash"), front = $("#flash-front"), back = $("#flash-back");
  let known = new Set(store.get("ss-known", []));
  let filter = "all", order = ORGANISMS.map((o) => o.id), deck = [], i = 0;

  const FILTERS = {
    all: () => true,
    gpos: (o) => o.gram === "+",
    gneg: (o) => o.gram !== "+",
    cocci: (o) => o.shape === "cocci",
    rods: (o) => o.shape !== "cocci",
    learning: (o) => !known.has(o.id),
  };

  const build = (keepId) => {
    deck = order.filter((id) => FILTERS[filter](byId[id]));
    i = Math.max(0, keepId ? deck.indexOf(keepId) : 0);
  };

  const paint = () => {
    const total = deck.length;
    const knownHere = deck.filter((id) => known.has(id)).length;
    $("#deck-bar").style.width = `${total ? (filter === "learning" ? 0 : (knownHere / total) * 100) : 100}%`;
    $("#deck-count").textContent = total ? `${i + 1} / ${total}` : "0 / 0";
    ["#deck-prev", "#deck-next", "#deck-got", "#deck-again"].forEach((s) => ($(s).disabled = !total));

    if (!total) {
      front.innerHTML = `<div class="flash__done"><p class="eyebrow">All clear</p><h3>You've marked every card as known.</h3><p>Pick another filter, or <button class="link" type="button" data-reset-known>reset your progress</button>.</p></div>`;
      back.innerHTML = "";
      return;
    }
    const o = byId[deck[i]];
    const status = known.has(o.id) ? `<span class="pill pill--ok">Known</span>` : "";
    front.innerHTML = `
      <div class="flash__top"><p class="tag">What is it?</p>${status}</div>
      <div class="flash__fov">${field(o, { label: false })}</div>
      <ul class="clues">${o.clues.map((c) => `<li>${c}</li>`).join("")}</ul>
      <p class="flash__hint">Tap to flip</p>`;
    back.innerHTML = `
      <div class="flash__top"><p class="tag">${o.gram === "+" ? "Gram-positive" : "Gram-negative"} · ${o.shape}</p>${status}</div>
      <h3 class="flash__name">${italic(o.name)}</h3>
      <p class="profile__morph">${o.morph}</p>
      <dl class="kvs kvs--tight">${o.tests.map(([t, r]) => `<div class="kv"><dt>${t}</dt><dd>${r}</dd></div>`).join("")}</dl>
      <p class="profile__tip"><span>Remember</span>${o.tip}</p>`;
  };

  const go = (d) => {
    if (!deck.length) return;
    const doIt = () => { card.classList.remove("is-flipped"); i = (i + d + deck.length) % deck.length; paint(); };
    if (reduced || !d) return doIt();
    const out = card.animate([{ transform: "none", opacity: 1 }, { transform: `translateX(${-d * 40}px) rotate(${-d * 2}deg)`, opacity: 0 }], { duration: 170, easing: "ease-in" });
    out.onfinish = () => {
      card.classList.add("no-anim"); doIt(); card.offsetWidth; card.classList.remove("no-anim");
      card.animate([{ transform: `translateX(${d * 40}px) rotate(${d * 2}deg)`, opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 300, easing: "cubic-bezier(.2,.7,.2,1)" });
    };
  };

  const flip = () => deck.length && card.classList.toggle("is-flipped");
  const mark = (isKnown) => {
    if (!deck.length) return;
    const id = deck[i];
    isKnown ? known.add(id) : known.delete(id);
    store.set("ss-known", [...known]);
    if (filter === "learning" && isKnown) {
      // The card leaves this filtered deck, so rebuild and stay at the same position.
      const at = i; build(); i = Math.min(at, Math.max(0, deck.length - 1));
      card.classList.remove("is-flipped"); paint(); return;
    }
    go(1);
  };

  // Tap to flip, swipe to move.
  let sx = null, sy = 0;
  card.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; });
  card.addEventListener("pointerup", (e) => {
    if (sx === null || e.target.closest("button")) return (sx = null);
    const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    else if (Math.abs(dx) < 8 && Math.abs(dy) < 8) flip();
  });
  card.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); }
  });
  document.addEventListener("keydown", (e) => {
    if (modal.open || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    const r = $("#cards").getBoundingClientRect();
    if (r.top > innerHeight * 0.6 || r.bottom < innerHeight * 0.3) return; // only while the deck is on screen
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "1") mark(false);
    else if (e.key === "2") mark(true);
  });

  front.addEventListener("click", (e) => {
    if (e.target.closest("[data-reset-known]")) { known.clear(); store.set("ss-known", []); build(); paint(); }
  });
  $("#deck-prev").addEventListener("click", () => go(-1));
  $("#deck-next").addEventListener("click", () => go(1));
  $("#deck-got").addEventListener("click", () => mark(true));
  $("#deck-again").addEventListener("click", () => mark(false));
  $("#deck-shuffle").addEventListener("click", () => {
    for (let k = order.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [order[k], order[j]] = [order[j], order[k]]; }
    build(); card.classList.remove("is-flipped"); paint();
    if (!reduced) card.animate([{ transform: "rotate(-3deg) scale(.97)" }, { transform: "rotate(2deg)" }, { transform: "none" }], { duration: 420 });
  });
  $("#deck-filters").addEventListener("click", (e) => {
    const b = e.target.closest("[data-f]");
    if (!b) return;
    $$("#deck-filters .chip").forEach((c) => c.classList.toggle("is-on", c === b));
    filter = b.dataset.f; build(); card.classList.remove("is-flipped"); paint();
  });
  window.addEventListener("show-card", (e) => {
    filter = "all";
    $$("#deck-filters .chip").forEach((c) => c.classList.toggle("is-on", c.dataset.f === "all"));
    build(e.detail); card.classList.remove("is-flipped"); paint();
  });

  build(); paint();
})();

/* ---------- 04 Tests ---------- */
(() => {
  const grid = $("#tests-grid"), empty = $("#tests-empty");
  const tube = ([label, c], fx) => `
    <figure class="tube">
      <span class="tube__glass${fx ? " fx-" + fx : ""}" style="--c:${c}"><span class="tube__liquid"></span></span>
      <figcaption>${label}</figcaption>
    </figure>`;

  grid.innerHTML = TESTS.map((t, k) => `
    <article class="test glass" data-q="${[t.name, t.detects, t.split, t.how, ...t.orgs.map((id) => byId[id].name)].join(" ").toLowerCase()}" style="--d:${(k % 6) * 50}ms">
      <h3>${t.name}</h3>
      <p class="test__detects">${t.detects}</p>
      <div class="test__res">
        <div><p class="tag">Positive</p>${tube(t.pos, t.posFx)}</div>
        <div><p class="tag">Negative</p>${tube(t.neg)}</div>
      </div>
      <p class="test__how"><b>How:</b> ${t.how}</p>
      <p class="test__split"><b>Separates:</b> ${t.split}</p>
      <div class="test__orgs">${t.orgs.map((id) => `<button type="button" class="org-chip" data-org="${id}" title="${byId[id].name}">${short(byId[id].name)}</button>`).join("")}</div>
    </article>`).join("");

  let t;
  $("#test-search").addEventListener("input", (e) => {
    clearTimeout(t);
    t = setTimeout(() => {
      const q = e.target.value.trim().toLowerCase();
      let shown = 0;
      $$(".test", grid).forEach((el) => { const hit = !q || el.dataset.q.includes(q); el.hidden = !hit; shown += hit; });
      empty.hidden = shown > 0;
    }, 90);
  });
})();

/* ---------- 05 Quiz ---------- */
(() => {
  const box = $("#quiz-box");
  const pickN = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
  let qs = [], n = 0, score = 0;

  const makeQuiz = () => {
    const targets = pickN(ORGANISMS, 10);
    return targets.map((o, k) => {
      if (k % 5 === 1 || k % 5 === 3) {
        // What does it look like? Distractors must differ in Gram reaction or shape,
        // so there's never two defensible answers.
        const seen = new Set([o.gram + o.shape]);
        const others = shuffle(ORGANISMS).filter((x) => !seen.has(x.gram + x.shape) && seen.add(x.gram + x.shape)).slice(0, 3);
        return {
          kind: "morph", o,
          prompt: `What would <i>${o.name}</i> look like on a Gram film?`,
          options: shuffle([o, ...others]).map((x) => ({ id: x.id, text: x.morph })),
        };
      }
      const similar = ORGANISMS.filter((x) => x.id !== o.id && x.gram === o.gram);
      const rest = ORGANISMS.filter((x) => x.id !== o.id && x.gram !== o.gram);
      const others = [...pickN(similar, 3), ...pickN(rest, 3)].slice(0, 3);
      return {
        kind: "id", o,
        prompt: `${o.morph}. ${o.clues.join(" · ")}. Which organism?`,
        options: shuffle([o, ...others]).map((x) => ({ id: x.id, text: italic(x.name) })),
      };
    });
  };

  const start = () => { qs = makeQuiz(); n = 0; score = 0; ask(); };

  const ask = () => {
    const q = qs[n];
    swap(box, `
      <div class="quiz__top">
        <p class="eyebrow">Question ${n + 1} of ${qs.length}</p>
        <div class="quiz__pips">${qs.map((_, k) => `<span class="${k < n ? (qs[k].right ? "ok" : "no") : k === n ? "now" : ""}"></span>`).join("")}</div>
      </div>
      <div class="quiz__q${q.kind === "id" ? " quiz__q--fov" : ""}">
        ${q.kind === "id" ? `<div class="quiz__fov">${field(q.o, { label: false })}</div>` : ""}
        <h3>${q.prompt}</h3>
      </div>
      <div class="quiz__opts">${q.options.map((op, k) => `<button class="opt opt--quiz" type="button" data-ans="${op.id}" style="--d:${k * 50}ms"><span class="opt__key">${"ABCD"[k]}</span><span class="opt__txt"><b>${op.text}</b></span></button>`).join("")}</div>
      <div class="quiz__fb" id="quiz-fb"></div>`, { dir: n ? 1 : 0 });
  };

  const answer = (id) => {
    const q = qs[n];
    if (q.done) return;
    q.done = true; q.right = id === q.o.id; score += q.right;
    $$("[data-ans]", box).forEach((b) => {
      b.disabled = true;
      if (b.dataset.ans === q.o.id) b.classList.add("is-right");
      else if (b.dataset.ans === id) b.classList.add("is-wrong");
    });
    const last = n === qs.length - 1;
    $("#quiz-fb").innerHTML = `
      <p><b>${q.right ? "Correct." : "Not quite."}</b> ${q.kind === "id" ? "" : `<i>${q.o.name}</i>: ${q.o.morph.toLowerCase()}. `}${q.o.tip}</p>
      <div class="quiz__fb-ctrl">
        <button class="link" type="button" data-org="${q.o.id}">See the profile</button>
        <button class="btn" type="button" data-next>${last ? "See my score" : "Next question"}</button>
      </div>`;
    if (!reduced) $("#quiz-fb").animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 300 });
    $("[data-next]", box).focus({ preventScroll: true });
  };

  const finish = () => {
    const best = Math.max(score, store.get("ss-best", 0));
    store.set("ss-best", best);
    const line = score === 10 ? "A clean sweep. Ready for the bench."
      : score >= 8 ? "Strong. Check the ones you missed and go again."
      : score >= 5 ? "Getting there. The key and the flashcards will close the gap."
      : "Early days. Start with the Gram stain and the key, then come back.";
    const missed = qs.filter((q) => !q.right);
    swap(box, `
      <div class="quiz__end">
        <p class="eyebrow">Your score</p>
        <p class="quiz__score"><b>${score}</b><span>/ ${qs.length}</span></p>
        <p>${line}</p>
        <p class="muted">Best so far: ${best} / 10</p>
        ${missed.length ? `<p class="tag">Revise these</p><div class="test__orgs">${missed.map((q) => `<button type="button" class="org-chip" data-org="${q.o.id}">${italic(q.o.name)}</button>`).join("")}</div>` : ""}
        <button class="btn" type="button" data-restart>New quiz</button>
      </div>`);
  };

  box.addEventListener("click", (e) => {
    const a = e.target.closest("[data-ans]");
    if (a) return answer(a.dataset.ans);
    if (e.target.closest("[data-next]")) { n++; return n < qs.length ? ask() : finish(); }
    if (e.target.closest("[data-restart]")) start();
  });
  start();
})();
