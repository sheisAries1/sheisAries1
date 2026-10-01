// Mock payment gateway. Nothing leaves the browser — it waits a moment and
// answers based on test card numbers, like a payment provider's sandbox.

const OUTCOMES = {
  '4000000000000002': 'Your card was declined. Try another card.',
  '4000000000009995': 'Insufficient funds. Try another card.',
};

export function luhn(num) {
  let sum = 0;
  for (let i = 0; i < num.length; i++) {
    let d = +num[num.length - 1 - i];
    if (i % 2) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return /^\d+$/.test(num) && sum % 10 === 0;
}

export function cardBrand(value) {
  const n = value.replace(/\D/g, '');
  if (/^(5061|5078|6500)/.test(n)) return 'Verve';
  if (/^4/.test(n)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard';
  return '';
}

export function formatCard(value) {
  return value.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const ref = () => 'TXN_' + Math.random().toString(36).slice(2, 10).toUpperCase();

export async function processPayment({ method, amount, card }) {
  await wait(1400);
  if (!(amount > 0)) return { ok: false, message: 'Nothing to pay for.' };
  if (method === 'card' && OUTCOMES[card]) return { ok: false, message: OUTCOMES[card] };
  return { ok: true, ref: ref() };
}
