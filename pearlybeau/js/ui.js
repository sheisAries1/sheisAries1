// Small shared helpers: escaping, money, icons, product cards, toast.
import { CATEGORIES } from './data.js';
import { inWishlist } from './store.js';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const naira = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });
export const money = (n) => naira.format(n).replace('NGN', '₦');

export const icons = {
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  globe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
  card: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/></svg>',
  award: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="6"/><circle cx="12" cy="9" r="2.5"/><path d="m8.2 13.6-1.7 7.4 5.5-3 5.5 3-1.7-7.4"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>',
};

// Product photo, or a drawn card for the gift card which has no photo.
export function productImage(p, cls = '') {
  if (!p.image) {
    return `<div class="giftcard ${cls}" aria-hidden="true"><span>PEARLY&nbsp;&nbsp;BEAU</span><small>GIFT CARD</small></div>`;
  }
  return `<img class="${p.packshot ? 'packshot' : 'photo'} ${cls}" src="${p.image}" alt="${esc(p.name)} — ${esc(p.variant)}" loading="lazy">`;
}

export function priceLabel(p) {
  return p.options ? `From ${money(Math.min(...p.options))}` : money(p.price);
}

export function wishButton(p) {
  const on = inWishlist(p.id);
  return `<button class="wish ${on ? 'is-on' : ''}" type="button" data-action="wish" data-id="${p.id}"
    aria-pressed="${on}" aria-label="${on ? 'Remove from' : 'Add to'} wishlist: ${esc(p.name)} ${esc(p.variant)}">${icons.heart}</button>`;
}

export function productCard(p) {
  const badge = p.badges[0] ? `<span class="tag">${esc(p.badges[0])}</span>` : '';
  const action = p.options
    ? `<a class="btn btn--ghost btn--sm" href="#/product/${p.id}">Choose amount</a>`
    : `<button class="btn btn--ghost btn--sm" type="button" data-action="add" data-id="${p.id}">Add to cart</button>`;
  return `
    <article class="card">
      <a class="card__media" href="#/product/${p.id}" tabindex="-1" aria-hidden="true">${productImage(p)}</a>
      ${badge}
      ${wishButton(p)}
      <div class="card__body">
        <p class="card__kicker">${esc(p.name)}</p>
        <h3 class="card__title"><a href="#/product/${p.id}">${esc(p.variant)}</a></h3>
        <p class="card__price">${priceLabel(p)}</p>
        ${action}
      </div>
    </article>`;
}

export function grid(products) {
  if (!products.length) return '<p class="empty">Nothing here yet.</p>';
  return `<div class="grid">${products.map(productCard).join('')}</div>`;
}

export function categoryName(slug) {
  return CATEGORIES[slug]?.name || 'All products';
}

let toastTimer;
export function toast(html) {
  const el = document.getElementById('toast');
  el.innerHTML = html;
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('is-in'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('is-in');
    setTimeout(() => { el.hidden = true; }, 250);
  }, 3200);
}
