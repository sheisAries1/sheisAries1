// Reusable UI pieces. Each returns an HTML string; content comes from content.js.

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const money = (n) => `£${n.toLocaleString('en-GB')}`;

export const icon = {
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  bell: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
};

// Glass button. `variant`: 'solid' (charcoal) or 'glass'.
export function button({ label, href = '#', variant = 'solid', size = '', arrow = false, attrs = '' }) {
  return `<a class="btn btn--${variant} ${size ? 'btn--' + size : ''}" href="${href}" data-magnetic ${attrs}>
    <span>${esc(label)}</span>${arrow ? icon.arrow : ''}</a>`;
}

export function logoCloud(logos) {
  return logos.map((l) => `<li class="logo logo--${l.style}">${esc(l.name)}</li>`).join('');
}

export function benefit(b, i) {
  return `
    <article class="benefit" data-reveal style="--i:${i}">
      <p class="benefit__stat"><span class="serif">${esc(b.stat)}</span> ${esc(b.statLabel)}</p>
      <h3>${esc(b.title)}</h3>
      <p>${esc(b.body)}</p>
    </article>`;
}

// Small illustrative visuals inside bento tiles.
const VISUALS = {
  portal: `
    <div class="mini-portal" aria-hidden="true">
      <div class="mini-portal__bar"><span></span><span></span><span></span><em>clients.yourstudio.com/saltwater</em></div>
      <div class="mini-portal__body">
        <div class="mini-portal__hero"><b>Saltwater Café</b><small>Brand identity · 60% complete</small><i style="--w:60%"></i></div>
        <div class="mini-portal__row"><span>${icon.check}</span>Proposal signed<em>12 Mar</em></div>
        <div class="mini-portal__row"><span>${icon.check}</span>Deposit paid · £1,200<em>12 Mar</em></div>
        <div class="mini-portal__row is-next"><span></span>Brand guidelines review<em>Due Fri</em></div>
      </div>
    </div>`,
  signature: `
    <div class="mini-sign" aria-hidden="true">
      <svg viewBox="0 0 220 70"><path class="sig" d="M8 48c18-30 30-38 34-28s-14 34-6 34 20-40 30-40-6 34 4 34 16-22 22-22 4 16 12 16 18-24 30-24 10 14 24 14 30-10 52-14"/></svg>
      <span>Signed by Maya Chen · 09:41</span>
    </div>`,
  milestones: `
    <ol class="mini-steps" aria-hidden="true">
      <li class="is-done"><i></i>Discovery<em>Paid</em></li>
      <li class="is-done"><i></i>Concepts<em>Paid</em></li>
      <li class="is-now"><i></i>Guidelines<em>Invoice sent</em></li>
      <li><i></i>Handoff<em>£900</em></li>
    </ol>`,
  reminders: `
    <div class="mini-remind" aria-hidden="true">
      <p><b>${icon.bell} Friendly nudge</b><span>Hi Maya, a gentle reminder that invoice #0142 is due Friday…</span></p>
      <small>Sends 3 days before due · stops when paid</small>
    </div>`,
  files: `
    <ul class="mini-files" aria-hidden="true">
      <li>${icon.file}<span>Saltwater_Logo_Suite.zip<em>48 MB</em></span><b>Ready</b></li>
      <li>${icon.file}<span>Brand_Guidelines_v3.pdf<em>12 MB</em></span><b>Ready</b></li>
      <li class="is-locked">${icon.lock}<span>Signage_Print_Files.zip<em>Unlocks after final payment</em></span><b>£900</b></li>
    </ul>`,
};

export function bentoTile(f, i) {
  return `
    <article class="tile glass ${f.size ? f.size.split(' ').map((s) => 'tile--' + s).join(' ') : ''}" data-reveal data-sheen style="--i:${i}">
      <div class="tile__text">
        <p class="kicker">${esc(f.kicker)}</p>
        <h3>${esc(f.title)}</h3>
        <p>${esc(f.body)}</p>
      </div>
      <div class="tile__visual">${VISUALS[f.visual] || ''}</div>
    </article>`;
}

export function step(s, i) {
  return `
    <li class="step" data-reveal style="--i:${i}">
      <span class="step__num serif">${String(i + 1).padStart(2, '0')}</span>
      <div>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.body)}</p>
        <p class="step__meta">${esc(s.meta)}</p>
      </div>
    </li>`;
}

function initials(name) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2);
}

export function avatar(t, size = 44) {
  return `<span class="avatar" style="--size:${size}px" data-initials="${esc(initials(t.name))}">
    <img src="${t.avatar}" alt="" width="${size}" height="${size}" loading="lazy" onerror="this.remove()"></span>`;
}

export function testimonial(t, i) {
  return `
    <figure class="quote ${t.featured ? 'quote--featured glass' : ''}" data-reveal ${t.featured ? 'data-sheen' : ''} style="--i:${i}">
      <blockquote>${t.featured ? '<span class="quote__mark serif" aria-hidden="true">“</span>' : ''}${esc(t.quote)}</blockquote>
      <figcaption>${avatar(t, t.featured ? 52 : 40)}<span><b>${esc(t.name)}</b><small>${esc(t.role)}</small></span></figcaption>
    </figure>`;
}

export function pricingCard(p, i) {
  return `
    <article class="plan glass ${p.featured ? 'plan--featured' : ''}" data-reveal data-sheen style="--i:${i}">
      ${p.featured ? '<p class="plan__badge">Most popular</p>' : ''}
      <h3>${esc(p.name)}</h3>
      <p class="plan__blurb">${esc(p.blurb)}</p>
      <p class="plan__price">
        <span class="serif" data-price data-monthly="${p.monthly}" data-yearly="${p.yearly}">£${p.yearly}</span>
        <small>per month<br><span data-billing-note>billed yearly</span></small>
      </p>
      ${button({ label: p.cta, href: '#cta', variant: p.featured ? 'solid' : 'glass', size: 'block' })}
      <ul>${p.features.map((f) => `<li>${icon.check}${esc(f)}</li>`).join('')}</ul>
    </article>`;
}

export function faqItem(f, i) {
  return `
    <details class="faq" name="faq" data-reveal style="--i:${i}">
      <summary><span>${esc(f.q)}</span><i>${icon.plus}</i></summary>
      <div class="faq__body"><p>${esc(f.a)}</p></div>
    </details>`;
}
