// Home page copy: stockists, benefits, steps, reviews, pricing tiers and FAQ.
// All of it is placeholder content. Swap in real reviews, stockists and photos when you have them.

export const HERO = {
  eyebrow: 'New — The Era Collection',
  title: 'Everyday watches with a <em>jeweller’s finish</em>.',
  lede: 'Polished stainless steel and refined rose gold plating, made in small runs in Lagos and delivered anywhere in the world.',
};

// Pieces you can switch between in the interactive preview.
export const PREVIEW = [
  { id: 'the-era-rose-gold', swatch: 'linear-gradient(135deg,#f3d2bf,#c9967a 55%,#a9745b)', strap: 'Link bracelet', case: '32 mm' },
  { id: 'classic-era-silver-rose', swatch: 'linear-gradient(135deg,#f4f4f4,#bdbdbd 48%,#d8a68a 52%,#b98065)', strap: 'Two-tone link', case: '32 mm' },
  { id: 'classic-era-rose-gold', swatch: 'linear-gradient(135deg,#f0cdb7,#bf8a6d 55%,#9c6a52)', strap: 'Rose gold link', case: '32 mm' },
  { id: 'rose-quartz', swatch: 'repeating-linear-gradient(45deg,#e8c2ac 0 2px,#c69479 2px 4px)', strap: 'Milanese mesh', case: '36 mm' },
];

// Placeholder stockists and press. Replace with the real names before launch.
export const LOGOS = ['The Lekki Edit', 'MARULA', 'Ìmọ́lẹ̀ Studio', 'Coastline', 'HOUSE OF ADÉ', 'Bloom & Bark'];

export const BENEFITS = [
  { icon: 'globe', title: 'Worldwide shipping', text: 'Lagos in 1–2 working days, the rest of Nigeria in 3–5 and anywhere else in 7–14, tracked from our studio to your door.' },
  { icon: 'card', title: 'Easy, secure payment', text: 'Pay by card, bank transfer or cash on delivery in Nigeria. Card details go through a secure checkout and are never stored.' },
  { icon: 'award', title: '2 year guarantee', text: 'Every watch is covered for two years. If the movement or plating fails, we repair or replace it at no cost.' },
];

export const STEPS = [
  { title: 'Choose your piece', text: 'Pick a watch, cuff or gift set. Every product page lists the case size, materials and strap fit.' },
  { title: 'Pay your way', text: 'Card, transfer or pay on delivery. Add a gift note and we’ll wrap it in a PearlyBeau box for ₦2,000.' },
  { title: 'Wear it for years', text: 'It arrives with a care card and guarantee. Message us any time for strap sizing or a battery change.' },
];

// Avatars load from randomuser.me (free placeholder portraits). Initials show if they can't load.
export const TESTIMONIALS = [
  {
    quote: 'I bought the Era for my sister’s graduation and ended up ordering one for myself the next week. The rose gold doesn’t look cheap at all, and it came beautifully boxed.',
    name: 'Tolani Adeyemi', role: 'Lekki, Lagos', product: 'The Era — Rose Gold',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    quote: 'Delivery to Manchester took nine days and they messaged me with tracking at every step. I wear the Classic Era every single day.',
    name: 'Amara Okafor', role: 'Manchester, UK', product: 'Classic Era — Silver / Rose',
    avatar: 'https://randomuser.me/api/portraits/women/90.jpg',
  },
  {
    quote: 'Ordered the His & Hers set for our anniversary. My husband actually wears his, which says a lot. Paying on delivery made it easy.',
    name: 'Funmi Bello', role: 'Abuja', product: 'His & Hers Set',
    avatar: 'https://randomuser.me/api/portraits/women/79.jpg',
  },
  {
    quote: 'The mesh strap on the Rose Quartz fits my small wrist without any links taken out. Simple, elegant, and people always ask where it’s from.',
    name: 'Kemi Johnson', role: 'Ibadan', product: 'Rose Quartz — Mesh',
    avatar: 'https://randomuser.me/api/portraits/women/26.jpg',
  },
  {
    quote: 'We ordered 40 watches as staff awards. The team handled the engraving list and delivered a day early.',
    name: 'Chidi Nwosu', role: 'HR lead, Victoria Island', product: 'Corporate order',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
];

// Pricing tiers point at real categories in data.js.
export const TIERS = [
  {
    name: 'Cuffs & Layers', from: 28000, href: '#/shop/jewelry', cta: 'Shop jewelry',
    text: 'Stack them with your watch, or wear them on their own.',
    perks: ['Stainless steel, tarnish resistant', 'Open cuff, one size fits most', 'PearlyBeau pouch included'],
  },
  {
    name: 'Signature Watches', from: 72000, href: '#/shop/watches', cta: 'Shop watches', featured: true,
    text: 'The Era, Classic Era and Rose Quartz.',
    perks: ['Japanese quartz movement', 'Rose gold or two-tone plating', '2 year guarantee', 'Free Nigeria delivery over ₦150,000'],
  },
  {
    name: 'Gift Sets', from: 105000, href: '#/shop/giftshop', cta: 'Shop gifts',
    text: 'A watch and cuff, or a pair, boxed together.',
    perks: ['Presentation box and gift note', 'Gift wrap included', 'Gift cards from ₦25,000'],
  },
];

export const FAQ = [
  ['Will the rose gold plating fade?', 'Our plating is applied over 316L stainless steel, so it holds its colour with everyday wear. Keep it away from perfume and chlorine, and wipe it with the cloth in the box. Plating faults are covered by the 2 year guarantee.'],
  ['Can I wear my watch in water?', 'Our watches are rated 3 ATM, so splashes, rain and hand washing are fine. Take it off before swimming or showering.'],
  ['How long does delivery take?', 'Lagos 1–2 working days, the rest of Nigeria 3–5, and worldwide 7–14. Standard delivery in Nigeria is free on orders over ₦150,000.'],
  ['Which payment methods do you accept?', 'Visa, Mastercard and Verve cards, bank transfer, and pay on delivery for addresses in Nigeria.'],
  ['What if the strap is too big?', 'Link bracelets can be shortened for free at our Ajah studio, or we’ll send links-removal instructions. The Rose Quartz mesh strap adjusts to any wrist.'],
  ['Can I return an order?', 'Yes. Return unworn items in their original box within 14 days for a refund or exchange.'],
];
