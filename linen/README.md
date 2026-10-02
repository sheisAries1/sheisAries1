# Linen — Glass Landing Page

A product landing page for **Linen**, a made-up client-portal app for small studios (proposals, projects and payments in one link). It uses a calm glass style in a warm neutral palette.

## Design

| Token | Hex | Used for |
| --- | --- | --- |
| Milk | `#FBF7F4` | Glass surfaces, light text on dark |
| Oat | `#E5DED2` | Background light, pills |
| Taupe | `#A39382` | Ambient shadow, accents |
| Mocha | `#685D54` | Secondary text, serif highlights |
| Charcoal | `#232323` | Text, primary buttons, dark panels |

- **Type:** Instrument Sans for the interface, and Instrument Serif italic for highlighted words in headlines.
- **Glass:** translucent panels with background blur, thin white borders, an inner top highlight, a soft reflection along the top-left edge, and layered shadows.
- **Motion:** slow ambient light drifting behind the page, fade-up reveals on scroll, buttons that drift toward the cursor, a highlight that follows the pointer on glass panels, and light sweeping across buttons on hover. All motion is turned off for visitors who choose reduced motion.

## Sections

Hero → interactive product demo → logo cloud → three benefits → bento feature grid → how it works → testimonials → pricing (monthly/yearly toggle) → FAQ → final call to action.

The **product demo** is a working mini app: switch between client projects, change tabs, tick off milestones (the progress bar updates), post an update, and send an invoice that gets "paid" a moment later.

## Editing

All repeated copy is in `js/content.js`: logos, benefits, features, steps, testimonials, plans, FAQs and the demo projects. Change it there and the page re-renders. Colours and spacing are CSS variables at the top of `css/styles.css`.

Testimonial photos load from randomuser.me as placeholders, with initials as a fallback. Replace them with real customer photos before using the page for real.

## Code

Plain HTML, CSS and JavaScript (ES modules), with no build step. Serve the folder to run it:

```sh
cd linen && python3 -m http.server
```

- `js/components.js`: reusable pieces (button, logo cloud, benefit, bento tile, step, testimonial, pricing card, FAQ item)
- `js/preview.js`: the interactive product demo
- `js/effects.js`: scroll reveals, magnetic buttons, glass highlight, nav, step progress line, pricing toggle, FAQ
- `js/main.js`: renders the sections and starts everything
