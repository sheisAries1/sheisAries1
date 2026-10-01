// Page views. Each returns { title, html, mount? }.
import { PRODUCTS, CATEGORIES, productById, FREE_DELIVERY_FROM } from './data.js';
import * as store from './store.js';
import { esc, money, icons, productImage, wishButton, grid, categoryName } from './ui.js';

// ---------- Home ----------

export function home() {
  const era = productById('the-era-rose-gold');
  const best = PRODUCTS.filter((p) => p.bestseller);
  const cats = ['watches', 'jewelry', 'eyewear'];
  return {
    title: 'Pearlybeau | Quality Watches, Eyewear & Jewelry',
    html: `
      <section class="hero">
        <div class="hero__text">
          <p class="eyebrow">NEW</p>
          <h1>THE ERA<br>COLLECTION</h1>
          <p class="lede">Collection is available and in polished stainless steel with refined Rose Gold plating.</p>
          <a class="btn" href="#/product/${era.id}">Shop Now</a>
        </div>
        <div class="hero__media">
          <img src="${era.image}" alt="The Era watch in rose gold" width="350" height="605">
        </div>
      </section>

      <section class="features" aria-label="Why shop with us">
        <div class="feature">
          <span class="feature__icon">${icons.globe}</span>
          <div><h2>Worldwide Shipping</h2><p>Delivery is world wide and super swift.</p></div>
        </div>
        <div class="feature">
          <span class="feature__icon">${icons.card}</span>
          <div><h2>Easy Payment</h2><p>Payment is secure.</p></div>
        </div>
        <div class="feature">
          <span class="feature__icon">${icons.award}</span>
          <div><h2>Guarantee</h2><p>2 years Guarantee</p></div>
        </div>
      </section>

      <section class="band band--grey">
        <header class="section-head">
          <p class="eyebrow">TRENDING PRODUCTS</p>
          <h2>Our Best Sellers</h2>
        </header>
        ${grid(best)}
        <p class="center"><a class="btn" href="#/shop">View all products</a></p>
      </section>

      <section class="band">
        <header class="section-head">
          <p class="eyebrow">SHOP BY CATEGORIES</p>
          <h2>Popular Categories</h2>
        </header>
        <div class="categories">
          ${cats.map((c) => `
            <a class="category" href="#/shop/${c}">
              <img src="${CATEGORIES[c].image}" alt="" loading="lazy">
              <span class="btn">${CATEGORIES[c].name.toUpperCase()}</span>
            </a>`).join('')}
        </div>
      </section>

      ${brandSections(true)}
    `,
  };
}

function brandSections(teaser = false) {
  return `
    <section class="band brand">
      <header class="section-head section-head--left">
        <p class="eyebrow">BRAND</p>
        <h2>Who We Are</h2>
      </header>
      <div class="split">
        <div>
          <h3 class="ghost-title">About Us</h3>
          <p>PearlyBeau is essentially a wrist watch brand, our fundamental goal is to offer high quality design and great craftmanship.</p>
          <p>Our timepiece is made with great attention to details and standard, we strive for perfection and we accept and nothing less.</p>
        </div>
        <img src="images/about.jpg" alt="A PearlyBeau rose gold watch worn with a dark silk sleeve" loading="lazy">
      </div>
      <div class="split split--flip">
        <img src="images/cat-watches.jpg" alt="Two Classic Era watches on a wooden table" loading="lazy">
        <div>
          <h3 class="ghost-title">Our Story</h3>
          <p>Driven by our ambition we embarked on this journey as a female led brand in june 2021.</p>
          <p>We are so proud of the company we are today. Over the years the development of our brand has been inspiring.</p>
          ${teaser ? '<a class="text-link" href="#/brand">More about PearlyBeau →</a>' : ''}
        </div>
      </div>
    </section>`;
}

export function brand() {
  return {
    title: 'Brand | Pearlybeau',
    html: `
      ${brandSections(false)}
      <section class="band band--grey">
        <div class="promise">
          <div><h3>Craftmanship</h3><p>Polished stainless steel, refined plating and Japanese quartz movements in every watch.</p></div>
          <div><h3>Guarantee</h3><p>Every watch is covered for 2 years. If something is wrong, we fix it or replace it.</p></div>
          <div><h3>From Lagos</h3><p>Designed in Ajah, Lagos and shipped anywhere in the world.</p></div>
        </div>
        <p class="center"><a class="btn" href="#/shop/watches">Shop Watches</a></p>
      </section>`,
  };
}

// ---------- Listing ----------

const SORTS = {
  featured: { label: 'Featured', fn: () => 0 },
  'price-asc': { label: 'Price: low to high', fn: (a, b) => a.price - b.price },
  'price-desc': { label: 'Price: high to low', fn: (a, b) => b.price - a.price },
  name: { label: 'Name A–Z', fn: (a, b) => (a.name + a.variant).localeCompare(b.name + b.variant) },
};

function listing({ title, intro, products, active, base, query }) {
  const sort = SORTS[query.get('sort')] ? query.get('sort') : 'featured';
  const sorted = [...products].sort(SORTS[sort].fn);
  const chips = [['', 'All'], ...Object.entries(CATEGORIES).map(([k, v]) => [k, v.name])]
    .map(([k, name]) => `<a class="chip ${active === k ? 'is-on' : ''}" href="#/shop${k ? '/' + k : ''}"
      ${active === k ? 'aria-current="page"' : ''}>${name}</a>`).join('');
  return `
    <section class="band page-head">
      <p class="eyebrow">SHOP</p>
      <h1>${esc(title)}</h1>
      ${intro ? `<p class="lede">${esc(intro)}</p>` : ''}
    </section>
    <section class="band band--grey band--tight">
      <div class="toolbar">
        <nav class="chips" aria-label="Categories">${chips}</nav>
        <label class="sort">Sort by
          <select data-sort-base="${esc(base)}">
            ${Object.entries(SORTS).map(([k, s]) => `<option value="${k}" ${k === sort ? 'selected' : ''}>${s.label}</option>`).join('')}
          </select>
        </label>
      </div>
      <p class="count">${sorted.length} ${sorted.length === 1 ? 'product' : 'products'}</p>
      ${grid(sorted)}
    </section>`;
}

export function shop(category, query) {
  if (category && !CATEGORIES[category]) return notFound();
  const products = category ? PRODUCTS.filter((p) => p.category === category) : PRODUCTS;
  return {
    title: `${categoryName(category)} | Pearlybeau`,
    nav: category,
    html: listing({
      title: categoryName(category),
      intro: CATEGORIES[category]?.blurb || 'Watches, eyewear, jewelry and gifts.',
      products,
      active: category || '',
      base: `#/shop${category ? '/' + category : ''}`,
      query,
    }),
  };
}

export function search(query) {
  const q = (query.get('q') || '').trim();
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const results = PRODUCTS.filter((p) => {
    const hay = `${p.name} ${p.variant} ${p.category} ${p.description}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
  const title = q ? `Results for “${q}”` : 'Search';
  return {
    title: `${title} | Pearlybeau`,
    html: q && !results.length
      ? `<section class="band page-head"><h1>${esc(title)}</h1>
          <p class="lede">No products match. Try “rose gold”, “cuff” or “sunglasses”.</p>
          <a class="btn" href="#/shop">Browse all products</a></section>`
      : listing({ title, intro: '', products: q ? results : PRODUCTS, active: null, base: `#/search?q=${encodeURIComponent(q)}`, query }),
  };
}

// ---------- Product ----------

export function product(id) {
  const p = productById(id);
  if (!p) return notFound();
  const related = PRODUCTS.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4);
  const options = p.options
    ? `<fieldset class="options"><legend>Amount</legend>
        ${p.options.map((o, i) => `<label class="option"><input type="radio" name="option" value="${o}" ${i === 0 ? 'checked' : ''}><span>${money(o)}</span></label>`).join('')}
       </fieldset>`
    : '';
  return {
    title: `${p.name} ${p.variant} | Pearlybeau`,
    nav: p.category,
    html: `
      <nav class="crumbs band band--tight" aria-label="Breadcrumb">
        <a href="#/">Home</a> / <a href="#/shop/${p.category}">${categoryName(p.category)}</a> / <span aria-current="page">${esc(p.name)} ${esc(p.variant)}</span>
      </nav>
      <section class="band pdp">
        <div class="pdp__media">${productImage(p, 'pdp__img')}${wishButton(p)}</div>
        <div class="pdp__info">
          <p class="eyebrow">${esc(p.name.toUpperCase())}</p>
          <h1>${esc(p.variant)}</h1>
          <p class="pdp__price" id="pdpPrice">${p.options ? money(p.options[0]) : money(p.price)}</p>
          <p>${esc(p.description)}</p>
          <form class="pdp__buy" id="buyForm" data-id="${p.id}">
            ${options}
            <div class="qty-row">
              <span class="qty-label" id="qtyLabel">Quantity</span>
              <div class="stepper" role="group" aria-labelledby="qtyLabel">
                <button type="button" data-step="-1" aria-label="Decrease quantity">−</button>
                <input name="qty" type="number" min="1" max="10" value="1" inputmode="numeric" aria-labelledby="qtyLabel">
                <button type="button" data-step="1" aria-label="Increase quantity">+</button>
              </div>
            </div>
            <button class="btn btn--block" type="submit">Add to cart</button>
          </form>
          <details open><summary>Details</summary><ul class="ticks">${p.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></details>
          <details><summary>Delivery &amp; returns</summary>
            <p>Lagos 1–2 working days, rest of Nigeria 3–5 days, worldwide 7–14 days. Free standard delivery in Nigeria on orders over ${money(FREE_DELIVERY_FROM)}. Returns accepted within 14 days if unworn.</p>
          </details>
        </div>
      </section>
      ${related.length ? `<section class="band band--grey"><header class="section-head"><p class="eyebrow">YOU MAY ALSO LIKE</p><h2>More ${categoryName(p.category)}</h2></header>${grid(related)}</section>` : ''}`,
    mount(root) {
      const form = root.querySelector('#buyForm');
      const qty = form.qty;
      form.addEventListener('click', (e) => {
        const step = e.target.closest('[data-step]');
        if (!step) return;
        qty.value = Math.max(1, Math.min(10, (+qty.value || 1) + +step.dataset.step));
      });
      form.addEventListener('change', (e) => {
        if (e.target.name === 'option') root.querySelector('#pdpPrice').textContent = money(+e.target.value);
      });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const n = Math.max(1, Math.min(10, +qty.value || 1));
        const option = form.option ? +form.option.value : null;
        document.dispatchEvent(new CustomEvent('pb:add', { detail: { id: p.id, qty: n, option } }));
      });
    },
  };
}

// ---------- Cart ----------

export function cart() {
  const lines = store.cartLines();
  if (!lines.length) {
    return {
      title: 'Cart | Pearlybeau',
      html: `<section class="band page-head"><h1>Your cart is empty</h1>
        <p class="lede">Find something you love.</p><a class="btn" href="#/shop">Shop Now</a></section>`,
    };
  }
  const t = store.totals();
  const code = store.promo();
  return {
    title: `Cart (${store.cartCount()}) | Pearlybeau`,
    html: `
      <section class="band page-head page-head--left"><h1>Your Cart</h1></section>
      <section class="band band--tight cart">
        <ul class="lines">
          ${lines.map((l) => `
            <li class="line">
              <a class="line__media" href="#/product/${l.id}">${productImage(l.product)}</a>
              <div class="line__info">
                <p class="card__kicker">${esc(l.product.name)}</p>
                <h2><a href="#/product/${l.id}">${esc(l.product.variant)}</a></h2>
                ${l.option ? `<p class="muted">Amount: ${money(l.option)}</p>` : ''}
                <p class="muted">${money(l.unit)} each</p>
              </div>
              <div class="stepper" role="group" aria-label="Quantity for ${esc(l.product.name)} ${esc(l.product.variant)}">
                <button type="button" data-action="qty" data-key="${l.key}" data-qty="${l.qty - 1}" aria-label="Decrease quantity">−</button>
                <output aria-live="polite">${l.qty}</output>
                <button type="button" data-action="qty" data-key="${l.key}" data-qty="${l.qty + 1}" aria-label="Increase quantity" ${l.qty >= 10 ? 'disabled' : ''}>+</button>
              </div>
              <p class="line__total">${money(l.total)}</p>
              <button class="icon-btn line__remove" type="button" data-action="remove" data-key="${l.key}" aria-label="Remove ${esc(l.product.name)} ${esc(l.product.variant)}">${icons.trash}</button>
            </li>`).join('')}
        </ul>
        <aside class="summary">
          <h2>Order summary</h2>
          ${promoForm(code)}
          <dl>
            <div><dt>Subtotal</dt><dd>${money(t.subtotal)}</dd></div>
            ${t.discount ? `<div><dt>Discount (${code})</dt><dd>−${money(t.discount)}</dd></div>` : ''}
            <div><dt>Delivery</dt><dd class="muted">At checkout</dd></div>
            <div class="summary__total"><dt>Total</dt><dd>${money(t.total)}</dd></div>
          </dl>
          <a class="btn btn--block" href="#/checkout">${icons.lock} Checkout</a>
          <a class="text-link" href="#/shop">Continue shopping</a>
        </aside>
      </section>`,
  };
}

export function promoForm(code) {
  return code
    ? `<p class="promo-applied">Code <strong>${code}</strong> applied <button type="button" class="text-link" data-action="unpromo">Remove</button></p>`
    : `<form class="promo" data-promo>
        <label class="sr-only" for="promoInput">Promo code</label>
        <input id="promoInput" name="code" placeholder="Promo code" autocomplete="off">
        <button type="submit" class="btn btn--ghost btn--sm">Apply</button>
        <p class="field-error" data-promo-error role="alert"></p>
      </form>`;
}

// ---------- Wishlist ----------

export function wishlist() {
  const items = store.wishlist();
  return {
    title: 'Wishlist | Pearlybeau',
    html: `
      <section class="band page-head"><p class="eyebrow">SAVED</p><h1>Your Wishlist</h1>
        ${items.length ? '' : '<p class="lede">Tap the heart on any product to save it here.</p><a class="btn" href="#/shop">Shop Now</a>'}
      </section>
      ${items.length ? `<section class="band band--grey">${grid(items)}</section>` : ''}`,
  };
}

// ---------- Account ----------

export function account() {
  const me = store.profile();
  const orders = store.orders();
  const ordersHtml = orders.length
    ? `<ul class="orders">${orders.map((o) => `
        <li><a href="#/order/${o.id}">
          <strong>${o.id}</strong>
          <span>${new Date(o.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span>${o.items.reduce((n, i) => n + i.qty, 0)} item(s)</span>
          <span>${money(o.totals.total)}</span>
          <span class="status">${esc(o.status)}</span>
        </a></li>`).join('')}</ul>`
    : '<p class="muted">No orders yet.</p>';

  if (!me) {
    return {
      title: 'Account | Pearlybeau',
      html: `
        <section class="band page-head"><p class="eyebrow">ACCOUNT</p><h1>Sign in</h1>
          <p class="lede">Demo account: your details stay in this browser and fill in checkout for you.</p></section>
        <section class="band band--tight narrow">
          <form class="form" id="signIn" novalidate>
            <label>Full name<input name="name" required autocomplete="name"></label>
            <label>Email<input name="email" type="email" required autocomplete="email"></label>
            <p class="field-error" role="alert"></p>
            <button class="btn btn--block" type="submit">Sign in</button>
          </form>
          ${orders.length ? `<h2 class="sub">Orders on this device</h2>${ordersHtml}` : ''}
        </section>`,
      mount(root) {
        const form = root.querySelector('#signIn');
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = form.name.value.trim();
          const email = form.email.value.trim();
          if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
            form.querySelector('.field-error').textContent = 'Enter your name and a valid email.';
            return;
          }
          store.saveProfile({ ...(store.profile() || {}), name, email });
          document.dispatchEvent(new Event('pb:rerender'));
        });
      },
    };
  }

  return {
    title: 'Account | Pearlybeau',
    html: `
      <section class="band page-head"><p class="eyebrow">ACCOUNT</p><h1>Hello, ${esc(me.name.split(' ')[0])}</h1>
        <p class="lede">${esc(me.email)}</p>
        <button class="btn btn--ghost btn--sm" type="button" data-action="signout">Sign out</button></section>
      <section class="band band--tight narrow"><h2 class="sub">Your orders</h2>${ordersHtml}</section>`,
  };
}

// ---------- Static pages ----------

const PAGES = {
  business: ['For Business', 'Corporate gifting, staff awards and branded watches. Send us a message with your quantities and dates and we will get back to you within two working days.'],
  partnership: ['Partnership', 'We work with stylists, boutiques and creators who love good design. Tell us about your audience and the kind of collaboration you have in mind.'],
  careers: ['Careers', 'We are a small, female-led team in Lagos. There are no open roles right now, but we would still love to hear from you.'],
  terms: ['Terms & Conditions', 'This is a demo storefront. No real orders are taken and no payment is charged. Prices, stock and delivery times shown are examples.'],
  privacy: ['Privacy Policy', 'Your cart, wishlist, orders and account details are saved only in this browser (localStorage). Nothing is sent to a server. Clear your site data to remove them.'],
};

export function page(slug) {
  const p = PAGES[slug];
  if (!p) return notFound();
  return {
    title: `${p[0]} | Pearlybeau`,
    html: `<section class="band page-head page-head--left narrow"><p class="eyebrow">PEARLYBEAU</p><h1>${p[0]}</h1><p class="lede">${p[1]}</p>
      <p>Call <a href="tel:+2349114819336">+2349114819336</a> or visit <a href="https://pearlybeau.co" rel="noopener">pearlybeau.co</a>.</p></section>`,
  };
}

export function notFound() {
  return {
    title: 'Page not found | Pearlybeau',
    html: `<section class="band page-head"><p class="eyebrow">404</p><h1>Page not found</h1>
      <p class="lede">That page doesn't exist.</p><a class="btn" href="#/">Back to home</a></section>`,
  };
}

