// Catalogue, categories and delivery options.
// Prices are placeholders in Nigerian naira — edit them here.

export const CATEGORIES = {
  watches: {
    name: 'Watches',
    blurb: 'Polished stainless steel, refined plating and clean white dials.',
    image: 'images/cat-watches.jpg',
  },
  eyewear: {
    name: 'Eyewear',
    blurb: 'Bold frames with full UV400 protection.',
    image: 'images/cat-eyewear.jpg',
  },
  jewelry: {
    name: 'Jewelry',
    blurb: 'Cuffs and layers made to stack with your watch.',
    image: 'images/cat-jewelry.jpg',
  },
  giftshop: {
    name: 'Giftshop',
    blurb: 'Gift sets and gift cards, wrapped and ready to give.',
    image: 'images/cat-watches.jpg',
  },
};

// `packshot: true` means the photo is a cut-out on a light background,
// so it is blended into the tile instead of cropped to fill it.
export const PRODUCTS = [
  {
    id: 'the-era-rose-gold',
    name: 'The Era',
    variant: 'Rose Gold',
    category: 'watches',
    price: 85000,
    image: 'images/era-rose-gold.jpg',
    packshot: true,
    badges: ['New'],
    bestseller: false,
    description:
      'The newest piece in the collection. A slim case in polished stainless steel with refined rose gold plating, a white sunray dial and a matching link bracelet.',
    details: ['Case: 32 mm stainless steel', 'Plating: rose gold', 'Movement: Japanese quartz', 'Water resistant: 3 ATM', '2 year guarantee'],
  },
  {
    id: 'rose-quartz',
    name: 'Rose Quartz',
    variant: 'Rose Gold Mesh',
    category: 'watches',
    price: 78000,
    image: 'images/rose-quartz.jpg',
    packshot: true,
    badges: [],
    bestseller: true,
    description:
      'Roman numerals, a date window and a fine Milanese mesh strap that adjusts to any wrist. Soft, feminine and easy to wear every day.',
    details: ['Case: 36 mm stainless steel', 'Strap: adjustable mesh', 'Date display', 'Water resistant: 3 ATM', '2 year guarantee'],
  },
  {
    id: 'classic-era-silver-rose',
    name: 'Classic Era',
    variant: 'Silver / Rose',
    category: 'watches',
    price: 72000,
    image: 'images/classic-era-silver-rose.jpg',
    packshot: true,
    badges: [],
    bestseller: true,
    description:
      'Two-tone links in silver and rose gold around a clean white dial. The Classic Era goes with everything in your jewelry box.',
    details: ['Case: 32 mm stainless steel', 'Bracelet: two-tone link', 'Movement: Japanese quartz', 'Water resistant: 3 ATM', '2 year guarantee'],
  },
  {
    id: 'classic-era-rose-gold',
    name: 'Classic Era',
    variant: 'Rose Gold',
    category: 'watches',
    price: 72000,
    image: 'images/classic-era-rose-gold.jpg',
    packshot: true,
    badges: [],
    bestseller: true,
    description:
      'Our best seller, all in rose gold. A timeless round case and link bracelet with slim baton markers.',
    details: ['Case: 32 mm stainless steel', 'Bracelet: rose gold link', 'Movement: Japanese quartz', 'Water resistant: 3 ATM', '2 year guarantee'],
  },
  {
    id: 'affluence-silver',
    name: 'Affluence',
    variant: 'Silver',
    category: 'jewelry',
    price: 28000,
    image: 'images/affluence-silver.jpg',
    packshot: true,
    badges: [],
    bestseller: true,
    description:
      'An open cuff in polished silver-tone steel, engraved with PEARLY BEAU. Slip it on beside your watch.',
    details: ['Material: stainless steel', 'Finish: polished silver', 'Open cuff, one size', 'Tarnish resistant'],
  },
  {
    id: 'elite-rose-gold',
    name: 'Elite',
    variant: 'Rose Gold',
    category: 'jewelry',
    price: 28000,
    image: 'images/elite-rose-gold.jpg',
    packshot: true,
    badges: [],
    bestseller: true,
    description:
      'The Elite cuff in warm rose gold. Made to sit next to the Era and Classic Era watches.',
    details: ['Material: stainless steel', 'Plating: rose gold', 'Open cuff, one size', 'Tarnish resistant'],
  },
  {
    id: 'layered-bar-necklace',
    name: 'Layered Bar & Coin',
    variant: 'Gold / Silver',
    category: 'jewelry',
    price: 32000,
    image: 'images/cat-jewelry.jpg',
    packshot: false,
    badges: [],
    bestseller: false,
    description:
      'Two fine chains, one with a slim bar and one with an engraved coin. Wear them together or apart. Arrives in a PearlyBeau pouch.',
    details: ['Material: stainless steel', 'Lengths: 40 cm and 45 cm', 'Lobster clasp', 'Comes in a gift pouch'],
  },
  {
    id: 'shady-002',
    name: 'Shady #002',
    variant: 'Jet Black',
    category: 'eyewear',
    price: 35000,
    image: 'images/cat-eyewear.jpg',
    packshot: false,
    badges: [],
    bestseller: false,
    description:
      'Oversized cat-eye frames in glossy black acetate with smoke lenses. Big, bold and made for the Lagos sun.',
    details: ['Frame: acetate', 'Lenses: smoke, UV400', 'Comes with case and cloth'],
  },
  {
    id: 'his-and-hers-set',
    name: 'His & Hers Set',
    variant: 'Classic Era pair',
    category: 'giftshop',
    price: 135000,
    image: 'images/cat-watches.jpg',
    packshot: false,
    badges: ['Gift set'],
    bestseller: false,
    description:
      'A Classic Era in Silver / Rose and a Classic Era in Rose Gold, boxed together. A gift for two.',
    details: ['2 × Classic Era watches', 'Presentation box', 'Gift note included', '2 year guarantee'],
  },
  {
    id: 'era-gift-set',
    name: 'The Era Gift Set',
    variant: 'Watch + Elite cuff',
    category: 'giftshop',
    price: 105000,
    image: 'images/era-rose-gold.jpg',
    packshot: true,
    badges: ['Gift set'],
    bestseller: false,
    description:
      'The Era watch and the Elite cuff, both in rose gold, in one gift box.',
    details: ['The Era — Rose Gold', 'Elite cuff — Rose Gold', 'Presentation box', 'Gift note included'],
  },
  {
    id: 'gift-card',
    name: 'PearlyBeau',
    variant: 'Gift Card',
    category: 'giftshop',
    price: 25000,
    options: [25000, 50000, 100000],
    image: null,
    packshot: false,
    badges: [],
    bestseller: false,
    description:
      'Let them choose. Sent by email with your message. Never expires.',
    details: ['Delivered by email', 'Use on anything in the store', 'Never expires'],
  },
];

export const DELIVERY = {
  NG: [
    { id: 'lagos', label: 'Lagos — 1–2 working days', price: 3000 },
    { id: 'ng-standard', label: 'Rest of Nigeria — 3–5 working days', price: 5000 },
    { id: 'ng-express', label: 'Express (Nigeria) — next working day', price: 9000 },
  ],
  INTL: [
    { id: 'intl', label: 'Worldwide — 7–14 working days', price: 25000 },
  ],
};

export const FREE_DELIVERY_FROM = 150000; // standard delivery in Nigeria
export const GIFT_WRAP_PRICE = 2000;
export const PROMO_CODES = { WELCOME10: 0.1 };

export function productById(id) {
  return PRODUCTS.find((p) => p.id === id);
}
