import { BRAND, PROMOS } from './data.js';
import { icon } from './art.js';
import * as store from './store.js';
import * as views from './views.js';
import { route, fallback, onRender, start, navigate, resolve, current } from './router.js';
import { initDrawers, initTheme, openCart, openDrawer, toast } from './ui.js';

const app = document.getElementById('app');
let currentBase = null;

route('/', views.home);
route('/shop', views.shop);
route('/product/:slug', views.product);
route('/cart', views.cart);
route('/checkout', () => ({ redirect: '/checkout/details' }));
route('/checkout/:step', views.checkout);
route('/order/:id', views.order);
route('/wishlist', views.wishlist);
route('/account', views.account);
route('/about', views.about);
route('/page/:slug', views.page);
fallback(views.notFound);

// Remember which control had focus so in-place re-renders (shop filters,
// cart quantity buttons) don't throw keyboard and screen-reader users back to the top.
function focusKey(root) {
  const el = document.activeElement;
  if (!el || !root.contains(el)) return null;
  if (el.name) return `[name="${el.name}"]${el.type === 'radio' || el.type === 'checkbox' ? `[value="${el.value}"]` : ''}`;
  if (el.dataset.qty) return `[data-qty="${el.dataset.qty}"][data-step="${el.dataset.step}"]`;
  if (el.dataset.wish) return `[data-wish="${el.dataset.wish}"]`;
  return null;
}
function restoreFocus(root, key) {
  const el = key && root.querySelector(key);
  if (!el) return false;
  el.focus({ preventScroll: true });
  if (el.type === 'search') el.setSelectionRange(el.value.length, el.value.length);
  return true;
}

onRender((view, path) => {
  if (view.redirect) return navigate(view.redirect, { replace: true });
  const base = path.split('?')[0];
  const samePage = currentBase === base;
  const key = samePage ? focusKey(app) : null;
  const y = scrollY;
  currentBase = base;
  document.title = view.title;
  app.innerHTML = view.html;
  view.mount?.(app);
  if (samePage) {
    scrollTo({ top: y, behavior: 'instant' });
    restoreFocus(app, key);
  } else {
    scrollTo({ top: 0, behavior: 'instant' });
    // Move focus to the new page heading for screen readers.
    const h1 = app.querySelector('h1');
    if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); }
  }
});

function renderChrome() {
  const n = store.cartCount();
  document.querySelectorAll('[data-count]').forEach((el) => { el.textContent = n; el.hidden = n === 0; });
  document.getElementById('cartBtn').setAttribute('aria-label', `Open cart, ${n} ${n === 1 ? 'item' : 'items'}`);
  const w = store.wishlist().length;
  document.querySelectorAll('[data-wish-count]').forEach((el) => { el.textContent = w; el.hidden = w === 0; });

  const t = store.totals();
  const body = document.getElementById('drawerBody');
  const key = focusKey(body);
  body.innerHTML = n
    ? `${views.cartLines()}
      <div class="drawer-foot">
        <dl class="totals"><div class="grand"><dt>Subtotal</dt><dd>${store.money(t.subtotal - t.discount)}</dd></div></dl>
        <a class="btn block" href="#/checkout/details">Checkout</a>
        <a class="btn btn-ghost block" href="#/cart">View cart</a>
      </div>`
    : `<div class="empty"><p>Your cart is empty.</p><a class="btn" href="#/shop">See all products</a></div>`;
  views.bindLines(body);
  if (key && !restoreFocus(body, key)) body.querySelector('button, a')?.focus();
}

store.onCartChange(() => {
  renderChrome();
  // Pages that show the cart or wishlist re-render in place.
  const { path } = current();
  if (path === '/cart' || path === '/wishlist' || path.startsWith('/checkout')) resolve();
});

// Fill in the line icons declared with data-ico in the HTML.
document.querySelectorAll('[data-ico]').forEach((el) => el.insertAdjacentHTML('afterbegin', icon(el.dataset.ico)));
document.getElementById('socials').innerHTML = BRAND.socials
  .map((s) => `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.name}">${icon(s.icon)}</a>`).join('');
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('menuBtn').addEventListener('click', () => openDrawer('menu'));

// Newsletter: "Sign up and receive discounts" — hands out the welcome code.
const [code] = Object.keys(PROMOS);
document.getElementById('signup').addEventListener('submit', (e) => {
  e.preventDefault();
  document.getElementById('signupMsg').innerHTML =
    `Thanks for signing up! Code <strong>${code}</strong> (${PROMOS[code].label}) has been added to your cart.`;
  store.applyPromo(code);
  toast(`${code} added: ${PROMOS[code].label} your order`);
  e.target.reset();
});

initTheme();
initDrawers();
renderChrome();
start();
