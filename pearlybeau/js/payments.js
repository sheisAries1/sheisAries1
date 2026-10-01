// A pretend payment gateway. Nothing leaves the browser and no card is charged.
//
// Test cards (any future expiry, any 3-digit CVC):
//   4242 4242 4242 4242  → approved
//   4000 0000 0000 0002  → declined
//   4000 0000 0000 9995  → insufficient funds
//   4000 0000 0000 3220  → asks for a one-time code (enter 123456)

export const TEST_CARDS = [
  { number: '4242 4242 4242 4242', result: 'Approved' },
  { number: '4000 0000 0000 0002', result: 'Declined' },
  { number: '4000 0000 0000 9995', result: 'Insufficient funds' },
  { number: '4000 0000 0000 3220', result: 'Asks for OTP 123456' },
];

export const digits = (s) => String(s || '').replace(/\D/g, '');

export function luhn(number) {
  const d = digits(number);
  if (d.length < 12 || d.length > 19) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = +d[d.length - 1 - i];
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

export function cardBrand(number) {
  const d = digits(number);
  if (/^4/.test(d)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'Mastercard';
  if (/^(5061|5078|6500)/.test(d)) return 'Verve';
  if (/^3[47]/.test(d)) return 'Amex';
  return '';
}

export function formatCardNumber(value) {
  return digits(value).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatExpiry(value) {
  const d = digits(value).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
}

export function validExpiry(value, now = new Date()) {
  const d = digits(value);
  if (d.length !== 4) return false;
  const month = +d.slice(0, 2);
  const year = 2000 + +d.slice(2);
  if (month < 1 || month > 12) return false;
  const endOfMonth = new Date(year, month, 1); // first day of the next month
  return endOfMonth > now;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Resolves with { ok, reference } or { ok:false, message } or { needsOtp:true }.
export async function chargeCard({ number, amount }, otp = null) {
  await wait(1400);
  const d = digits(number);
  if (d.endsWith('0002')) return { ok: false, message: 'Your card was declined. Try another card.' };
  if (d.endsWith('9995')) return { ok: false, message: 'Insufficient funds on this card.' };
  if (d.endsWith('3220') && otp === null) return { ok: false, needsOtp: true };
  if (d.endsWith('3220') && otp !== '123456') return { ok: false, message: 'That code is not right. Check it and try again.' };
  return { ok: true, reference: `pay_${Math.random().toString(36).slice(2, 12)}`, amount, last4: d.slice(-4), brand: cardBrand(d) };
}

export async function confirmTransfer(amount) {
  await wait(1000);
  return { ok: true, reference: `trf_${Math.random().toString(36).slice(2, 12)}`, amount };
}
