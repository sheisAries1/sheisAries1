// Cart, wishlist, orders and profile, saved in localStorage.
import { productById, PROMO_CODES, FREE_DELIVERY_FROM, GIFT_WRAP_PRICE } from './data.js';

const KEY = 'pearlybeau-store-v1';

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && Array.isArray(saved.cart)) return saved;
  } catch (e) { /* storage blocked or corrupt */ }
  return { cart: [], wishlist: [], orders: [], profile: null, promo: null };
}

const state = load();
const listeners = new Set();

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage blocked */ }
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ---- Cart ----

const lineKey = (id, option) => (option ? `${id}:${option}` : id);

export function cartLines() {
  return state.cart
    .map((line) => {
      const product = productById(line.id);
      if (!product) return null;
      const unit = line.option || product.price;
      return { ...line, product, unit, total: unit * line.qty };
    })
    .filter(Boolean);
}

export function cartCount() {
  return state.cart.reduce((n, l) => n + l.qty, 0);
}

export function addToCart(id, qty = 1, option = null) {
  const key = lineKey(id, option);
  const line = state.cart.find((l) => l.key === key);
  if (line) line.qty = Math.min(10, line.qty + qty);
  else state.cart.push({ key, id, option, qty: Math.min(10, qty) });
  save();
}

export function setQty(key, qty) {
  const line = state.cart.find((l) => l.key === key);
  if (!line) return;
  if (qty <= 0) state.cart = state.cart.filter((l) => l.key !== key);
  else line.qty = Math.min(10, qty);
  save();
}

export function removeLine(key) {
  setQty(key, 0);
}

export function clearCart() {
  state.cart = [];
  state.promo = null;
  save();
}

// ---- Promo codes ----

export function applyPromo(code) {
  const clean = String(code || '').trim().toUpperCase();
  if (!PROMO_CODES[clean]) return false;
  state.promo = clean;
  save();
  return true;
}

export function removePromo() {
  state.promo = null;
  save();
}

export function promo() {
  return state.promo;
}

// ---- Totals ----

export function totals({ delivery = null, giftWrap = false } = {}) {
  const subtotal = cartLines().reduce((s, l) => s + l.total, 0);
  const discount = state.promo ? Math.round(subtotal * PROMO_CODES[state.promo]) : 0;
  let shipping = delivery ? delivery.price : 0;
  const freeEligible = delivery && delivery.id !== 'intl' && delivery.id !== 'ng-express';
  if (freeEligible && subtotal - discount >= FREE_DELIVERY_FROM) shipping = 0;
  const wrap = giftWrap ? GIFT_WRAP_PRICE : 0;
  return { subtotal, discount, shipping, wrap, total: subtotal - discount + shipping + wrap };
}

// ---- Wishlist ----

export function wishlist() {
  return state.wishlist.map(productById).filter(Boolean);
}

export function inWishlist(id) {
  return state.wishlist.includes(id);
}

export function toggleWishlist(id) {
  if (inWishlist(id)) state.wishlist = state.wishlist.filter((w) => w !== id);
  else state.wishlist.push(id);
  save();
  return inWishlist(id);
}

// ---- Orders & profile ----

export function placeOrder(order) {
  state.orders.unshift(order);
  state.cart = [];
  state.promo = null;
  save();
}

export function orders() {
  return state.orders;
}

export function orderById(id) {
  return state.orders.find((o) => o.id === id);
}

export function profile() {
  return state.profile;
}

export function saveProfile(p) {
  state.profile = p;
  save();
}

export function signOut() {
  state.profile = null;
  save();
}
