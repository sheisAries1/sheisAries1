// Renders the repeating sections from content.js, then starts the effects.
import { LOGOS, BENEFITS, FEATURES, STEPS, TESTIMONIALS, PLANS, FAQS } from './content.js';
import { logoCloud, benefit, bentoTile, step, testimonial, pricingCard, faqItem } from './components.js';
import { initPreview } from './preview.js';
import * as fx from './effects.js';

const fill = (selector, html) => {
  const el = document.querySelector(selector);
  if (el) el.innerHTML = html;
};

fill('[data-logos]', logoCloud(LOGOS));
fill('[data-benefits]', BENEFITS.map(benefit).join(''));
fill('[data-bento]', FEATURES.map(bentoTile).join(''));
fill('[data-steps]', STEPS.map(step).join(''));
fill('[data-quotes]', TESTIMONIALS.map(testimonial).join(''));
fill('[data-plans]', PLANS.map(pricingCard).join(''));
fill('[data-faqs]', FAQS.map(faqItem).join(''));

initPreview(document.querySelector('[data-preview]'));
fx.initNav();
fx.initReveal();
fx.initMagnetic();
fx.initSheen();
fx.initStepLine();
fx.initPricingToggle();
fx.initFaq();

document.querySelector('[data-year]').textContent = new Date().getFullYear();

// Final CTA form: a friendly confirmation instead of a real sign-up.
const form = document.querySelector('[data-signup]');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = form.email.value.trim();
  const msg = form.querySelector('[data-signup-msg]');
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    msg.textContent = 'Please enter a valid email address.';
    form.email.focus();
    return;
  }
  form.classList.add('is-done');
  msg.textContent = `You're in. We've sent a setup link to ${email}.`;
});
