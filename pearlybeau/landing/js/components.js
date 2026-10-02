// Reusable UI pieces for the landing page. Each returns an HTML string.
import { productById } from '../../js/data.js';
import { money } from '../../js/ui.js';

export { money };

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Transparent PNG of a product photo (watches and cuffs), for use on glass.
export const cutout = (p) => '../' + p.image.replace('images/', 'images/cutouts/').replace('.jpg', '.png');

// Shop routes live one folder up.
export const shopLink = (route) => `../#/${route}`;

export const icon = {
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
};

export function button({ label, href = '#', variant = 'solid', size = '', arrow = false, attrs = '' }) {
  const tag = href ? 'a' : 'button';
  const where = href ? `href="${href}"` : 'type="button"';
  return `<${tag} class="btn btn--${variant} ${size ? 'btn--' + size : ''}" ${where} data-magnetic ${attrs}>
    <span>${esc(label)}</span>${arrow ? icon.arrow : ''}</${tag}>`;
}

export function cityCloud(cities) {
  return cities.map((c, i) => `<li class="city city--${i % 3}">${esc(c)}</li>`).join('');
}

export function benefit(b, i) {
  return `
    <article class="benefit" data-reveal style="--i:${i}">
      <p class="benefit__stat"><span class="serif">${esc(b.stat)}</span> ${esc(b.statLabel)}</p>
      <h3>${esc(b.title)}</h3>
      <p>${esc(b.body)}</p>
    </article>`;
}

const VISUALS = {
  movement: `
    <div class="dial" aria-hidden="true">
      <span class="dial__mark"></span>
      <i class="dial__hand dial__hand--h"></i><i class="dial__hand dial__hand--m"></i><i class="dial__hand dial__hand--s"></i>
      <b></b>
    </div>`,
  water: `
    <div class="depth" aria-hidden="true">
      <div class="depth__row"><span>Rain &amp; splashes</span><i class="ok">${icon.check}</i></div>
      <div class="depth__row"><span>Washing hands</span><i class="ok">${icon.check}</i></div>
      <div class="depth__row is-no"><span>Swimming</span><i>—</i></div>
    </div>`,
};

export function bentoTile(f, i) {
  const sizes = f.size ? f.size.split(' ').map((s) => 'tile--' + s).join(' ') : '';
  const media = f.image
    ? `<div class="tile__media ${f.packshot ? 'tile__media--packshot' : ''}"><img src="${f.image}" alt="${esc(f.alt)}" loading="lazy"></div>`
    : `<div class="tile__visual">${VISUALS[f.visual] || ''}</div>`;
  return `
    <article class="tile glass ${sizes} ${f.image && !f.packshot ? 'tile--photo' : ''}" data-reveal data-sheen style="--i:${i}">
      <div class="tile__text">
        <p class="kicker">${esc(f.kicker)}</p>
        <h3>${esc(f.title)}</h3>
        <p>${esc(f.body)}</p>
      </div>
      ${media}
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

export function avatar(t, size = 44) {
  const initials = t.name.split(' ').map((p) => p[0]).join('').slice(0, 2);
  return `<span class="avatar" style="--size:${size}px" data-initials="${esc(initials)}">
    <img src="${t.avatar}" alt="" width="${size}" height="${size}" loading="lazy" onerror="this.remove()"></span>`;
}

const stars = '<span class="stars" aria-label="5 out of 5 stars">★★★★★</span>';

export function testimonial(t, i) {
  return `
    <figure class="quote ${t.featured ? 'quote--featured glass' : ''}" data-reveal ${t.featured ? 'data-sheen' : ''} style="--i:${i}">
      ${stars}
      <blockquote>${esc(t.quote)}</blockquote>
      <figcaption>${avatar(t, t.featured ? 52 : 40)}<span><b>${esc(t.name)}</b><small>${esc(t.role)}</small></span></figcaption>
    </figure>`;
}

// A watch "plan". The toggle switches between the watch alone and the watch with its cuff.
export function pricingCard(plan, cuffId, i) {
  const p = productById(plan.id);
  const cuff = productById(cuffId);
  return `
    <article class="plan glass ${plan.featured ? 'plan--featured' : ''}" data-reveal data-sheen style="--i:${i}">
      ${plan.featured ? '<p class="plan__badge">New</p>' : ''}
      <div class="plan__media"><img src="${cutout(p)}" alt="${esc(p.name)} ${esc(p.variant)}" loading="lazy"></div>
      <p class="kicker">${esc(p.name)}</p>
      <h3>${esc(p.variant)}</h3>
      <p class="plan__blurb">${esc(plan.blurb)}</p>
      <p class="plan__price">
        <span class="serif" data-price data-solo="${p.price}" data-set="${p.price + cuff.price}">${money(p.price)}</span>
        <small data-plan-note data-solo="Watch only" data-set="With the ${esc(cuff.name)} cuff">Watch only</small>
      </p>
      ${button({ label: 'Add to bag', href: '', variant: plan.featured ? 'light' : 'solid', size: 'block', attrs: `data-add="${p.id}" data-cuff="${cuff.id}"` })}
      <a class="plan__link" href="${shopLink('product/' + p.id)}">View details</a>
      <ul>${p.details.slice(0, 4).map((d) => `<li>${icon.check}${esc(d)}</li>`).join('')}</ul>
    </article>`;
}

export function faqItem(f, i) {
  return `
    <details class="faq" name="faq" data-reveal style="--i:${i}">
      <summary><span>${esc(f.q)}</span><i>${icon.plus}</i></summary>
      <div class="faq__body"><p>${esc(f.a)}</p></div>
    </details>`;
}
