# Stain & Sort: Bacterial ID Study Guide

An interactive revision guide to identifying bacteria the way it's done at the bench: Gram stain first, then shape, then a short chain of biochemical tests.

## What's inside

- **Gram stain, step by step.** Run the four reagents (crystal violet, iodine, decolouriser, safranin) and watch Gram-positive and Gram-negative walls and smears change colour, with an explanation at each step.
- **Identification key.** A dichotomous key from Gram stain → shape → catalase, coagulase, haemolysis, optochin, oxidase, lactose, indole, H₂S, urease and more. It ends at a full organism profile. Every answer is kept in a "Your path" trail you can jump back through.
- **Flashcards.** 27 organisms, each with a drawn microscope field, three clues and a flip side with the full test profile and a memory tip. Filter by Gram reaction or shape, shuffle, and mark cards "Got it" or "Still learning" (saved in your browser). Works with swipe, tap and keyboard.
- **Bench-test library.** 20 tests with what they detect, how to do them, what a positive and negative look like, and which organisms they separate. Searchable; tap an organism for its profile.
- **Quiz.** Ten mixed questions (name the organism from its profile, or pick what a named organism looks like on a film), with feedback and your best score.

## Design

- Palette: Midnight Blue, Ivory, Slate, Dusty Blue and Espresso. Gram violet and safranin pink are the only extra colours, because they carry meaning.
- Poppins throughout, frosted-glass panels over slow-moving paint spills, and a hero where each section is a roll of fabric.
- Light and dark themes (follows your system, with a toggle), responsive down to 320 px, and all motion turns off with `prefers-reduced-motion`.

## Run locally

It's plain HTML, CSS and JavaScript modules, with no build step:

```bash
cd stain-and-sort
python3 -m http.server 8000
# open http://localhost:8000
```

## Files

- `index.html`: page structure
- `css/styles.css`: design tokens, layout and animation
- `js/data.js`: organisms, the identification key and bench tests
- `js/micro.js`: draws each organism's microscope field as SVG
- `js/app.js`: stain stepper, key, flashcards, test library and quiz

## Note

Reactions are typical textbook results. Real isolates vary, and most labs now confirm identity with MALDI-TOF. This is a study aid, not for diagnostic use.
