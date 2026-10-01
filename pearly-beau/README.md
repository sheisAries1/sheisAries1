# PearlyBeau Storefront

A shop for **PearlyBeau**, a female-led wrist watch brand from Ajah, Lagos. The brand copy, products, prices, ratings and contact details come from [pearlybeau.netlify.app](https://pearlybeau.netlify.app/).

- **Home**: The Era Collection hero, the shipping/payment/guarantee strip, Our Best Sellers, Popular Categories (Watches, Jewelry, Eyewear) and Who We Are / Our Story
- **Shop**: filter by category and collection, search, and sort by price or rating. Filters live in the URL, so a filtered page can be shared.
- **Product pages**: finish swatches, quantity, stock, specs, delivery info and "you may also like"
- **Cart**: a slide-out mini cart plus a full cart page with quantity changes and discount codes. Signing up in the footer adds `WELCOME10` (10% off).
- **Checkout**: three steps (details → delivery → payment) with form checks. Lagos, nationwide, pick-up and worldwide delivery options depend on the address.
- **Mock payments**: no real money moves. The test cards are:
  - `4242 4242 4242 4242`: payment succeeds
  - `4000 0000 0000 0002`: card declined
  - `4000 0000 0000 9995`: insufficient funds

  Bank transfer is also mocked.
- **Order confirmation** with a printable receipt, a **wishlist** (♡) and **order history** (👤). All of these are saved in your browser only.

The pages use hash routing (`#/shop`, `#/product/…`, `#/checkout/payment`, `#/order/…`), so they work on GitHub Pages without any server setup. It's built with plain HTML, CSS and JavaScript modules: no build step, light and dark modes, keyboard and screen-reader friendly, and it works on phones.

## Editing the shop

Everything lives in `js/data.js`: products, prices, collections, delivery options, discount codes and page copy.

- The product pictures are drawn in code (`js/art.js`). To use real photos, put them in `images/` and add `image: 'images/your-photo.jpg'` to the product.
- Products marked `sample: true` are the **Bar Necklace** and **Shady #002**. They appear in the site's category tiles, but their prices weren't shown, so check them before going live.
- The social links in `BRAND.socials` point to the platforms' home pages. Replace them with PearlyBeau's real profile links.

## Files

| File | What it does |
| --- | --- |
| `js/router.js` | Tiny hash router |
| `js/store.js` | Cart, wishlist and orders (saved in localStorage) |
| `js/payments.js` | Mock payment gateway, card checks |
| `js/views.js` | Every page |
| `js/ui.js` | Drawers, toast, theme toggle |
