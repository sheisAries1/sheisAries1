// Page views. Each returns { title, html, mount? } — `mount(root)` wires events
// after the HTML is in the page.
import { BRAND, HERO, FEATURES, CATEGORIES, COLLECTIONS, PRODUCTS, FINISHES, DELIVERY, PAGES } from './data.js';
import { productArt, icon } from './art.js';
import * as store from './store.js';
import { navigate } from './router.js';
import { processPayment, cardBrand, formatCard, luhn } from './payments.js';
import { toast, openCart } from './ui.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const collectionName = (id) => COLLECTIONS.find((c) => c.id === id)?.name ?? '';
const categoryName = (id) => CATEGORIES.find((c) => c.id === id)?.name ?? '';
const fullName = (p) => `${collectionName(p.collection)} ${p.name}`;

/* ---------- Shared pieces ---------- */

function heading(eyebrow, title, tag = 'h2') {
  return `<header class="sec-head"><p class="eyebrow">${eyebrow}</p><${tag}>${title}</${tag}></header>`;
}

function rating(p) {
  return p.rating ? `<p class="meta">${icon('star')}<span><b>${p.rating.toFixed(1)}</b> rating (${p.reviews})</span></p>` : '';
}

function heartBtn(p) {
  const on = store.inWishlist(p.slug);
  return `<button type="button" class="heart ${on ? 'on' : ''}" data-wish="${p.slug}" aria-pressed="${on}" aria-label="${on ? 'Remove' : 'Save'} ${esc(fullName(p))} ${on ? 'from' : 'to'} wishlist">${icon('heart')}</button>`;
}

function productCard(p) {
  const soldOut = p.stock === 0;
  return `<article class="card">
    <a class="card-link" href="#/product/${p.slug}">
      <div class="card-media">${productArt(p)}
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
      </div>
      <div class="card-body">
        <p class="kicker">${collectionName(p.collection)}</p>
        <h3>${esc(p.name)}</h3>
        <p class="meta">${icon('tag')}<span>${store.money(p.price)}</span></p>
        ${rating(p)}
      </div>
    </a>
    ${heartBtn(p)}
    <button class="btn btn-sm add" data-add="${p.slug}" ${soldOut ? 'disabled' : ''}>${soldOut ? 'Sold out' : 'Add to cart'}</button>
  </article>`;
}

function bindCards(root) {
  root.querySelectorAll('[data-add]').forEach((b) =>
    b.addEventListener('click', () => {
      const p = store.bySlug(b.dataset.add);
      if (store.addToCart(p.slug)) {
        toast(`${fullName(p)} added to your cart`);
        openCart();
      }
    })
  );
  root.querySelectorAll('[data-wish]').forEach((b) =>
    b.addEventListener('click', () => {
      const p = store.bySlug(b.dataset.wish);
      const on = store.toggleWish(p.slug);
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on);
      b.setAttribute('aria-label', `${on ? 'Remove' : 'Save'} ${fullName(p)} ${on ? 'from' : 'to'} wishlist`);
      toast(on ? 'Saved to your wishlist' : 'Removed from your wishlist');
    })
  );
}

function summaryHtml(t, { delivery = false } = {}) {
  return `<dl class="totals">
    <div><dt>Subtotal</dt><dd>${store.money(t.subtotal)}</dd></div>
    ${t.discount ? `<div class="good"><dt>Discount ${esc(t.promoCode)} (${t.promoLabel})</dt><dd>−${store.money(t.discount)}</dd></div>` : ''}
    <div><dt>Delivery</dt><dd>${!delivery || t.shipping == null ? 'Calculated at checkout' : t.shipping === 0 ? 'Free' : store.money(t.shipping)}</dd></div>
    <div class="grand"><dt>Total</dt><dd>${store.money(t.total)}</dd></div>
  </dl>`;
}

/* ---------- Home (mirrors pearlybeau.netlify.app) ---------- */

export function home() {
  const hero = store.bySlug(HERO.product);
  const best = PRODUCTS.filter((p) => p.bestseller);
  return {
    title: `${BRAND.name} — Wrist watches, jewelry & eyewear`,
    html: `
    <section class="hero">
      <p class="eyebrow">${HERO.eyebrow}</p>
      <h1>${HERO.title}</h1>
      <p>${HERO.text}</p>
      <a class="btn" href="#/shop?collection=classic-era">Shop Now</a>
      <a class="hero-art" href="#/product/${hero.slug}" aria-label="${esc(fullName(hero))}">${productArt(hero, { size: 'hero' })}</a>
    </section>

    <ul class="features">
      ${FEATURES.map((f) => `<li><span class="feature-ico">${icon(f.icon)}</span><div><h3>${f.title}</h3><p>${f.text}</p></div></li>`).join('')}
    </ul>

    <section class="band">
      ${heading('Trending products', 'Our Best Sellers')}
      <div class="grid">${best.map(productCard).join('')}</div>
      <div class="center"><a class="btn" href="#/shop">See all products ${icon('arrow')}</a></div>
    </section>

    <section class="section">
      ${heading('Shop by categories', 'Popular Categories')}
      <div class="cats">
        ${CATEGORIES.map((c) => `<a class="cat" href="#/shop?category=${c.id}">
          <div class="cat-art">${productArt(store.bySlug(c.cover))}</div>
          <span class="btn btn-sm">${c.name}</span></a>`).join('')}
      </div>
    </section>

    ${brandStory()}`,
    mount: bindCards,
  };
}

function brandStory(tag = 'h2') {
  return `<section class="section about-brand">
    ${heading('Brand', 'Who We Are', tag)}
    <div class="split">
      <div><h3 class="ghost">About Us</h3>${BRAND.about.map((t) => `<p>${t}</p>`).join('')}</div>
      <div class="split-art">${productArt(store.bySlug('rose-quartz-rose-gold'), { size: 'hero' })}</div>
    </div>
    <div class="split reverse">
      <div class="split-art">${productArt(store.bySlug('classic-era-two-tone'), { size: 'hero' })}</div>
      <div><h3 class="ghost">Our Story</h3>${BRAND.story.map((t) => `<p>${t}</p>`).join('')}</div>
    </div>
  </section>`;
}

/* ---------- Shop / listing ---------- */

const SORTS = {
  featured: { label: 'Featured', fn: (a, b) => PRODUCTS.indexOf(a) - PRODUCTS.indexOf(b) },
  rating: { label: 'Top rated', fn: (a, b) => (b.rating ?? 0) - (a.rating ?? 0) },
  'price-asc': { label: 'Price: low to high', fn: (a, b) => a.price - b.price },
  'price-desc': { label: 'Price: high to low', fn: (a, b) => b.price - a.price },
};

export function shop({ query }) {
  const category = query.category ?? 'all';
  const collection = query.collection ?? 'all';
  const sort = SORTS[query.sort] ? query.sort : 'featured';
  const q = (query.q ?? '').trim();

  const list = PRODUCTS.filter((p) =>
    (category === 'all' || p.category === category) &&
    (collection === 'all' || p.collection === collection) &&
    (!q || `${fullName(p)} ${FINISHES[p.finish].label} ${categoryName(p.category)} ${p.description}`.toLowerCase().includes(q.toLowerCase()))
  ).sort(SORTS[sort].fn);

  const title = collection !== 'all' ? collectionName(collection) : category !== 'all' ? categoryName(category) : 'All Products';
  const collectionsHere = COLLECTIONS.filter((c) => PRODUCTS.some((p) => p.collection === c.id && (category === 'all' || p.category === category)));

  return {
    title: `${title} — ${BRAND.name}`,
    html: `
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a> / <span>Shop</span></nav>
    ${heading('Shop PearlyBeau', title, 'h1')}
    <form class="filters" id="filters" role="search" aria-label="Filter products">
      <label class="field search">${icon('search')}<span class="sr-only">Search</span><input type="search" name="q" value="${esc(q)}" placeholder="Search products"></label>
      <fieldset><legend class="sr-only">Category</legend>
        ${[{ id: 'all', name: 'All' }, ...CATEGORIES].map((c) => `<label class="chip"><input type="radio" name="category" value="${c.id}" ${c.id === category ? 'checked' : ''}><span>${c.name}</span></label>`).join('')}
      </fieldset>
      <label class="field inline"><span>Collection</span>
        <select name="collection"><option value="all">All</option>${collectionsHere.map((c) => `<option value="${c.id}" ${c.id === collection ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
      </label>
      <label class="field inline"><span>Sort</span>
        <select name="sort">${Object.entries(SORTS).map(([k, s]) => `<option value="${k}" ${k === sort ? 'selected' : ''}>${s.label}</option>`).join('')}</select>
      </label>
    </form>
    <p class="muted count-line" aria-live="polite">${list.length} ${list.length === 1 ? 'product' : 'products'}</p>
    ${list.length
      ? `<div class="grid">${list.map(productCard).join('')}</div>`
      : `<div class="empty"><p>No products match. Try another search.</p><a class="btn" href="#/shop">Clear filters</a></div>`}`,
    mount(root) {
      bindCards(root);
      const form = root.querySelector('#filters');
      const apply = (e) => {
        const data = new FormData(form);
        // A new category resets the collection so it can't filter to nothing.
        if (e?.target?.name === 'category') data.set('collection', 'all');
        const params = new URLSearchParams();
        for (const [k, v] of data) if (v && v !== 'all' && !(k === 'sort' && v === 'featured')) params.set(k, v);
        const qs = params.toString();
        navigate(`/shop${qs ? '?' + qs : ''}`, { replace: true });
      };
      form.addEventListener('change', (e) => e.target.name !== 'q' && apply(e));
      let t;
      form.q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(apply, 350); });
      form.addEventListener('submit', (e) => { e.preventDefault(); apply(); });
    },
  };
}

/* ---------- Product ---------- */

export function product({ params }) {
  const p = store.bySlug(params.slug);
  if (!p) return notFound();
  const f = FINISHES[p.finish];
  const siblings = PRODUCTS.filter((x) => x.collection === p.collection);
  const related = PRODUCTS.filter((x) => x.slug !== p.slug && x.category === p.category).slice(0, 4);
  const soldOut = p.stock === 0;

  return {
    title: `${fullName(p)} — ${BRAND.name}`,
    html: `
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a> / <a href="#/shop?category=${p.category}">${categoryName(p.category)}</a> / <span>${esc(fullName(p))}</span></nav>
    <div class="pdp">
      <div class="pdp-art">${productArt(p, { size: 'hero' })}${p.badge ? `<span class="badge">${p.badge}</span>` : ''}</div>
      <div class="pdp-info">
        <p class="eyebrow">${collectionName(p.collection)}</p>
        <h1>${esc(p.name)}</h1>
        <p class="price">${store.money(p.price)}</p>
        ${rating(p)}
        ${siblings.length > 1 ? `<div class="swatches" role="group" aria-label="Finish">
          ${siblings.map((s) => `<a href="#/product/${s.slug}" class="swatch ${s.slug === p.slug ? 'on' : ''}" style="--c:${FINISHES[s.finish].swatch}" aria-label="${FINISHES[s.finish].label}" ${s.slug === p.slug ? 'aria-current="true"' : ''}></a>`).join('')}
          <span>${f.label}</span></div>` : `<p class="muted">Finish: ${f.label}</p>`}
        <p>${esc(p.description)}</p>
        <form class="buy" id="buy">
          <div class="qty" role="group" aria-label="Quantity">
            <button type="button" data-step="-1" aria-label="Decrease quantity">−</button>
            <input name="qty" type="number" min="1" max="${Math.max(1, p.stock)}" value="1" inputmode="numeric" aria-label="Quantity" ${soldOut ? 'disabled' : ''}>
            <button type="button" data-step="1" aria-label="Increase quantity">+</button>
          </div>
          <button class="btn grow" ${soldOut ? 'disabled' : ''}>${soldOut ? 'Sold out' : 'Add to cart'}</button>
          ${heartBtn(p)}
        </form>
        <p class="stock ${p.stock <= 5 ? 'low' : ''}">${soldOut ? 'Out of stock' : p.stock <= 5 ? `Only ${p.stock} left` : 'In stock'}</p>
        <ul class="features mini">${FEATURES.map((x) => `<li>${icon(x.icon)}<span><b>${x.title}</b> · ${x.text}</span></li>`).join('')}</ul>
        <details open><summary>Details</summary>
          <dl class="specs">${Object.entries(p.specs).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
        </details>
        <details><summary>Delivery</summary>
          <ul class="plain">${DELIVERY.map((d) => `<li><b>${d.label}</b> — ${d.price ? store.money(d.price) : 'Free'} · ${d.note}</li>`).join('')}</ul>
        </details>
      </div>
    </div>
    ${related.length ? `<section class="section">${heading('You may also like', `More ${categoryName(p.category)}`)}
      <div class="grid">${related.map(productCard).join('')}</div></section>` : ''}`,
    mount(root) {
      bindCards(root);
      const form = root.querySelector('#buy');
      const input = form.qty;
      const clamp = () => (input.value = Math.min(Math.max(1, +input.value || 1), Math.max(1, p.stock)));
      form.querySelectorAll('[data-step]').forEach((b) =>
        b.addEventListener('click', () => { input.value = +input.value + +b.dataset.step; clamp(); })
      );
      input.addEventListener('change', clamp);
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        clamp();
        if (store.addToCart(p.slug, +input.value)) {
          toast(`${input.value} × ${fullName(p)} added to your cart`);
          openCart();
        }
      });
    },
  };
}

/* ---------- Cart ---------- */

export function cartLines({ compact = false } = {}) {
  const items = store.cartItems();
  if (!items.length) return '';
  return `<ul class="lines">${items.map(({ product: p, qty }) => `
    <li class="line">
      <a class="line-art" href="#/product/${p.slug}" tabindex="-1" aria-hidden="true">${productArt(p, { size: 'mini' })}</a>
      <div class="line-info">
        <p class="kicker">${collectionName(p.collection)}</p>
        <a href="#/product/${p.slug}"><strong>${esc(p.name)}</strong></a>
        ${compact ? `<span class="muted">Qty ${qty}</span>` : `
        <div class="qty sm" role="group" aria-label="Quantity for ${esc(fullName(p))}">
          <button type="button" data-qty="${p.slug}" data-step="-1" aria-label="Decrease">−</button>
          <span>${qty}</span>
          <button type="button" data-qty="${p.slug}" data-step="1" aria-label="Increase" ${qty >= p.stock ? 'disabled' : ''}>+</button>
        </div>`}
      </div>
      <div class="line-end">
        <span>${store.money(p.price * qty)}</span>
        ${compact ? '' : `<button class="link" data-remove="${p.slug}">Remove</button>`}
      </div>
    </li>`).join('')}</ul>`;
}

export function bindLines(root) {
  root.querySelectorAll('[data-qty]').forEach((b) =>
    b.addEventListener('click', () => {
      const line = store.cartItems().find((i) => i.slug === b.dataset.qty);
      store.setQty(b.dataset.qty, line.qty + +b.dataset.step);
    })
  );
  root.querySelectorAll('[data-remove]').forEach((b) =>
    b.addEventListener('click', () => store.removeFromCart(b.dataset.remove))
  );
}

export function cart() {
  const items = store.cartItems();
  const t = store.totals();
  return {
    title: `Your cart — ${BRAND.name}`,
    html: `
    ${heading('Shopping', 'Your Cart', 'h1')}
    ${!items.length ? `<div class="empty"><p>Your cart is empty.</p><a class="btn" href="#/shop">See all products</a></div>` : `
    <div class="cart">
      <div>
        ${cartLines()}
        <a class="link" href="#/shop">← Continue shopping</a>
      </div>
      <aside class="panel">
        <h2>Order Summary</h2>
        ${t.promoCode
          ? `<p class="promo-on">Code <strong>${esc(t.promoCode)}</strong> applied · <button class="link" id="rmPromo">Remove</button></p>`
          : `<form class="promo" id="promo"><label class="field"><span>Discount code</span><input name="code" placeholder="Sign up below for a code" autocomplete="off"></label><button class="btn btn-ghost">Apply</button></form>`}
        ${summaryHtml(t)}
        <a class="btn block" href="#/checkout/details">Checkout</a>
        <p class="muted small center">Demo store: no real payments are taken.</p>
      </aside>
    </div>`}`,
    mount(root) {
      bindLines(root);
      root.querySelector('#promo')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = e.target.code.value;
        if (store.applyPromo(code)) toast('Discount applied');
        else { toast(`“${code}” isn’t a valid code`); e.target.code.focus(); }
      });
      root.querySelector('#rmPromo')?.addEventListener('click', store.removePromo);
    },
  };
}

/* ---------- Wishlist & account ---------- */

export function wishlist() {
  const list = store.wishlist();
  return {
    title: `Wishlist — ${BRAND.name}`,
    html: `${heading('Saved for later', 'Your Wishlist', 'h1')}
      ${list.length ? `<div class="grid">${list.map(productCard).join('')}</div>`
        : `<div class="empty"><p>Tap the ${icon('heart', 'inline')} on any product to save it here.</p><a class="btn" href="#/shop">See all products</a></div>`}`,
    mount: bindCards,
  };
}

export function account() {
  const orders = store.getOrders();
  return {
    title: `Your orders — ${BRAND.name}`,
    html: `${heading('Account', 'Your Orders', 'h1')}
      <p class="muted center">Orders placed in this demo are kept in this browser only.</p>
      ${orders.length ? `<ul class="orders">${orders.map((o) => `<li class="panel"><a href="#/order/${o.id}">
          <strong>${esc(o.id)}</strong><span class="muted">${new Date(o.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span>${o.items.reduce((n, i) => n + i.qty, 0)} item(s)</span><b>${store.money(o.totals.total)}</b></a></li>`).join('')}</ul>`
        : `<div class="empty"><p>No orders yet.</p><a class="btn" href="#/shop">Start shopping</a></div>`}`,
  };
}

/* ---------- Checkout ---------- */

const DRAFT_KEY = 'pb-checkout';
const STEPS = [
  { id: 'details', label: 'Details' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'payment', label: 'Payment' },
];
const loadDraft = () => { try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY)) ?? {}; } catch { return {}; } };
const saveDraft = (d) => { try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch { /* ignore */ } };
let draft = loadDraft();

const STATES = ['Lagos', 'Abuja (FCT)', 'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'];
const COUNTRIES = ['Nigeria', 'Ghana', 'United Kingdom', 'United States', 'Canada', 'South Africa', 'Kenya', 'Other'];

function deliveryAllowed(d) {
  const ng = (draft.country ?? 'Nigeria') === 'Nigeria';
  if (d.region === 'intl') return !ng;
  if (!ng) return false;
  return d.region === 'lagos' ? draft.state === 'Lagos' : true;
}

function stepDone(id) {
  if (id === 'details') return !!(draft.email && draft.name && draft.phone && draft.address && draft.city && draft.country && (draft.country !== 'Nigeria' || draft.state));
  if (id === 'delivery') return !!draft.delivery && deliveryAllowed(DELIVERY.find((d) => d.id === draft.delivery));
  return false;
}

export function checkout({ params }) {
  if (!store.cartCount()) return { redirect: '/cart' };
  const step = STEPS.some((s) => s.id === params.step) ? params.step : 'details';
  // Don't let people skip ahead.
  const firstOpen = STEPS.find((s) => !stepDone(s.id))?.id ?? 'payment';
  if (STEPS.findIndex((s) => s.id === step) > STEPS.findIndex((s) => s.id === firstOpen)) {
    return { redirect: `/checkout/${firstOpen}` };
  }

  const deliveryOpt = stepDone('delivery') ? DELIVERY.find((d) => d.id === draft.delivery) : null;
  const t = store.totals(deliveryOpt?.price ?? null);
  const idx = STEPS.findIndex((s) => s.id === step);
  const ng = (draft.country ?? 'Nigeria') === 'Nigeria';

  const progress = `<ol class="steps">${STEPS.map((s, i) => `<li class="${i < idx ? 'done' : i === idx ? 'now' : ''}" ${i === idx ? 'aria-current="step"' : ''}>
    ${i < idx ? `<a href="#/checkout/${s.id}">${s.label}</a>` : `<span>${s.label}</span>`}</li>`).join('')}</ol>`;

  const forms = {
    details: `
      <form id="step" novalidate>
        <h2>Contact</h2>
        ${field('email', 'Email', 'email', { autocomplete: 'email' })}
        ${field('phone', 'Phone', 'tel', { autocomplete: 'tel', placeholder: '0911 481 9336' })}
        <h2>Delivery address</h2>
        ${field('name', 'Full name', 'text', { autocomplete: 'name' })}
        ${field('address', 'Street address', 'text', { autocomplete: 'street-address' })}
        <div class="row">
          ${field('city', 'City / Area', 'text', { autocomplete: 'address-level2' })}
          <label class="field"><span>Country</span><select name="country" autocomplete="country-name">
            ${COUNTRIES.map((c) => `<option ${(draft.country ?? 'Nigeria') === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select><small class="err"></small></label>
        </div>
        <label class="field" id="stateField" ${ng ? '' : 'hidden'}><span>State</span><select name="state" autocomplete="address-level1">
          <option value="">Choose…</option>${STATES.map((s) => `<option ${draft.state === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select><small class="err"></small></label>
        <button class="btn block">Continue to delivery</button>
      </form>`,
    delivery: `
      <form id="step">
        <h2>Delivery method</h2>
        <fieldset class="options">
          <legend class="sr-only">Delivery method</legend>
          ${DELIVERY.filter((d) => d.region === 'intl' ? !ng : ng).map((d) => {
            const off = !deliveryAllowed(d);
            return `<label class="option ${off ? 'off' : ''}"><input type="radio" name="delivery" value="${d.id}" ${draft.delivery === d.id && !off ? 'checked' : ''} ${off ? 'disabled' : ''}>
              <span><strong>${d.label}</strong><small>${off ? 'Lagos addresses only' : d.note}</small></span>
              <b>${d.price ? store.money(d.price) : 'Free'}</b></label>`;
          }).join('')}
        </fieldset>
        <label class="field"><span>Gift note (optional)</span><textarea name="note" rows="2" maxlength="200">${esc(draft.note)}</textarea></label>
        <p class="err" id="deliveryErr" role="alert"></p>
        <button class="btn block">Continue to payment</button>
      </form>`,
    payment: `
      <form id="step" novalidate>
        <h2>Payment</h2>
        <div class="notice">${icon('card')}<div><strong>Demo checkout.</strong> Don't enter a real card. Use a test card:
          <ul class="plain small">
            <li><code>4242 4242 4242 4242</code> — payment succeeds</li>
            <li><code>4000 0000 0000 0002</code> — card declined</li>
            <li><code>4000 0000 0000 9995</code> — insufficient funds</li>
          </ul>Any future expiry date and any 3-digit CVC.</div></div>
        <fieldset class="options two">
          <legend class="sr-only">Payment method</legend>
          <label class="option"><input type="radio" name="method" value="card" checked><span><strong>Card</strong><small>Visa, Mastercard, Verve</small></span></label>
          <label class="option"><input type="radio" name="method" value="transfer"><span><strong>Bank transfer</strong><small>Pay into a one-time account</small></span></label>
        </fieldset>
        <div id="cardFields">
          <label class="field"><span>Card number <b class="card-brand" id="brand"></b></span>
            <input name="card" inputmode="numeric" autocomplete="off" placeholder="4242 4242 4242 4242" maxlength="23"><small class="err"></small></label>
          <div class="row">
            <label class="field"><span>Expiry (MM/YY)</span><input name="exp" inputmode="numeric" autocomplete="off" placeholder="12/28" maxlength="5"><small class="err"></small></label>
            <label class="field"><span>CVC</span><input name="cvc" inputmode="numeric" autocomplete="off" placeholder="123" maxlength="4"><small class="err"></small></label>
          </div>
          <label class="field"><span>Name on card</span><input name="cardName" autocomplete="off" value="${esc(draft.name)}"><small class="err"></small></label>
        </div>
        <div id="transferFields" hidden>
          <div class="panel soft"><p class="muted small">Transfer exactly</p><p class="price">${store.money(t.total)}</p>
            <p>Demo Bank · 0123456789 · PearlyBeau (Demo)</p>
            <p class="muted small">In this demo, pressing Pay confirms the transfer straight away.</p></div>
        </div>
        <p class="err" id="payErr" role="alert"></p>
        <button class="btn block" id="payBtn">Pay ${store.money(t.total)}</button>
      </form>`,
  };

  return {
    title: `Checkout — ${BRAND.name}`,
    html: `
    ${heading('Secure checkout', 'Checkout', 'h1')}${progress}
    <div class="checkout">
      <div class="panel">${forms[step]}</div>
      <aside class="panel">
        <h2>Order Summary</h2>
        ${cartLines({ compact: true })}
        ${summaryHtml(t, { delivery: true })}
        ${draft.email && step !== 'details' ? `<div class="recap small"><p><strong>Ship to</strong> ${esc(draft.name)}, ${esc(draft.address)}, ${esc(draft.city)}${draft.state && ng ? ', ' + esc(draft.state) : ''}, ${esc(draft.country)}</p><a class="link" href="#/checkout/details">Edit</a></div>` : ''}
      </aside>
    </div>`,
    mount(root) {
      const form = root.querySelector('#step');
      if (step === 'details') mountDetails(form);
      if (step === 'delivery') mountDelivery(form);
      if (step === 'payment') mountPayment(form, t, deliveryOpt);
    },
  };
}

function field(name, label, type, attrs = {}) {
  const extra = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
  return `<label class="field"><span>${label}</span><input name="${name}" type="${type}" value="${esc(draft[name])}" required ${extra}><small class="err"></small></label>`;
}

function setErr(input, msg) {
  const el = input.closest('.field')?.querySelector('.err');
  if (el) el.textContent = msg;
  input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  return !msg;
}

function mountDetails(form) {
  const ng = () => form.country.value === 'Nigeria';
  const rules = {
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email'),
    phone: (v) => {
      const d = v.replace(/[\s()-]/g, '');
      if (ng()) return /^(\+?234|0)[789][01]\d{8}$/.test(d) ? '' : 'Enter a Nigerian mobile number, e.g. 0911 481 9336';
      return /^\+?\d{7,15}$/.test(d) ? '' : 'Enter a valid phone number';
    },
    name: (v) => (v.trim().length > 1 ? '' : 'Enter your name'),
    address: (v) => (v.trim().length > 4 ? '' : 'Enter your street address'),
    city: (v) => (v.trim() ? '' : 'Enter your city or area'),
    state: (v) => (!ng() || v ? '' : 'Choose a state'),
  };
  form.country.addEventListener('change', () => (form.querySelector('#stateField').hidden = !ng()));
  // Re-check a field while it's being fixed. (Not on blur: clearing a message
  // then shifts the layout and the user's click on Continue can miss.)
  for (const n of Object.keys(rules)) {
    const recheck = () => form[n].getAttribute('aria-invalid') === 'true' && setErr(form[n], rules[n](form[n].value));
    form[n].addEventListener('input', recheck);
    form[n].addEventListener('change', recheck);
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstBad = null;
    for (const [n, rule] of Object.entries(rules)) {
      if (!setErr(form[n], rule(form[n].value)) && !firstBad) firstBad = form[n];
    }
    if (firstBad) return firstBad.focus();
    for (const n of Object.keys(rules)) draft[n] = form[n].value.trim();
    draft.country = form.country.value;
    if (!ng()) draft.state = '';
    saveDraft(draft);
    navigate('/checkout/delivery');
  });
}

function mountDelivery(form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const choice = form.querySelector('[name="delivery"]:checked')?.value;
    if (!choice) { form.querySelector('#deliveryErr').textContent = 'Choose a delivery method'; return; }
    draft.delivery = choice;
    draft.note = form.note.value.trim();
    saveDraft(draft);
    navigate('/checkout/payment');
  });
}

function mountPayment(form, t, deliveryOpt) {
  const cardBox = form.querySelector('#cardFields');
  const transferBox = form.querySelector('#transferFields');
  const brandEl = form.querySelector('#brand');
  const errEl = form.querySelector('#payErr');
  const btn = form.querySelector('#payBtn');

  form.querySelectorAll('[name="method"]').forEach((r) =>
    r.addEventListener('change', () => {
      const card = form.method.value === 'card';
      cardBox.hidden = !card;
      transferBox.hidden = card;
      errEl.textContent = '';
    })
  );
  form.card.addEventListener('input', () => {
    form.card.value = formatCard(form.card.value);
    brandEl.textContent = cardBrand(form.card.value);
  });
  form.exp.addEventListener('input', (e) => {
    let v = form.exp.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3 || (v.length === 2 && e.inputType !== 'deleteContentBackward')) v = v.slice(0, 2) + '/' + v.slice(2);
    form.exp.value = v;
  });
  form.cvc.addEventListener('input', () => (form.cvc.value = form.cvc.value.replace(/\D/g, '')));

  const validateCard = () => {
    const num = form.card.value.replace(/\s/g, '');
    const [mm, yy] = form.exp.value.split('/').map(Number);
    const expOk = mm >= 1 && mm <= 12 && yy >= 0 && new Date(2000 + yy, mm, 1) > new Date();
    const fields = [form.card, form.exp, form.cvc, form.cardName];
    const ok = [
      setErr(form.card, num.length >= 13 && luhn(num) ? '' : 'Enter a valid card number'),
      setErr(form.exp, expOk ? '' : 'Enter a future expiry date'),
      setErr(form.cvc, /^\d{3,4}$/.test(form.cvc.value) ? '' : 'Enter the 3-digit code'),
      setErr(form.cardName, form.cardName.value.trim() ? '' : 'Enter the name on the card'),
    ];
    const bad = fields[ok.indexOf(false)];
    bad?.focus();
    return !bad;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errEl.textContent = '';
    const method = form.method.value;
    if (method === 'card' && !validateCard()) return;

    btn.disabled = true;
    btn.classList.add('loading');
    btn.textContent = 'Processing…';
    const result = await processPayment({
      method, amount: t.total,
      card: method === 'card' ? form.card.value.replace(/\s/g, '') : null,
    });
    if (!result.ok) {
      btn.disabled = false;
      btn.classList.remove('loading');
      btn.textContent = `Pay ${store.money(t.total)}`;
      errEl.textContent = result.message;
      return;
    }

    const order = {
      id: 'PB-' + Date.now().toString(36).toUpperCase().slice(-6),
      date: new Date().toISOString(),
      items: store.cartItems().map(({ slug, qty, product: p }) => ({ slug, qty, name: fullName(p), price: p.price })),
      totals: t,
      delivery: deliveryOpt,
      customer: { ...draft },
      payment: { method, ref: result.ref, last4: method === 'card' ? form.card.value.slice(-4) : null, brand: method === 'card' ? cardBrand(form.card.value) : null },
    };
    store.saveOrder(order);
    draft = {};
    try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    // Leave checkout first so emptying the cart doesn't bounce us to /cart.
    navigate(`/order/${order.id}`);
    store.clearCart();
  });
}

/* ---------- Order confirmation ---------- */

export function order({ params }) {
  const o = store.getOrder(params.id);
  if (!o) return notFound();
  const c = o.customer;
  return {
    title: `Order ${o.id} — ${BRAND.name}`,
    html: `
    <section class="confirm">
      <div class="tick" aria-hidden="true">✓</div>
      <p class="eyebrow">Order ${esc(o.id)}</p>
      <h1>Thank you, ${esc(c.name.split(' ')[0])}!</h1>
      <p>Your order is confirmed. ${o.delivery.id === 'pickup' ? 'We will call you on ' + esc(c.phone) + ' when it is ready in Ajah.' : `Expected delivery: ${esc(o.delivery.note)}.`}
        In a real store a receipt would go to <strong>${esc(c.email)}</strong>.</p>
      <div class="panel left">
        <ul class="lines">${o.items.map((i) => {
          const p = store.bySlug(i.slug);
          return `<li class="line"><div class="line-art">${p ? productArt(p, { size: 'mini' }) : ''}</div>
          <div class="line-info"><strong>${esc(i.name)}</strong><span class="muted">Qty ${i.qty}</span></div>
          <div class="line-end">${store.money(i.price * i.qty)}</div></li>`;
        }).join('')}</ul>
        ${summaryHtml(o.totals, { delivery: true })}
        <div class="recap-grid small">
          <div><strong>Delivery</strong><p>${esc(o.delivery.label)}<br>${esc(c.address)}, ${esc(c.city)}${c.state ? ', ' + esc(c.state) : ''}, ${esc(c.country)}</p></div>
          <div><strong>Payment</strong><p>${o.payment.method === 'card' ? `${esc(o.payment.brand || 'Card')} ending ${esc(o.payment.last4)}` : 'Bank transfer'}<br>Ref ${esc(o.payment.ref)}</p></div>
          ${c.note ? `<div><strong>Gift note</strong><p>“${esc(c.note)}”</p></div>` : ''}
        </div>
      </div>
      <div class="actions center"><a class="btn" href="#/shop">Continue shopping</a><button class="btn btn-ghost" type="button" id="printBtn">Print receipt</button></div>
    </section>`,
    mount: (root) => root.querySelector('#printBtn').addEventListener('click', () => print()),
  };
}

/* ---------- About, info pages & 404 ---------- */

export function about() {
  return {
    title: `About — ${BRAND.name}`,
    html: `${brandStory('h1')}
      <section class="section contact panel">
        <h2>Contact us</h2>
        <p>${BRAND.address}<br><a href="tel:${BRAND.phone}">${BRAND.phone}</a><br>${BRAND.website}</p>
      </section>`,
  };
}

export function page({ params }) {
  const pg = PAGES[params.slug];
  if (!pg) return notFound();
  return {
    title: `${pg.title} — ${BRAND.name}`,
    html: `<section class="prose">${heading('PearlyBeau', pg.title, 'h1')}${pg.body.map((t) => `<p>${t}</p>`).join('')}
      <p>Call us: <a href="tel:${BRAND.phone}">${BRAND.phone}</a> · ${BRAND.address}</p></section>`,
  };
}

export function notFound() {
  return {
    title: `Not found — ${BRAND.name}`,
    html: `<section class="empty tall"><h1>We couldn't find that page</h1><p class="muted">It may have moved, or the link may be wrong.</p><a class="btn" href="#/shop">See all products</a></section>`,
  };
}
