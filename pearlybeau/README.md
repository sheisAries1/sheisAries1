# Pearly Beau — Storefront

An online shop for PearlyBeau, a female-led watch brand from Lagos. It copies the look of the brand's site: Times-style serif type, soft grey sections and square black buttons.

## Pages

Every page has its own link (hash routing, so it runs on GitHub Pages with no server setup):

| Route | Page |
| --- | --- |
| `#/` | Home: The Era hero, shipping/payment/guarantee strip, best sellers, popular categories, Who We Are |
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
- **Images:** `images/`. These were cropped from screenshots of the live site, so swap in the original high-resolution photos when you have them.
- **Styles:** `css/styles.css`. The colours are variables at the top of the file.

## Code

Plain HTML, CSS and JavaScript (ES modules), with no build step. Because it uses modules, serve the folder rather than opening the file directly:

```sh
cd pearlybeau && python3 -m http.server
```

- `js/app.js`: router, header, cart badge, toasts, newsletter
- `js/views.js`: home, listing, product, cart, wishlist, account and info pages
- `js/checkout.js`: checkout form, validation, payment and confirmation
- `js/store.js`: cart, wishlist, promo, totals and orders
- `js/payments.js`: mock gateway and card helpers
