import { BREAKS, RAMP_VARS } from "./config.js";

const d3 = window.d3;

/** Read a CSS custom property from :root (resolves the active theme). */
export function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Sequential colour for a resistance percentage, using the themed ramp. */
export function makeColorScale() {
  const ramp = RAMP_VARS.map(cssVar);
  return d3.scaleThreshold().domain(BREAKS).range(ramp);
}

export const fmtPct = (v, digits = 1) => (v == null || Number.isNaN(v) ? "—" : `${d3.format(`.${digits}f`)(v)}%`);
export const fmtNum = (v, digits = 1) => (v == null || Number.isNaN(v) ? "—" : d3.format(`,.${digits}f`)(v));
export const fmtSigned = (v, digits = 1) => (v == null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : "±"}${d3.format(`.${digits}f`)(Math.abs(v))}`);

export function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Pearson correlation coefficient and least-squares line for paired values. */
export function regression(points) {
  const n = points.length;
  if (n < 3) return null;
  const mx = d3.mean(points, (p) => p.x);
  const my = d3.mean(points, (p) => p.y);
  let sxy = 0, sxx = 0, syy = 0;
  for (const p of points) {
    sxy += (p.x - mx) * (p.y - my);
    sxx += (p.x - mx) ** 2;
    syy += (p.y - my) ** 2;
  }
  if (!sxx || !syy) return null;
  const slope = sxy / sxx;
  return { r: sxy / Math.sqrt(sxx * syy), slope, intercept: my - slope * mx, n };
}

/** Create an element with attributes and text, safely (no innerHTML). */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "style") node.style.cssText = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

// ---------- Shared tooltip ----------
const tip = document.getElementById("tooltip");

/**
 * Show the tooltip. `content` = { title, sub?, rows: [{ key, color?, shape?, value }] }
 * Values lead (bold), labels follow; built with textContent only.
 */
export function showTooltip(content, x, y) {
  tip.replaceChildren();
  tip.append(el("div", { class: "tooltip__title" }, content.title));
  if (content.sub) tip.append(el("div", { class: "tooltip__sub" }, content.sub));
  for (const r of content.rows ?? []) {
    const key = el("span", { class: "tooltip__key" });
    if (r.color) key.append(el("i", { class: r.shape === "square" ? "sq" : null, style: `background:${r.color}` }));
    key.append(r.key);
    tip.append(el("div", { class: "tooltip__row" }, key, el("span", { class: "tooltip__val" }, r.value)));
  }
  tip.classList.add("is-visible");
  tip.setAttribute("aria-hidden", "false");
  positionTooltip(x, y);
}

export function positionTooltip(x, y) {
  const pad = 14;
  const { width, height } = tip.getBoundingClientRect();
  let left = x + pad;
  let top = y + pad;
  if (left + width > window.innerWidth - 8) left = x - width - pad;
  if (top + height > window.innerHeight - 8) top = y - height - pad;
  tip.style.left = `${Math.max(8, left)}px`;
  tip.style.top = `${Math.max(8, top)}px`;
}

export function hideTooltip() {
  tip.classList.remove("is-visible");
  tip.setAttribute("aria-hidden", "true");
}

/** Tooltip position for keyboard focus: anchor to the element's box. */
export function focusPoint(node) {
  const b = node.getBoundingClientRect();
  return [b.left + b.width / 2, b.top + b.height / 2];
}

/** Rounded-end bar path: 4px radius at the data end, square at the baseline. */
export function hBarPath(x0, x1, y, h, r = 4) {
  const w = Math.max(0, x1 - x0);
  const rr = Math.min(r, w, h / 2);
  return `M${x0},${y}H${x0 + w - rr}Q${x0 + w},${y} ${x0 + w},${y + rr}V${y + h - rr}Q${x0 + w},${y + h} ${x0 + w - rr},${y + h}H${x0}Z`;
}

/** Observe width changes of a container and call back (debounced to frames). */
export function onResize(node, cb) {
  let last = 0;
  let raf = 0;
  new ResizeObserver(([entry]) => {
    const w = Math.round(entry.contentRect.width);
    if (w === last) return;
    last = w;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => cb(w));
  }).observe(node);
}
