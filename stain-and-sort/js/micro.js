// Procedural "under the microscope" fields drawn as inline SVG.
// Every organism gets a seeded layout, so its field looks the same each visit.

const GRAM = {
  "+": { fill: "var(--gram-pos)", edge: "var(--gram-pos-edge)" },
  "-": { fill: "var(--gram-neg)", edge: "var(--gram-neg-edge)" },
  "−": { fill: "var(--gram-neg)", edge: "var(--gram-neg-edge)" },
};

function rng(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n) => Math.round(n * 10) / 10;

// Pick well-spaced anchor points inside the circular field.
function anchors(r, count, minDist, pad = 18) {
  const pts = [];
  let tries = 0;
  while (pts.length < count && tries++ < 600) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * (92 - pad);
    const p = { x: 100 + Math.cos(a) * d, y: 100 + Math.sin(a) * d };
    if (pts.every((q) => Math.hypot(q.x - p.x, q.y - p.y) > minDist)) pts.push(p);
  }
  return pts;
}

const coccus = (x, y, rad, i) =>
  `<circle class="cell" style="--i:${i}" cx="${f(x)}" cy="${f(y)}" r="${f(rad)}"/>`;

const rod = (x, y, len, w, ang, i, extra = "") =>
  `<g class="cell" style="--i:${i}" transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})"><rect x="${f(-len / 2)}" y="${f(-w / 2)}" width="${f(len)}" height="${f(w)}" rx="${f(extra === "box" ? 1.2 : w / 2)}"/>${extra && extra !== "box" ? extra : ""}</g>`;

const DRAW = {
  clusters(r) {
    let out = "", i = 0;
    for (const c of anchors(r, 6, 44)) {
      const n = 7 + Math.floor(r() * 9);
      const placed = [];
      for (let k = 0; k < n * 4 && placed.length < n; k++) {
        const a = r() * Math.PI * 2, d = r() * 13;
        const p = { x: c.x + Math.cos(a) * d, y: c.y + Math.sin(a) * d };
        if (placed.every((q) => Math.hypot(q.x - p.x, q.y - p.y) > 8.6)) placed.push(p);
      }
      placed.forEach((p) => (out += coccus(p.x, p.y, 4.6, i++)));
    }
    return out;
  },
  chains(r) {
    let out = "", i = 0;
    for (const c of anchors(r, 6, 38)) {
      let a = r() * Math.PI * 2, x = c.x, y = c.y;
      const n = 5 + Math.floor(r() * 6);
      for (let k = 0; k < n; k++) {
        out += coccus(x, y, 4.2, i++);
        a += (r() - 0.5) * 0.7;
        x += Math.cos(a) * 8.8; y += Math.sin(a) * 8.8;
        if (Math.hypot(x - 100, y - 100) > 86) break;
      }
    }
    return out;
  },
  pairs(r) {
    let out = "", i = 0;
    for (const c of anchors(r, 13, 24)) {
      const a = r() * 180, n = r() > 0.65 ? 2 : 1;
      for (let k = 0; k < n; k++) {
        const ox = Math.cos((a * Math.PI) / 180) * 18 * k, oy = Math.sin((a * Math.PI) / 180) * 18 * k;
        out += `<g class="cell" style="--i:${i++}" transform="translate(${f(c.x + ox)} ${f(c.y + oy)}) rotate(${f(a)})"><ellipse cx="-4.3" cy="0" rx="4.4" ry="3.8"/><ellipse cx="4.3" cy="0" rx="4.4" ry="3.8"/></g>`;
      }
    }
    return out;
  },
  lancet(r) {
    let out = "", i = 0;
    const lens = "M-9 0 Q-5 -4.6 -0.8 0 Q-5 4.6 -9 0Z M9 0 Q5 -4.6 0.8 0 Q5 4.6 9 0Z";
    for (const c of anchors(r, 14, 24)) {
      out += `<g class="cell" style="--i:${i++}" transform="translate(${f(c.x)} ${f(c.y)}) rotate(${f(r() * 180)})"><ellipse class="halo" cx="0" cy="0" rx="12.5" ry="7.5"/><path d="${lens}"/></g>`;
    }
    return out;
  },
  kidney(r) {
    let out = "", i = 0;
    const bean = "M-1 -5.5 C-8 -6.5 -9.5 5.5 -1 5.5 C-2.6 2 -2.6 -2 -1 -5.5Z";
    for (const c of anchors(r, 15, 22)) {
      out += `<g class="cell" style="--i:${i++}" transform="translate(${f(c.x)} ${f(c.y)}) rotate(${f(r() * 180)})"><path d="${bean}"/><path d="${bean}" transform="scale(-1 1)"/></g>`;
    }
    return out;
  },
  rods(r, o) {
    let out = "", i = 0;
    const len = o.slim ? 15 : 13.5, w = o.slim ? 4 : 5.4;
    for (const c of anchors(r, o.slim ? 26 : 22, 17)) {
      const cap = o.capsule ? `<rect class="halo" x="${f(-len / 2 - 3)}" y="${f(-w / 2 - 3)}" width="${f(len + 6)}" height="${f(w + 6)}" rx="${f(w / 2 + 3)}"/>` : "";
      out += `<g class="cell" style="--i:${i++}" transform="translate(${f(c.x)} ${f(c.y)}) rotate(${f(r() * 180)})">${cap}<rect x="${f(-len / 2)}" y="${f(-w / 2)}" width="${f(len)}" height="${f(w)}" rx="${f(w / 2)}"/></g>`;
    }
    return out;
  },
  boxcar(r, o) {
    let out = "", i = 0;
    for (const c of anchors(r, 5, 42)) {
      let a = r() * 180, x = c.x, y = c.y;
      const n = 2 + Math.floor(r() * 3);
      for (let k = 0; k < n; k++) {
        const spore = o.spores && r() > 0.35 ? `<ellipse class="spore" cx="${f((r() - 0.5) * 6)}" cy="0" rx="3.4" ry="2.2"/>` : "";
        out += `<g class="cell" style="--i:${i++}" transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"><rect x="-10" y="-3.6" width="20" height="7.2" rx="1.2"/>${spore}</g>`;
        a += (r() - 0.5) * 16;
        x += Math.cos((a * Math.PI) / 180) * 21; y += Math.sin((a * Math.PI) / 180) * 21;
        if (Math.hypot(x - 100, y - 100) > 80) break;
      }
    }
    return out;
  },
  shortRods(r) {
    let out = "", i = 0;
    for (const c of anchors(r, 16, 22)) {
      const a = r() * 180;
      out += rod(c.x, c.y, 9, 4, a, i++);
      if (r() > 0.55) {
        const b = a + 35 + r() * 25, rad = (b * Math.PI) / 180;
        out += rod(c.x + Math.cos(rad) * 9, c.y + Math.sin(rad) * 9, 9, 4, b, i++);
      }
    }
    return out;
  },
  palisade(r) {
    let out = "", i = 0;
    const club = "M-8 -1.6 Q-8 -2.4 -7 -2.4 L5 -3.2 Q8.5 -3.2 8.5 0 Q8.5 3.2 5 3.2 L-7 2.4 Q-8 2.4 -8 1.6Z";
    for (const c of anchors(r, 10, 30)) {
      const base = r() * 180, n = 2 + Math.floor(r() * 3);
      for (let k = 0; k < n; k++) {
        const a = base + (k % 2 ? 40 + r() * 40 : r() * 10) + k * 8;
        const rad = (base * Math.PI) / 180;
        out += `<g class="cell" style="--i:${i++}" transform="translate(${f(c.x + Math.cos(rad) * k * 4)} ${f(c.y + Math.sin(rad) * k * 4)}) rotate(${f(a)})"><path d="${club}"/><circle class="granule" cx="6" cy="0" r="1.1"/></g>`;
      }
    }
    return out;
  },
  coccobacilli(r) {
    let out = "", i = 0;
    for (const c of anchors(r, 34, 13, 12)) {
      out += `<ellipse class="cell" style="--i:${i++}" cx="${f(c.x)}" cy="${f(c.y)}" rx="${f(3.2 + r() * 1.4)}" ry="2.4" transform="rotate(${f(r() * 180)} ${f(c.x)} ${f(c.y)})"/>`;
    }
    return out;
  },
  comma(r) {
    let out = "", i = 0;
    for (const c of anchors(r, 20, 20)) {
      out += `<path class="cell stroke" style="--i:${i++}" d="M-6 2 Q0 -5 6 2" transform="translate(${f(c.x)} ${f(c.y)}) rotate(${f(r() * 360)})"/>`;
    }
    return out;
  },
  gullwing(r) {
    let out = "", i = 0;
    for (const c of anchors(r, 16, 24)) {
      const d = r() > 0.5 ? "M-10 2 Q-5 -5 0 1 Q5 -5 10 2" : "M-9 -2 Q-4.5 5 0 0 Q4.5 -5 9 2";
      out += `<path class="cell stroke" style="--i:${i++}" d="${d}" transform="translate(${f(c.x)} ${f(c.y)}) rotate(${f(r() * 360)})"/>`;
    }
    return out;
  },
  spiral(r) {
    let out = "", i = 0;
    for (const c of anchors(r, 17, 23)) {
      out += `<path class="cell stroke" style="--i:${i++}" d="M-9 0 Q-6.75 -4 -4.5 0 T0 0 T4.5 0 T9 0" transform="translate(${f(c.x)} ${f(c.y)}) rotate(${f(r() * 360)})"/>`;
    }
    return out;
  },
};

const LAYOUT = {
  clusters: ["clusters"], chains: ["chains"], pairs: ["pairs"], lancet: ["lancet"], kidney: ["kidney"],
  rods: ["rods", {}], "rods-capsule": ["rods", { capsule: true }], "slender-rods": ["rods", { slim: true }],
  boxcar: ["boxcar", { spores: true }], "boxcar-plain": ["boxcar", {}],
  "short-rods": ["shortRods"], palisade: ["palisade"], coccobacilli: ["coccobacilli"],
  comma: ["comma"], gullwing: ["gullwing"], spiral: ["spiral"],
};

let uid = 0;
export function field(org, { label = true } = {}) {
  const r = rng(org.id);
  const [fn, opts] = LAYOUT[org.layout];
  const g = GRAM[org.gram];
  const id = `fov${uid++}`;
  // Faint debris and stain precipitate makes it read as a real smear.
  let debris = "";
  for (let k = 0; k < 26; k++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 88;
    debris += `<circle cx="${f(100 + Math.cos(a) * d)}" cy="${f(100 + Math.sin(a) * d)}" r="${f(0.4 + r() * 1.3)}"/>`;
  }
  return `<svg class="fov" viewBox="0 0 200 200" role="img" aria-label="${label ? org.morph : "Stained smear"}">
    <defs>
      <radialGradient id="${id}-bg" cx="42%" cy="38%" r="70%"><stop offset="0" stop-color="var(--fov-hi)"/><stop offset="1" stop-color="var(--fov-lo)"/></radialGradient>
      <radialGradient id="${id}-vig" cx="50%" cy="50%" r="50%"><stop offset=".72" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>
      <clipPath id="${id}-c"><circle cx="100" cy="100" r="92"/></clipPath>
    </defs>
    <circle cx="100" cy="100" r="92" fill="url(#${id}-bg)"/>
    <g clip-path="url(#${id}-c)">
      <g class="debris" fill="${g.fill}" opacity=".22">${debris}</g>
      <g class="cells" fill="${g.fill}" stroke="${g.edge}" stroke-width=".7">${DRAW[fn](r, opts || {})}</g>
    </g>
    <circle cx="100" cy="100" r="92" fill="url(#${id}-vig)"/>
    <circle cx="100" cy="100" r="92.5" fill="none" class="fov-ring"/>
  </svg>`;
}

// Tiny icons for key options.
const G = {
  coccus: `<circle cx="12" cy="12" r="5"/>`,
  rod: `<rect x="3" y="8.5" width="18" height="7" rx="3.5"/>`,
  diplo: `<path d="M11 6.5c-6 -1-7 12 0 11c-1.4-3.4-1.4-7.6 0-11z"/><path d="M13 6.5c6 -1 7 12 0 11c1.4-3.4 1.4-7.6 0-11z"/>`,
  cb: `<ellipse cx="7" cy="9" rx="3.4" ry="2.4"/><ellipse cx="16" cy="8" rx="3" ry="2.2"/><ellipse cx="11" cy="16" rx="3.4" ry="2.4"/>`,
  curve: `<path d="M4 15 Q8 5 12 12 T20 9" fill="none" stroke-width="3.2" stroke-linecap="round"/>`,
  comma: `<path d="M6 15 Q12 4 18 15" fill="none" stroke-width="3.4" stroke-linecap="round"/>`,
  gull: `<path d="M3 14 Q7.5 6 12 13 Q16.5 6 21 14" fill="none" stroke-width="3" stroke-linecap="round"/>`,
  spiral: `<path d="M3 12 Q5.25 7 7.5 12 T12 12 T16.5 12 T21 12" fill="none" stroke-width="2.8" stroke-linecap="round"/>`,
  air: `<path d="M3 9h11a3 3 0 1 0-3-3M3 14h15a3 3 0 1 1-3 3" fill="none" stroke-width="2" stroke-linecap="round"/>`,
  jar: `<rect x="6" y="6" width="12" height="15" rx="2" fill="none" stroke-width="2"/><rect x="5" y="3" width="14" height="3.4" rx="1"/>`,
  tumble: `<rect x="7" y="9" width="10" height="5" rx="2.5" transform="rotate(-25 12 12)"/><path d="M4 18c3 2 7 2 10 0M20 6c-2-2-5-2-7-1" fill="none" stroke-width="1.6" stroke-linecap="round"/>`,
  letters: `<rect x="3" y="10" width="10" height="4" rx="2" transform="rotate(-40 8 12)"/><rect x="10" y="10" width="10" height="4" rx="2" transform="rotate(40 15 12)"/>`,
  xv: `<text x="12" y="16" text-anchor="middle" font-size="11" font-weight="600" font-family="Poppins, sans-serif">XV</text>`,
  drop: `<path d="M12 4c3 4.5 6 7.5 6 10.5a6 6 0 0 1-12 0C6 11.5 9 8.5 12 4z"/>`,
};

export function glyph(name) {
  return `<svg viewBox="0 0 24 24" class="glyph" aria-hidden="true">${G[name] || ""}</svg>`;
}

// Colour chips that mimic what you see on the bench.
const S = {
  gpos: ["var(--gram-pos)"], gneg: ["var(--gram-neg)"],
  bubbles: ["#efe9dd", "bubbles"], flat: ["#e5dfd2"],
  clot: ["#a87c5e", "clot"], liquid: ["#e2c9a4"],
  zone: ["#d9cfbd", "zone"], nozone: ["#b9ae98"],
  beta: ["#efd9d2", "zone"], alpha: ["#7e8a55"], gamma: ["#9c3a3a"],
  turbid: ["#d9c46a"], clear: ["#6e5a8a"],
  spore: ["var(--gram-pos)", "spore"], rodplain: ["var(--gram-pos)"],
  sugar2: ["#e2c24f", "two"], sugar1: ["#e2c24f", "one"], sugar0: ["#c2453d"],
  oxpos: ["#3b2a5c"], oxneg: ["#ece8df"],
  lf: ["#c9587a"], nlf: ["#e8d9a8"],
  indpos: ["#e7cf6b", "ring"], indneg: ["#e7cf6b"],
  h2spos: ["#1e1a18"], h2sneg: ["#c9453b"],
  ureapos: ["#d4508a"], ureaneg: ["#e6a45a"],
};

export function swatch(name) {
  const [c, fx] = S[name] || ["#ccc"];
  return `<span class="swatch${fx ? " fx-" + fx : ""}" style="--c:${c}" aria-hidden="true"></span>`;
}
