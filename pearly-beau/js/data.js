// PearlyBeau catalogue and copy, taken from https://pearlybeau.netlify.app/.
// Products marked `sample: true` appear on the site (category tiles) but their
// name/price weren't visible — confirm them before going live.
// To use real photos, put them in images/ and set `image: 'images/file.jpg'`.

export const BRAND = {
  name: 'PearlyBeau',
  wordmark: 'PEARLY BEAU',
  about: [
    'PearlyBeau is essentially a wrist watch brand, our fundamental goal is to offer high quality design and great craftmanship.',
    'Our timepiece is made with great attention to details and standard, we strive for perfection and we accept nothing less.',
  ],
  story: [
    'Driven by our ambition we embarked on this journey as a female led brand in June 2021.',
    'We are so proud of the company we are today. Over the years the development of our brand has been inspiring.',
  ],
  address: 'Ajah, Lagos, Nigeria',
  phone: '+2349114819336',
  website: 'pearlybeau.co',
  currency: 'NGN',
  socials: [
    { name: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/' },
    { name: 'Facebook', icon: 'facebook', url: 'https://www.facebook.com/' },
    { name: 'Twitter', icon: 'twitter', url: 'https://twitter.com/' },
  ],
};

export const HERO = {
  eyebrow: 'New',
  title: 'The Era Collection',
  text: 'Collection is available and in polished stainless steel with refined Rose Gold plating.',
  product: 'classic-era-rose-gold',
};

export const FEATURES = [
  { icon: 'globe', title: 'Worldwide Shipping', text: 'Delivery is world wide and super swift.' },
  { icon: 'card', title: 'Easy Payment', text: 'Payment is secure.' },
  { icon: 'award', title: 'Guarantee', text: '2 years Guarantee' },
];

export const CATEGORIES = [
  { id: 'watches', name: 'Watches', cover: 'classic-era-two-tone' },
  { id: 'jewelry', name: 'Jewelry', cover: 'signature-bar-necklace' },
  { id: 'eyewear', name: 'Eyewear', cover: 'shady-002' },
];

export const COLLECTIONS = [
  { id: 'rose-quartz', name: 'Rose Quartz' },
  { id: 'classic-era', name: 'Classic Era' },
  { id: 'affluence', name: 'Affluence' },
  { id: 'elite', name: 'Elite' },
  { id: 'signature', name: 'Signature' },
  { id: 'shady', name: 'Shady' },
];

// Finishes drive the illustrations and the filter swatches.
export const FINISHES = {
  'rose-gold': { label: 'Rose Gold', swatch: '#e2ab8f', metal: ['#f8d9c8', '#c4866a'] },
  'silver':    { label: 'Silver', swatch: '#cfd3d8', metal: ['#f6f7f9', '#9fa5ad'] },
  'two-tone':  { label: 'Silver/Rose Gold', swatch: 'linear-gradient(90deg,#cfd3d8 50%,#e2ab8f 50%)', metal: ['#f8d9c8', '#c4866a'], alt: ['#f6f7f9', '#9fa5ad'] },
  'gold':      { label: 'Gold', swatch: '#d9b46a', metal: ['#f4dfa8', '#b08a40'] },
  'black':     { label: 'Black', swatch: '#1d1d1d', metal: ['#4a4a4a', '#0c0c0c'] },
};

export const PRODUCTS = [
  {
    slug: 'rose-quartz-rose-gold', name: 'Rose Gold', collection: 'rose-quartz', category: 'watches',
    finish: 'rose-gold', style: 'mesh', price: 25000, rating: 4.9, reviews: 90, bestseller: true, stock: 12,
    description: 'Our first minimalist piece. A slim rose gold case with Roman numerals on a clean white dial, on a fine Milanese mesh strap that sits light on the wrist.',
    specs: { Case: 'Stainless steel, rose gold plated', Dial: 'White, Roman numerals', Strap: 'Milanese mesh', Movement: 'Quartz', Guarantee: '2 years' },
  },
  {
    slug: 'classic-era-two-tone', name: 'Silver/Rose Gold', collection: 'classic-era', category: 'watches',
    finish: 'two-tone', style: 'link', price: 50000, rating: 4.0, reviews: 80, bestseller: true, stock: 6,
    description: 'From the Era Collection. Polished stainless steel with refined Rose Gold plating, on a two-tone link bracelet.',
    specs: { Case: 'Polished stainless steel', Finish: 'Silver with rose gold plating', Dial: 'White, baton markers', Strap: 'Two-tone link bracelet', Movement: 'Quartz', Guarantee: '2 years' },
  },
  {
    slug: 'classic-era-rose-gold', name: 'Rose Gold', collection: 'classic-era', category: 'watches',
    finish: 'rose-gold', style: 'link', price: 50000, rating: 4.0, reviews: 78, bestseller: true, badge: 'New', stock: 8,
    description: 'The Era Collection in full rose gold. Polished stainless steel with refined Rose Gold plating and a matching link bracelet.',
    specs: { Case: 'Polished stainless steel', Finish: 'Rose gold plating', Dial: 'White, baton markers', Strap: 'Link bracelet', Movement: 'Quartz', Guarantee: '2 years' },
  },
  {
    slug: 'affluence-silver', name: 'Silver', collection: 'affluence', category: 'jewelry',
    finish: 'silver', style: 'cuff', price: 5000, rating: 4.9, reviews: 75, bestseller: true, stock: 30,
    description: 'A sleek open cuff bangle engraved with PEARLY BEAU. Wear it alone or stacked next to your watch.',
    specs: { Type: 'Open cuff bangle', Finish: 'Silver', Detail: 'PEARLY BEAU engraving' },
  },
  {
    slug: 'elite-rose-gold', name: 'Rose Gold', collection: 'elite', category: 'jewelry',
    finish: 'rose-gold', style: 'cuff', price: 5000, rating: 4.9, reviews: 80, bestseller: true, stock: 30,
    description: 'The rose gold cuff that matches every PearlyBeau watch, engraved with PEARLY BEAU.',
    specs: { Type: 'Open cuff bangle', Finish: 'Rose gold', Detail: 'PEARLY BEAU engraving' },
  },
  {
    slug: 'signature-bar-necklace', name: 'Bar Necklace', collection: 'signature', category: 'jewelry', sample: true,
    finish: 'gold', style: 'necklace', price: 8000, stock: 15,
    description: 'A fine chain with a slim bar pendant. Light enough to wear every day.',
    specs: { Type: 'Pendant necklace', Finish: 'Gold tone', Pendant: 'Bar' },
  },
  {
    slug: 'shady-002', name: 'Shady #002', collection: 'shady', category: 'eyewear', sample: true,
    finish: 'black', style: 'sunglasses', price: 12000, stock: 10,
    description: 'Bold square frames in glossy black with dark tinted lenses, printed PEARLYBEAU SHADY #002.',
    specs: { Frame: 'Black, square', Lens: 'Dark tint', Detail: 'SHADY #002 lens print' },
  },
];

export const DELIVERY = [
  { id: 'lagos', label: 'Lagos delivery', note: '1–2 working days', price: 2500, region: 'lagos' },
  { id: 'nationwide', label: 'Nationwide', note: '2–5 working days', price: 4500, region: 'ng' },
  { id: 'pickup', label: 'Pick up in Ajah, Lagos', note: 'We will call you when it is ready', price: 0, region: 'lagos' },
  { id: 'worldwide', label: 'Worldwide shipping', note: '5–10 working days', price: 25000, region: 'intl' },
];

// The newsletter sign-up hands out this code ("Sign up and receive discounts").
export const PROMOS = { WELCOME10: { label: '10% off', rate: 0.1 } };

export const PAGES = {
  'for-business': { title: 'For Business', body: ['Corporate gifts, staff awards and bulk orders. Call us on +2349114819336 to talk about engraving and packaging for your team.'] },
  partnership: { title: 'Partnership', body: ['We work with stylists, creators and boutiques who love simple, well-made pieces. Call or message us to start a conversation.'] },
  careers: { title: 'Careers', body: ['We are a female-led team based in Ajah, Lagos. There are no open roles right now, but we are always happy to hear from people who love what we do.'] },
  terms: { title: 'Terms & Conditions', body: ['This is a demo storefront. No real orders are placed and no payments are taken.', 'Prices are shown in Nigerian Naira (₦). Every watch comes with a 2 years guarantee.'] },
  privacy: { title: 'Privacy Policy', body: ['This demo keeps your bag, wishlist and demo orders in your own browser only. Nothing is sent to a server.'] },
};
