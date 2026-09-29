# Gram Guide — Bacteria ID Study Kit

A study tool for learning how clinical labs identify bacteria: Gram stain first, then shape, then the bench tests. It uses plain HTML, CSS and JavaScript with no build step and no frameworks, and runs straight from GitHub Pages.

**Live:** https://sheisaries1.github.io/sheisAries1/gram-guide/

## What's inside

- **Interactive key.** Answer one question at a time (Gram reaction, morphology, catalase, coagulase, oxidase, lactose, indole and so on) and watch the list of possible organisms shrink. Each step explains how to read the test. Click any organism in the list to replay its route, or click an earlier answer to go back.
- **Flashcards.** 29 organisms with a microscope-style drawing of each. You can study name-first or profile-first, filter by Gram reaction, shuffle, and swipe on touch screens. The cards you mark as known are saved in `localStorage`.
- **Quiz.** Ten rounds built from the key itself. The wrong options are the organism's closest relatives, and a wrong answer tells you exactly which test separates the two.
- **Bench reference.** 16 tests, each with drawings of a positive and a negative result (tubes, slides, plates and discs).
- Frosted-glass surfaces, a light and a dark theme, the Poppins font, scroll-reveal animations and `prefers-reduced-motion` support.

## Structure

```
gram-guide/
├── index.html
├── css/styles.css     design tokens, glass, layout, animations
└── js/
    ├── data.js        organisms, the identification key, bench tests
    ├── draw.js        SVG drawings (cells, answer icons, tubes/plates)
    ├── key.js         interactive key
    ├── cards.js       flashcards
    ├── quiz.js        quiz
    ├── ui.js          theme, nav, reveal, toast, hero microscope
    └── main.js        wires it all together
```

Everything the app knows lives in `js/data.js`. To add an organism, add it to `organisms` and hang it off a branch of `key`. The flashcards, quiz and candidate list all pick it up automatically.

## Run locally

ES modules need a server, so opening the file directly won't work:

```
cd gram-guide
python3 -m http.server 8000
```

Then open http://localhost:8000.

## A note on accuracy

The reactions shown are the typical textbook results taught on clinical microbiology courses. Real isolates vary, so this is a revision aid, not a lab SOP.
