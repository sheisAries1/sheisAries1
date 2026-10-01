// Checkout: details → delivery → payment (mocked), then the order confirmation.
import { DELIVERY, GIFT_WRAP_PRICE, FREE_DELIVERY_FROM } from './data.js';
import * as store from './store.js';
import * as pay from './payments.js';
import { esc, money, icons, productImage } from './ui.js';
import { promoForm } from './views.js';

const COUNTRIES = [
  ['NG', 'Nigeria'], ['GH', 'Ghana'], ['GB', 'United Kingdom'], ['US', 'United States'],
  ['CA', 'Canada'], ['ZA', 'South Africa'], ['AE', 'United Arab Emirates'], ['XX', 'Other'],
];

const NG_STATES = ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta',
  'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'];

const deliveryOptions = (country) => (country === 'NG' ? DELIVERY.NG : DELIVERY.INTL);

function field(label, name, attrs = '', hint = '') {
  return `<label class="field">${label}<input name="${name}" ${attrs}>${hint}<span class="field-error" data-err="${name}"></span></label>`;
}

export function checkout() {
  if (!store.cartLines().length) {
    return {
      title: 'Checkout | Pearlybeau',
      html: `<section class="band page-head"><h1>Your cart is empty</h1>
        <p class="lede">Add something before you check out.</p><a class="btn" href="#/shop">Shop Now</a></section>`,
    };
  }
  const me = store.profile() || {};
  const [first = '', ...rest] = (me.name || '').split(' ');

  return {
    title: 'Checkout | Pearlybeau',
    html: `
      <section class="band page-head page-head--left">
        <p class="eyebrow">SECURE CHECKOUT</p><h1>Checkout</h1>
        <ol class="steps" aria-label="Checkout steps">
          <li class="is-done">Cart</li><li class="is-on" aria-current="step">Details &amp; payment</li><li>Confirmation</li>
        </ol>
      </section>
      <section class="band band--tight checkout">
        <form class="form checkout__form" id="checkoutForm" novalidate>
          <fieldset>
            <legend><span>1</span> Contact</legend>
            <div class="row">
              ${field('Email', 'email', `type="email" autocomplete="email" required value="${esc(me.email || '')}"`)}
              ${field('Phone', 'phone', `type="tel" autocomplete="tel" required placeholder="+234…" value="${esc(me.phone || '')}"`)}
            </div>
          </fieldset>

          <fieldset>
            <legend><span>2</span> Delivery address</legend>
            <div class="row">
              ${field('First name', 'first', `autocomplete="given-name" required value="${esc(first)}"`)}
              ${field('Last name', 'last', `autocomplete="family-name" required value="${esc(rest.join(' '))}"`)}
            </div>
            ${field('Address', 'address', `autocomplete="street-address" required value="${esc(me.address || '')}"`)}
            <div class="row">
              ${field('City', 'city', `autocomplete="address-level2" required value="${esc(me.city || '')}"`)}
              ${field('State / region', 'region', `list="ngStates" autocomplete="address-level1" required value="${esc(me.region || '')}"`)}
            </div>
            <datalist id="ngStates">${NG_STATES.map((s) => `<option value="${s}">`).join('')}</datalist>
            <label class="field">Country
              <select name="country" autocomplete="country">
                ${COUNTRIES.map(([c, n]) => `<option value="${c}" ${c === (me.country || 'NG') ? 'selected' : ''}>${n}</option>`).join('')}
              </select>
            </label>
          </fieldset>

          <fieldset>
            <legend><span>3</span> Delivery method</legend>
            <div class="radios" id="deliveryOptions"></div>
            <p class="muted small">Free standard delivery in Nigeria on orders over ${money(FREE_DELIVERY_FROM)}.</p>
            <label class="check"><input type="checkbox" name="giftWrap"> Gift wrap with a handwritten note (+${money(GIFT_WRAP_PRICE)})</label>
            <label class="field" id="giftNoteField" hidden>Gift note<textarea name="giftNote" rows="2" maxlength="200" placeholder="Happy birthday!"></textarea></label>
          </fieldset>

          <fieldset>
            <legend><span>4</span> Payment</legend>
            <div class="radios">
              <label class="radio"><input type="radio" name="method" value="card" checked><span><strong>Debit / credit card</strong><small>Visa, Mastercard, Verve</small></span></label>
              <label class="radio"><input type="radio" name="method" value="transfer"><span><strong>Bank transfer</strong><small>Pay into our account, we confirm instantly</small></span></label>
              <label class="radio" id="codOption"><input type="radio" name="method" value="cod"><span><strong>Pay on delivery</strong><small>Nigeria only</small></span></label>
            </div>

            <div class="pay-panel" data-panel="card">
              ${field('Name on card', 'cardName', 'autocomplete="cc-name"')}
              <label class="field">Card number
                <span class="card-input"><input name="cardNumber" inputmode="numeric" autocomplete="cc-number" placeholder="1234 5678 9012 3456"><span class="brand" id="cardBrand"></span></span>
                <span class="field-error" data-err="cardNumber"></span>
              </label>
              <div class="row">
                ${field('Expiry', 'cardExpiry', 'inputmode="numeric" autocomplete="cc-exp" placeholder="MM / YY"')}
                ${field('CVC', 'cardCvc', 'inputmode="numeric" autocomplete="cc-csc" placeholder="123" maxlength="4"')}
              </div>
              <div class="test-cards">
                <p><strong>Demo mode — no real payment is taken.</strong> Use a test card:</p>
                <ul>${pay.TEST_CARDS.map((c) => `<li><button type="button" class="text-link" data-fill="${c.number}">${c.number}</button> <span>${c.result}</span></li>`).join('')}</ul>
              </div>
            </div>

            <div class="pay-panel" data-panel="transfer" hidden>
              <dl class="bank">
                <div><dt>Bank</dt><dd>Demo Bank</dd></div>
                <div><dt>Account name</dt><dd>PearlyBeau Ltd</dd></div>
                <div><dt>Account number</dt><dd>0123456789</dd></div>
                <div><dt>Amount</dt><dd data-total>—</dd></div>
              </dl>
              <p class="muted small">Demo mode: no transfer is needed. Placing the order simulates a confirmed transfer.</p>
            </div>

            <div class="pay-panel" data-panel="cod" hidden>
              <p class="muted small">Pay by cash or POS when your order arrives.</p>
            </div>
          </fieldset>

          <p class="form-error" id="formError" role="alert"></p>
          <button class="btn btn--block btn--lg" type="submit" id="placeBtn">${icons.lock} <span>Place order</span></button>
          <a class="text-link" href="#/cart">← Back to cart</a>
        </form>

        <aside class="summary" id="summary" aria-live="polite"></aside>
      </section>

      <dialog class="otp" id="otpDialog" aria-labelledby="otpTitle">
        <form method="dialog" id="otpForm">
          <h2 id="otpTitle">Confirm it's you</h2>
          <p>Your bank sent a one-time code to your phone. <span class="muted">(Demo: enter 123456.)</span></p>
          <label class="field">One-time code<input name="otp" inputmode="numeric" maxlength="6" autocomplete="one-time-code" required></label>
          <div class="otp__actions">
            <button class="btn btn--ghost" value="cancel" formnovalidate>Cancel</button>
            <button class="btn" value="ok">Verify</button>
          </div>
        </form>
      </dialog>`,
    mount,
  };
}

function mount(root) {
  const form = root.querySelector('#checkoutForm');
  const summary = root.querySelector('#summary');
  const deliveryBox = root.querySelector('#deliveryOptions');
  let selectedDelivery = null;

  function renderDelivery() {
    const opts = deliveryOptions(form.country.value);
    if (!opts.some((o) => o.id === selectedDelivery)) selectedDelivery = opts[0].id;
    deliveryBox.innerHTML = opts.map((o) => `
      <label class="radio"><input type="radio" name="delivery" value="${o.id}" ${o.id === selectedDelivery ? 'checked' : ''}>
        <span><strong>${o.label}</strong></span><em>${money(o.price)}</em></label>`).join('');
    const cod = root.querySelector('#codOption');
    const isNG = form.country.value === 'NG';
    cod.querySelector('input').disabled = !isNG;
    cod.classList.toggle('is-disabled', !isNG);
    if (!isNG && form.method.value === 'cod') form.querySelector('input[value="card"]').checked = true;
    showPanel();
  }

  function currentDelivery() {
    return deliveryOptions(form.country.value).find((o) => o.id === selectedDelivery);
  }

  function currentTotals() {
    return store.totals({ delivery: currentDelivery(), giftWrap: form.giftWrap.checked });
  }

  function renderSummary() {
    const lines = store.cartLines();
    const t = currentTotals();
    const code = store.promo();
    summary.innerHTML = `
      <h2>Order summary</h2>
      <ul class="mini-lines">
        ${lines.map((l) => `<li>
          <span class="mini-lines__media">${productImage(l.product)}<b>${l.qty}</b></span>
          <span>${esc(l.product.name)}<small>${esc(l.product.variant)}${l.option ? ` · ${money(l.option)}` : ''}</small></span>
          <span>${money(l.total)}</span></li>`).join('')}
      </ul>
      ${promoForm(code)}
      <dl>
        <div><dt>Subtotal</dt><dd>${money(t.subtotal)}</dd></div>
        ${t.discount ? `<div><dt>Discount (${code})</dt><dd>−${money(t.discount)}</dd></div>` : ''}
        <div><dt>Delivery</dt><dd>${t.shipping ? money(t.shipping) : 'Free'}</dd></div>
        ${t.wrap ? `<div><dt>Gift wrap</dt><dd>${money(t.wrap)}</dd></div>` : ''}
        <div class="summary__total"><dt>Total</dt><dd>${money(t.total)}</dd></div>
      </dl>
      <p class="muted small">${icons.lock} Demo checkout — you will not be charged.</p>`;
    root.querySelectorAll('[data-total]').forEach((el) => { el.textContent = money(t.total); });
    root.querySelector('#placeBtn span').textContent = `Place order · ${money(t.total)}`;
  }

  function showPanel() {
    root.querySelectorAll('.pay-panel').forEach((p) => { p.hidden = p.dataset.panel !== form.method.value; });
  }

  // Live formatting for card fields.
  form.cardNumber.addEventListener('input', () => {
    form.cardNumber.value = pay.formatCardNumber(form.cardNumber.value);
    root.querySelector('#cardBrand').textContent = pay.cardBrand(form.cardNumber.value);
  });
  form.cardExpiry.addEventListener('input', (e) => {
    if (e.inputType === 'deleteContentBackward') return;
    form.cardExpiry.value = pay.formatExpiry(form.cardExpiry.value);
  });
  form.cardCvc.addEventListener('input', () => { form.cardCvc.value = pay.digits(form.cardCvc.value).slice(0, 4); });

  form.addEventListener('click', (e) => {
    const fill = e.target.closest('[data-fill]');
    if (!fill) return;
    form.cardNumber.value = fill.dataset.fill;
    form.cardNumber.dispatchEvent(new Event('input'));
    if (!form.cardExpiry.value) form.cardExpiry.value = '12 / 30';
    if (!form.cardCvc.value) form.cardCvc.value = '123';
    if (!form.cardName.value) form.cardName.value = `${form.first.value} ${form.last.value}`.trim();
  });

  form.addEventListener('change', (e) => {
    const { name } = e.target;
    if (name === 'country') renderDelivery();
    if (name === 'delivery') selectedDelivery = e.target.value;
    if (name === 'method') showPanel();
    if (name === 'giftWrap') root.querySelector('#giftNoteField').hidden = !e.target.checked;
    if (['country', 'delivery', 'giftWrap'].includes(name)) renderSummary();
    if (e.target.closest('.field')) setError(name, '');
  });

  // Promo codes live in the summary; the app asks for a re-render via this event.
  summary.addEventListener('pb:summary', renderSummary);

  function setError(name, msg) {
    const el = form.querySelector(`[data-err="${name}"]`);
    if (el) el.textContent = msg;
    const input = form.elements[name];
    if (input && input.setAttribute) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function validate() {
    const v = (n) => form.elements[n].value.trim();
    const errors = {};
    if (!/^\S+@\S+\.\S+$/.test(v('email'))) errors.email = 'Enter a valid email.';
    if (pay.digits(v('phone')).length < 7) errors.phone = 'Enter a phone number.';
    ['first', 'last', 'address', 'city', 'region'].forEach((n) => { if (!v(n)) errors[n] = 'Required.'; });
    if (form.method.value === 'card') {
      if (!v('cardName')) errors.cardName = 'Enter the name on the card.';
      if (!pay.luhn(v('cardNumber'))) errors.cardNumber = 'Enter a valid card number.';
      if (!pay.validExpiry(v('cardExpiry'))) errors.cardExpiry = 'Enter a future date as MM / YY.';
      if (!/^\d{3,4}$/.test(v('cardCvc'))) errors.cardCvc = '3 or 4 digits.';
    }
    form.querySelectorAll('[data-err]').forEach((el) => setError(el.dataset.err, errors[el.dataset.err] || ''));
    const first = Object.keys(errors)[0];
    if (first) form.elements[first].focus();
    return !first;
  }

  function askOtp() {
    const dialog = root.querySelector('#otpDialog');
    const otpForm = root.querySelector('#otpForm');
    otpForm.reset();
    return new Promise((resolve) => {
      dialog.addEventListener('close', () => resolve(dialog.returnValue === 'ok' ? otpForm.otp.value.trim() : null), { once: true });
      dialog.showModal();
    });
  }

  const placeBtn = root.querySelector('#placeBtn');
  const formError = root.querySelector('#formError');

  function busy(on, label) {
    placeBtn.disabled = on;
    placeBtn.classList.toggle('is-busy', on);
    if (label) placeBtn.querySelector('span').textContent = label;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.textContent = '';
    if (!validate()) return;

    const t = currentTotals();
    const method = form.method.value;
    busy(true, method === 'card' ? 'Processing payment…' : 'Placing order…');

    let payment;
    try {
      if (method === 'card') {
        let result = await pay.chargeCard({ number: form.cardNumber.value, amount: t.total });
        if (result.needsOtp) {
          busy(true, 'Waiting for verification…');
          const otp = await askOtp();
          if (otp === null) result = { ok: false, message: 'Payment cancelled.' };
          else {
            busy(true, 'Verifying…');
            result = await pay.chargeCard({ number: form.cardNumber.value, amount: t.total }, otp);
          }
        }
        if (!result.ok) throw new Error(result.message);
        payment = { method: 'Card', status: 'Paid', reference: result.reference, detail: `${result.brand || 'Card'} ending ${result.last4}` };
      } else if (method === 'transfer') {
        const result = await pay.confirmTransfer(t.total);
        payment = { method: 'Bank transfer', status: 'Paid', reference: result.reference, detail: 'Transfer confirmed' };
      } else {
        payment = { method: 'Pay on delivery', status: 'Due on delivery', reference: null, detail: 'Cash or POS on arrival' };
      }
    } catch (err) {
      busy(false);
      renderSummary();
      formError.textContent = err.message;
      return;
    }

    const f = (n) => form.elements[n].value.trim();
    const customer = {
      name: `${f('first')} ${f('last')}`, email: f('email'), phone: f('phone'),
      address: f('address'), city: f('city'), region: f('region'), country: form.country.value,
    };
    store.saveProfile({ ...(store.profile() || {}), ...customer });

    const order = {
      id: `PB-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      date: new Date().toISOString(),
      status: payment.status === 'Paid' ? 'Confirmed' : 'Awaiting payment',
      items: store.cartLines().map((l) => ({
        id: l.id, name: l.product.name, variant: l.product.variant, option: l.option, qty: l.qty, unit: l.unit,
      })),
      totals: t,
      promo: store.promo(),
      delivery: currentDelivery(),
      giftWrap: form.giftWrap.checked ? (f('giftNote') || 'Gift wrapped') : null,
      customer,
      payment,
    };
    store.placeOrder(order);
    location.hash = `#/order/${order.id}`;
  });

  renderDelivery();
  renderSummary();
}

// ---------- Confirmation ----------

export function order(id) {
  const o = store.orderById(id);
  if (!o) {
    return {
      title: 'Order not found | Pearlybeau',
      html: `<section class="band page-head"><h1>Order not found</h1><p class="lede">We couldn't find order ${esc(id)} on this device.</p>
        <a class="btn" href="#/account">Your orders</a></section>`,
    };
  }
  const c = o.customer;
  const country = COUNTRIES.find(([k]) => k === c.country)?.[1] || c.country;
  return {
    title: `Order ${o.id} | Pearlybeau`,
    html: `
      <section class="band page-head">
        <span class="done-mark">${icons.check}</span>
        <p class="eyebrow">ORDER ${esc(o.id)}</p>
        <h1>Thank you, ${esc(c.name.split(' ')[0])}!</h1>
        <p class="lede">${o.payment.status === 'Paid' ? 'Your payment went through and your order is confirmed.' : 'Your order is placed. You will pay when it arrives.'}
          A confirmation would be sent to <strong>${esc(c.email)}</strong>.</p>
      </section>
      <section class="band band--tight narrow receipt">
        <ul class="mini-lines">
          ${o.items.map((i) => `<li><span>${i.qty} ×</span><span>${esc(i.name)}<small>${esc(i.variant)}${i.option ? ` · ${money(i.option)}` : ''}</small></span><span>${money(i.unit * i.qty)}</span></li>`).join('')}
        </ul>
        <dl>
          <div><dt>Subtotal</dt><dd>${money(o.totals.subtotal)}</dd></div>
          ${o.totals.discount ? `<div><dt>Discount (${esc(o.promo)})</dt><dd>−${money(o.totals.discount)}</dd></div>` : ''}
          <div><dt>Delivery</dt><dd>${o.totals.shipping ? money(o.totals.shipping) : 'Free'}</dd></div>
          ${o.totals.wrap ? `<div><dt>Gift wrap</dt><dd>${money(o.totals.wrap)}</dd></div>` : ''}
          <div class="summary__total"><dt>Total</dt><dd>${money(o.totals.total)}</dd></div>
        </dl>
        <div class="receipt__grid">
          <div><h2>Delivering to</h2><p>${esc(c.name)}<br>${esc(c.address)}<br>${esc(c.city)}, ${esc(c.region)}<br>${esc(country)}<br>${esc(c.phone)}</p></div>
          <div><h2>Delivery</h2><p>${esc(o.delivery.label)}${o.giftWrap ? `<br>Gift wrapped: “${esc(o.giftWrap)}”` : ''}</p></div>
          <div><h2>Payment</h2><p>${esc(o.payment.method)} · ${esc(o.payment.status)}<br>${esc(o.payment.detail)}${o.payment.reference ? `<br><small class="muted">Ref ${esc(o.payment.reference)}</small>` : ''}</p></div>
        </div>
        <p class="center"><a class="btn" href="#/shop">Continue shopping</a> <a class="btn btn--ghost" href="#/account">View all orders</a></p>
      </section>`,
  };
}
