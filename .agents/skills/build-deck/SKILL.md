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
- Nested slots: the **parent** draws the box (a dashed frame, a diagram node), and the box is 16:9. Place the child with `nest(parentAt, { cx, cy, w })` and `parent: '<id>'`. Keep `cx/cy/w` in one constant shared by the parent's CSS and `deck.js` (see `decks/example`).
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
| Cards side by side | `.card` in a flex row, one `<Step>` each | pattern index: `WhatHappened.vue` |
| Code walkthrough | `@engine/components/Code.vue` with `:focus` and `:callouts` | `decks/example/scenes/Walkthrough.vue` |
| Screenshot | `@engine/components/Shot.vue` with `src="/shots/x.png"` (placeholder until the file exists) | `decks/example/scenes/Screenshot.vue` |
| Live site / launch card | `<Shot live="…">` / `<Shot live="…" external>` | pattern index: `LiveDemo.vue` |
| Big number | `@engine/useCount.js` | pattern index: `OneInstance.vue` |
| Diagram, wires, packets, dives | SVG paths with `stroke-dashoffset` transitions; nested scenes in its boxes | pattern index: `Map.vue` + `map/geometry.js` |
| Takeaway over everything | `ghost: true, at: null` | pattern index: `ControlPlane.vue` |
| Demo fallback | `skip: true` (X jumps to it) | `README.md` |
| Logo, mascot, one-off art | a component in `decks/<id>/components/`, listed in `brief.md` | `AGENTS.md` rule 3 |

"Pattern index" means the table in `AGENTS.md`. Those files use another deck's theme classes: copy the structure, not the styling. Anything the engine can't do yet is an engine change (`AGENTS.md` rule 1). Ask before making one.

## Definition of done

- `npm run check -- <id>`: 0 errors. Each warning is fixed or explained in your report. Missing `/shots/` files are expected.
- `?sheet` audit: 0 findings, or every finding explained (e.g. a deliberate bleed off the card).
- Every scene has 2–5 cue lines in `notes.json`, with `[PRESS]` marking the clicks.
- `npm run deck -- build <id>` passes.
- `brief.md` is up to date: visual language, deck components, canvas layout, the scene table.
- Your report ends with a **TODO list for the speaker**: every missing screenshot and asset (from `check`'s `TODO asset` lines and the brief's "Assets needed"), and every `TODO:` left in the scenes.
- Stop the dev servers you started.
