# ABC Doors: a 3D alphabet video for toddlers

A vertical (9:16) 3D animated learning video in a bright nursery-rhyme style. A little girl toddles down a hall of colourful doors, opens each one, and finds the word behind it: **A - Apple, B - Banana, C - Cat, D - Dog, E - Elephant, F - Fish, G - Grapes, H - Hat, I - Ice, J - Jelly, K - Kite, L - Lion**. At the end a fluffy hamster waves "Bye-Bye 👋".

- **Video:** [`video/abc-doors.mp4`](video/abc-doors.mp4): 1080×1920, 30 fps, about 70 s, with music and sound effects
- **Live version:** open `index.html` from a web server. It plays the same animation in real time with WebGL.
- **AI-video prompt pack:** [`PROMPTS.md`](PROMPTS.md) has scene-by-scene prompts for Veo, Sora, Kling and similar tools, written so the character stays consistent.

## How it's made

Everything is procedural, so there are no model or texture files. The toddler, animals, fruit, doors and room are all built in code from rounded primitives, lathes, extrusions and tubes with [three.js](https://threejs.org/).

| File | What it does |
| --- | --- |
| `js/timeline.json` | Scene list (letter, word, door colour, reaction) and timing |
| `js/character.js` | The toddler model and her pose/expression rig |
| `js/world.js` | Glossy mirrored floor, door wall, bunting, wall shapes, toys, doors, rooms behind the doors |
| `js/props.js` | What's behind each door, plus the goodbye hamster |
| `js/hud.js` | On-screen words, bubble wipes, "Bye-Bye" card and logo |
| `js/main.js` | Choreography: walking, reaching, door swing, reactions, camera, lights |
| `tools/render.mjs` | Renders each frame in headless Chromium and pipes it to ffmpeg |
| `tools/make_audio.py` | Synthesizes the original soundtrack and effects in sync with the timeline |

The animation is a pure function of time (`ABC.renderAt(t)`), so the offline render and the live page match frame for frame.

### Re-render

```bash
npm install three@0.169.0                               # anywhere, for offline rendering
python3 tools/make_audio.py                             # -> audio/soundtrack.m4a
node tools/render.mjs --three node_modules/three --out video/silent.mp4
ffmpeg -i video/silent.mp4 -i audio/soundtrack.m4a -c:v copy -c:a copy -shortest video/abc-doors.mp4
# quick look at single frames:
node tools/render.mjs --three node_modules/three --stills 4.4,30.5,62 --outdir stills
```

To change the words or colours, edit `js/timeline.json`. Each `kind` maps to a builder in `js/props.js`.

## Credits

- Font: [Fredoka](https://fonts.google.com/specimen/Fredoka) (SIL Open Font License)
- 👋 emoji: [Twemoji](https://github.com/jdecked/twemoji) (CC-BY 4.0)
- Music and sound effects: synthesized by `tools/make_audio.py` (original)
