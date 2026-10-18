---
name: build-deck
description: Build, scaffold or finish a can-present deck (infinite-canvas talk) from a scene-description.md, or from a topic via write-talk. Covers new-deck --from, the theme, writing scenes, canvas layout, npm run check, the ?sheet audit and the definition of done. Use when asked to make, build, implement, lay out or fix up the slides/scenes of a deck in this repo.
---

# Build a deck

You turn a `scene-description.md` into a finished deck under `decks/<id>/`. Read `AGENTS.md` first (rules, scene rules, pattern index) and `README.md` for deck.js fields, tokens and building blocks. Don't repeat them from memory; look them up.

No scene description yet? If the user only has a topic, run the **write-talk** skill (`.agents/skills/write-talk/SKILL.md`) first. Don't invent the talk.

## Procedure

1. **Scaffold.** `npm run new-deck -- <id> --from path/to/scene-description.md [--icon 🎤]`. This writes stub scenes that already render, with each scene's description in its top comment, `deck.js` with `steps`, `notes.json` and `brief.md`. Read the TODOs it prints.
2. **Run it.** `npm run deck -- dev <id> --port 5180` in the background. Use a spare port if 5173 is taken.
3. **Theme from the brand** (recipe below). Do it before the scenes, so you only judge each scene once.
4. **Scenes in order.** For each stub: read its top comment, build what On screen and Animation describe, and keep the `<Step :at>`s matching Builds. Use the real text from the description; mark anything missing `TODO:`. Leave the top comment in place, or trim it once the scene is done.
5. **Layout pass.** Replace the default left-to-right path with the description's Overview/Position (rules below). Nest the scenes marked `// TODO: nest inside …`.
6. **`npm run check -- <id>`.** Fix every error. Fix or explain every warning. Scenes listed as "not inferred" need a manual look at `steps`.
7. **`?sheet`** (`http://localhost:<port>/?sheet`). Read the audit list at the top with `get_page_text`, not a screenshot. Then `?sheet&steps&only=<ids>` for the scenes with builds. One screenshot of the sheet shows the whole deck's look.
8. **Browser spot-checks**, only now: a few flights (`#id/0`, then →), each nested dive, the overview (O), and any live site or launch card.

## Layout rules of thumb

- Neighbours 2200–2400px apart (centre to centre); a card is 1920×1080.
- Rotations within ±3°. Alternate the sign so the path wiggles gently.
- A long flight (5000px or more, or a jump to another region) marks an act change. Keep scenes within an act close together.
- Regions tell the story in the overview: e.g. "problem" on the left, "solution" on the right, a bridge between them. Write the regions in a comment at the top of `deck.js`.
- Nested slots: the **parent** draws the box (a dashed frame, a diagram node), and the box is 16:9. Place the child with `nest(parentAt, { cx, cy, w })` and `parent: '<id>'`. Keep `cx/cy/w` in one place shared by the parent and `deck.js`: a `<Diagram>` slot does that for you (`nest(ARCH, arch.slot('inside'))` in `decks/example`).
- `s` > 1 for "bigger than normal" (a diagram the camera pulls back to see); 1.3–1.6 is plenty.
- `check` warns about overlapping cards and nested cards that stick out of their parent. Trust it.

## Theme recipe

Start from the `theme.css` the template wrote. It already sets every token and the standard classes.

- **Tokens that matter:** `--deck-canvas` (seen in every flight and the overview), `--deck-accent` / `--deck-on-accent` (kickers, highlights, code keywords, UI), `--deck-ink` / `--deck-paper` (dark and light UI, callouts on code), `--code-bg`. Then the palette variables the slide variants use. The README token table says what each one colours.
- **Fonts:** bundle them locally with `@fontsource/*` imported at the top of `deck.js` (the venue may have no wifi), then set `--sans` / `--serif` / `--mono`. A new fontsource package is the one dependency a deck may add. **Ask the user first.** Until they agree, use the system stacks.
- **Contrast:** body text at least 4.5:1 against its slide; the accent as text needs about 3:1 and only at headline size. Bright accents stay off light slides as text: give each variant its own `--accent` (the template's `--accent-on-light`). Text on an accent background is dark.
- **Alternate backgrounds** (`slide--dark` / `--light` / `--accent`) between neighbours so every flight has contrast. Keep `--accent` slides for section openers.
- **Sizes:** headlines 96–170px, body 40–50px, nothing under 26px. The sheet audit enforces the 26px floor.

## What to use for what

| The description says | Use | Working example |
|---|---|---|
| Headline + kicker, statement | `.kicker`, `.h1`/`.h2`, `.lead`, `class="rise" style="--d: n"` | `decks/example/scenes/Title.vue` |
| Things appearing on clicks | `<Step :at="n" anim="up\|pop\|…">` | `decks/example/scenes/Inside.vue` |
| Captions that replace each other | `<Step :at :until>` | pattern index: `OneLine.vue` |
| Cards side by side | `.card` in a flex row, one `<Step anim="pop">` each | `decks/example/scenes/Cards.vue` |
| Big number, counting, with a ring | `@engine/components/BigNumber.vue` (`:to`, `ring`, `:at`, `format`, `suffix`, `label`) | `decks/example/scenes/Stat.vue` |
| QR code: a link with a short label (slides, feedback form, repo) | `@engine/components/QrCode.vue` (`url`, `label`, `layout`, `:at`, `:size`); the real URL comes from the description. Keep it on stage long enough to scan | `decks/example/scenes/GetTheCode.vue` |
| Code walkthrough | `@engine/components/Code.vue` with `:focus` and `:callouts` | `decks/example/scenes/Walkthrough.vue` |
| Diagram, wires, packets, dives | `defineDiagram()` from `@engine/diagram.js` in a `.js` file next to the scene, drawn with `@engine/components/Diagram.vue`; deck.js uses the same definition (`steps: arch.steps`, `nest(…, arch.slot('x'))`, `revealAt` / `revealDelay`) | `decks/example/scenes/Arch.vue` + `arch.js`, nested: `Inside.vue` |
| Ride a wire / follow the request into a scene | `via: ride(diagram, edgeIndex, PARENT_AT, { label, zoom, tone })` on the scene the line leads into (import `ride` from `@engine/diagram.js`); `via: { path, space }` for a hand-drawn path. The previous scene should be the diagram or a scene nested in it | `decks/example/deck.js` (`inside`, `canvas`) |
| The camera zooms into part of a scene on a click; detail appears as it gets close; a label only in the overview | `frames: { n: { cx, cy, w } }` on the scene in deck.js (a box of the card per build step), and `<Detail :from :to>` / `<Detail :until>` from `@engine/components/Detail.vue` in the scene. Draw deep levels at normal sizes in transformed 1920×1080 boxes and mark them `data-audit="ignore"` | `decks/example/scenes/Deeper.vue` + `deeper.js` |
| Finale: the other scenes gather round the last one (ring, grid, spiral, custom shape) | `formation: { shape: 'ring', spin: 60 }` on the last scene in deck.js (`'grid'`, `'spiral'`, `{ shape: 'points', points }` or a function `(i, n) => ({ x, y })`). One per deck, top-level, `r: 0`; size its text for about a third of the screen | `decks/example/deck.js` (`thanks`) + `scenes/Thanks.vue` |
| Outer layers: after the end, pull back to reveal the talk was the dot on an i (and that card the full stop of a bigger sentence) | `outer: { hole: { cx, cy, w } }` on scenes after the last one, no `at`; the scene draws the dot at the hole (HTML text, a transparent slide variant, `<Detail :until>` for the dot); share the hole between scene and deck.js | `decks/example/scenes/Bigger.vue`, `Biggest.vue` + `outer.js` |
| Screenshot(s), tilted | `@engine/components/Shot.vue` with `src="/shots/x.png"` (placeholder until the file exists) | `decks/example/scenes/Screens.vue` |
| Live site / launch card | `<Shot live="…">` / `<Shot live="…" external>` | `decks/example/scenes/Live.vue`; launch card: pattern index `LiveDemo.vue` |
| Looping illustration | inline SVG + CSS keyframes in the scene, coloured with `--deck-*` tokens | `decks/example/scenes/Loop.vue` |
| Takeaway over everything | `ghost: true, at: null` | `decks/example/scenes/Takeaway.vue` |
| Demo fallback | `skip: true` (X jumps to it) | `decks/example/scenes/Fallback.vue` |
| Logo, mascot, one-off art | a component in `decks/<id>/components/`, listed in `brief.md` | `AGENTS.md` rule 3 |

"Pattern index" means the table in `AGENTS.md`; its talk files are more elaborate versions. Those files use another deck's theme classes: copy the structure, not the styling. Anything the engine can't do yet is an engine change (`AGENTS.md` rule 1). Ask before making one.

## Definition of done

- `npm run check -- <id>`: 0 errors. Each warning is fixed or explained in your report. Missing `/shots/` files are expected.
- `?sheet` audit: 0 findings, or every finding explained (e.g. a deliberate bleed off the card).
- Every scene has 2–5 cue lines in `notes.json`, with `[PRESS]` marking the clicks.
- `npm run deck -- build <id>` passes.
- `brief.md` is up to date: visual language, deck components, canvas layout, the scene table.
- Your report ends with a **TODO list for the speaker**: every missing screenshot and asset (from `check`'s `TODO asset` lines and the brief's "Assets needed"), and every `TODO:` left in the scenes.
- Stop the dev servers you started.
