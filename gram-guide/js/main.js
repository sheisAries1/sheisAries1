import { organisms, tests } from "./data.js";
import { resultArt } from "./draw.js";
import { initTheme, initNav, initReveal, initScope, countUp } from "./ui.js";
import { initKey } from "./key.js";
import { initCards } from "./cards.js";
import { initQuiz } from "./quiz.js";

initTheme();
initNav();
initScope();
initKey();
initCards();
initQuiz();
renderTests();
initReveal();

// Hero counters run once the numbers are on screen.
const counts = { organisms: organisms.length, tests: tests.length };
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    countUp(e.target, counts[e.target.dataset.count]);
    io.unobserve(e.target);
  }
});
document.querySelectorAll("[data-count]").forEach((el) => io.observe(el));

function renderTests() {
  document.querySelector("#tests-grid").innerHTML = tests
    .map((t, i) => `
      <article class="test glass reveal" style="--i:${i % 4}">
        <header><span class="test__tag">${t.tag}</span><h3>${t.name}</h3></header>
        <p>${t.what}</p>
        <div class="test__results">
          ${t.results.map((r) => `
            <figure class="res">
              ${resultArt(t.look, r)}
              <figcaption><b>${r.sign}</b>${r.label}</figcaption>
            </figure>`).join("")}
        </div>
        <p class="test__used">${t.used}</p>
      </article>`)
    .join("");
}
