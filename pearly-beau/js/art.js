// Product illustrations drawn as inline SVG, styled after the PearlyBeau
// product shots (white dials, rose gold mesh and link bracelets, engraved
// cuffs). A product with an `image` field shows that photo instead.
import { FINISHES } from './data.js';

let uid = 0;
const n = (v) => +v.toFixed(1);

export function productArt(p, { size = 'card' } = {}) {
  const f = FINISHES[p.finish];
  const alt = `${p.name} — ${f.label}`;
  if (p.image) return `<img class="art art-${size}" src="${p.image}" alt="${alt}" loading="lazy">`;
  const id = `a${++uid}`;
  const draw = { mesh: watch, link: watch, cuff, necklace, sunglasses }[p.style] ?? watch;
  return `<svg class="art art-${size}" viewBox="0 0 200 260" role="img" aria-label="${alt}">${grad(id, 'm', f.metal)}${f.alt ? grad(id, 'a', f.alt) : ''}${draw(p, f, id)}</svg>`;
}

function grad(id, k, [a, b]) {
  return `<defs><linearGradient id="${id}${k}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${b}"/><stop offset=".45" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>`;
}

function watch(p, f, id) {
  const m = `url(#${id}m)`, a = f.alt ? `url(#${id}a)` : m;
  const cx = 100, cy = 130, R = 50;
  let strap = '';
  if (p.style === 'mesh') {
    strap = `<defs><pattern id="${id}p" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="${f.metal[1]}"/><circle cx="1.5" cy="1.5" r="1" fill="${f.metal[0]}"/></pattern></defs>
      <path d="M78 0h44l-2 84H80z" fill="url(#${id}p)"/><path d="M80 176h40l2 84H78z" fill="url(#${id}p)"/>
      <rect x="78" y="250" width="44" height="10" fill="${m}"/>`;
  } else {
    // Link bracelet: three-piece rows, centre links in the alt metal for two-tone.
    for (let y = 0; y < 86; y += 12) strap += linkRow(y, m, a);
    for (let y = 176; y < 260; y += 12) strap += linkRow(y, m, a);
  }
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const ang = (i * Math.PI) / 6, s = Math.sin(ang), c = -Math.cos(ang);
    if (p.style === 'mesh' && (i === 0 || i === 6)) return '';
    const r1 = i % 3 === 0 ? 34 : 38;
    return `<line x1="${n(cx + r1 * s)}" y1="${n(cy + r1 * c)}" x2="${n(cx + 43 * s)}" y2="${n(cy + 43 * c)}" stroke="${f.metal[1]}" stroke-width="${i % 3 === 0 ? 2 : 1.2}"/>`;
  }).join('');
  const roman = p.style === 'mesh'
    ? `<text x="${cx}" y="${cy - 30}" text-anchor="middle" font-family="Times New Roman, serif" font-size="11" fill="${f.metal[1]}">XII</text>
       <text x="${cx}" y="${cy + 41}" text-anchor="middle" font-family="Times New Roman, serif" font-size="11" fill="${f.metal[1]}">VI</text>`
    : '';
  return `${strap}
    <rect x="${cx + R - 2}" y="${cy - 6}" width="9" height="12" rx="2" fill="${m}"/>
    <circle cx="${cx}" cy="${cy}" r="${R + 4}" fill="${m}"/>
    <circle cx="${cx}" cy="${cy}" r="${R - 2}" fill="#fff"/>
    <circle cx="${cx}" cy="${cy}" r="${R - 2}" fill="none" stroke="#000" stroke-opacity=".06" stroke-width="3"/>
    ${ticks}${roman}
    <text x="${cx}" y="${cy - 14}" text-anchor="middle" font-family="Courier New, monospace" font-size="5.5" letter-spacing="1" fill="#555">PEARLY BEAU</text>
    <g stroke="${f.metal[1]}" stroke-linecap="round">
      <line x1="${cx}" y1="${cy}" x2="${cx - 18}" y2="${cy + 10}" stroke-width="2.4"/>
      <line x1="${cx}" y1="${cy}" x2="${cx + 28}" y2="${cy + 18}" stroke-width="1.6"/>
    </g>
    <circle cx="${cx}" cy="${cy}" r="2.6" fill="${f.metal[1]}"/>`;
}

function linkRow(y, outer, centre) {
  return `<rect x="76" y="${y}" width="14" height="11" rx="2" fill="${outer}"/>
    <rect x="91" y="${y}" width="18" height="11" rx="2" fill="${centre}"/>
    <rect x="110" y="${y}" width="14" height="11" rx="2" fill="${outer}"/>`;
}

function cuff(p, f, id) {
  return `<ellipse cx="100" cy="140" rx="86" ry="22" fill="none" stroke="url(#${id}m)" stroke-width="10"/>
    <path d="M18 132a86 22 0 0 1 164 0" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>
    <rect x="10" y="128" width="12" height="16" rx="5" fill="url(#${id}m)"/>
    <rect x="178" y="128" width="12" height="16" rx="5" fill="url(#${id}m)"/>
    <text x="100" y="166" text-anchor="middle" font-family="Courier New, monospace" font-size="7" letter-spacing="1.5" fill="${f.metal[1]}">PEARLY BEAU</text>`;
}

function necklace(p, f, id) {
  return `<path d="M40 20c0 120 50 150 60 150s60-30 60-150" fill="none" stroke="url(#${id}m)" stroke-width="1.6"/>
    <circle cx="100" cy="170" r="2" fill="${f.metal[1]}"/>
    <rect x="72" y="172" width="56" height="7" rx="3.5" fill="url(#${id}m)"/>
    <circle cx="100" cy="206" r="6" fill="url(#${id}m)"/>
    <path d="M100 179v21" stroke="url(#${id}m)" stroke-width="1"/>`;
}

function sunglasses(p, f, id) {
  return `<path d="M6 106h188" stroke="${f.metal[0]}" stroke-width="10" stroke-linecap="round"/>
    <rect x="12" y="98" width="76" height="62" rx="16" fill="url(#${id}m)"/>
    <rect x="112" y="98" width="76" height="62" rx="16" fill="url(#${id}m)"/>
    <rect x="18" y="104" width="64" height="50" rx="12" fill="#262a33"/>
    <rect x="118" y="104" width="64" height="50" rx="12" fill="#262a33"/>
    <path d="M88 116q12-8 24 0" fill="none" stroke="${f.metal[0]}" stroke-width="6"/>
    <path d="M24 112l18-4" stroke="#fff" stroke-opacity=".25" stroke-width="3" stroke-linecap="round"/>
    <text x="150" y="140" text-anchor="middle" font-family="Courier New, monospace" font-size="6" fill="#8b8f99">SHADY #002</text>`;
}

/* ---------- Icons (stroke icons, matching the site's thin line style) ---------- */
const P = {
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  cart: '<path d="M3 4h2l2.5 11h11L21 7H6.5"/><circle cx="9" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>',
  menu: '<path d="M3 7h18M3 12h18M3 17h18"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8L3 12Z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
  star: '<path d="m12 3 2.8 5.9 6.2.8-4.6 4.3 1.2 6.2L12 17l-5.6 3.2 1.2-6.2L3 9.7l6.2-.8Z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8"/>',
  facebook: '<circle cx="12" cy="12" r="9"/><path d="M13.5 21v-7h2.5l.5-3h-3V9.5c0-1 .4-1.5 1.5-1.5H16V5.3A12 12 0 0 0 14 5c-2.3 0-3.5 1.4-3.5 3.7V11H8v3h2.5v7"/>',
  twitter: '<path d="M22 5.8a8 8 0 0 1-2.4.7 4 4 0 0 0 1.8-2.3 8 8 0 0 1-2.6 1 4 4 0 0 0-7 3.7A11.6 11.6 0 0 1 3.4 4.6a4 4 0 0 0 1.3 5.5 4 4 0 0 1-1.9-.5 4 4 0 0 0 3.3 4 4 4 0 0 1-1.8.1 4 4 0 0 0 3.8 2.8A8 8 0 0 1 2 18.1 11.6 11.6 0 0 0 8.3 20c7.5 0 11.7-6.3 11.7-11.7v-.5A8 8 0 0 0 22 5.8Z"/>',
};
export const icon = (name, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[name]}</svg>`;
