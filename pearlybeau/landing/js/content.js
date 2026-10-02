// Copy for the landing page. Product names, prices and photos come from the
// shop's catalogue (../js/data.js), so the two never disagree.
//
// PLACEHOLDERS: the testimonials and their photos are made up so the layout can be
// seen. Replace them with real customer reviews before the page goes live.

// Watches shown in the interactive explorer and the pricing cards.
export const WATCH_IDS = ['the-era-rose-gold', 'classic-era-rose-gold', 'classic-era-silver-rose', 'rose-quartz'];

// The cuff suggested alongside each watch.
export const CUFF_FOR = {
  'the-era-rose-gold': 'elite-rose-gold',
  'classic-era-rose-gold': 'elite-rose-gold',
  'classic-era-silver-rose': 'affluence-silver',
  'rose-quartz': 'elite-rose-gold',
};

export const SWATCH = {
  'the-era-rose-gold': 'linear-gradient(135deg, #f3d3bf, #c99377)',
  'classic-era-rose-gold': 'linear-gradient(135deg, #efcdb8, #b9846a)',
  'classic-era-silver-rose': 'linear-gradient(135deg, #e9e9e9 0 50%, #e2b49b 50% 100%)',
  'rose-quartz': 'repeating-linear-gradient(45deg, #e8c3ae 0 2px, #cf9f86 2px 4px)',
};

export const CITIES = ['Lagos', 'Abuja', 'London', 'Accra', 'Toronto', 'Houston'];

export const BENEFITS = [
  {
    stat: 'Worldwide',
    statLabel: 'shipping',
    title: 'Delivered swiftly, wherever you are',
    body: 'Lagos in 1–2 working days, the rest of Nigeria in 3–5, and anywhere in the world in 7–14.',
  },
  {
    stat: 'Secure',
    statLabel: 'payment',
    title: 'Pay the way that suits you',
    body: 'Card, bank transfer, or pay on delivery within Nigeria. Payment is secure, whichever you choose.',
  },
  {
    stat: '2 years',
    statLabel: 'guarantee',
    title: 'Made to last, and we stand by it',
    body: 'Every watch is covered for two full years. If something isn’t right, we repair it or replace it.',
  },
];

export const FEATURES = [
  {
    size: 'wide tall',
    kicker: 'Craftmanship',
    title: 'Great attention to detail, and nothing less',
    body: 'Slim cases in polished stainless steel, finished with refined rose gold plating and clean white dials.',
    image: '../images/about.jpg',
    alt: 'A rose gold PearlyBeau watch worn with a dark silk sleeve',
  },
  {
    kicker: 'Movement',
    title: 'Japanese quartz',
    body: 'Accurate to seconds a month, with no winding.',
    visual: 'movement',
  },
  {
    kicker: 'Everyday wear',
    title: 'Water resistant to 3 ATM',
    body: 'Rain and hand-washing are fine. Take it off for a swim.',
    visual: 'water',
  },
  {
    kicker: 'Stack it',
    title: 'Cuffs made to sit beside your watch',
    body: 'Affluence in silver and Elite in rose gold, engraved with PEARLY BEAU.',
    image: '../images/cutouts/elite-rose-gold.png',
    packshot: true,
    alt: 'The Elite cuff in rose gold',
  },
  {
    size: 'wide',
    kicker: 'Gift-ready',
    title: 'Boxed, wrapped and ready to give',
    body: 'Add gift wrap and a handwritten note at checkout. His & Hers sets arrive in one presentation box.',
    image: '../images/cat-watches.jpg',
    alt: 'Two Classic Era watches on a wooden table',
  },
];

export const STEPS = [
  {
    title: 'Choose your piece',
    body: 'Pick a watch and finish, and add a matching cuff if you like. Not sure? The Classic Era goes with everything.',
    meta: 'Rose gold, silver or two-tone',
  },
  {
    title: 'Check out securely',
    body: 'Pay by card or bank transfer, or pay on delivery in Nigeria. Add gift wrap and a note if it’s a present.',
    meta: 'Takes about a minute',
  },
  {
    title: 'Wear it the same week',
    body: 'Your watch ships from Lagos in its box, with the two-year guarantee card inside.',
    meta: 'Lagos delivery in 1–2 days',
  },
];

export const TESTIMONIALS = [
  {
    featured: true,
    quote: 'I wear my Classic Era every single day, from the office to dinner. It still looks as polished as the morning it arrived.',
    name: 'Adaeze N.',
    role: 'Lagos · Classic Era, Rose Gold',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  {
    quote: 'Bought The Era as an anniversary gift. The box and the handwritten note made it feel so personal.',
    name: 'Tunde A.',
    role: 'Abuja · The Era Gift Set',
    avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
  },
  {
    quote: 'Delivery to London took nine days, and the watch is even prettier in person.',
    name: 'Simisola O.',
    role: 'London · Rose Quartz',
    avatar: 'https://randomuser.me/api/portraits/women/79.jpg',
  },
  {
    quote: 'The Elite cuff next to my watch gets compliments every time I wear them together.',
    name: 'Kemi B.',
    role: 'Accra · Elite cuff',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
  },
];

// Pricing cards: [watch id, short pitch, featured?]
export const PLANS = [
  { id: 'classic-era-rose-gold', blurb: 'Our best seller. A timeless round case and link bracelet.' },
  { id: 'the-era-rose-gold', blurb: 'The newest piece. Slim, polished and all in rose gold.', featured: true },
  { id: 'rose-quartz', blurb: 'Roman numerals, a date window and an adjustable mesh strap.' },
];

export const FAQS = [
  {
    q: 'How long does delivery take?',
    a: 'Lagos: 1–2 working days. Rest of Nigeria: 3–5 working days. Worldwide: 7–14 working days. Standard delivery in Nigeria is free on orders over ₦150,000.',
  },
  {
    q: 'Which payment methods can I use?',
    a: 'Debit or credit card (Visa, Mastercard, Verve), bank transfer, or pay on delivery for addresses in Nigeria.',
  },
  {
    q: 'What does the 2-year guarantee cover?',
    a: 'Any fault in the movement or the case under normal wear. We repair it, or replace the watch if we can’t. Keep the guarantee card from the box.',
  },
  {
    q: 'Will it fit my wrist?',
    a: 'Mesh straps adjust to any wrist with a sliding clasp. Link bracelets can be shortened by removing links, which any jeweller can do in minutes.',
  },
  {
    q: 'Can I return a watch?',
    a: 'Yes. Returns are accepted within 14 days if the watch is unworn and in its original box.',
  },
  {
    q: 'Can you gift wrap it?',
    a: 'Yes. Tick gift wrap at checkout and add a note, and we’ll handwrite it and wrap the box.',
  },
];
