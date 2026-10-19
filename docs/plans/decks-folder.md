# Plan: split the engine from the talk (`decks/` folder)

Branch: `decks-folder`. Goal: the engine lives in one place and knows nothing about any particular talk; each talk is a folder under `decks/`. The Thursday talk (22 Oct 2026) moves to `decks/shovelling-umbraco/` and must **look and behave exactly as it does on `main`**: same scenes, same positions, same colours and fonts, same keys, same URL hashes, same notes.

## Target layout

```
engine/
  main.js                 ← was src/main.js (picks App / Presenter / Notes)
  App.vue Presenter.vue Notes.vue
  camera.js useDeck.js useStep.js useCount.js signals.js notes.js
  Step.vue SceneFrame.vue ScenePreview.vue
  layout.js               ← nest() (from scenes/map/geometry.js) + the "ghost covers the canvas" bounds maths (from deck.js)
  components/Shot.vue Code.vue      ← generic building blocks
  styles/engine.css       ← base html/body, <Step> build anims, .rise/.fade-in, engine chrome tokens + defaults
  vite.js                 ← the deck-sync and deck-notes plugins + deck resolution, exported for vite.config.js
decks/
  shovelling-umbraco/
    deck.js               ← export default { id, title, icon, scenes }
    theme.css             ← Kraftvaerk palette, fonts (@fontsource imports move here or into deck.js), .slide primitives, kicker, wordmark, callout, card…
    notes.json
    brief.md              ← the talk-specific half of presentation-guide.md
    scenes/…              ← all current scenes, incl. scenes/map/geometry.js (NODES, SLOTS, REVEAL_MS; imports nest from @engine/layout.js)
    components/           ← UmbracoMark, WordPressMark, Shovel, ShovelLoop, DsaLogo, DiagonalLine
    public/assets/ public/shots/   ← moved from public/
  example/                ← tiny second deck (3–4 scenes, own minimal theme) proving the engine is talk-agnostic
docs/
  presentation-guide.md   ← generic half: what the engine can do, toolbox, scene-description.md format
index.html  vite.config.js  package.json  README.md
```

Use `git mv` for every move so history follows the files.

## Deck selection

- `vite.config.js` resolves the active deck: `process.env.DECK`, else `"canPresent": { "deck": "shovelling-umbraco" }` in package.json. Fail with a clear message listing `decks/*` if the folder doesn't exist.
- Aliases: `@engine` → `engine/`, `@deck` → `decks/<active>/`. Engine code imports the deck only through `@deck/deck.js`; scenes import engine pieces through `@engine/...`.
- `publicDir` → `decks/<active>/public`. `build.outDir` → `dist/<active>`.
- Notes file → `decks/<active>/notes.json` (both the dev middleware and the `generateBundle` copy). Keep the `watch.ignored` rule pointing at it so saving notes never hot-reloads the deck.
- Add npm scripts that work on Windows PowerShell without cross-env: keep `dev`, `dev:lan`, `build`, `preview` using the default deck; document `$env:DECK='example'; npm run dev` (PowerShell) and `DECK=example npm run dev` (bash) in the README. Do not add dependencies.

## Engine must be talk-agnostic

After the change, inside `engine/`:
- no `--k-*` CSS variables, no Kraftvaerk/Umbraco/WordPress/DSA/shovel names (the BroadcastChannel `'shovel-deck'` becomes `` `can-present:${deck.id}` ``, the presenter window name likewise);
- no imports from `decks/` except via the `@deck` alias, and only `@deck/deck.js`.

Chrome colours (App.vue progress bar, reset button, hint, overview labels/outline, canvas background and dot grid; Presenter.vue; Notes.vue; Code.vue; Shot.vue) move to engine tokens with neutral defaults in `engine/styles/engine.css`, e.g. `--deck-canvas`, `--deck-accent`, `--deck-on-accent`, `--deck-ink`, `--deck-progress-end`, `--code-bg`, plus `--sans`/`--mono`/`--ease-out`/`--ease-spring`/`--radius` defaults. Pick names that make sense; keep the set small. `decks/shovelling-umbraco/theme.css` sets them to the current Kraftvaerk values so the talk renders identically. Read every engine file's CSS for hard-coded colours, not just `var(--k-…)`.

Deck config (`export default { id, title, icon, scenes }`): `main.js` sets `document.title` (before Presenter/Notes prefix it) and the favicon from `icon` (an emoji, same data-URL SVG trick as today). `index.html` becomes generic.

Move the ghost-bounds IIFE out of deck.js into the engine (e.g. useDeck normalises scenes on load: any `ghost` scene with `at: null` gets the covering placement). Move `nest()` into `engine/layout.js`; the talk's geometry.js keeps NODES/SLOTS/REVEAL_MS and imports `nest`.

Fix while there: the `nestedVisible` doc comment mentions `revealAt` but deck.js uses `revealDelay` (both are real features; make the comment describe both accurately).

## Docs

- `README.md`: what can-present is, run it, keys, choosing a deck, the layout above, "make a new deck" (copy `decks/example`), adding a scene, building blocks, notes/sync. Drop talk-specific wording; correct the stale bits (notes live in `decks/<deck>/notes.json` and are edited on /notes, not in deck.js).
- `docs/presentation-guide.md`: the generic part of today's guide (what the deck is, toolbox, build anims, canvas layout vocabulary, output format, rules). Where it said talk details, tell Claude chat to read the deck's `brief.md` alongside it.
- `decks/shovelling-umbraco/brief.md`: the talk section, how to work with Kaspar, and **visual language corrected to what `theme.css` actually uses** (Kraftvaerk palette: dark #3d3d3f, sand, grey, red, green with its rules; Libre Caslon Text headlines, DM Sans body, JetBrains Mono code; slide variants dark/sand/grey/red). Drop the "existing demo scenes" table; replace with the real scene list (id + title) from deck.js.

## Out of scope

No visual or content changes to the talk, no new engine features, no npm package/template extraction, no dependency upgrades, no push.

## Done when

1. `npm run build` succeeds for the default deck and with `DECK=example`.
2. `grep -rniE "k-(dark|green|red|sand|grey|light)|kraftvaerk|umbraco|wordpress|dsa|shovel" engine/` returns nothing (README/docs excluded).
3. The dev server serves the talk with the same hashes (`#map/0`, `#the-policy/3` …), /notes loads and edits `decks/shovelling-umbraco/notes.json`, `?presenter` works.
4. Small, reviewable commits on `decks-folder` (moves first, then rewiring, then docs), each building.
