// All page copy that repeats lives here. Edit this file to rebrand the page.

export const LOGOS = [
  { name: 'Northbound', style: 'serif' },
  { name: 'KILN & CO', style: 'caps' },
  { name: 'ferro.', style: 'lower' },
  { name: 'Halden Studio', style: 'sans' },
  { name: 'Saltwater', style: 'italic' },
  { name: 'ODDFELLOW', style: 'wide' },
];

export const BENEFITS = [
  {
    stat: '2.4×',
    statLabel: 'faster sign-off',
    title: 'Get approved without the email chase',
    body: 'Clients review the proposal, sign it and pay the deposit on one page. No PDFs, no “just following up”.',
  },
  {
    stat: '11 days',
    statLabel: 'sooner, on average',
    title: 'Get paid when the work is done',
    body: 'Invoices go out the moment a milestone is approved, and Linen sends the polite reminders for you.',
  },
  {
    stat: '1 link',
    statLabel: 'per client, forever',
    title: 'Look like a bigger studio',
    body: 'Every client gets a portal in your colours with your logo, on your own domain. It feels made for them.',
  },
];

// size: 'wide' spans two columns, 'tall' spans two rows.
export const FEATURES = [
  {
    size: 'wide tall',
    kicker: 'Client portal',
    title: 'One link holds the whole project',
    body: 'Proposal, timeline, files, messages and invoices, all in one place your client can find again in six months.',
    visual: 'portal',
  },
  {
    kicker: 'Proposals',
    title: 'Signed in a tap',
    body: 'Legally binding e-signatures, with the deposit collected at the same time.',
    visual: 'signature',
  },
  {
    kicker: 'Milestones',
    title: 'Split work into paid stages',
    body: 'Each approval releases the next invoice automatically.',
    visual: 'milestones',
  },
  {
    kicker: 'Reminders',
    title: 'Follow-ups that sound like you',
    body: 'Write them once. Linen sends them on schedule and stops when the client pays.',
    visual: 'reminders',
  },
  {
    size: 'wide',
    kicker: 'File handoff',
    title: 'Final files, released on payment',
    body: 'Upload the deliverables early. Your client can preview them now and download them once the last invoice clears.',
    visual: 'files',
  },
];

export const STEPS = [
  {
    title: 'Send a proposal',
    body: 'Start from a template, set your milestones and prices, and share one link. Your client signs and pays the deposit there.',
    meta: 'About 4 minutes',
  },
  {
    title: 'Run the project in the open',
    body: 'Post updates, share drafts and collect feedback in the portal. Your client always knows what is next.',
    meta: 'No more status emails',
  },
  {
    title: 'Get paid at every milestone',
    body: 'When the client approves a stage, the invoice goes out by itself. Card, bank transfer or Apple Pay.',
    meta: 'Paid in 3 days on average',
  },
];

export const TESTIMONIALS = [
  {
    featured: true,
    quote: 'We used to spend Friday afternoons chasing invoices. Now clients pay before we even remember to check. Linen paid for itself in the first week.',
    name: 'Amara Okafor',
    role: 'Founder, Saltwater Design',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    quote: 'Clients say our portal feels more polished than agencies ten times our size.',
    name: 'Daniel Reyes',
    role: 'Creative Director, Northbound',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    quote: 'Proposal to signed deposit in under an hour. That used to take a week of back and forth.',
    name: 'Hannah Lindqvist',
    role: 'Interior Architect, Halden Studio',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    quote: 'The milestone payments changed our cash flow. We stopped financing our clients’ projects.',
    name: 'Marcus Bell',
    role: 'Partner, Kiln & Co',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
];

export const PLANS = [
  {
    name: 'Solo',
    monthly: 15,
    yearly: 12,
    blurb: 'For freelancers with a few clients at a time.',
    features: ['5 active clients', 'Proposals and e-signatures', 'Invoices and online payments', 'Linen subdomain'],
    cta: 'Start free',
  },
  {
    name: 'Studio',
    monthly: 36,
    yearly: 29,
    featured: true,
    blurb: 'For small teams who want to look established.',
    features: ['Unlimited clients', 'Milestone payments', 'Automatic reminders', 'Your own domain and branding', '3 team members'],
    cta: 'Start free',
  },
  {
    name: 'Agency',
    monthly: 99,
    yearly: 79,
    blurb: 'For busy studios with several project leads.',
    features: ['Everything in Studio', '15 team members', 'Client permissions', 'Priority support', 'Data export'],
    cta: 'Talk to us',
  },
];

export const FAQS = [
  {
    q: 'Do my clients need an account?',
    a: 'No. They open their portal from a private link, and confirm their email the first time they sign or pay. That’s it.',
  },
  {
    q: 'How do payments work, and what does it cost?',
    a: 'Clients pay by card, bank transfer or Apple Pay. Money lands in your bank account in 2–3 working days. Linen adds no fee on top of the standard card processing rate.',
  },
  {
    q: 'Can I use my own domain and branding?',
    a: 'Yes, on Studio and Agency. Add your logo and colours, point a subdomain like clients.yourstudio.com at Linen, and we handle the certificate.',
  },
  {
    q: 'Can I bring my existing clients and templates?',
    a: 'Import clients from a CSV, and paste your current proposal into a Linen template. Most studios are fully moved over in an afternoon.',
  },
  {
    q: 'What happens when the free trial ends?',
    a: 'You choose a plan or your account pauses. Nothing is deleted, and your clients can still open their portals and download their files.',
  },
  {
    q: 'Is my clients’ data safe?',
    a: 'All data is encrypted in transit and at rest, backed up daily, and hosted in the EU. You can export everything at any time.',
  },
];

// Demo data for the interactive product preview.
export const PREVIEW_PROJECTS = [
  {
    id: 'saltwater',
    client: 'Saltwater Café',
    project: 'Brand identity',
    color: '#A39382',
    initials: 'SC',
    milestones: [
      { name: 'Discovery & moodboard', amount: 1200, done: true },
      { name: 'Logo concepts', amount: 1800, done: true },
      { name: 'Brand guidelines', amount: 1500, done: false },
      { name: 'Final files & signage', amount: 900, done: false },
    ],
    updates: [
      { who: 'You', text: 'Shared 3 logo directions for review.', when: '2d' },
      { who: 'Maya (client)', text: 'Love direction B — can we try it in oat?', when: '1d' },
    ],
  },
  {
    id: 'ferro',
    client: 'Ferro Architects',
    project: 'Website redesign',
    color: '#685D54',
    initials: 'FA',
    milestones: [
      { name: 'Sitemap & wireframes', amount: 2400, done: true },
      { name: 'Visual design', amount: 3200, done: false },
      { name: 'Build & content', amount: 4100, done: false },
    ],
    updates: [
      { who: 'You', text: 'Wireframes approved — starting visual design.', when: '5h' },
    ],
  },
  {
    id: 'halden',
    client: 'Halden Homes',
    project: 'Show-flat interiors',
    color: '#232323',
    initials: 'HH',
    milestones: [
      { name: 'Concept board', amount: 1600, done: true },
      { name: 'Furniture schedule', amount: 2200, done: true },
      { name: 'Install & styling', amount: 2800, done: true },
    ],
    updates: [
      { who: 'Jonas (client)', text: 'Everything looks incredible. Thank you!', when: '3d' },
    ],
  },
];
