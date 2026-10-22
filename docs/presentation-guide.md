# Presentation guide: jamming on a talk

> **For Claude (chat):** you're helping a speaker write a conference talk that will be built with can-present. You can't see the code. Your job is to help shape the story and then produce a **`scene-description.md`** that a coding agent will turn into the real deck. This file tells you what the deck engine can do and the exact format to hand back.
>
> **Read the deck's `brief.md` alongside this file** (e.g. `decks/shovelling-umbraco/brief.md`). It has the talk itself (title, event, audience, tone, length), how to work with the speaker, the deck's visual language (colours, fonts, slide backgrounds) and the scenes that already exist. Where this guide and the brief disagree, the brief wins.

## How to work with the speaker

1. **Story first.** Agree on the arc (hook → problem → how → demo → payoff) before discussing any visuals.
2. **Then scenes.** Break the arc into scenes. One idea per scene. If a scene needs more than about 3 sentences of explanation, split it.
3. **Then visuals.** For each scene, pick one strong visual idea from the toolbox below. Don't decorate every scene. Mix big-statement scenes with dense ones.
4. **Then write `scene-description.md`** in the format at the bottom. The speaker hands it to the coding agent.

Ask before inventing facts about their code, clients or numbers. Use `TODO:` in the description for anything they still have to supply. As a rule of thumb, plan for 1–2 minutes per scene, so a 25-minute slot is roughly 15–25 scenes.

## What the deck is

This isn't PowerPoint. It's a web app (Vue) with these properties:

- **A single infinite canvas.** Every scene is a 1920×1080 card placed somewhere on a huge 2D surface. Moving to the next scene makes the camera **fly** there: it zooms out, pans and zooms back in. Scenes can be rotated a few degrees and scaled, which makes the flight more dramatic.
- **Nested scenes.** A scene can be placed *small inside another scene*. The camera then **dives into it**. Example: a diagram has a box, and the next scene lives inside that box, so the camera zooms into the box and the detail appears. This is the signature move. Use it 2–4 times in the whole talk, where "zooming into detail" means something. Nested scenes can appear on a build step of their parent, or a set time after the parent comes on stage.
- **Riding a wire.** Instead of the usual zoom-out-pan-in, the flight into a scene can *ride a line*: the camera flies close to the start of a diagram arrow (or any drawn path), follows it through its curves and corners with a small labelled pill ("scenes", "GET /jobs") at the centre of the screen, as if the audience were the packet, and then dives into the next scene. ← plays the ride backwards. It's one continuous motion of 1.5–4 seconds. Use it where "this goes there" *is* the point, e.g. a request travelling to the box that handles it, and lead into a nested scene that lives at the end of the line. Once or twice per talk.
- **Zooming into detail, within one scene.** Clicks can move the camera *inside* a scene instead of building things: each click frames a smaller part of the card, and content appears only once the camera is close enough to read it, like a map. From afar a box says "API"; one click in, its endpoints fade in; one more, a line of real code; one more, a single character. Zooms of 30× to 500× stay smooth and sharp, and the content materialises *during* the zoom. This is the "powers of ten" moment: once per talk, where "look closer, there's more inside" is the point. The same trick works the other way: a label can show only when the camera is far away, e.g. region names that are readable in the overview.
- **The deck rearranges itself.** At the end, the camera pulls back over the whole talk, and then every scene *moves*: the cards leave their places and swing round into a formation around the final scene (a slowly orbiting ring, a grid, a spiral, or the points of any shape), one after another with a springy little overshoot, while the camera closes in. Leaving that scene sends them all home. It takes about two seconds. Use it once, on the last scene ("thanks", "questions?"): it works because the audience has seen every one of those cards during the talk, so write the final scene's text to match ("everything we saw today") and big, since that card is about a third of the screen wide in the formation. It also works as a transition into a scene mid-talk: the cards gather into a shape round it (the letters of a word, a logo), hold for a moment, then fly home while the camera moves in on that card. The shape can be any arrangement of the cards, each placed, turned and sized on its own; a deck can do this more than once (e.g. a word on the way into one scene, the ring round the last).
- **The deck folds into a hand.** A card trick as the move into a scene: the camera pulls back over the whole talk, every scene swings round into a fan like a hand of playing cards (tilted, overlapping, in talk order), the hand is held for a beat for the "wow", then the next scene's card is drawn out of the hand (it slides up and straightens), and the camera dives into it. About five seconds. Use it once per talk, mid-talk, at a turn where "out of everything we've seen, this one" is the point (the results, the punchline, the one number that matters). Going back plays a normal flight.
- **Outer layers: keep zooming out.** After the last scene the camera can keep pulling back, and the whole talk turns out to be a tiny part of a much bigger card: the dot on an "i" in a sentence written across the canvas. Another click, and that card is the full stop of an even bigger sentence, as many times as you like. Each pull-back is one smooth flight of a few seconds. Use it once, at the very end: the reveal works because the audience has just seen how big the talk is.
- **Cards with a back.** A scene can be the *other side* of another card. Instead of flying on, the camera pulls back a little and the card turns over on the canvas, like a page or a sign, with a slight wobble and a sheen, and the camera moves back in on its back. ← turns it back. About 1.7 seconds. Use it where two things belong together as two sides of one thing: a question and its answer, before and after, code and what it makes. Once or twice per talk.
- **A takeaway that hovers over everything.** One scene can be a "ghost": placed over the whole canvas, visible only while it's on stage.
- **Overview.** Pressing O zooms out to show the whole canvas. Since the audience can see the layout of the talk, **where scenes sit is part of the storytelling** (e.g. one world on the left, another on the right, a bridge in the middle).
- **Builds.** Inside a scene, elements can appear one click at a time.
- **Speaker notes.** A separate notes screen shows the current scene's notes in huge white-on-black text, so every scene should have notes. Notes are **per scene**, not per click. The fewer words, the bigger they render, so keep them to short cue bullets.
- **Live websites.** A scene can embed a real, clickable website in a browser frame, or a launch card that opens a site in a new tab (for sites that refuse to be framed). The speaker can click around in it on stage.
- **Fallback scenes.** A scene can be skipped in normal navigation and reached with one key, e.g. screenshots in case the live demo dies.
- **A website of its own.** A finished deck can be built into a plain static site (any web host, including GitHub Pages under a subpath) that works without the speaker's laptop: the same canvas, overview, presenter view and notes screen, with the notes read-only. Useful for sharing the talk afterwards. Editing notes still happens on the speaker's machine. It can also be packed into **one HTML file** with everything inside (fonts, screenshots, notes) that opens straight from disk, no server or wifi: mail it, or keep it on a USB stick as a backup. Live sites still need the network.

## Visual language

Each deck has its own theme. **The colours, fonts and slide backgrounds are in the deck's `brief.md`.** These hold for every deck:

- Big, bold, lots of space, few words per scene.
- **Text sizes on the 1920×1080 canvas:** headline 96–170px, body 40–50px, small print no smaller than 26px. **If text won't fit at 40px, there's too much text.**
- A small pill-shaped **kicker** label above a headline works well as a section marker (e.g. "THE SITUATION", "LIVE").
- Alternate slide backgrounds so the flights look good.

## Toolbox (what a scene can contain)

The building blocks below exist already. The agent can also build new things, but these cost nothing:

| Block | What it is | Good for |
|---|---|---|
| **Headline + kicker** | big text with a small pill label above | section openers, statements |
| **Cards** | rounded cards side by side, each popping in on a click | comparisons, "three things", personas |
| **Big number** | huge number that counts up or down when the scene comes on stage (or on a click), re-counting every time you come back. Optionally a ring draws itself around it in sync. Thousands separators (6,836), decimals (99.9), a prefix or suffix ($, %, ×) and a short label underneath | punchlines, stats |
| **Code block** | syntax-highlighted code; specific lines (or one token) light up per click while the rest dims, with a speech-bubble callout per click | walking through code |
| **Screenshot** | image in a browser or app-window frame, optionally tilted | showing UI. The speaker supplies the PNGs. |
| **Live site** | real iframe in a browser frame, clickable; or a launch card that opens it in a new tab | demos without leaving the deck |
| **Diagram** | boxes (or logos) connected by arrows. The diagram builds itself: each box pops in on a click, or on a timer when the scene comes on stage (no clicks needed), and each line draws itself once both of its boxes are there. Little labelled packets ("GET /jobs", "200 OK") flow along the lines in either direction. A box can hold a slot where a nested scene lives, so the camera can dive into it | architecture, data flow, "zoom into this part" |
| **Ride a wire** | the flight into a scene follows a line of a diagram (or any drawn path) at close range, with a labelled pill at the centre of the screen, then dives in. Optionally the camera leans a few degrees into the corners | "follow the request", the hand-off from one box to the next, data flow told as a journey |
| **Zoom into detail** | clicks fly the camera deeper into one scene (each click frames a smaller part of it), and details fade in as they become big enough to read; labels can also show only from far away (the overview) | "powers of ten": a system → a component → a line of code; revealing what's inside a box without leaving the scene |
| **The deck rearranges itself** | every other scene leaves the path and gathers round a scene: a ring that slowly orbits (default), a grid, a spiral, or any shape (a word, a logo); it all goes home when you leave, on a click, or by itself after a hold | the ending: thanks, questions, "everything we covered"; mid-talk, the cards spelling a word on the way into a scene |
| **Fold into a hand** | the move into a scene: every scene fans out into a hand of playing cards, a beat, then that scene's card is drawn out and the camera dives in | a mid-talk turn: "of everything so far, this one"; the results; the reveal |
| **Flip** | the card turns over on the canvas to show another scene on its back; the camera pulls back just enough to see it turn | question/answer, before/after, code/result |
| **Outer layers** | pull back past the whole talk to reveal it was a tiny part of a bigger card (the dot on an i), as many times as you like | the very end: "all of that fits in the dot of an i", "it's turtles all the way down" |
| **QR code** | a link with a short label and a code that falls onto the canvas dot by dot when the scene arrives (or on a click): the three corner squares thud down first, then the rest rains in, each dot dropping from near the audience with its shadow tightening under it. Big and high-contrast, so it scans from the back of the room; the link is shown as text too | "get the slides", feedback forms, repos |
| **Custom SVG animation** | the agent draws and animates a small illustration | title, section breaks, jokes. One per few scenes, not more. |

Every block above has a working scene in the engine's example deck (`decks/example`), so the coding agent has something to copy. The deck may have its own components too (logos, mascots, recurring motifs). The brief lists them.

**Build animations** for elements that appear on a click: `up` (slide up), `down`, `left`, `right`, `pop` (springy scale), `blur` (focus in), `fade`, `dim` (always visible, faded until its turn).

**Entrance animations** play every time a scene comes on stage: staggered text rising in, a line or underline drawing itself, a number counting, a QR code's dots falling onto the canvas.

**Cheap:** text, cards, big numbers, QR codes, code, screenshots, live sites, builds, diagrams of boxes and arrows (with flowing packets and nested slots), riding a diagram's line into a nested scene, a card that turns over to show another scene on its back, a click that zooms the camera onto part of a scene, a label that only shows in the overview, a finale where every scene gathers round the last one (ring, grid or spiral), the deck folding into a hand of cards to draw the next scene, outer layers that reveal the talk as the dot of an i (a line of text per layer).
**Medium:** a custom looping SVG illustration, a bespoke diagram that goes beyond boxes and arrows (curves, logos as nodes, custom shapes), a ride along a hand-drawn path, a multi-level "powers of ten" zoom (every level's content has to be designed for the zoom it's read at), a finale formation in a custom shape (the points of a logo or a word).
**Ask first:** anything that needs real data at runtime, video, sound or 3D.

## Screenshots and assets

The speaker takes the screenshots. In the description, **name every image you need** with a filename and a one-line brief of what it should show, e.g. `shots/backoffice-block-editor.png – the block list editor with 3 blocks, one expanded`. The agent puts in a labelled placeholder until the file exists.

## The canvas layout

Give each scene a rough position in plain words. The agent turns that into coordinates. Useful vocabulary:

- "to the right of X", "below X", "far away from everything" (long dramatic flight)
- "tilted slightly left/right"
- "inside X's <element>" (nested: the camera dives in)
- "reached by riding X's <line> from Y" (the flight in follows that line; Y should be X itself or a scene nested in X, since a ride from far away looks odd)
- "bigger than normal" (the camera pulls back to show it)
- "back of <scene>" (the card turns over to show this scene; put it right after that scene, and give it no position of its own)
- "on click n the camera zooms into its <element>" (a zoom within the scene; say what appears at that zoom)
- "label only readable from far away" (shown in the overview, gone up close)
- "outer layer: the whole talk is the dot of the i in '<sentence>'" (after the last scene; each further layer says which spot of its card holds the layer before, e.g. "the full stop")
- "outer layer round <scene>: that one card is <spot> of '<sentence>'" (e.g. a card that turns green is the stem of a green "1"; the rest of the talk fades while it's up)
- "formation, until click n": the cards orbit the scene, and on click n they go home while the camera moves in on it
- "formation spelling <word> round it, then in": the cards form the word (or another shape) round the scene, hold a moment, then go home while the camera moves in on it
- "reached by folding the deck into a hand and drawing this card" (the move in from the scene before; optionally how long to hold the hand)
- "region: …" if you've defined regions
- "finale: the other scenes gather round it as a ring / grid / spiral / <shape>" (on the last scene; place it where the pull-back over the whole talk reads well, e.g. back near the start)

Also describe how the whole talk should look in overview, e.g. "a path going left to right with the deep dives as zoom-ins".

## Output format: `scene-description.md`

Produce **one markdown file** in exactly this shape. Be concrete: write the actual on-screen words and what appears on each click. The coding agent should not have to invent content.

```markdown
# Scene description: <talk title>

## Overview
- Running time: 25 min, ~18 scenes
- Arc: one paragraph
- Canvas layout: one paragraph (regions, the path, where the dives happen)
- Recurring motifs: e.g. the mascot appears at every section break

## Assets needed
- shots/xxx.png – what it shows
- live: https://… – what we'll click on
- qr: https://… – what the QR code links to

## Scenes

### 1. title – Title
- **Background:** one of the deck's slide backgrounds (see brief.md)
- **Position:** start of the path
- **On screen:** exact text, and what visual
- **Animation:** entrance and any loop
- **Builds:** none | 1. … 2. …
- **Notes:** what the speaker says (bullet points, not a script)

### 2. setup – The situation
…
```

Rules for the scene list:

- Each scene heading is `### <number>. <id> – <Title>`. The id is short kebab-case and becomes the URL (`#the-setup/2`).
- **Builds** are numbered in click order. A scene with no builds advances with a single click.
- **Notes** go on the notes screen, one block per scene: 2–5 short cue bullets, not a script. Mark jokes as `(joke)` and add timing cues like `(pause)`.
- For **code**, include the actual code and say which lines light up on which click.
- For a **QR code**, put the real URL in the description (the exact link people should land on, not "TODO: link" if it's known), its short label, and whether the link is shown as text. Shorter URLs make coarser codes that scan from further back. Leave it on stage long enough for people to get their phones out.
- For **diagrams**, list the nodes, the connections (with labels), the reveal order (box by box on clicks, or timed so it builds itself), the packets that flow (label and direction) and any box that holds a nested scene.
- For **nested scenes**, say which scene and which element they live inside.
- For **rides**, say which line (from which box to which), the pill's label, and the scene it leads into.
- For a **hand**, say which scene is drawn out (the one the move leads into) and, if it matters, how long the full hand is held. Once per talk.
- For a **finale formation**, say the shape (ring, and whether it orbits; grid; spiral; or the shape to trace) on the last scene, and write its text big: it's read from far away.
- For **zooms into detail**, list them under **Builds**: which part of the scene the camera frames on each click, and what appears (or disappears) at that zoom level.
- Mark anything unknown as `TODO:` instead of guessing.
