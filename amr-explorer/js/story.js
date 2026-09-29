// Narrative layers built from the real data:
//   buildFindings – glass carousel of computed key findings
//   buildStory    – scroll-driven "scrollytelling" beeswarm with a pinned chart
import { PATHOGENS } from "./config.js";
import { cssVar, fmtPct, fmtNum, ordinal, regression, el, showTooltip, hideTooltip, onResize } from "./utils.js";
import { sparkline } from "./charts.js";

const d3 = window.d3;
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =========================================================
   Key findings carousel
   ========================================================= */
export function buildFindings({ data, go }) {
  const g = data.sources.glass;
  const e = data.sources.ecdc;
  const lastG = d3.max(g.years);
  const lastE = d3.max(e.years);
  const firstE = d3.min(e.years);

  const series = (src, p, iso) => Object.entries(src.resistance[p][iso] ?? {})
    .map(([y, v]) => ({ year: +y, value: v })).sort((a, b) => a.year - b.year);
  const yearValues = (src, p, y) => Object.entries(src.resistance[p])
    .filter(([, ys]) => ys[y] != null).map(([iso, ys]) => ({ iso, name: src.countries[iso], value: ys[y] }));
  const change = (src, p, a, b) => Object.entries(src.resistance[p])
    .filter(([, ys]) => ys[a] != null && ys[b] != null)
    .map(([iso, ys]) => ({ iso, name: src.countries[iso], from: ys[a], to: ys[b], delta: ys[b] - ys[a] }));

  const slides = [];

  // 1. The biggest improvement in Europe: MRSA.
  const mrsaFall = d3.least(change(e, "mrsa", firstE, lastE), (d) => d.delta);
  slides.push({
    tag: "mrsa", tone: "good", source: "ECDC EARS-Net",
    big: `${fmtNum(mrsaFall.from, 0)}% → ${fmtNum(mrsaFall.to, 0)}%`,
    title: `${mrsaFall.name} cut MRSA by ${fmtNum(-mrsaFall.delta, 0)} points`,
    body: `The largest fall in Europe between ${firstE} and ${lastE}. MRSA can be pushed back with screening, hand hygiene and careful prescribing.`,
    spark: series(e, "mrsa", mrsaFall.iso),
    view: { source: "ecdc", pathogen: "mrsa", year: lastE, country: mrsaFall.iso },
  });

  // 2. Highest K. pneumoniae in Europe.
  const kpnTop = d3.greatest(yearValues(e, "kpn", lastE), (d) => d.value);
  slides.push({
    tag: "kpn", tone: "bad", source: "ECDC EARS-Net",
    big: fmtPct(kpnTop.value),
    title: `Europe’s highest K. pneumoniae resistance: ${kpnTop.name}`,
    body: `In ${lastE}, close to ${Math.round(kpnTop.value / 10) * 10 >= 80 ? "4 in 5" : `${Math.round(kpnTop.value)}%`} of invasive isolates resisted 3rd-generation cephalosporins.`,
    spark: series(e, "kpn", kpnTop.iso),
    view: { source: "ecdc", pathogen: "kpn", year: lastE, country: kpnTop.iso },
  });

  // 3. The global spread for E. coli.
  const ec = yearValues(g, "ecoli", lastG);
  const lo = d3.least(ec, (d) => d.value);
  const hi = d3.greatest(ec, (d) => d.value);
  slides.push({
    tag: "ecoli", tone: "bad", source: "WHO GLASS",
    big: `${Math.round(hi.value / lo.value)}×`,
    title: `The gap between ${lo.name} and ${hi.name}`,
    body: `E. coli resistance ranged from ${fmtPct(lo.value)} to ${fmtPct(hi.value)} across ${ec.length} countries in ${lastG}. Where you fall ill changes which antibiotics still work.`,
    bars: [lo, { name: "Median", value: d3.median(ec, (d) => d.value) }, hi],
    view: { source: "glass", pathogen: "ecoli", year: lastG, country: hi.iso },
  });

  // 4. The fastest like-for-like rise (WHO GLASS, 2018 → latest).
  const rise = d3.greatest(change(g, "ecoli", 2018, lastG), (d) => d.delta);
  slides.push({
    tag: "ecoli", tone: "bad", source: "WHO GLASS",
    big: `+${fmtNum(rise.delta, 0)} pp`,
    title: `The fastest rise: ${rise.name}`,
    body: `E. coli resistance in ${rise.name} went from ${fmtPct(rise.from)} in 2018 to ${fmtPct(rise.to)} in ${lastG}, the largest increase among countries that reported in both years.`,
    spark: series(g, "ecoli", rise.iso),
    view: { source: "glass", pathogen: "ecoli", year: lastG, country: rise.iso },
  });

  // 5. The lowest MRSA rate in Europe.
  const mrsaLow = d3.least(yearValues(e, "mrsa", lastE), (d) => d.value);
  slides.push({
    tag: "mrsa", tone: "good", source: "ECDC EARS-Net",
    big: fmtPct(mrsaLow.value),
    title: `${mrsaLow.name} keeps MRSA near zero`,
    body: `The lowest MRSA share in Europe in ${lastE}. It has stayed low for a decade under a “search and destroy” approach to screening and isolation.`,
    spark: series(e, "mrsa", mrsaLow.iso),
    view: { source: "ecdc", pathogen: "mrsa", year: lastE, country: mrsaLow.iso },
  });

  // 6. Surveillance is growing.
  const reporting = g.years.map((y) => ({
    year: y, value: new Set([...yearValues(g, "ecoli", y), ...yearValues(g, "mrsa", y)].map((d) => d.iso)).size,
  }));
  slides.push({
    tag: null, tone: "neutral", source: "WHO GLASS",
    big: `${reporting[0].value} → ${reporting[reporting.length - 1].value}`,
    title: "More countries are counting",
    body: `Countries reporting resistance data to WHO grew from ${reporting[0].value} in ${g.years[0]} to ${reporting[reporting.length - 1].value} in ${lastG}. You can only fight what you measure.`,
    spark: reporting,
    sparkDomain: [0, d3.max(reporting, (d) => d.value)],
    view: { source: "glass", pathogen: "ecoli", year: lastG },
  });

  // 7. Antibiotic use vs resistance.
  const pts = [];
  for (const [iso, ys] of Object.entries(g.resistance.ecoli)) {
    const pairs = Object.entries(ys).filter(([y]) => g.consumption[iso]?.[y] != null);
    if (pairs.length) pts.push({ x: d3.mean(pairs, ([y]) => g.consumption[iso][y]), y: d3.mean(pairs, ([, v]) => v) });
  }
  const fit = regression(pts);
  slides.push({
    tag: "ecoli", tone: "neutral", source: "WHO GLASS · GLASS-AMC",
    big: `r = ${fit.r.toFixed(2)}`,
    title: "More antibiotic use, more resistance",
    body: `Across ${fit.n} countries, higher antibiotic use goes with higher E. coli resistance, but it explains only about ${Math.round(fit.r ** 2 * 100)}% of the gap between countries.`,
    dots: pts,
    fit,
    view: { source: "glass", pathogen: "ecoli", year: lastG, scrollTo: "usage" },
  });

  renderCarousel(slides, go);
}

function renderCarousel(slides, go) {
  const track = document.getElementById("carousel-track");
  const dots = document.getElementById("carousel-dots");
  const light = cssVar("--on-deep");

  track.replaceChildren(...slides.map((s, i) => {
    const chip = s.tag
      ? el("span", { class: "chip" }, el("i", { style: `background:${cssVar(`--deep-${s.tag}`)}` }), PATHOGENS[s.tag].short)
      : el("span", { class: "chip" }, "Surveillance");
    const tone = el("span", { class: `tone tone--${s.tone}` }, s.tone === "good" ? "▼ Improving" : s.tone === "bad" ? "▲ Concern" : "● Context");
    const visual = el("div", { class: "slide__visual" });
    if (s.spark) {
      visual.append(sparkline(s.spark, { color: light, width: 280, height: 56, domain: s.sparkDomain ?? [0, 100] }));
      visual.append(el("div", { class: "slide__axis" },
        el("span", {}, String(s.spark[0].year)), el("span", {}, String(s.spark[s.spark.length - 1].year))));
    } else if (s.bars) {
      const max = d3.max(s.bars, (b) => b.value);
      visual.append(...s.bars.map((b) => el("div", { class: "mini-bar" },
        el("span", { class: "mini-bar__label" }, b.name),
        el("span", { class: "mini-bar__track" }, el("i", { style: `width:${(b.value / max) * 100}%` })),
        el("span", { class: "mini-bar__val" }, fmtPct(b.value, 0)))));
    } else if (s.dots) {
      visual.append(miniScatter(s.dots, s.fit, light));
    }
    return el("article", {
      class: "slide fx-glow fx-tilt", role: "group", "aria-roledescription": "slide",
      "aria-label": `${i + 1} of ${slides.length}: ${s.title}`, "data-index": i,
    },
      el("div", { class: "slide__top" }, chip, tone),
      el("p", { class: "slide__big" }, s.big),
      el("h3", { class: "slide__title" }, s.title),
      el("p", { class: "slide__body" }, s.body),
      visual,
      el("div", { class: "slide__foot" },
        el("span", { class: "slide__source" }, s.source),
        el("button", { type: "button", class: "slide__cta", onclick: () => go(s.view) }, "See it in the data →")));
  }));

  dots.replaceChildren(...slides.map((s, i) => el("button", {
    type: "button", class: "carousel__dot", "aria-label": `Go to finding ${i + 1}`, onclick: () => goTo(i),
  })));

  const slideEls = [...track.children];
  let current = 0;

  function goTo(i, smooth = true) {
    const n = slideEls.length;
    current = ((i % n) + n) % n;
    const s = slideEls[current];
    track.scrollTo({ left: s.offsetLeft - (track.clientWidth - s.clientWidth) / 2, behavior: smooth && !reduceMotion() ? "smooth" : "auto" });
  }

  // Track which slide is centred.
  function sync() {
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    slideEls.forEach((s, i) => {
      if (Math.abs(s.offsetLeft + s.clientWidth / 2 - mid) < Math.abs(slideEls[best].offsetLeft + slideEls[best].clientWidth / 2 - mid)) best = i;
    });
    current = best;
    slideEls.forEach((s, i) => s.classList.toggle("is-active", i === best));
    [...dots.children].forEach((d, i) => d.setAttribute("aria-current", i === best ? "true" : "false"));
    document.getElementById("carousel-status").textContent = `Finding ${best + 1} of ${slideEls.length}`;
  }
  track.onscroll = () => requestAnimationFrame(sync);
  goTo(0, false);
  sync();

  document.getElementById("carousel-prev").onclick = () => { pause(); goTo(current - 1); };
  document.getElementById("carousel-next").onclick = () => { pause(); goTo(current + 1); };
  track.onkeydown = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); pause(); goTo(current + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); pause(); goTo(current - 1); }
  };

  // Mouse drag-to-scroll (touch already scrolls natively).
  let drag = null;
  track.onpointerdown = (e) => {
    if (e.pointerType !== "mouse" || e.target.closest("button")) return;
    drag = { x: e.clientX, left: track.scrollLeft, moved: false };
    track.classList.add("is-dragging");
    track.setPointerCapture(e.pointerId);
    pause();
  };
  track.onpointermove = (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 3) drag.moved = true;
    track.scrollLeft = drag.left - dx;
  };
  track.onpointerup = track.onpointercancel = () => {
    if (!drag) return;
    track.classList.remove("is-dragging");
    drag = null;
    goTo(current);
  };

  // Autoplay: paused on hover/focus/interaction and for reduced motion.
  let timer = null;
  let paused = false;
  function pause() { paused = true; clearInterval(timer); }
  function play() {
    clearInterval(timer);
    if (paused || reduceMotion()) return;
    timer = setInterval(() => { if (!document.hidden) goTo(current + 1); }, 6000);
  }
  const root = document.getElementById("findings");
  root.onpointerenter = () => clearInterval(timer);
  root.onpointerleave = play;
  root.onfocusin = () => clearInterval(timer);
  // Only run while the carousel is on screen.
  new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : clearInterval(timer)), { threshold: 0.4 }).observe(root);
}

function miniScatter(points, fit, color) {
  const w = 280, h = 56;
  const x = d3.scaleLinear().domain([0, d3.max(points, (p) => p.x)]).range([4, w - 4]);
  const y = d3.scaleLinear().domain([0, 100]).range([h - 4, 4]);
  const svg = d3.create("svg").attr("viewBox", `0 0 ${w} ${h}`).attr("aria-hidden", "true");
  svg.append("g").selectAll("circle").data(points).join("circle")
    .attr("cx", (p) => x(p.x)).attr("cy", (p) => y(p.y)).attr("r", 2.5).attr("fill", color).attr("fill-opacity", 0.6);
  const [x0, x1] = x.domain();
  svg.append("line").attr("x1", x(x0)).attr("x2", x(x1))
    .attr("y1", y(fit.intercept + fit.slope * x0)).attr("y2", y(Math.min(100, fit.intercept + fit.slope * x1)))
    .attr("stroke", color).attr("stroke-width", 2).attr("stroke-linecap", "round");
  return svg.node();
}

/* =========================================================
   Scrollytelling: one pinned beeswarm, steps drive the state
   ========================================================= */
export function buildStory({ data, go }) {
  const g = data.sources.glass;
  const firstY = d3.min(g.years);
  const lastY = d3.max(g.years);
  const rows = (y) => Object.entries(g.resistance.ecoli)
    .filter(([, ys]) => ys[y] != null)
    .map(([iso, ys]) => ({ iso, name: g.countries[iso], value: ys[y] }));
  const first = rows(firstY);
  const last = rows(lastY).sort((a, b) => a.value - b.value);
  const median = d3.median(last, (d) => d.value);
  const lows = last.slice(0, 5);
  const highs = last.filter((d) => d.value >= 80);
  const top3 = [...highs].reverse().slice(0, 3);
  const uk = last.find((d) => d.iso === "GBR");
  const ukRank = last.length - last.indexOf(uk);
  const list = (arr) => arr.map((d) => d.name).join(", ").replace(/, ([^,]*)$/, " and $1");

  const steps = [
    {
      year: firstY, emphasis: () => true,
      title: `${firstY}: ${first.length} countries`,
      text: `Each dot is one country, placed by the share of E. coli bloodstream infections that resisted 3rd-generation cephalosporins. In ${firstY}, only ${first.length} countries reported to WHO GLASS.`,
    },
    {
      year: lastY, emphasis: () => true,
      title: `${lastY}: ${last.length} countries`,
      text: `Six years later, ${last.length} countries were reporting. The dots now cover almost the whole scale, from ${fmtPct(last[0].value)} to ${fmtPct(last[last.length - 1].value)}.`,
    },
    {
      year: lastY, emphasis: (d) => d.value >= median, median: true,
      title: `Half are above ${fmtPct(median, 0)}`,
      text: `In half of these countries, ${fmtPct(median, 0)} or more of these infections were resistant. There, a common infection often needs a reserve antibiotic.`,
    },
    {
      year: lastY, emphasis: (d) => lows.some((l) => l.iso === d.iso), labels: lows.slice(0, 3),
      title: "The lowest rates",
      text: `The five lowest rates were in ${list(lows)}, all under ${fmtPct(Math.ceil(lows[lows.length - 1].value), 0)}.`,
    },
    {
      year: lastY, emphasis: (d) => d.value >= 80, labels: top3,
      title: `${highs.length} countries at 80% or more`,
      text: `At the other end, ${highs.length} countries reported 80% or more resistant, including ${list(top3)}.`,
    },
    {
      year: lastY, emphasis: (d) => d.iso === "GBR", labels: uk ? [uk] : [], median: true,
      title: uk ? `The United Kingdom: ${fmtPct(uk.value)}` : "Your country",
      text: uk ? `The UK sits well below the median, ${ordinal(ukRank)} highest of ${last.length}. Explore every country, pathogen and year on the map.` : "Explore every country on the map.",
      cta: true,
    },
  ];

  const stepsEl = document.getElementById("story-steps");
  stepsEl.replaceChildren(...steps.map((s, i) => el("article", { class: "step fx-glow", "data-step": i },
    el("span", { class: "step__num" }, `${i + 1} / ${steps.length}`),
    el("h3", {}, s.title),
    el("p", {}, s.text),
    s.cta ? el("button", { type: "button", class: "btn btn--pill step__cta", onclick: () => go({ source: "glass", pathogen: "ecoli", year: lastY, country: "GBR" }) }, "Open the map") : null)));

  const chartEl = document.getElementById("story-chart");
  const titleEl = document.getElementById("story-title");
  let active = 0;
  let layout = null;

  function computeLayout() {
    const width = chartEl.clientWidth;
    const narrow = width < 520;
    const height = narrow ? 240 : 320;
    const r = narrow ? 4.5 : 6.5;
    const m = { top: 24, right: 16, bottom: 36, left: 16 };
    const x = d3.scaleLinear().domain([0, 100]).range([m.left, width - m.right]);
    const swarm = (arr) => {
      const nodes = arr.map((d) => ({ ...d, x: x(d.value), y: (height - m.bottom + m.top) / 2 }));
      const sim = d3.forceSimulation(nodes)
        .force("x", d3.forceX((d) => x(d.value)).strength(1))
        .force("y", d3.forceY((height - m.bottom + m.top) / 2).strength(0.08))
        .force("collide", d3.forceCollide(r + 1))
        .stop();
      for (let i = 0; i < 200; i++) sim.tick();
      return new Map(nodes.map((n) => [n.iso, n]));
    };
    return { width, height, r, m, x, pos: { [firstY]: swarm(first), [lastY]: swarm(last) } };
  }

  const svg = d3.select(chartEl).append("svg").attr("role", "img");
  const axisG = svg.append("g").attr("class", "axis");
  const medianG = svg.append("g");
  const dotsG = svg.append("g");
  const labelsG = svg.append("g");

  function draw(animate = true) {
    const s = steps[active];
    const { width, height, r, m, x, pos } = layout;
    const t = svg.transition().duration(animate && !reduceMotion() ? 750 : 0).ease(d3.easeCubicInOut);
    const nodes = [...pos[s.year].values()];
    const emph = cssVar("--s-ecoli");
    const muted = cssVar("--mark-muted");
    const surface = cssVar("--surface");

    svg.attr("viewBox", `0 0 ${width} ${height}`)
      .attr("aria-label", `${s.title}. ${s.text}`);
    titleEl.textContent = `E. coli resistant to 3rd-gen cephalosporins, ${s.year}`;

    axisG.attr("transform", `translate(0,${height - m.bottom})`)
      .call(d3.axisBottom(x).ticks(width < 520 ? 5 : 10).tickFormat((v) => `${v}%`).tickSizeOuter(0));

    const md = s.median ? [median] : [];
    medianG.selectAll("g").data(md).join(
      (enter) => {
        const gm = enter.append("g").style("opacity", 0);
        gm.append("line").attr("class", "median-line");
        gm.append("text").attr("class", "axis-title").attr("text-anchor", "middle");
        return gm;
      },
      (update) => update,
      (exit) => exit.transition(t).style("opacity", 0).remove(),
    ).call((gm) => {
      gm.transition(t).style("opacity", 1);
      gm.select("line").attr("x1", x(median)).attr("x2", x(median)).attr("y1", m.top - 6).attr("y2", height - m.bottom);
      gm.select("text").attr("x", x(median)).attr("y", m.top - 10).text(`median ${fmtPct(median, 0)}`);
    });

    dotsG.selectAll("circle").data(nodes, (d) => d.iso).join(
      (enter) => enter.append("circle").attr("r", 0).attr("cx", (d) => d.x).attr("cy", (d) => d.y).attr("fill", emph),
      (update) => update,
      (exit) => exit.transition(t).attr("r", 0).remove(),
    )
      .attr("stroke", surface).attr("stroke-width", 1.5)
      .on("pointermove", (event, d) => showTooltip({
        title: d.name, sub: String(s.year),
        rows: [{ key: "Resistant", color: emph, value: fmtPct(d.value) }],
      }, event.clientX, event.clientY))
      .on("pointerleave", hideTooltip)
      .transition(t)
      .attr("cx", (d) => d.x).attr("cy", (d) => d.y).attr("r", r)
      .attr("fill", (d) => (s.emphasis(d) ? emph : muted));

    const labels = (s.labels ?? []).map((d) => pos[s.year].get(d.iso)).filter(Boolean);
    // Labels stack at the top; a hairline leader ties each one to its dot.
    labelsG.selectAll("g").data(labels, (d) => d.iso).join(
      (enter) => {
        const gl = enter.append("g").style("opacity", 0);
        gl.append("line").attr("class", "leader");
        gl.append("text").attr("class", "chart-label chart-label--strong");
        return gl;
      },
      (update) => update,
      (exit) => exit.transition(t).style("opacity", 0).remove(),
    ).call((gl) => {
      const ly = (i) => m.top + 2 + i * 16;
      gl.select("text")
        .text((d) => `${d.name} ${fmtPct(d.value, 0)}`)
        .attr("text-anchor", (d) => (d.x > width * 0.7 ? "end" : "start"))
        .attr("x", (d) => d.x + (d.x > width * 0.7 ? -8 : 8))
        .attr("y", (d, i) => ly(i));
      gl.select("line")
        .attr("x1", (d) => d.x).attr("x2", (d) => d.x)
        .attr("y1", (d, i) => ly(i) - 4).attr("y2", (d) => d.y - r - 2);
      gl.transition(t).style("opacity", 1);
    });
  }

  onResize(chartEl, () => { layout = computeLayout(); draw(false); });

  const stepEls = [...stepsEl.children];
  const progress = document.getElementById("story-progress");
  const count = document.getElementById("story-count");

  // On phones the steps become a horizontal swipe row under the chart;
  // on wider screens they scroll vertically past the pinned chart.
  const horizontal = () => getComputedStyle(stepsEl).overflowX === "auto";

  function setActive(i) {
    if (i === active) return;
    active = i;
    stepEls.forEach((s, j) => s.classList.toggle("is-active", j === i));
    progress.style.setProperty("--p", (i + 1) / steps.length);
    count.textContent = `${i + 1} / ${steps.length}`;
    if (layout) draw();
  }

  // Position-based (not IntersectionObserver), so a fast fling never skips a step.
  function sync() {
    let i = 0;
    if (horizontal()) {
      const mid = stepsEl.scrollLeft + stepsEl.clientWidth / 2;
      let best = Infinity;
      stepEls.forEach((s, j) => {
        const dist = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
        if (dist < best) { best = dist; i = j; }
      });
    } else {
      const line = innerHeight * 0.55;
      stepEls.forEach((s, j) => { if (s.getBoundingClientRect().top < line) i = j; });
    }
    setActive(i);
  }
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; sync(); });
  };
  addEventListener("scroll", onScroll, { passive: true });
  stepsEl.addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);

  const goStep = (i) => {
    const target = stepEls[Math.max(0, Math.min(steps.length - 1, i))];
    stepsEl.scrollTo({
      left: target.offsetLeft - (stepsEl.clientWidth - target.offsetWidth) / 2,
      behavior: reduceMotion() ? "auto" : "smooth",
    });
  };
  document.getElementById("story-prev").onclick = () => goStep(active - 1);
  document.getElementById("story-next").onclick = () => goStep(active + 1);

  stepEls[0].classList.add("is-active");
  progress.style.setProperty("--p", 1 / steps.length);
  count.textContent = `1 / ${steps.length}`;

  return { redraw: () => { if (layout) draw(false); } };
}
