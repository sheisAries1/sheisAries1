// Small hand-built SVG drawings: what an organism looks like down the
// microscope, and little icons for the answers in the key.

const NS = 'xmlns="http://www.w3.org/2000/svg"';

const circle = (x, y, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}"/>`;
const rod = (x, y, a, w = 22, h = 8) =>
  `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${h / 2}" transform="rotate(${a} ${x} ${y})"/>`;

// Each layout is drawn in a 120×80 box.
const layouts = {
  clusters: () => {
    const pts = [[38, 32], [48, 28], [44, 38], [54, 36], [34, 42], [50, 46], [60, 30], [40, 50], [58, 44],
      [80, 50], [88, 46], [84, 56], [92, 54], [76, 58]];
    return pts.map(([x, y]) => circle(x, y, 5)).join("");
  },
  chains: () => {
    let s = "";
    for (let i = 0; i < 9; i++) s += circle(14 + i * 11, 40 + Math.sin(i / 1.6) * 12, 5);
    for (let i = 0; i < 4; i++) s += circle(70 + i * 10, 16 + i * 3, 4.5);
    return s;
  },
  pairs: () =>
    [[24, 24, 20], [62, 40, -30], [96, 22, 60], [34, 60, 90], [84, 62, 10]]
      .map(([x, y, a]) => `<g transform="rotate(${a} ${x} ${y})"><ellipse cx="${x - 6}" cy="${y}" rx="6" ry="4.6"/><ellipse cx="${x + 6}" cy="${y}" rx="6" ry="4.6"/></g>`)
      .join(""),
  kidneys: () =>
    [[26, 26, 10], [66, 42, -20], [98, 24, 70], [36, 62, 80], [88, 62, 0]]
      .map(([x, y, a]) => `<g transform="rotate(${a} ${x} ${y})"><path d="M${x - 1} ${y - 7}a7 7 0 1 0 0 14c-2.6-3-2.6-11 0-14Z"/><path d="M${x + 1} ${y - 7}a7 7 0 1 1 0 14c2.6-3 2.6-11 0-14Z"/></g>`)
      .join(""),
  rods: () =>
    [[26, 22, 20], [60, 30, -15], [96, 20, 40], [30, 58, -40], [70, 60, 10], [100, 56, -70], [46, 42, 80]]
      .map(([x, y, a]) => rod(x, y, a)).join(""),
  boxcars: () => {
    let s = "";
    for (let i = 0; i < 4; i++) s += `<rect x="${8 + i * 27}" y="22" width="25" height="10" rx="2"/>`;
    for (let i = 0; i < 3; i++) s += `<rect x="${30 + i * 27}" y="50" width="25" height="10" rx="2" transform="rotate(-8 60 55)"/>`;
    return s;
  },
  clubs: () =>
    [[30, 30, 30], [44, 32, -30], [80, 26, 70], [88, 30, 110], [40, 60, 0], [70, 58, 60], [98, 60, -20]]
      .map(([x, y, a]) => `<path transform="rotate(${a} ${x} ${y})" d="M${x - 11} ${y}a3 3 0 0 1 3-3h13a5 5 0 0 1 0 10H${x - 8}a3 3 0 0 1-3-3Z"/>`)
      .join(""),
  coccobacilli: () =>
    [[22, 24, 10], [34, 26, 10], [64, 20, -20], [96, 30, 50], [30, 56, 70], [60, 50, 0], [72, 52, 0], [98, 62, -30], [46, 38, 30]]
      .map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="6.5" ry="4.4" transform="rotate(${a} ${x} ${y})"/>`)
      .join(""),
  commas: () =>
    [[22, 24, 0], [64, 18, 40], [98, 34, -20], [30, 58, 60], [72, 56, -10]]
      .map(([x, y, a]) => `<path transform="rotate(${a} ${x} ${y})" d="M${x - 10} ${y + 2}q10 -12 20 0" fill="none" stroke-width="6" stroke-linecap="round"/>`)
      .join(""),
  spirals: () =>
    [[26, 26, 0], [80, 20, 30], [50, 52, -20], [96, 58, 10]]
      .map(([x, y, a]) => `<path transform="rotate(${a} ${x} ${y})" d="M${x - 16} ${y}q4 -9 8 0t8 0t8 0t8 0" fill="none" stroke-width="5" stroke-linecap="round"/>`)
      .join(""),
};

/** A microscope-field drawing, coloured by Gram reaction. */
export function morphSVG(org, cls = "morph") {
  const tone = org.gram === "pos" ? "var(--gram-pos)" : "var(--gram-neg)";
  return `<svg ${NS} class="${cls}" viewBox="0 0 120 80" aria-hidden="true" style="--cell:${tone}"><g>${layouts[org.morph]()}</g></svg>`;
}

// Icons for the key's answer buttons (24×24, stroked).
const icons = {
  cocci: '<circle cx="8" cy="9" r="3.2"/><circle cx="15" cy="8" r="3.2"/><circle cx="11" cy="15" r="3.2"/><circle cx="17.5" cy="15.5" r="2.6"/>',
  rods: '<rect x="3" y="6" width="12" height="5" rx="2.5" transform="rotate(-15 9 8.5)"/><rect x="9" y="13" width="12" height="5" rx="2.5" transform="rotate(10 15 15.5)"/>',
  diplo: '<path d="M11 5a5 5 0 1 0 0 10c-1.8-2-1.8-8 0-10Z"/><path d="M13 5a5 5 0 1 1 0 10c1.8-2 1.8-8 0-10Z"/><path d="M8 17.5h8" opacity=".35"/>',
  cocco: '<ellipse cx="8" cy="9" rx="4" ry="2.8"/><ellipse cx="16" cy="11" rx="4" ry="2.8"/><ellipse cx="10" cy="17" rx="4" ry="2.8"/>',
  curved: '<path d="M4 15q4-8 8 0t8 0"/><path d="M6 7q3-4 6 0" />',
  bubbles: '<circle cx="8" cy="15" r="3"/><circle cx="15" cy="10" r="4"/><circle cx="16" cy="18" r="2"/><circle cx="9" cy="7" r="1.8"/>',
  flat: '<path d="M4 16h16"/><circle cx="12" cy="12" r="2.4"/>',
  clot: '<path d="M8 3h8v5l-1 1v11a3 3 0 0 1-6 0V9L8 8Z"/><path d="M9.5 13h5v4a2.5 2.5 0 0 1-5 0Z" fill="currentColor"/>',
  liquid: '<path d="M8 3h8v5l-1 1v11a3 3 0 0 1-6 0V9L8 8Z"/><path d="M9.5 14.5h5"/>',
  zone: '<circle cx="12" cy="12" r="9" stroke-dasharray="2.4 2.2"/><circle cx="12" cy="12" r="3.2" fill="currentColor"/>',
  nozone: '<circle cx="12" cy="12" r="3.2" fill="currentColor"/><path d="M3 5l2 2M19 5l2 2M3 19l2-2M21 19l-2-2M12 2v3M12 19v3" opacity=".5"/>',
  spore: '<rect x="3" y="8" width="18" height="8" rx="4"/><ellipse cx="16" cy="12" rx="2.4" ry="2" fill="currentColor"/>',
  air: '<path d="M3 9h11a3 3 0 1 0-3-3M3 14h15a3 3 0 1 1-3 3M3 19h6"/>',
  noair: '<path d="M3 9h11a3 3 0 1 0-3-3M3 14h15a3 3 0 1 1-3 3"/><path d="M4 4l16 16"/>',
  stab: '<path d="M8 3h8v18H8z"/><path d="M12 5v13" stroke-width="2.4"/>',
  diffuse: '<path d="M8 3h8v18H8z"/><path d="M12 5v13" /><path d="M10 9h4M9.5 12h5M10 15h4" opacity=".5"/>',
  sugar2: '<path d="M6 4v14a2 2 0 0 0 4 0V4M14 4v14a2 2 0 0 0 4 0V4"/><path d="M6 11h4M14 11h4" stroke-width="2.4"/>',
  sugar1: '<path d="M6 4v14a2 2 0 0 0 4 0V4M14 4v14a2 2 0 0 0 4 0V4"/><path d="M6 11h4" stroke-width="2.4"/>',
  sugar0: '<path d="M6 4v14a2 2 0 0 0 4 0V4M14 4v14a2 2 0 0 0 4 0V4"/>',
  plate: '<circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1.6" fill="currentColor"/><circle cx="14" cy="14" r="1.6" fill="currentColor"/><circle cx="14" cy="8.5" r="1.2" fill="currentColor"/>',
  choc: '<circle cx="12" cy="12" r="9"/><path d="M6 12h12M12 6v12" opacity=".4"/><circle cx="9" cy="9" r="1.3" fill="currentColor"/>',
};

export function iconSVG(name) {
  return `<svg ${NS} viewBox="0 0 24 24" class="ico" aria-hidden="true">${icons[name] || icons.flat}</svg>`;
}

/** Illustration for one result in the tests reference. */
export function resultArt(look, r) {
  if (look === "tube") {
    const fx = r.fx === "clot" ? '<path class="clot" d="M-9 30h18v20a9 9 0 0 1-18 0Z"/>'
      : r.fx === "stab" ? '<path class="stab" d="M0 18v36"/>'
      : r.fx === "diffuse" ? '<path class="stab" d="M0 18v36"/><ellipse class="haze" cx="0" cy="38" rx="9" ry="18"/>'
      : "";
    const top = r.slant ? "M-11 30L11 18V56a11 11 0 0 1-22 0Z" : "M-11 22h22V56a11 11 0 0 1-22 0Z";
    const ring = r.ring ? `<rect x="-11" y="16" width="22" height="6" style="fill:${r.ring}"/>` : "";
    const butt = r.butt ? `<path d="M-11 46h22v10a11 11 0 0 1-22 0Z" style="fill:${r.butt}"/>` : "";
    return `<svg ${NS} viewBox="-20 -2 40 74" class="art"><g>
      <path class="tube-glass" d="M-12 4h24v52a12 12 0 0 1-24 0Z"/>
      <path d="${top}" style="fill:${r.color}"/>${butt}${ring}${fx}
      <path class="tube-shine" d="M-7 10v42"/></g></svg>`;
  }
  if (look === "slide") {
    const bubbles = r.fx === "bubbles"
      ? '<g class="bubbles"><circle cx="-6" cy="-2" r="3"/><circle cx="3" cy="-5" r="4"/><circle cx="8" cy="3" r="2.4"/><circle cx="-2" cy="5" r="2"/><circle cx="-11" cy="4" r="1.6"/></g>'
      : "";
    return `<svg ${NS} viewBox="-30 -20 60 40" class="art art--wide"><rect class="slide-glass" x="-28" y="-14" width="56" height="28" rx="3"/>
      <ellipse cx="0" cy="0" rx="15" ry="9" style="fill:${r.color}"/>${bubbles}</svg>`;
  }
  // plate + disc
  let inner = "";
  if (look === "plate") {
    if (r.fx === "arrow") inner = '<path d="M-3-20v40" class="streak"/><path d="M-1 -8L14 0L-1 8Z" class="arrowhead"/><path d="M8 0h14" class="streak"/>';
    else if (r.fx === "streak") inner = '<path d="M-3-20v40" class="streak"/><path d="M8 0h14" class="streak"/>';
    else {
      const dots = [[-8, -8], [7, -10], [10, 6], [-6, 9], [0, -1], [-13, 1], [2, 13]];
      inner = (r.halo ? dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6.5" style="fill:${r.halo}" class="halo"/>`).join("") : "")
        + dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" style="fill:${r.colony}"/>`).join("");
    }
  } else {
    inner = `<circle cx="0" cy="0" r="23" class="lawn" style="fill:${r.halo || "var(--lawn)"}"/>`
      + (r.zone ? '<circle cx="0" cy="0" r="12" style="fill:' + r.color + '"/>' : "")
      + '<circle cx="0" cy="0" r="4.5" class="disc"/>';
  }
  return `<svg ${NS} viewBox="-30 -30 60 60" class="art"><circle cx="0" cy="0" r="28" class="plate-rim"/>
    <circle cx="0" cy="0" r="25" style="fill:${r.color}"/>${inner}</svg>`;
}
