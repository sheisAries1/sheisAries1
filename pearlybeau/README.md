# Pearly Beau — Storefront

An online shop for PearlyBeau, a female-led watch brand from Lagos, with a glassmorphism look: translucent panels with soft blur, thin white borders and layered shadows over a slowly moving background.

- **Colours:** Milk `#FBF7F4`, Oat `#E5DED2`, Taupe `#A39382`, Mocha `#685D54`, Charcoal `#232323`, plus the brand's rose gold `#C38F73` for stars and hearts.
- **Type:** Instrument Sans for the logo and interface, Instrument Serif for headlines.
- **Motion:** slow background drift, light reflections that follow the cursor on glass panels, scroll reveals, magnetic buttons and a tilting product preview. All of it switches off when the visitor has reduced motion turned on.

## Pages

Every page has its own link (hash routing, so it runs on GitHub Pages with no server setup):

| Route | Page |
| --- | --- |
| `#/` | Home: hero, interactive watch preview, stockist logos, three benefits, bento grid, how it works, reviews, pricing tiers, FAQ, final call to action |
| `#/shop`, `#/shop/watches` (also `eyewear`, `jewelry`, `giftshop`) | Product listing with category chips and sorting (`?sort=price-asc`, etc.) |
| `#/search?q=rose gold` | Search from the header bar |
| `#/product/:id` | Product page: quantity, gift card amounts, details, delivery info, related products |
| `#/cart` | Cart: change quantities, remove items, promo code |
| `#/checkout` | Contact, address, delivery method, gift wrap, payment |
| `#/order/:id` | Order confirmation / receipt |
| `#/wishlist`, `#/account` | Saved items, demo sign-in and order history |
| `#/brand`, `#/page/terms` … | Brand story and footer pages |

## Payments are mocked

No real payment is taken. `js/payments.js` acts as a pretend gateway:

| Card | Result |
| --- | --- |
| `4242 4242 4242 4242` | Approved |
| `4000 0000 0000 0002` | Declined |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 3220` | Asks for a one-time code: enter `123456` |

Use any future expiry date and any 3-digit CVC. Card numbers are checked with the Luhn algorithm. Bank transfer and pay on delivery (Nigeria only) also work. Signing up to the newsletter shows the code **WELCOME10** (10% off).

The cart, wishlist, orders and account stay in the browser's `localStorage`.

## Editing

- **Products, prices, delivery rates, promo codes:** `js/data.js`. The prices are placeholders.
- **Home page copy** (hero, stockist names, reviews, pricing tiers, FAQ): `js/content.js`. The stockist names and reviews are made up. Replace them with real ones before launch. Review photos load from randomuser.me, and initials show if they can't load.
- **Images:** `images/`. These were cropped from screenshots of the live site, so swap in the original high-resolution photos when you have them.
- **Styles:** `css/styles.css`. The colours are variables at the top of the file.

## Code

Plain HTML, CSS and JavaScript (ES modules), with no build step. Because it uses modules, serve the folder rather than opening the file directly:

```sh
cd pearlybeau && python3 -m http.server
```

- `js/app.js`: router, header, cart badge, toasts, newsletter
- `js/home.js`: home page, built from small section components (`sectionHead`, `hero`, `preview`, `bento`, …)
- `js/content.js`: home page copy
- `js/motion.js`: scroll reveals, magnetic buttons, tilt and glass reflections
- `js/views.js`: listing, product, cart, wishlist, account, brand and info pages
- `js/checkout.js`: checkout form, validation, payment and confirmation
- `js/store.js`: cart, wishlist, promo, totals and orders
- `js/payments.js`: mock gateway and card helpers
