# AGENTS.md

can-present is a Vue 3 + Vite engine for talks on an infinite canvas. Every scene is a 1920×1080 card placed on a big 2D surface, and the camera flies and zooms between them. The engine is in `engine/`; each talk is a folder under `decks/`.

## Start here: what are you doing?

| Task | Read | Skip |
|---|---|---|
| **Writing a talk** (story, scenes, `scene-description.md`) | the write-talk skill (`.agents/skills/write-talk/SKILL.md`), `docs/presentation-guide.md`, then the deck's `brief.md` | all code |
| **Building or editing a deck** | the build-deck skill (`.agents/skills/build-deck/SKILL.md`), `README.md` (deck.js fields, tokens, building blocks), `decks/example/` (a complete small deck) | `engine/` internals, `decks/shovelling-umbraco/` (see the pattern index below) |
| **Changing the engine** | `README.md`, the engine files you touch, `docs/presentation-guide.md` | other decks |

`docs/presentation-guide.md` is the canonical list of what a talk can do. It's written for a model that can't see the code (e.g. Claude chat), and it defines the `scene-description.md` format that a coding agent turns into a deck. If you're asked to make a deck from a topic and there's no scene description yet, follow the guide's process with the user first.

## Skills

Two skills hold the workflows. Claude Code finds them through `.claude/skills/` (stubs), Codex and Copilot read `.agents/skills/` directly. Without skill support, read the file yourself:

- **write-talk** (`.agents/skills/write-talk/SKILL.md`): shape a new or reworked talk with the speaker and write `brief.md` and `scene-description.md`.
- **build-deck** (`.agents/skills/build-deck/SKILL.md`): turn a scene description into a finished deck: scaffold, theme, scenes, layout, check, sheet, definition of done.

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
npm run deck -- dev [deck]          # dev server, http://localhost:5173 (deck defaults to package.json "canPresent.deck")
npm run deck -- dev example --port 5180   # extra args go to Vite (--port, --host, --open, --strictPort)
npm run deck -- lan [deck]          # dev server on the network
npm run deck -- build [deck]        # → dist/<deck>/
npm run deck -- preview [deck]      # serve the build
npm run check -- [deck]             # text lint: ids, steps vs builds, notes, overlaps, nesting, missing shots (--json too)
npm run new-deck -- <id> [--title "…"] [--icon 🎬] [--from scene-description.md]   # scaffold decks/<id> from templates/deck/
```

`npm run check` prints one line per finding (`ERROR  <scene-id>  <message>` / `WARN …`) and exits 1 on errors. Errors: duplicate or non-kebab ids, unknown `parent`, no `component`/`at`, builds that `steps` can't reach. Warnings: dead clicks, missing or empty notes, overlapping top-level cards, a nested card outside its parent, `/shots/…` or `/assets/…` files not in `public/` yet (a TODO for the speaker), a scene root without `class="slide"`. Build steps are inferred from literal `<Step :at>`/`:until`, `:focus`/`:callouts` keys and `step >= n` checks; scenes with non-literal ones are listed as "not inferred" for you to check by hand.

`new-deck --from` turns a scene description (format: `docs/presentation-guide.md`, example: `docs/examples/scene-description.example.md`) into stub scenes that already render and navigate: one `.vue` per scene with the description in a top comment, the slide variant, the title and one `<Step>` per build; `deck.js` on a default path; `notes.json`; the assets list in `brief.md`. It never overwrites a deck.

Open a scene and build step directly with the URL hash: `http://localhost:5173/#<scene-id>/<step>`. `/notes` is the notes screen, `?presenter` the presenter view.

**`?sheet`** (`http://localhost:5173/?sheet`) shows every scene in a grid at its last build step: the whole deck in one screenshot. `&steps` gives one tile per build step, `&only=id1,id2` limits it, `&cols=3` changes the grid. About 1.5 s after load it audits every tile for text under 26px, text outside the card and an overflowing `.slide`. Findings appear as a plain-text list at the top (`<scene-id>/<step>: <kind> "<text>" <size>px`, so `get_page_text` is enough), as red badges and outlines on the tiles, and in `window.__deckAudit`. Engine chrome that's small on purpose carries `data-audit="ignore"`.

The wrapper works the same in bash and PowerShell. The older form still works: `npm run dev` / `npm run build` with `DECK=example` (bash) or `$env:DECK='example'` (PowerShell) set first. If `node` isn't on PATH on this machine, load fnm first: `fnm env --shell powershell | Out-String | Invoke-Expression`.

## Verifying a change

1. `npm run deck -- build <deck>` passes for every deck you touched (and for `example` too if you touched the engine).
2. `npm run check -- <deck>` has no errors, and its warnings are fixed or explained. Then open `?sheet` (and `?sheet&steps&only=<id>` for scenes with builds) and read the audit list: fix or explain each finding. Only then take screenshots: the scene at its hash at its last build step, the flight into it, and the overview (O).
3. If you changed the engine, the grep in rule 2 returns nothing, and `docs/presentation-guide.md` and `README.md` say what's new.
