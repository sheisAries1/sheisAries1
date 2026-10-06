# ABC Doors: prompt pack for AI video generators

Use these prompts in a text-to-video or image-to-video tool (Veo, Sora, Kling, Runway, Pika, Hailuo and similar) to get a Pixar-style render of the same storyboard. The 3D animation in this folder can be your animatic, and its frames make good image-to-video start frames.

**Tips for a consistent character**
1. Make one reference image of the toddler with the **Character sheet** prompt below. Use it as the start frame or character reference for every clip.
2. Paste the **Style block** and **Character block** word for word into every scene prompt. Change only the scene text.
3. Generate each letter as its own 5–6 second clip in 9:16, then join them with a quick colourful wipe. The rendered video uses the same order and timing (`js/timeline.json`).
4. Add the on-screen text ("A - APPLE" and so on) in your editor, not in the generator. AI models often misspell text.
5. Negative prompt (where supported): `scary, dark, realistic human skin pores, extra fingers, deformed hands, distorted face, text artifacts, watermark, blurry, horror, aggressive animals, sharp teeth`.

---

## Style block (paste into every prompt)

> Vertical 9:16, high-quality 3D animated children's nursery-rhyme video, Pixar-like polished cartoon style. A clean, bright indoor children's learning room: glossy white reflective floor, soft pastel-pink walls, colourful geometric shapes (stars, circles, triangles, hearts) scattered on the walls, colourful bunting, toy blocks and ring stackers on the floor, and a row of vibrant red, blue, yellow and green doors with white frames and golden knobs. Soft studio lighting, cheerful atmosphere, smooth reflections, soft shadows, vibrant saturated colours, medium full-body framing, gentle camera movement.

## Character block (paste into every prompt)

> The main character is the same adorable 2-year-old Black toddler girl in every shot: chubby cheeks, big sparkling brown eyes with long lashes, a warm smile, short rounded afro hair with a hot-pink ribbon bow on one side, a pastel-pink puff-sleeve dress with a white Peter Pan collar and a small pink heart on the chest, white socks and pink Mary-Jane shoes. Keep her face, hair, outfit and proportions exactly the same.

## Character sheet (reference image)

> [Character block] Character turnaround sheet, front view, three-quarter view and side view, standing on a plain pastel-pink background, Pixar-style 3D render, soft studio light.

---

## Scenes

Each prompt below goes after the Style and Character blocks.

**1. A for Apple**
> She toddles up to a bright red door with a large bold yellow letter "A" on it, reaches up to the golden door knob with her little hand, and pulls the door open with excitement. Behind the door is a cheerful apple-themed room with a soft green hill, a woven basket piled with shiny red apples and more red apples floating and sparkling in the air. She gasps with surprise and puts her hands on her cheeks, then smiles happily. Slow push-in.

**2. B for Banana**
> Cut to a bright blue door with a large yellow letter "B". She walks toward it, reaches for the knob and opens it. Behind it is a sunny yellow room with a big bunch of bright yellow bananas on a white stand and playful bananas floating and spinning. She claps her hands with joy.

**3. C for Cat**
> A yellow-orange door with a large red letter "C". She opens the door and a cute, friendly fluffy grey-and-white kitten with big green eyes and pink ears pops out and tilts its head, next to a pink ball of yarn. She bounces up and down with excitement and curiosity.

**4. D for Dog**
> A red door with a large yellow letter "D". She opens it and a cute friendly brown-and-white puppy with floppy ears and a pink tongue stands behind the door, wagging its tail and looking happily at her. She claps and giggles.

**5. E for Elephant**
> A blue door with a large yellow letter "E". She opens the door and a cute baby elephant in soft blue-grey with big pink-lined ears steps forward and playfully raises its trunk. She holds her cheeks and laughs happily.

**6. F for Fish**
> Transition to a bright underwater-themed aquarium corner with a sea-blue wall painted with bubbles. A large glass aquarium on a white cabinet holds colourful orange fish swimming between green seaweed, pebbles and rising bubbles. She stands beside the tank, looks at the fish with wide excited eyes and points at them.

**7. G for Grapes**
> A green door with a large yellow letter "G". She opens it and finds a huge, shiny bunch of purple grapes with a green leaf, swaying gently in a lilac room, with small grapes floating around. She points at the grapes with excitement.

**8. I for Ice**
> A red door with a large yellow letter "I". She stands beside the closed door, reaches for the knob and opens it. Behind it is a playful icy room: shiny translucent ice cubes (the biggest one has a cute smiling face), icicles, little snow mounds and gently falling snowflakes. She bounces happily with her arms up.

**9. J for Jelly**
> A blue door with a large yellow letter "J". She opens the door to find colourful wobbly jelly desserts (red, green, orange, purple and yellow) on white plates and a cake stand, each with whipped cream and a cherry on top, jiggling. She points at them happily.

**10. K for Kite**
> A red door with a large yellow letter "K". She opens it and reveals a bright blue sky scene with fluffy clouds and green grass, where three colourful diamond kites with bow tails fly and dance in the breeze. She waves up at the kites.

**11. L for Lion**
> A green door with a large yellow letter "L". She opens it and a cute, friendly cartoon lion cub with a fluffy orange mane, soft golden fur and a gentle smile appears. It looks playful and kind, not scary. She claps with excitement.

**12. Goodbye**
> A cute fluffy orange-and-white hamster with round pink ears and big shiny eyes sits on a lavender cushion against a soft pastel pink-lavender-mint gradient background, with floating hearts and bubbles, and waves goodbye to the camera with one tiny paw. Leave empty space at the top for the text "Bye-Bye 👋" and at the bottom for a kids-learning logo.

---

## Voice-over and lyrics (optional)

A simple call-and-repeat works well over the soundtrack:

> "A is for Apple, A-A-Apple! … B is for Banana, B-B-Banana! … C is for Cat … D is for Dog … E is for Elephant … F is for Fish … G is for Grapes … I is for Ice … J is for Jelly … K is for Kite … L is for Lion! … Bye-bye, friends!"

Each line starts as its door opens, about 2.2 s into each 5.4 s scene (scene *n* starts at *n* × 5.4 s, counting from 0).
