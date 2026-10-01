// Cart + orders, persisted in localStorage. Every read/write is guarded so
// the store still works (in memory) in private windows.
import { PRODUCTS, PROMOS, BRAND } from './data.js';


const CART_KEY = 'pb-cart';
const ORDERS_KEY = 'pb-orders';
const listeners = new Set();

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

let cart = load(CART_KEY, { items: [], promo: null });

export const bySlug = (slug) => PRODUCTS.find((p) => p.slug === slug);

export const money = (n) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: BRAND.currency, maximumFractionDigits: 0 }).format(n);

function commit() {
  // Drop anything no longer in the catalogue and clamp to stock.
  cart.items = cart.items
    .map((i) => ({ ...i, qty: Math.min(i.qty, bySlug(i.slug)?.stock ?? 0) }))
    .filter((i) => i.qty > 0);
  save(CART_KEY, cart);
  listeners.forEach((fn) => fn(cart));
}

export const onCartChange = (fn) => listeners.add(fn);

export function cartItems() {
  return cart.items.map((i) => ({ ...i, product: bySlug(i.slug) }));
}
export const cartCount = () => cart.items.reduce((n, i) => n + i.qty, 0);

export function addToCart(slug, qty = 1) {
  const p = bySlug(slug);
  if (!p || p.stock === 0) return false;
  const line = cart.items.find((i) => i.slug === slug);
  if (line) line.qty += qty;
  else cart.items.push({ slug, qty });
  commit();
  return true;
}

export function setQty(slug, qty) {
  const line = cart.items.find((i) => i.slug === slug);
  if (!line) return;
  line.qty = Math.max(0, qty);
  commit();
}

export const removeFromCart = (slug) => setQty(slug, 0);

export function clearCart() {
  cart = { items: [], promo: null };
  commit();
}

export function applyPromo(code) {
  const key = code.trim().toUpperCase();
  if (!PROMOS[key]) return false;
  cart.promo = key;
  commit();
  return true;
}
export function removePromo() {
  cart.promo = null;
  commit();
}

export function totals(deliveryPrice = null) {
  const subtotal = cartItems().reduce((s, i) => s + i.product.price * i.qty, 0);
  const promo = cart.promo ? PROMOS[cart.promo] : null;
  const discount = promo ? Math.round(subtotal * promo.rate) : 0;
  const shipping = deliveryPrice;
  const total = subtotal - discount + (shipping ?? 0);
  return { subtotal, discount, promoCode: cart.promo, promoLabel: promo?.label, shipping, total };
}

/* ---------- Wishlist ---------- */
const WISH_KEY = 'pb-wishlist';
let wish = load(WISH_KEY, []).filter(bySlug);
export const wishlist = () => wish.map(bySlug);
export const inWishlist = (slug) => wish.includes(slug);
export function toggleWish(slug) {
  wish = inWishlist(slug) ? wish.filter((s) => s !== slug) : [...wish, slug];
  save(WISH_KEY, wish);
  listeners.forEach((fn) => fn(cart));
  return inWishlist(slug);
}

export function saveOrder(order) {
  const orders = load(ORDERS_KEY, []);
  orders.unshift(order);
  save(ORDERS_KEY, orders.slice(0, 20));
}
export const getOrders = () => load(ORDERS_KEY, []);
export const getOrder = (id) => getOrders().find((o) => o.id === id);
