# Atelier Ma — Japandi Interiors

A calm, editorial concept site for a high-end Japandi interior design studio.

- **Direction:** Japanese minimalism — restraint, asymmetric print-inspired layouts, generous empty space
- **Type:** Noto Serif (headings) and DM Sans (body, navigation, controls)
- **Palette:** rice paper `#F3EEE5`, ink `#1E1C19`, muted clay `#B39A84`, pale moss `#B5B79D`, walnut (brand) `#5B3F2E`, plus a subtle SVG paper grain
- **Sections:** opening statement, philosophy, practice, selected rooms, process, client words, materials, consultation form, footer
- **Human touch:** copy in the founders' own voice, a signed note from them, studio notes on room captions, and two hand-drawn marks (an underline under the headline and an ensō by the signature) that draw themselves in
- **Motion:** slow fades, image mask reveals and drawn hairlines via IntersectionObserver; all turned off for `prefers-reduced-motion`, and content stays visible without JavaScript
- **Accessibility:** skip link, semantic landmarks, labelled form with inline errors, visible focus states, keyboard and Escape support for the mobile menu
- **Performance:** vanilla HTML/CSS/JS with no build step, responsive WebP images with `srcset`, lazy loading below the fold, preloaded hero image

Open `index.html` directly or serve the folder (`npx http-server japandi`).
