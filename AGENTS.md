# AGENTS.md

can-present is a Vue 3 + Vite engine for talks on an infinite canvas. Every scene is a 1920×1080 card placed on a big 2D surface, and the camera flies and zooms between them. The engine is in `engine/`; each talk is a folder under `decks/`.

## Start here: what are you doing?

| Task | Read | Skip |
|---|---|---|
| **Writing a talk** (story, scenes, `scene-description.md`) | `docs/presentation-guide.md`, then the deck's `brief.md` | all code |
| **Building or editing a deck** | `README.md` (deck.js fields, tokens, building blocks), `decks/example/` (a complete small deck) | `engine/` internals, `decks/shovelling-umbraco/` (see the pattern index below) |
| **Changing the engine** | `README.md`, the engine files you touch, `docs/presentation-guide.md` | other decks |

`docs/presentation-guide.md` is the canonical list of what a talk can do. It's written for a model that can't see the code (e.g. Claude chat), and it defines the `scene-description.md` format that a coding agent turns into a deck. If you're asked to make a deck from a topic and there's no scene description yet, follow the guide's process with the user first.

## Rules

1. **Features are documented in the same change.** Any engine change that adds, removes or changes something a talk can do (a scene option, a building block, a build or entrance animation, a key, a screen the speaker uses like /notes) must update `docs/presentation-guide.md`: "What the deck is", the toolbox table, the animation lists and the cost tiers, as relevant. Changes to how you build (deck.js fields, component props, tokens, commands) must update `README.md`. A feature that isn't in the guide doesn't exist as far as the people writing talks are concerned.
2. **The engine stays talk-agnostic.** Nothing in `engine/` may name a deck, a brand or a client, use a deck's CSS variables, or import from `decks/` except through `@deck/deck.js`. Engine colours are `--deck-*` / `--code-*` tokens with defaults in `engine/styles/engine.css`; decks set them in their `theme.css`. This check must return nothing:
   `grep -rniE "k-(dark|green|red|sand|grey|light)|kraftvaerk|umbraco|wordpress|dsa|shovel" engine/`
3. **Deck-specific things stay in the deck.** Logos, mascots and one-off illustrations go in `decks/<deck>/components/`, and are listed in that deck's `brief.md`. Promote something to `engine/components/` only when it's generic and themed through tokens.
4. **`decks/shovelling-umbraco` is a real talk.** Don't change how it looks or behaves unless asked. Read its files for patterns (index below), but don't copy its Kraftvaerk styling into other decks.

## Scene rules (the ones that break most often)

- A scene root is `<div class="slide slide--<variant>">`, where the variants come from the deck's `theme.css`. The card is a fixed 1920×1080 px; never size it to the viewport.
- `steps` in deck.js must equal the highest build step the scene uses (`<Step :at="n">`, `:focus` / `:callouts` keys, or `step >=` checks). If it's too low, builds are unreachable. If it's too high, the scene needs dead clicks.
- Text sizes on the card: headlines 96–170px, body 40–50px, nothing below 26px. If it doesn't fit at 40px, there's too much text.
- Every scene id is kebab-case, unique, and has an entry in the deck's `notes.json` (2–5 short cue lines; `[PRESS]` marks a click).
- Entrance animations use `class="rise"` / `"fade-in"` with `style="--d: n"`, or scene CSS under `.is-active`, so they replay each time the scene comes on stage.
- Nested scenes: `at: nest(parentAt, { cx, cy, w })` from `@engine/layout.js` plus `parent: '<id>'`, where `cx`/`cy`/`w` describe a box in the parent's 1920×1080 space. The parent should draw something at that box.

## Pattern index: where to find a working example

Read the one file you need instead of searching. The files in `decks/shovelling-umbraco/scenes/` use that deck's theme classes, so keep the structure and swap the styling.

| Pattern | File |
|---|---|
| Minimal deck: theme, deck.js, notes, nesting | `decks/example/` |
| Code walkthrough: line/token focus, callouts | `decks/example/scenes/Walkthrough.vue`, `shovelling-umbraco/scenes/WhoAmI.vue` |
| Diagram: wires that draw themselves, flowing packets, nested scenes in its boxes | `shovelling-umbraco/scenes/Map.vue` + `scenes/map/geometry.js` |
| Big number counting, with a ring | `shovelling-umbraco/scenes/OneInstance.vue`; two stats with phases: `Numbers.vue` |
| Cards popping in on clicks | `shovelling-umbraco/scenes/WhatHappened.vue`, `DangerousBits.vue` |
| Typed snippet plus captions that replace each other (`<Step :until>`) | `shovelling-umbraco/scenes/OneLine.vue` |
| Screenshot with per-step highlights | `shovelling-umbraco/scenes/TheSection.vue` |
| Two tilted screenshots | `shovelling-umbraco/scenes/TwoOutfits.vue` |
| Live site next to a launch card | `shovelling-umbraco/scenes/LiveDemo.vue` |
| Ghost takeaway over the whole canvas | `shovelling-umbraco/scenes/ControlPlane.vue` (+ `ghost: true, at: null` in deck.js) |
| Looping SVG illustration | `shovelling-umbraco/components/ShovelLoop.vue`; a hand-drawn scribble: `scenes/TheAsk.vue` |

## Commands

```bash
npm install
npm run dev                         # default deck (package.json "canPresent.deck"), http://localhost:5173
DECK=example npm run dev            # another deck (bash)
npm run build                       # → dist/<deck>/
```

In PowerShell: `$env:DECK='example'; npm run dev`. If `node` isn't on PATH on this machine, load fnm first: `fnm env --shell powershell | Out-String | Invoke-Expression`.

Open a scene and build step directly with the URL hash: `http://localhost:5173/#<scene-id>/<step>`. `/notes` is the notes screen, `?presenter` the presenter view.

## Verifying a change

1. `npm run build` passes for every deck you touched (and for `DECK=example` if you touched the engine).
2. Look at what you changed in a browser at its hash, at its last build step, and in the overview (O). Check that text fits, nothing overflows the card, and the flight into the scene looks right.
3. If you changed the engine, the grep in rule 2 returns nothing, and `docs/presentation-guide.md` and `README.md` say what's new.
