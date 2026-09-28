import { cssVar, fmtPct, fmtNum, hBarPath, showTooltip, hideTooltip, focusPoint, ordinal, el } from "./utils.js";

const d3 = window.d3;

function emptyState(container, message) {
  container.replaceChildren(el("p", { class: "empty-state" }, message));
}

/* ------------------------------------------------------------------
   Ranking — horizontal bars, one series, value at the tip
   ------------------------------------------------------------------ */
export function renderRanking(container, { rows, total, color, selected, median, onSelect, order }) {
  const width = container.clientWidth;
  if (!rows.length) return emptyState(container, "No countries reported data for this selection.");

  const narrow = width < 520;
  const rowH = 30;
  const barH = 18;
  const m = { top: 28, right: 56, bottom: 8, left: narrow ? 112 : 170 };
  const height = m.top + rows.length * rowH + m.bottom;
  const x = d3.scaleLinear()
    .domain([0, Math.max(10, d3.max(rows, (d) => d.value), median ?? 0)]).nice()
    .range([m.left, width - m.right]);

  const svg = d3.create("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("role", "list")
    .attr("aria-label", "Country ranking");

  svg.append("g").attr("class", "grid")
    .attr("transform", `translate(0,${m.top - 6})`)
    .call(d3.axisTop(x).ticks(narrow ? 3 : 6).tickSize(-(rows.length * rowH)).tickFormat((v) => `${v}%`))
    .call((g) => g.select(".domain").remove())
    .call((g) => g.selectAll("text").attr("class", "tick-label").attr("dy", "-2"));

  const row = svg.append("g").selectAll("g")
    .data(rows)
    .join("g")
    .attr("class", (d) => `bar-row${d.iso === selected ? " is-selected" : ""}`)
    .attr("transform", (d, i) => `translate(0,${m.top + i * rowH})`)
    .attr("role", "listitem")
    .attr("tabindex", 0)
    .attr("aria-label", (d) => `${d.name}: ${fmtPct(d.value)}, ${ordinal(d.rank)} highest of ${total}`);

  // Hit target spans the whole row, bigger than the painted bar.
  row.append("rect").attr("class", "bar-hit").attr("x", 0).attr("y", 0)
    .attr("width", width).attr("height", rowH).attr("fill", "transparent").attr("rx", 6);
  row.append("path").attr("class", "bar")
    .attr("d", (d) => hBarPath(x(0), x(d.value), (rowH - barH) / 2, barH))
    .attr("fill", color);
  row.append("text").attr("class", "chart-label")
    .attr("x", m.left - 10).attr("y", rowH / 2).attr("dy", "0.35em").attr("text-anchor", "end")
    .text((d) => (narrow && d.name.length > 14 ? `${d.name.slice(0, 13)}…` : d.name));
  row.append("text").attr("class", "chart-label chart-label--strong")
    .attr("x", (d) => x(d.value) + 6).attr("y", rowH / 2).attr("dy", "0.35em")
    .text((d) => fmtPct(d.value));

  if (median != null) {
    const mx = x(median);
    svg.append("line").attr("class", "median-line")
      .attr("x1", mx).attr("x2", mx).attr("y1", m.top - 4).attr("y2", height - m.bottom);
    svg.append("text").attr("class", "axis-title")
      .attr("x", mx).attr("y", height).attr("dy", "0.9em").attr("text-anchor", "middle")
      .text(`median ${fmtPct(median)}`);
    svg.attr("viewBox", `0 0 ${width} ${height + 16}`);
  }

  const tip = (d, px, py) => showTooltip({
    title: d.name,
    sub: order === "high" ? `${ordinal(d.rank)} highest of ${total}` : `${ordinal(total - d.rank + 1)} lowest of ${total}`,
    rows: [{ key: "Resistant", color, shape: "square", value: fmtPct(d.value) }],
  }, px, py);
  row
    .on("pointermove", (event, d) => tip(d, event.clientX, event.clientY))
    .on("pointerleave blur", hideTooltip)
    .on("focus", function (event, d) { tip(d, ...focusPoint(this)); })
    .on("click", (event, d) => onSelect(d.iso))
    .on("keydown", (event, d) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(d.iso); } });

  container.replaceChildren(svg.node());
}

/* ------------------------------------------------------------------
   Trend — lines per pathogen + median / IQR band, crosshair tooltip
   ------------------------------------------------------------------ */
export function renderTrend(container, { series, band, bandLabel, years, title }) {
  const width = container.clientWidth;
  const hasData = series.some((s) => s.points.length);
  if (!hasData) return emptyState(container, `${title} has not reported data for these pathogens.`);

  const narrow = width < 520;
  const height = narrow ? 300 : 380;
  const m = { top: 16, right: narrow ? 16 : 28, bottom: 32, left: 44 };
  const x = d3.scaleLinear().domain(d3.extent(years)).range([m.left, width - m.right]);
  const yMax = d3.max([...series.flatMap((s) => s.points.map((p) => p.value)), ...band.map((b) => b.q3)]);
  const y = d3.scaleLinear().domain([0, Math.max(10, yMax)]).nice().range([height - m.bottom, m.top]);

  const svg = d3.create("svg").attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img").attr("aria-label", `Resistance over time for ${title}`);

  svg.append("g").attr("class", "grid")
    .attr("transform", `translate(${m.left},0)`)
    .call(d3.axisLeft(y).ticks(5).tickSize(-(width - m.left - m.right)).tickFormat((v) => `${v}%`))
    .call((g) => g.select(".domain").remove())
    .call((g) => g.selectAll("text").attr("x", -8));
  svg.append("g").attr("class", "axis")
    .attr("transform", `translate(0,${height - m.bottom})`)
    .call(d3.axisBottom(x).tickValues(years.filter((yr, i) => !narrow || i % 2 === 0 || i === years.length - 1)).tickFormat(d3.format("d")).tickSizeOuter(0));

  // Reference band: interquartile range + median across reporting countries.
  const bandPts = band.filter((b) => b.n >= 3);
  svg.append("path").datum(bandPts)
    .attr("fill", cssVar("--band"))
    .attr("d", d3.area().x((d) => x(d.year)).y0((d) => y(d.q1)).y1((d) => y(d.q3)).curve(d3.curveMonotoneX));
  svg.append("path").datum(bandPts)
    .attr("fill", "none").attr("stroke", cssVar("--median")).attr("stroke-width", 1.5)
    .attr("d", d3.line().x((d) => x(d.year)).y((d) => y(d.median)).curve(d3.curveMonotoneX));

  const line = d3.line().x((d) => x(d.year)).y((d) => y(d.value)).curve(d3.curveMonotoneX);
  const surface = cssVar("--surface");
  for (const s of series) {
    if (!s.points.length) continue;
    svg.append("path").datum(s.points)
      .attr("fill", "none").attr("stroke", s.color).attr("stroke-width", 2.5)
      .attr("stroke-linejoin", "round").attr("stroke-linecap", "round").attr("d", line);
    svg.append("g").selectAll("circle").data(s.points).join("circle")
      .attr("cx", (d) => x(d.year)).attr("cy", (d) => y(d.value)).attr("r", 4)
      .attr("fill", s.color).attr("stroke", surface).attr("stroke-width", 2);
    // Direct label at the line end (only when there's room to the right).
    const last = s.points[s.points.length - 1];
    if (!narrow && series.length <= 3) {
      svg.append("text").attr("class", "chart-label chart-label--strong")
        .attr("x", x(last.year) + 8).attr("y", y(last.value)).attr("dy", "0.35em")
        .attr("text-anchor", last.year === years[years.length - 1] ? "start" : "start")
        .text(fmtPct(last.value, 0));
    }
  }

  // Crosshair — snaps to the nearest year; lists every series.
  const cross = svg.append("line").attr("class", "crosshair")
    .attr("y1", m.top).attr("y2", height - m.bottom).style("opacity", 0);
  svg.append("rect")
    .attr("x", m.left).attr("y", m.top).attr("width", width - m.left - m.right).attr("height", height - m.top - m.bottom)
    .attr("fill", "transparent")
    .on("pointermove", (event) => {
      const [px] = d3.pointer(event);
      const year = years.reduce((a, b) => (Math.abs(x(b) - px) < Math.abs(x(a) - px) ? b : a));
      cross.attr("x1", x(year)).attr("x2", x(year)).style("opacity", 1);
      const b = band.find((d) => d.year === year);
      showTooltip({
        title: String(year),
        rows: [
          ...series.map((s) => ({ key: s.label, color: s.color, value: fmtPct(s.points.find((p) => p.year === year)?.value) })),
          { key: `${bandLabel} median`, color: cssVar("--median"), value: b && b.n >= 3 ? fmtPct(b.median) : "—" },
        ],
      }, event.clientX, event.clientY);
    })
    .on("pointerleave", () => { cross.style("opacity", 0); hideTooltip(); });

  container.replaceChildren(svg.node());
}

/* ------------------------------------------------------------------
   Heatmap — countries × years, sequential cells with a 2px gap
   ------------------------------------------------------------------ */
export function renderHeatmap(container, { rows, years, color, label, selected, onSelect }) {
  const width = container.clientWidth;
  if (!rows.length) return emptyState(container, "No data.");
  const narrow = width < 560;
  const m = { top: 24, right: 8, bottom: 4, left: narrow ? 92 : 128 };
  const cellW = (width - m.left - m.right) / years.length;
  const cellH = narrow ? 18 : 22;
  const height = m.top + rows.length * cellH + m.bottom;
  const surface = cssVar("--surface");

  const svg = d3.create("svg").attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "grid").attr("aria-label", `${label} by country and year`);

  svg.append("g").selectAll("text").data(years).join("text")
    .attr("class", "tick-label axis-title")
    .attr("x", (d, i) => m.left + i * cellW + cellW / 2).attr("y", m.top - 8).attr("text-anchor", "middle")
    .text((d) => (narrow ? `’${String(d).slice(2)}` : d));

  const row = svg.append("g").selectAll("g").data(rows).join("g")
    .attr("class", "heat-row").attr("role", "row")
    .attr("transform", (d, i) => `translate(0,${m.top + i * cellH})`);
  row.append("text").attr("class", (d) => `chart-label heat-label${d.iso === selected ? " chart-label--strong" : ""}`)
    .attr("x", m.left - 8).attr("y", cellH / 2).attr("dy", "0.35em").attr("text-anchor", "end")
    .style("cursor", "pointer")
    .text((d) => d.name)
    .on("click", (event, d) => onSelect(d.iso));

  row.selectAll("rect").data((d) => years.map((year) => ({ row: d, year, value: d.values[year] })))
    .join("rect")
    .attr("class", "heat-cell").attr("role", "gridcell").attr("tabindex", (d) => (d.value == null ? null : 0))
    .attr("aria-label", (d) => `${d.row.name} ${d.year}: ${fmtPct(d.value)}`)
    .attr("x", (d, i) => m.left + i * cellW + 1).attr("y", 1)
    .attr("width", Math.max(1, cellW - 2)).attr("height", cellH - 2).attr("rx", 3)
    .attr("fill", (d) => (d.value == null ? "url(#heat-nodata)" : color(d.value)))
    .attr("stroke", surface).attr("stroke-width", 0)
    .on("pointermove", (event, d) => cellTip(d, event.clientX, event.clientY))
    .on("focus", function (event, d) { cellTip(d, ...focusPoint(this)); })
    .on("pointerleave blur", hideTooltip)
    .on("click", (event, d) => onSelect(d.row.iso));

  const defs = svg.insert("defs", ":first-child");
  const p = defs.append("pattern").attr("id", "heat-nodata").attr("patternUnits", "userSpaceOnUse")
    .attr("width", 6).attr("height", 6).attr("patternTransform", "rotate(45)");
  p.append("rect").attr("width", 6).attr("height", 6).attr("fill", cssVar("--nodata"));
  p.append("line").attr("y2", 6).attr("stroke", cssVar("--nodata-hatch")).attr("stroke-width", 2);

  function cellTip(d, px, py) {
    const prev = d.row.values[d.year - 1];
    showTooltip({
      title: `${d.row.name} · ${d.year}`,
      rows: [
        { key: label, color: d.value == null ? null : color(d.value), shape: "square", value: fmtPct(d.value) },
        ...(prev != null && d.value != null ? [{ key: "vs previous year", value: `${d.value - prev >= 0 ? "+" : "−"}${fmtNum(Math.abs(d.value - prev))} pp` }] : []),
      ],
    }, px, py);
  }

  container.replaceChildren(svg.node());
}

/* ------------------------------------------------------------------
   Scatter — consumption (x) vs resistance (y), nearest-point hover
   ------------------------------------------------------------------ */
export function renderScatter(container, { points, fit, color, selected, onSelect, label }) {
  const width = container.clientWidth;
  if (points.length < 3) return emptyState(container, "Too few countries report both antibiotic use and resistance for this selection.");

  const narrow = width < 520;
  const height = narrow ? 320 : 400;
  const m = { top: 16, right: 20, bottom: 48, left: 52 };
  const x = d3.scaleLinear().domain([0, d3.max(points, (p) => p.x) * 1.05]).nice().range([m.left, width - m.right]);
  const y = d3.scaleLinear().domain([0, Math.max(10, d3.max(points, (p) => p.y) * 1.05)]).nice().range([height - m.bottom, m.top]);
  const surface = cssVar("--surface");

  const svg = d3.create("svg").attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img").attr("aria-label", `Scatter plot of antibiotic consumption against ${label}`);

  svg.append("g").attr("class", "grid")
    .attr("transform", `translate(${m.left},0)`)
    .call(d3.axisLeft(y).ticks(5).tickSize(-(width - m.left - m.right)).tickFormat((v) => `${v}%`))
    .call((g) => g.select(".domain").remove()).call((g) => g.selectAll("text").attr("x", -8));
  svg.append("g").attr("class", "axis")
    .attr("transform", `translate(0,${height - m.bottom})`)
    .call(d3.axisBottom(x).ticks(narrow ? 4 : 7).tickSizeOuter(0));
  svg.append("text").attr("class", "axis-title")
    .attr("x", width - m.right).attr("y", height - 6).attr("text-anchor", "end")
    .text("Antibiotic use · DDD per 1,000 people per day →");

  if (fit) {
    const [x0, x1] = x.domain();
    const clampY = (v) => Math.max(y.domain()[0], Math.min(y.domain()[1], v));
    svg.append("line").attr("class", "fit-line")
      .attr("x1", x(x0)).attr("y1", y(clampY(fit.intercept + fit.slope * x0)))
      .attr("x2", x(x1)).attr("y2", y(clampY(fit.intercept + fit.slope * x1)));
  }

  const dots = svg.append("g").selectAll("circle").data(points).join("circle")
    .attr("class", (d) => `dot-point${d.iso === selected ? " is-selected" : ""}`)
    .attr("cx", (d) => x(d.x)).attr("cy", (d) => y(d.y)).attr("r", (d) => (d.iso === selected ? 7 : 5.5))
    .attr("fill", color).attr("fill-opacity", 0.85).attr("stroke", surface);
  dots.filter((d) => d.iso === selected).raise();

  // Label the selected country and the two extremes — sparingly.
  const extremes = new Set([
    d3.greatest(points, (p) => p.y)?.iso,
    d3.least(points, (p) => p.y)?.iso,
    selected,
  ]);
  svg.append("g").selectAll("text").data(points.filter((p) => extremes.has(p.iso))).join("text")
    .attr("class", (d) => `chart-label${d.iso === selected ? " chart-label--strong" : ""}`)
    .attr("x", (d) => x(d.x) + (x(d.x) > width - 120 ? -10 : 10))
    .attr("text-anchor", (d) => (x(d.x) > width - 120 ? "end" : "start"))
    .attr("y", (d) => y(d.y)).attr("dy", "0.35em")
    .text((d) => d.name);

  // Nearest-point hover via Delaunay, so the reader never has to hit a 10px dot.
  const delaunay = d3.Delaunay.from(points, (p) => x(p.x), (p) => y(p.y));
  let active = -1;
  svg.append("rect").attr("x", m.left).attr("y", m.top)
    .attr("width", width - m.left - m.right).attr("height", height - m.top - m.bottom)
    .attr("fill", "transparent").style("cursor", "pointer")
    .on("pointermove", (event) => {
      const [px, py] = d3.pointer(event);
      const i = delaunay.find(px, py);
      const p = points[i];
      const dist = Math.hypot(x(p.x) - px, y(p.y) - py);
      if (dist > 40) { active = -1; dots.attr("fill-opacity", 0.85); return hideTooltip(); }
      active = i;
      dots.attr("fill-opacity", (d, j) => (j === i ? 1 : 0.35));
      showTooltip({
        title: p.name,
        sub: p.years,
        rows: [
          { key: label, color, value: fmtPct(p.y) },
          { key: "Antibiotic use (DDD)", value: fmtNum(p.x) },
        ],
      }, event.clientX, event.clientY);
    })
    .on("pointerleave", () => { active = -1; dots.attr("fill-opacity", 0.85); hideTooltip(); })
    .on("click", () => { if (active >= 0) onSelect(points[active].iso); });

  container.replaceChildren(svg.node());
}

/* ------------------------------------------------------------------
   Sparkline — tiny trend used in stat tiles and the profile panel
   ------------------------------------------------------------------ */
export function sparkline(points, { color, width = 96, height = 28, domain, years }) {
  const svg = d3.create("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("aria-hidden", "true");
  if (points.length < 2) {
    if (points.length === 1) {
      svg.append("circle").attr("cx", width - 4).attr("cy", height / 2).attr("r", 3.5).attr("fill", color);
    }
    return svg.node();
  }
  const x = d3.scaleLinear().domain(years ? d3.extent(years) : d3.extent(points, (p) => p.year)).range([3, width - 4]);
  const y = d3.scaleLinear().domain(domain ?? d3.extent(points, (p) => p.value)).range([height - 3, 3]);
  svg.append("path").datum(points)
    .attr("fill", "none").attr("stroke", color).attr("stroke-width", 2)
    .attr("stroke-linecap", "round").attr("stroke-linejoin", "round")
    .attr("d", d3.line().x((p) => x(p.year)).y((p) => y(p.value)).curve(d3.curveMonotoneX));
  const last = points[points.length - 1];
  svg.append("circle").attr("cx", x(last.year)).attr("cy", y(last.value)).attr("r", 3.5)
    .attr("fill", color).attr("stroke", cssVar("--surface")).attr("stroke-width", 2);
  return svg.node();
}
