// Renders the sections, wires the bag to the shop's cart and starts the effects.
import { productById } from '../../js/data.js';
import { addToCart, cartCount, subscribe } from '../../js/store.js';
import { CITIES, BENEFITS, FEATURES, STEPS, TESTIMONIALS, PLANS, FAQS, CUFF_FOR } from './content.js';
import { cityCloud, benefit, bentoTile, step, testimonial, pricingCard, faqItem, money, esc, shopLink } from './components.js';
import { initExplorer, initLagosTime } from './explorer.js';
import * as fx from './effects.js';

const fill = (selector, html) => {
  const el = document.querySelector(selector);
  if (el) el.innerHTML = html;
};

fill('[data-cities]', cityCloud(CITIES));
fill('[data-benefits]', BENEFITS.map(benefit).join(''));
fill('[data-bento]', FEATURES.map(bentoTile).join(''));
fill('[data-steps]', STEPS.map(step).join(''));
fill('[data-quotes]', TESTIMONIALS.map(testimonial).join(''));
fill('[data-plans]', PLANS.map((p, i) => pricingCard(p, CUFF_FOR[p.id], i)).join(''));
fill('[data-faqs]', FAQS.map(faqItem).join(''));

// ---------- Bag ----------

const badge = document.querySelector('[data-bag-count]');
function updateBadge() {
  const n = cartCount();
  badge.textContent = n;
  badge.hidden = !n;
  badge.closest('a').setAttribute('aria-label', `Bag, ${n} ${n === 1 ? 'item' : 'items'}`);
}
subscribe(updateBadge);
updateBadge();

const toast = document.querySelector('[data-toast]');
let toastTimer;
function addAll(ids) {
  ids.forEach((id) => addToCart(id));
  const names = ids.map((id) => { const p = productById(id); return `${p.name} ${p.variant}`; });
  toast.innerHTML = `<span>Added <b>${esc(names.join(' + '))}</b></span><a href="${shopLink('cart')}">View bag</a>`;
  toast.classList.add('is-in');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-in'), 3500);
}

initExplorer(document.querySelector('[data-explorer]'), { onAdd: addAll });

// Pricing cards add the watch, plus the cuff when "With a cuff" is selected.
document.querySelector('[data-plans]').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-add]');
  if (!btn) return;
  const withCuff = document.querySelector('[data-billing]').dataset.period === 'set';
  addAll(withCuff ? [btn.dataset.add, btn.dataset.cuff] : [btn.dataset.add]);
});

// ---------- Effects ----------

initLagosTime(document.querySelector('[data-lagos-time]'));
fx.initNav();
fx.initReveal();
fx.initMagnetic();
fx.initSheen();
fx.initStepLine();
fx.initPricingToggle(money);
fx.initFaq();

document.querySelector('[data-year]').textContent = new Date().getFullYear();

// Newsletter: same welcome code as the shop.
const form = document.querySelector('[data-signup]');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = form.querySelector('[data-signup-msg]');
  if (!/^\S+@\S+\.\S+$/.test(form.email.value.trim())) {
    msg.textContent = 'Please enter a valid email address.';
    form.email.focus();
    return;
  }
  form.classList.add('is-done');
  msg.innerHTML = 'Welcome to PearlyBeau. Use code <b>WELCOME10</b> for 10% off your first order.';
});
