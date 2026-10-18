# Presentation guide: jamming on the talk

> **For Claude (chat):** you're helping Kaspar write a conference talk. You can't see the code. Your job is to help shape the story and then produce a **`scene-description.md`** that a coding agent will turn into the real deck. This file tells you what the deck engine can do and the exact format to hand back.

## The talk

- **Title:** Shovelling Umbraco Into Other People's WordPress
- **Event:** Umbraco Meetup, 22 October 2026
- **Speaker:** Kaspar Boel Kjeldsen (kjeldsen.dev). Head of Umbraco at Kraftvaerk, Umbraco MVP.
- **Audience:** Umbraco developers and people around them. They know Umbraco well and have opinions about WordPress.
- **Tone:** funny, self-aware, technically real. The title is the joke; the content should still teach something.
- **Length:** ask Kaspar if it isn't settled yet. As a rule of thumb, plan for 1–2 minutes per scene, so a 25-minute slot is roughly 15–25 scenes.

## How to work with Kaspar

1. **Story first.** Agree on the arc (hook → problem → how → demo → payoff) before discussing any visuals.
2. **Then scenes.** Break the arc into scenes. One idea per scene. If a scene needs more than about 3 sentences of explanation, split it.
3. **Then visuals.** For each scene, pick one strong visual idea from the toolbox below. Don't decorate every scene. Mix big-statement scenes with dense ones.
4. **Then write `scene-description.md`** in the format at the bottom. Kaspar hands it to the coding agent.

Ask before inventing facts about his code, clients or numbers. Use `TODO:` in the description for anything he still has to supply.

## What the deck is

This isn't PowerPoint. It's a web app (Vue) with these properties:

- **A single infinite canvas.** Every scene is a 1920×1080 card placed somewhere on a huge 2D surface. Moving to the next scene makes the camera **fly** there: it zooms out, pans and zooms back in. Scenes can be rotated a few degrees and scaled, which makes the flight more dramatic.
- **Nested scenes.** A scene can be placed *small inside another scene*. The camera then **dives into it**. Example: a diagram has a box labelled "the shovel", and the next scene lives inside that box, so the camera zooms into the box and the code appears. This is the signature move. Use it 2–4 times in the whole talk, where "zooming into detail" means something.
- **Overview.** Pressing O zooms out to show the whole canvas. Since the audience can see the layout of the talk, **where scenes sit is part of the storytelling** (e.g. the "Umbraco world" on the left, the "WordPress world" on the right, the bridge in the middle).
- **Builds.** Inside a scene, elements can appear one click at a time.
- **Speaker notes.** A separate notes screen shows the current scene's notes in huge white-on-black text, so every scene should have notes. Notes are **per scene**, not per click. The fewer words, the bigger they render, so keep them to short cue bullets.
- **Live websites.** A scene can embed a real, clickable website in a browser frame. He can click around in it on stage.

## Visual language

The deck follows Umbraco's visual style: big, bold, friendly, lots of space, rounded shapes, and few words per scene.

| Token | Colour | Use |
|---|---|---|
| navy | `#1b264f` | dark backgrounds, main text on light |
| blue | `#3544b1` | Umbraco, primary accents |
| pink | `#f5c1bc` | highlights, kickers, "the important word" |
| hot pink | `#f28b82` | underline scribbles, emphasis |
| sand | `#f6f3ee` | light backgrounds |
| WP blue | `#3858e9` | anything WordPress |

- **Scene backgrounds:** `dark` (navy), `sand`, `pink` or `blue`. Alternate them so the flights look good.
- **Font:** Lato (very bold for headlines), JetBrains Mono for code.
- **Text sizes on the 1920×1080 canvas:** headline 96–170px, body 40–50px, small print no smaller than 26px. **If text won't fit at 40px, there's too much text.**
- A small pill-shaped **kicker** label above a headline works well as a section marker (e.g. "THE SITUATION", "LIVE").

## Toolbox (what a scene can contain)

The building blocks below exist already. The agent can also build new things, but these cost nothing:

| Block | What it is | Good for |
|---|---|---|
| **Headline + kicker** | big bold text with a small pill label above | section openers, statements |
| **Cards** | rounded cards side by side, each popping in on a click | comparisons, "three things", personas |
| **Big number** | huge animated number (count up/down) with a ring drawn around it | punchlines, stats |
| **Code block** | syntax-highlighted code; specific lines light up per click while the rest dims | walking through code |
| **Screenshot** | image in a browser or app-window frame, optionally tilted | showing UI. Kaspar supplies the PNGs. |
| **Live site** | real iframe in a browser frame, clickable | demos without leaving the deck |
| **Diagram** | boxes/logos connected by lines that draw themselves, with little packets flowing along them | architecture, data flow |
| **Logos** | Umbraco mark, WordPress mark, a cartoon shovel (all custom SVG, animatable) | anywhere |
| **Custom SVG animation** | the agent draws and animates a small illustration (e.g. the title has a shovel looping, flinging Umbraco logos into the WordPress logo) | title, section breaks, jokes. One per few scenes, not more. |

**Build animations** for elements that appear on a click: `up` (slide up), `left`, `right`, `pop` (springy scale), `blur` (focus in), `fade`, `dim` (always visible, faded until its turn).

**Entrance animations** play every time a scene comes on stage: staggered text rising in, a line or underline drawing itself, a number counting.

**Cheap:** text, cards, code, screenshots, live sites, builds, diagrams of boxes and arrows.
**Medium:** a custom looping SVG illustration, a bespoke diagram with flowing data.
**Ask first:** anything that needs real data at runtime, video, sound or 3D.

## Screenshots and assets

Kaspar takes the screenshots. In the description, **name every image you need** with a filename and a one-line brief of what it should show, e.g. `shots/backoffice-block-editor.png – the block list editor with 3 blocks, one expanded`. The agent puts in a labelled placeholder until the file exists.

## The canvas layout

Give each scene a rough position in plain words. The agent turns that into coordinates. Useful vocabulary:

- "to the right of X", "below X", "far away from everything" (long dramatic flight)
- "tilted slightly left/right"
- "inside X's <element>" (nested: the camera dives in)
- "bigger than normal" (the camera pulls back to show it)
- "region: Umbraco side / WordPress side / the bridge" if you've defined regions

Also describe how the whole talk should look in overview, e.g. "a path going left to right with the deep dives as zoom-ins".

## Output format: `scene-description.md`

Produce **one markdown file** in exactly this shape. Be concrete: write the actual on-screen words and what appears on each click. The coding agent should not have to invent content.

```markdown
# Scene description: Shovelling Umbraco Into Other People's WordPress

## Overview
- Running time: 25 min, ~18 scenes
- Arc: one paragraph
- Canvas layout: one paragraph (regions, the path, where the dives happen)
- Recurring motifs: e.g. the shovel appears at every section break

## Assets needed
- shots/xxx.png – what it shows
- live: https://… – what we'll click on

## Scenes

### 1. title – Title
- **Background:** dark
- **Position:** start of the path, centre of the "Umbraco side"
- **On screen:** exact text, and what visual
- **Animation:** entrance and any loop
- **Builds:** none | 1. … 2. …
- **Notes:** what Kaspar says (bullet points, not a script)

### 2. setup – The situation
…
```

Rules for the scene list:

- Each scene heading is `### <number>. <id> – <Title>`. The id is short kebab-case and becomes the URL (`#the-setup/2`).
- **Builds** are numbered in click order. A scene with no builds advances with a single click.
- **Notes** go on the notes screen, one block per scene: 2–5 short cue bullets, not a script. Mark jokes as `(joke)` and add timing cues like `(pause)`.
- For **code**, include the actual code and say which lines light up on which click.
- For **diagrams**, list the nodes, the connections and the reveal order.
- For **nested scenes**, say which scene and which element they live inside.
- Mark anything unknown as `TODO:` instead of guessing.

## Existing demo scenes

The deck already contains eight demo scenes. They can be reused, rewritten or dropped; just say which in the description.

| id | What it is |
|---|---|
| title | title, with a shovel flinging Umbraco logos into the WordPress logo |
| setup | 3 cards: client loves WP / you love Umbraco / budget: "lol." |
| pipeline | Umbraco → shovel → WordPress diagram with flowing packets |
| code | PHP shortcode snippet, nested inside the pipeline's "shovel" box |
| screens | two tilted browser frames: "Edited here… / …shows up here." |
| live | near-fullscreen live kjeldsen.dev |
| zero | big "0 migrations were harmed in the making of this talk" |
| thanks | Thanks! Questions? + waving shovel |
