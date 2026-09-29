import { PATHOGENS, SOURCES, BIN_LABELS, RAMP_VARS } from "./config.js";
import {
  cssVar, makeColorScale, fmtPct, fmtNum, fmtSigned, ordinal, regression, el,
  showTooltip, hideTooltip, onResize,
} from "./utils.js";
import { createMap } from "./map.js";
import { renderRanking, renderTrend, renderHeatmap, renderScatter, sparkline } from "./charts.js";
import { buildFindings, buildStory } from "./story.js";
import { initFx } from "./fx.js";

const d3 = window.d3;
const $ = (id) => document.getElementById(id);

const [data, topo] = await Promise.all([
  d3.json("data/amr.json"),
  d3.json("data/world.topo.json"),
]);

/* =========================================================
   Data helpers
   ========================================================= */
const src = (key = state.source) => data.sources[key];
const nameOf = (iso, key = state.source) => src(key).countries[iso] ?? iso;
const pathogenColor = (p) => cssVar(PATHOGENS[p].color);

function valuesFor(sourceKey, pathogen, year) {
  const byIso = src(sourceKey).resistance[pathogen] ?? {};
  const out = new Map();
  for (const [iso, years] of Object.entries(byIso)) if (years[year] != null) out.set(iso, years[year]);
  return out;
}
function seriesFor(sourceKey, pathogen, iso) {
  const years = src(sourceKey).resistance[pathogen]?.[iso] ?? {};
  return Object.entries(years).map(([y, v]) => ({ year: +y, value: v })).sort((a, b) => a.year - b.year);
}
const consumptionFor = (sourceKey, iso, year) => src(sourceKey).consumption[iso]?.[year];

function ranked(sourceKey, pathogen, year) {
  const values = valuesFor(sourceKey, pathogen, year);
  const rows = [...values].map(([iso, value]) => ({ iso, value, name: nameOf(iso, sourceKey) }))
    .sort((a, b) => d3.descending(a.value, b.value) || d3.ascending(a.name, b.name));
  rows.forEach((r, i) => { r.rank = i + 1; });
  return rows;
}

function distribution(sourceKey, pathogen) {
  return src(sourceKey).years.map((year) => {
    const vals = [...valuesFor(sourceKey, pathogen, year).values()].sort(d3.ascending);
    return {
      year, n: vals.length,
      q1: d3.quantileSorted(vals, 0.25), median: d3.quantileSorted(vals, 0.5), q3: d3.quantileSorted(vals, 0.75),
    };
  });
}

/* =========================================================
   State (mirrored in the URL hash so any view can be shared)
   ========================================================= */
const state = { source: "glass", pathogen: "ecoli", year: 2022, country: "GBR", rank: "high" };
let heatPathogen = "kpn";

function readHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  if (SOURCES[p.get("source")]) state.source = p.get("source");
  if (SOURCES[state.source].pathogens.includes(p.get("pathogen"))) state.pathogen = p.get("pathogen");
  const yr = +p.get("year");
  if (src().years.includes(yr)) state.year = yr;
  else state.year = d3.max(src().years);
  const c = (p.get("country") ?? "").toUpperCase();
  state.country = src().countries[c] ? c : SOURCES[state.source].defaultCountry;
}
function writeHash() {
  const p = new URLSearchParams({ source: state.source, pathogen: state.pathogen, year: state.year, country: state.country });
  try { history.replaceState(null, "", `#${p}`); } catch (e) { /* URL state unavailable in sandboxed frames */ }
}

function setState(patch) {
  Object.assign(state, patch);
  const s = SOURCES[state.source];
  if (!s.pathogens.includes(state.pathogen)) state.pathogen = s.pathogens[0];
  if (!src().years.includes(state.year)) state.year = d3.max(src().years);
  if (!src().countries[state.country]) state.country = s.defaultCountry;
  writeHash();
  renderAll();
}

/* =========================================================
   Controls
   ========================================================= */
function segmented(container, options, current, onPick) {
  container.replaceChildren(...options.map((o) => {
    const btn = el("button", {
      type: "button", role: "radio", "aria-checked": String(o.value === current),
      tabindex: o.value === current ? 0 : -1, "data-value": o.value,
    });
    if (o.swatch) btn.append(el("span", { class: "swatch", style: `background:${o.swatch}` }));
    btn.append(o.label);
    btn.addEventListener("click", () => onPick(o.value));
    return btn;
  }));
}
// Arrow-key navigation within radio groups.
document.addEventListener("keydown", (e) => {
  const btn = e.target.closest?.('.segmented [role="radio"]');
  if (!btn || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
  e.preventDefault();
  const all = [...btn.parentElement.querySelectorAll('[role="radio"]:not(:disabled)')];
  const next = all[(all.indexOf(btn) + (e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1) + all.length) % all.length];
  next.click();
  requestAnimationFrame(() => next.parentElement.querySelector(`[data-value="${next.dataset.value}"]`)?.focus());
});

function renderControls() {
  segmented($("source-control"), Object.entries(SOURCES).map(([value, s]) => ({ value, label: s.short })), state.source,
    (source) => { stopPlay(); setState({ source }); map.setFocus(source === "ecdc" ? "europe" : "world"); });
  segmented($("pathogen-control"), SOURCES[state.source].pathogens.map((value) => ({
    value, label: PATHOGENS[value].short, swatch: pathogenColor(value),
  })), state.pathogen, (pathogen) => setState({ pathogen }));

  const years = src().years;
  const slider = $("year-slider");
  slider.min = years[0];
  slider.max = years[years.length - 1];
  slider.value = state.year;
  $("year-output").value = state.year;

  const sel = $("country-select");
  const opts = Object.entries(src().countries).sort((a, b) => a[1].localeCompare(b[1]));
  sel.replaceChildren(...opts.map(([iso, name]) => el("option", { value: iso, selected: iso === state.country }, name)));

  for (const b of $("rank-control").querySelectorAll("button")) {
    b.setAttribute("aria-checked", String(b.dataset.value === state.rank));
    b.tabIndex = b.dataset.value === state.rank ? 0 : -1;
  }
}

$("year-slider").addEventListener("input", (e) => setState({ year: +e.target.value }));
$("country-select").addEventListener("change", (e) => selectCountry(e.target.value));
$("rank-control").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (b) setState({ rank: b.dataset.value });
});

let playTimer = null;
function stopPlay() {
  clearInterval(playTimer);
  playTimer = null;
  $("play").classList.remove("is-playing");
  $("play").setAttribute("aria-label", "Play through the years");
}
$("play").addEventListener("click", () => {
  if (playTimer) return stopPlay();
  const years = src().years;
  if (state.year === years[years.length - 1]) setState({ year: years[0] });
  $("play").classList.add("is-playing");
  $("play").setAttribute("aria-label", "Pause");
  playTimer = setInterval(() => {
    const i = years.indexOf(state.year);
    if (i >= years.length - 1) return stopPlay();
    setState({ year: years[i + 1] });
  }, 1100);
});

function selectCountry(iso) {
  if (!src().countries[iso]) return;
  setState({ country: iso });
}

/* =========================================================
   Map
   ========================================================= */
const map = createMap({
  container: $("map"),
  topo,
  onHover(iso, x, y) {
    const rows = ranked(state.source, state.pathogen, state.year);
    const r = rows.find((d) => d.iso === iso);
    showTooltip({
      title: nameOf(iso),
      sub: r ? `${ordinal(r.rank)} highest of ${rows.length} · ${state.year}` : String(state.year),
      rows: SOURCES[state.source].pathogens.map((p) => ({
        key: PATHOGENS[p].short,
        color: pathogenColor(p),
        shape: "square",
        value: fmtPct(src().resistance[p]?.[iso]?.[state.year]),
      })),
    }, x, y);
  },
  onLeave: hideTooltip,
  onSelect: selectCountry,
});
$("zoom-in").addEventListener("click", () => map.zoomBy(1.6));
$("zoom-out").addEventListener("click", () => map.zoomBy(1 / 1.6));
$("zoom-reset").addEventListener("click", () => map.reset());

function renderLegend(container, title) {
  const color = makeColorScale();
  container.replaceChildren(
    el("span", { class: "legend__title" }, title),
    el("span", { class: "legend__scale" }, ...BIN_LABELS.map((label, i) =>
      el("span", { class: "legend__step" }, el("i", { style: `background:${cssVar(RAMP_VARS[i])}` }), el("span", {}, `${label}%`)))),
    el("span", { class: "legend__nodata" }, el("i"), "No data"),
  );
  return color;
}

function renderMap() {
  const p = PATHOGENS[state.pathogen];
  const values = valuesFor(state.source, state.pathogen, state.year);
  $("map-title").textContent = `${p.short} resistant to ${p.drug}, ${state.year}`;
  $("map-sub").textContent = `${SOURCES[state.source].name} · ${SOURCES[state.source].measure}`;
  const color = renderLegend($("map-legend"), "Resistant");
  map.update({ values, selected: state.country, color });
  $("map").setAttribute("aria-label",
    `Map of ${p.short} resistance in ${state.year}. ${values.size} countries reported. Full values are in the data table below.`);

  const rows = ranked(state.source, state.pathogen, state.year);
  const insight = $("map-insight");
  insight.replaceChildren();
  if (!rows.length) return insight.append("No countries reported for this selection.");
  const hi = rows[0];
  const lo = rows[rows.length - 1];
  const med = d3.median(rows, (r) => r.value);
  insight.append(
    `In ${state.year}, `, el("b", {}, `${rows.length} countries`), ` reported ${p.short} data. Resistance ranged from `,
    el("b", {}, fmtPct(lo.value)), ` in ${lo.name} to `, el("b", {}, fmtPct(hi.value)), ` in ${hi.name}. In the median country, `,
    el("b", {}, `${fmtPct(med, 0)} of infections`), " didn’t respond to first-line treatment.",
  );
}

/* =========================================================
   Profile panel
   ========================================================= */
function renderProfile() {
  const panel = $("profile");
  const iso = state.country;
  const s = SOURCES[state.source];
  const p = PATHOGENS[state.pathogen];
  const rows = ranked(state.source, state.pathogen, state.year);
  const me = rows.find((r) => r.iso === iso);
  const series = seriesFor(state.source, state.pathogen, iso);
  const latest = series[series.length - 1];
  const med = d3.median(rows, (r) => r.value);

  const hero = me
    ? el("div", {},
      el("div", { class: "profile__hero" },
        el("span", { class: "profile__value" }, fmtNum(me.value), el("small", {}, "%"))),
      el("p", { class: "profile__caption" }, `of ${p.short} infections resistant to ${p.drug} in ${state.year}`),
      el("div", { class: "meter", style: "margin-top:12px", role: "img", "aria-label": `${fmtPct(me.value)} on a 0 to 100% scale` },
        el("i", { style: `width:${me.value}%;background:${makeColorScale()(me.value)}` })))
    : el("p", { class: "profile__empty" },
      `No ${p.short} data reported for ${state.year}.`,
      latest ? ` Latest: ${fmtPct(latest.value)} in ${latest.year}.` : "");

  const first = series[0];
  const change = latest && first && latest.year !== first.year ? latest.value - first.value : null;
  const use = consumptionFor(state.source, iso, state.year);
  const facts = el("div", { class: "profile__facts" },
    fact("Rank", me ? `${ordinal(me.rank)} of ${rows.length}` : "—"),
    fact("vs median", me && med != null ? `${fmtSigned(me.value - med)} pp` : "—"),
    fact(change != null ? `Change ${first.year}–${String(latest.year).slice(2)}` : "Change", change != null ? `${fmtSigned(change)} pp` : "—"),
    fact("Antibiotic use", use != null ? `${fmtNum(use)} DDD` : "—"),
  );

  const years = src().years;
  const list = el("div", { class: "profile__series" },
    ...s.pathogens.map((key) => {
      const pts = seriesFor(state.source, key, iso);
      const last = pts[pts.length - 1];
      return el("div", { class: "pseries" },
        el("span", { class: "pseries__name" }, el("span", { class: "swatch", style: `background:${pathogenColor(key)}` }), PATHOGENS[key].short),
        sparkline(pts, { color: pathogenColor(key), domain: [0, 100], years }),
        el("span", { class: "pseries__val" }, last ? fmtPct(last.value, 0) : "—"));
    }));

  panel.replaceChildren(
    el("div", { class: "profile__flagline" },
      el("h3", { class: "profile__name" }, nameOf(iso)),
      el("span", { class: "profile__iso" }, iso)),
    hero, facts,
    el("div", {}, el("p", { class: "fact__label", style: "margin-bottom:8px" }, `All tracked pathogens · ${years[0]}–${years[years.length - 1]}`), list),
    el("p", { class: "profile__note" }, "DDD = defined daily doses per 1,000 people per day. pp = percentage points. Click any country on the map, ranking or table to switch."),
  );

  function fact(label, value) {
    return el("div", { class: "fact" }, el("div", { class: "fact__label" }, label), el("div", { class: "fact__value" }, value));
  }
}

/* =========================================================
   Ranking, trend, heatmap, scatter
   ========================================================= */
function renderRankingCard() {
  const rows = ranked(state.source, state.pathogen, state.year);
  const shown = state.rank === "high" ? rows.slice(0, 15) : rows.slice(-15).reverse();
  const p = PATHOGENS[state.pathogen];
  $("rank-title").textContent = `${state.rank === "high" ? "Highest" : "Lowest"} ${p.short} resistance, ${state.year}`;
  $("rank-sub").textContent = `${shown.length} of ${rows.length} reporting countries · click a bar to open its profile`;
  renderRanking($("ranking"), {
    rows: shown, total: rows.length, color: pathogenColor(state.pathogen), selected: state.country,
    median: d3.median(rows, (r) => r.value), onSelect: selectCountry, order: state.rank,
  });
}

function renderTrendCard() {
  const s = SOURCES[state.source];
  const series = s.pathogens.map((key) => ({
    key, label: PATHOGENS[key].short, color: pathogenColor(key), points: seriesFor(state.source, key, state.country),
  }));
  $("trend-title").textContent = `${nameOf(state.country)} over time`;
  $("trend-sub").textContent = `${s.name} · ${s.measure}`;
  $("trend-legend").replaceChildren(
    ...series.map((d) => el("span", { class: "legend__item" }, el("i", { class: "legend__line", style: `background:${d.color}` }), d.label)),
    el("span", { class: "legend__item" }, el("i", { class: "legend__band" }), `All countries · ${PATHOGENS[state.pathogen].short}`),
  );
  renderTrend($("trend"), {
    series, band: distribution(state.source, state.pathogen), bandLabel: `All-country ${PATHOGENS[state.pathogen].short}`,
    years: src().years, title: nameOf(state.country),
  });
}

function renderHeatCard() {
  const ecdc = src("ecdc");
  segmented($("heat-control"), SOURCES.ecdc.pathogens.map((value) => ({ value, label: PATHOGENS[value].short })), heatPathogen,
    (value) => { heatPathogen = value; renderHeatCard(); });
  const byIso = ecdc.resistance[heatPathogen];
  const lastOf = (years) => years[d3.max(Object.keys(years), Number)];
  const rows = Object.entries(byIso)
    .map(([iso, values]) => ({ iso, name: ecdc.countries[iso], values }))
    .sort((a, b) => d3.descending(lastOf(a.values), lastOf(b.values)));
  $("heat-title").textContent = `${PATHOGENS[heatPathogen].short} resistant to ${PATHOGENS[heatPathogen].drug}`;
  const color = renderLegend($("heat-legend"), "Resistant");
  renderHeatmap($("heatmap"), {
    rows, years: ecdc.years, color, label: `${PATHOGENS[heatPathogen].short} resistant`,
    selected: state.source === "ecdc" ? state.country : null,
    onSelect: (iso) => {
      setState({ source: "ecdc", country: iso, pathogen: heatPathogen });
      map.setFocus("europe");
      $("explorer").scrollIntoView();
    },
  });
}

function renderScatterCard() {
  const s = src();
  const p = PATHOGENS[state.pathogen];
  const points = [];
  for (const [iso, years] of Object.entries(s.resistance[state.pathogen] ?? {})) {
    const paired = Object.entries(years)
      .map(([y, v]) => ({ y: +y, r: v, c: s.consumption[iso]?.[y] }))
      .filter((d) => d.c != null);
    if (!paired.length) continue;
    const span = d3.extent(paired, (d) => d.y);
    points.push({
      iso, name: s.countries[iso],
      x: d3.mean(paired, (d) => d.c), y: d3.mean(paired, (d) => d.r),
      years: span[0] === span[1] ? `${span[0]}` : `Average of ${paired.length} years, ${span[0]}–${span[1]}`,
    });
  }
  const fit = regression(points);
  $("scatter-title").textContent = `Antibiotic use vs ${p.short} resistance`;
  $("scatter-sub").textContent = `${SOURCES[state.source].name} · ${points.length} countries with both measures`;
  renderScatter($("scatter"), {
    points, fit, color: pathogenColor(state.pathogen), selected: state.country, onSelect: selectCountry,
    label: `${p.short} resistant`,
  });

  const corr = $("corr");
  if (!fit) return corr.replaceChildren(el("p", { class: "corr__text" }, "Not enough paired data to estimate a correlation."));
  const a = Math.abs(fit.r);
  const strength = a < 0.1 ? "almost no" : a < 0.3 ? "a weak" : a < 0.5 ? "a moderate" : "a strong";
  const dir = fit.r >= 0 ? "rise" : "fall";
  corr.replaceChildren(
    el("p", { class: "corr__label" }, "Correlation (Pearson r)"),
    el("p", { class: "corr__r" }, d3.format(".2f")(fit.r)),
    el("div", { class: "corr__meter", role: "img", "aria-label": `r = ${fit.r.toFixed(2)} on a scale from −1 to +1` },
      el("i", { style: `left:${((fit.r + 1) / 2) * 100}%` })),
    el("div", { class: "corr__ticks" }, el("span", {}, "−1"), el("span", {}, "0"), el("span", {}, "+1")),
    el("p", { class: "corr__text" },
      "Across ", el("b", {}, `${fit.n} countries`), `, higher antibiotic use goes with ${strength} ${dir} in ${p.short} resistance. Use alone explains about `,
      el("b", {}, `${Math.round(fit.r ** 2 * 100)}%`), " of the difference between countries — infection control, sanitation, diagnostics and prescribing quality matter too."),
    el("p", { class: "profile__note" }, "Line: least-squares fit. Correlation is not causation."),
  );
}

/* =========================================================
   Headline stats (fixed: latest global & European picture)
   ========================================================= */
function renderStats() {
  const g = "glass";
  const years = src(g).years;
  const last = years[years.length - 1];
  const tiles = [];

  for (const key of ["ecoli", "mrsa"]) {
    const dist = distribution(g, key).filter((d) => d.n >= 10);
    const cur = dist.find((d) => d.year === last);
    // Like-for-like change: only countries reporting in both years.
    const base = 2018;
    const a = src(g).resistance[key];
    const diffs = Object.values(a).filter((y) => y[base] != null && y[last] != null).map((y) => y[last] - y[base]);
    tiles.push({
      label: `Median ${PATHOGENS[key].short} resistance, ${last}`,
      value: [fmtNum(cur.median, 0), "%"],
      delta: [el("b", {}, `${fmtSigned(d3.median(diffs))} pp`), ` median change since ${base} across ${diffs.length} countries`],
      spark: dist.map((d) => ({ year: d.year, value: d.median })),
      color: pathogenColor(key),
    });
  }

  const counts = years.map((y) => ({
    year: y,
    value: new Set([...valuesFor(g, "ecoli", y).keys(), ...valuesFor(g, "mrsa", y).keys()]).size,
  }));
  tiles.push({
    label: `Countries reporting to WHO GLASS, ${last}`,
    value: [String(counts[counts.length - 1].value), ""],
    delta: ["Up from ", el("b", {}, String(counts[0].value)), ` in ${years[0]} — surveillance is growing`],
    spark: counts,
    color: cssVar("--steel"),
  });

  const ey = src("ecdc").years;
  const kp = ey.map((y) => ({ year: y, value: [...valuesFor("ecdc", "kpn", y).values()].filter((v) => v >= 25).length }));
  const kpLast = kp[kp.length - 1];
  const kpTotal = valuesFor("ecdc", "kpn", kpLast.year).size;
  tiles.push({
    label: `European countries with ≥25% resistant K. pneumoniae, ${kpLast.year}`,
    value: [String(kpLast.value), ` of ${kpTotal}`],
    delta: ["ECDC EARS-Net · ", el("b", {}, String(kp[0].value)), ` in ${ey[0]}`],
    spark: kp,
    color: pathogenColor("kpn"),
  });

  $("stats").replaceChildren(...tiles.map((t) => {
    const card = el("article", { class: "stat fx-glow fx-tilt" },
      el("p", { class: "stat__label" }, t.label),
      el("p", { class: "stat__value" }, t.value[0], el("small", {}, t.value[1])),
      el("p", { class: "stat__delta" }, ...t.delta));
    card.append(sparkline(t.spark, { color: t.color, width: 240, height: 36 }));
    return card;
  }));

  const all = new Set([...Object.keys(src("glass").countries), ...Object.keys(src("ecdc").countries)]);
  $("hero-country-count").textContent = `${all.size}`;
}

/* =========================================================
   Data table
   ========================================================= */
const tableState = { sort: "name", dir: "ascending", q: "" };

function tableRows() {
  const s = src();
  const first = s.years[0];
  return Object.entries(s.countries).map(([iso, name]) => {
    const row = { iso, name, use: consumptionFor(state.source, iso, state.year) };
    for (const p of SOURCES[state.source].pathogens) row[p] = s.resistance[p]?.[iso]?.[state.year];
    const series = seriesFor(state.source, state.pathogen, iso);
    row.change = series.length > 1 ? series[series.length - 1].value - series[0].value : null;
    row.first = first;
    return row;
  });
}

function renderTable() {
  const s = SOURCES[state.source];
  const cols = [
    { key: "name", label: "Country" },
    ...s.pathogens.map((p) => ({ key: p, label: `${PATHOGENS[p].short} %`, pathogen: p })),
    { key: "change", label: `Δ ${PATHOGENS[state.pathogen].short} (pp)` },
    { key: "use", label: "Use (DDD)" },
  ];
  const color = makeColorScale();
  let rows = tableRows().filter((r) => r.name.toLowerCase().includes(tableState.q));
  const dirFn = tableState.dir === "ascending" ? d3.ascending : d3.descending;
  rows.sort((a, b) => {
    const va = a[tableState.sort];
    const vb = b[tableState.sort];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    return dirFn(va, vb);
  });

  const thead = el("thead", {}, el("tr", {}, ...cols.map((c) => {
    const th = el("th", { scope: "col", "aria-sort": tableState.sort === c.key ? tableState.dir : "none" });
    th.append(el("button", {
      type: "button",
      onclick: () => {
        tableState.dir = tableState.sort === c.key && tableState.dir === "descending" ? "ascending"
          : tableState.sort === c.key ? "descending" : c.key === "name" ? "ascending" : "descending";
        tableState.sort = c.key;
        renderTable();
        document.querySelector(`#table th[aria-sort]:not([aria-sort="none"]) button`)?.focus();
      },
    }, c.label));
    return th;
  })));

  const tbody = el("tbody", {}, ...rows.map((r) => {
    const tr = el("tr", { class: r.iso === state.country ? "is-selected" : null, onclick: () => selectCountry(r.iso) });
    for (const c of cols) {
      const v = r[c.key];
      if (c.key === "name") tr.append(el("td", {}, r.name));
      else if (c.pathogen) {
        tr.append(el("td", {}, v == null ? el("span", { class: "muted" }, "—")
          : el("span", { class: "cell-pill" }, el("i", { style: `background:${color(v)}` }), fmtNum(v))));
      } else if (c.key === "change") {
        tr.append(el("td", { class: v == null ? "muted" : v > 0 ? "delta-up" : "delta-down" }, v == null ? "—" : fmtSigned(v)));
      } else tr.append(el("td", { class: v == null ? "muted" : null }, v == null ? "—" : fmtNum(v)));
    }
    return tr;
  }));

  $("table").replaceChildren(
    el("caption", { class: "visually-hidden" }, `${s.name} resistance by country, ${state.year}`), thead, tbody);
  $("table-sub").textContent = `${s.name} · ${state.year} · ${rows.length} countries · Δ = change from first to latest report`;
}

$("table-search").addEventListener("input", (e) => {
  tableState.q = e.target.value.trim().toLowerCase();
  renderTable();
});

$("download").addEventListener("click", () => {
  const s = src();
  const lines = [["iso3", "country", "year", "pathogen", "antibiotic", "resistance_pct", "consumption_ddd_per_1000_per_day"]];
  for (const p of SOURCES[state.source].pathogens) {
    for (const [iso, years] of Object.entries(s.resistance[p])) {
      for (const [y, v] of Object.entries(years)) {
        lines.push([iso, s.countries[iso], y, PATHOGENS[p].name, PATHOGENS[p].drug, v, s.consumption[iso]?.[y] ?? ""]);
      }
    }
  }
  const csv = lines.map((l) => l.map((v) => (/[",]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v)).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = el("a", { href: url, download: `amr-${state.source}.csv` });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

/* =========================================================
   Theme, menu & render loop
   ========================================================= */
$("theme-toggle").addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches;
  const next = dark ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("amr-theme", next); } catch (e) { /* storage unavailable */ }
  renderEverything();
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => renderEverything());

$("menu-toggle").addEventListener("click", () => {
  const open = $("nav-links").classList.toggle("is-open");
  $("menu-toggle").setAttribute("aria-expanded", String(open));
});
$("nav-links").addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    $("nav-links").classList.remove("is-open");
    $("menu-toggle").setAttribute("aria-expanded", "false");
  }
});

function renderAll() {
  renderControls();
  renderMap();
  renderProfile();
  renderRankingCard();
  renderTrendCard();
  renderScatterCard();
  renderTable();
  if (state.source === "ecdc") renderHeatCard();
}
function renderEverything() {
  renderStats();
  renderAll();
  renderHeatCard();
  story?.redraw();
}

/** Jump to a view from the findings carousel or the story. */
function go(view) {
  const { scrollTo = "explorer", ...patch } = view;
  stopPlay();
  setState(patch);
  map.setFocus(state.source === "ecdc" ? "europe" : "world");
  document.getElementById(scrollTo).scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}
let story = null;

readHash();
writeHash();
renderEverything();
buildFindings({ data, go });
story = buildStory({ data, go });
initFx();
if (state.source === "ecdc") map.setFocus("europe", false);

// Charts are drawn to their container width, so redraw on resize.
onResize($("ranking"), renderRankingCard);
onResize($("trend"), renderTrendCard);
onResize($("heatmap"), renderHeatCard);
onResize($("scatter"), renderScatterCard);
