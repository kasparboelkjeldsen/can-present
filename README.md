# can-present

A small Vue + Vite engine for talks on an infinite canvas: every scene is a 1920×1080 card placed somewhere on a big 2D surface, and the camera flies and zooms between them, Prezi style. Scenes can sit inside other scenes (the camera dives in), build up step by step, embed live websites, and come with a synced presenter view and a big-text notes screen.

The engine lives in `engine/` and knows nothing about any particular talk. Each talk is a folder under `decks/`.

```bash
npm install
npm run dev                      # default deck, http://localhost:5173
npm run deck -- dev example      # any deck (see "Choosing a deck")
npm run check -- example         # lint a deck (see "Checking a deck")
npm run new-deck -- my-talk      # start a new deck (see "Make a new deck")
```

http://localhost:5173/?sheet shows the whole deck on one page with a text-size audit (see "The sheet").

## Keys

| Key | |
|---|---|
| → / ↓ / Space / PageDown / Enter | next step or scene |
| ← / ↑ / PageUp / Backspace | back |
| O or 0 | overview (click a scene to jump to it) |
| P | presenter window (synced: current and next scene, notes, timer) |
| F | fullscreen |
| B or . | blackout |
| X | jump to the fallback scene (`skip: true`, stepped over in normal navigation) |
| R | reset: every window back to the first scene, blackout off, live sites reloaded, presenter timer zeroed. Also a ↺ Reset button (deck: top-right while the mouse moves; /notes: header; presenter: controls) |
| Home / End | first / last |

The URL hash (`#map/2` = scene `map`, build step 2) keeps your place across reloads.

## Choosing a deck

The default deck is set in `package.json`:

```json
"canPresent": { "deck": "shovelling-umbraco" }
```

Pick another deck with the `deck` wrapper (same syntax in every shell):

```bash
npm run deck -- dev [deck]        # dev server
npm run deck -- lan [deck]        # dev server on the network (--host)
npm run deck -- build [deck]      # → dist/<deck>/
npm run deck -- preview [deck]    # serve the build
npm run deck -- check [deck]      # lint it (see "Checking a deck")
```

`[deck]` defaults to `canPresent.deck`. Options after the deck name go to Vite for `dev`, `lan` and `preview`: `--port 5180`, `--host [address]`, `--open`, `--strictPort`. `scripts/deck.mjs` drives Vite's JavaScript API with the normal `vite.config.js`.

Or override it for one command with the `DECK` environment variable:

```powershell
$env:DECK='example'; npm run dev      # PowerShell (stays set for that window; Remove-Item Env:DECK to clear)
```

```bash
DECK=example npm run dev              # bash
```

The same works for `npm run build` (output goes to `dist/<deck>/`), `npm run preview` and `npm run dev:lan`. An unknown deck name fails with the list of folders in `decks/`.

## Layout

```
engine/                     the engine (talk-agnostic)
  main.js                   entry: picks the deck view, /notes, ?sheet or ?presenter; sets title and favicon from the deck
  App.vue                   the canvas, camera, overview, progress bar
  Presenter.vue Notes.vue   ?presenter and /notes
  Sheet.vue                 ?sheet: every scene in a grid, with the text-size/overflow audit
  useDeck.js                shared state, keys, URL hash, sync between windows
  useStep.js Step.vue       build steps inside a scene
  useCount.js               animated numbers
  camera.js layout.js       camera maths; nest() and the ghost "covers the canvas" placement
  notes.js signals.js
  SceneFrame.vue ScenePreview.vue
  components/Code.vue Shot.vue BigNumber.vue
  styles/engine.css         base styles, <Step> and .rise/.fade-in animations, engine tokens with defaults
  vite.js                   deck selection and the dev-server plugins (used by vite.config.js)
decks/
  shovelling-umbraco/       Umbraco Meetup, 22 Oct 2026
    deck.js                 export default { id, title, icon, scenes }
    theme.css               palette, fonts, slide primitives, engine token values
    notes.json              speaker notes, keyed by scene id
    brief.md                the talk, for Claude chat (with docs/presentation-guide.md)
    scenes/ components/
    public/                 served at / (shots/, assets/)
  example/                  a four-scene starter deck
templates/
  deck/                     what npm run new-deck copies (not a deck itself)
docs/
  presentation-guide.md     what the engine can do, for writing a talk with Claude chat
  examples/                 scene-description.example.md: the format, and new-deck's test fixture
scripts/
  deck.mjs                  npm run deck: dev / lan / build / preview / check for any deck
  check.mjs                 npm run check: the deck lint
  new-deck.mjs              npm run new-deck: scaffold a deck, optionally from a scene description
AGENTS.md                   rules and orientation for coding agents (CLAUDE.md points at it)
.agents/skills/             agent skills: write-talk, build-deck (.claude/skills/ has stubs pointing here)
```

Scenes import engine pieces through `@engine/…` (e.g. `import Step from '@engine/Step.vue'`). The engine reaches the active deck only through `@deck/deck.js`.

## Make a new deck

```bash
npm run new-deck -- <id> [--title "…"] [--icon 🎬] [--from path/to/scene-description.md]
```

This copies `templates/deck/` to `decks/<id>/` and fills in the id, title and icon. It never overwrites an existing deck. The template has `deck.js`, a neutral `theme.css` (every engine token set, `slide--dark` / `slide--light` / `slide--accent`, `.kicker`, `.h1`, `.h2`, `.lead`, `.accent`, `.callout`, `.callout--green`, `.card`, `.fineprint`), `notes.json`, a `brief.md` with `TODO:`s, `scenes/Title.vue` and `public/shots/`.

With `--from`, it reads a scene description in the format of `docs/presentation-guide.md` (example: `docs/examples/scene-description.example.md`) and scaffolds the whole deck:

- one scene file per scene (`the-check` → `scenes/TheCheck.vue`) with On screen, Animation, Builds and Position copied into a top comment, the slide variant from **Background** (anything that isn't dark, light or accent becomes `slide--dark` with a TODO), the title as the `.h2`, and one `<Step :at="n">` per numbered build;
- `deck.js` entries with `steps`, laid out left to right 2300px apart (a scene whose Position says "inside …" gets a `// TODO: nest inside …` comment);
- `notes.json` from the **Notes** bullets, the "Assets needed" list in `brief.md`, and a copy of the description at `decks/<id>/scene-description.md`.

Then run it with `npm run deck -- dev <id>`, or make it the default in `package.json`. You can also copy `decks/example` by hand.

`deck.js` imports the deck's own CSS and fonts. `theme.css` defines the look of a `.slide` and sets the engine tokens (all optional, defaults in `engine/styles/engine.css`):

| Token | Used for |
|---|---|
| `--deck-canvas` | canvas behind the scenes, page background |
| `--deck-grid` | dot grid on the canvas |
| `--deck-ink` | dark UI: default text, reset button, window frames, launch cards, code callout text |
| `--deck-paper` | light UI: text on ink buttons, code callout background |
| `--deck-accent` / `--deck-on-accent` | highlights (overview labels, key hints, timer, progress start, live-site ring, code keywords) and text on them |
| `--deck-accent-2` | progress bar end, error text on /notes, wavy underline on a focused code token |
| `--code-bg` / `--code-line-hot` | `<Code>` background and focused-line background |
| `--sans` `--serif` `--mono` `--ease-out` `--ease-spring` `--radius` | type and motion |
| `--display-font` | font of `<BigNumber>`'s number (optional; unset, it inherits the slide's font) |

`<Code>` callouts also use the deck's `.callout` class for their shape (and `.callout--green` for `tone: 'green'`), so define those in your theme.

## Adding a scene

1. Create `decks/<deck>/scenes/Thing.vue` with a `.slide` root (the slide variants come from the deck's theme). The canvas is a fixed 1920×1080.
2. Register it in the deck's `deck.js` with an `id`, `title`, `steps` and `at: { x, y, r, s }` (its centre on the canvas, rotation in degrees, scale).
   - Nest a scene inside another with `at: nest(parentAt, { cx, cy, w })` (from `@engine/layout.js`) and `parent: '<id>'`. `revealAt` makes it wait for a build step of the parent; `revealDelay` (ms) delays its fade-in.
   - `skip: true` steps over it in normal navigation (X or `#id` still reaches it).
   - `ghost: true` with `at: null` hovers over the whole canvas and only shows while on stage.
3. For builds, use `<Step :at="n" anim="up|down|left|right|pop|blur|fade|dim">`, or `useStep()` for custom logic.
   Add `class="rise"` (plus `style="--d: n"` to stagger) or `fade-in` for entrance animations that replay each time the scene comes on stage, or hook `.is-active` in scene CSS.

## Checking a deck

```bash
npm run check -- [deck]           # or: npm run deck -- check [deck]
npm run -s check -- [deck] --json # the same findings as JSON
```

A text lint that loads `deck.js` through Vite, the way the app does, and reads each scene's source. It prints `ERROR  <scene-id>  <message>` or `WARN …` lines and a summary, and exits 1 if there are errors.

- **Errors:** duplicate ids, ids that aren't kebab-case, a `parent` that doesn't exist, a scene without `component` or `at` (a ghost may use `at: null`), build steps used beyond `steps` (unreachable).
- **Warnings:** fewer build steps used than `steps` (dead clicks), scenes without notes (or empty ones), `notes.json` keys with no scene, top-level cards that overlap on the canvas, a nested card that isn't inside its parent, `/shots/…` and `/assets/…` paths that don't exist in `public/` yet (the speaker's TODO list), a scene root without class `slide`.

Build steps are inferred from literal `<Step :at="n">` / `:until="n"`, the numeric keys of literal `:focus` / `:callouts` objects, and `step >= n`, `step > n`, `step === n`. If a scene uses anything non-literal (e.g. `:at="i"`), its steps are listed as "not inferred" and not checked.

## The sheet: the whole deck on one page

Open **`?sheet`** (e.g. http://localhost:5173/?sheet) to see every scene in a grid, in deck order, each at its last build step (a scene without builds shows its finished state, as in the overview). Live sites stay placeholders. Under each tile: number, id, title, `steps` and flags (`skip`, `ghost`, `in <parent>`). Click a tile to open that scene.

| Query | |
|---|---|
| `?sheet&cols=3` | number of columns (default 4) |
| `?sheet&steps` | one tile per build step (0…steps), for checking builds |
| `?sheet&only=id1,id2` | just these scenes |

About 1.5 s after it loads, the sheet audits every tile: text smaller than 26px, text that sticks out of the 1920×1080 card, and a `.slide` whose content overflows. Each tile gets a red badge with its count and outlines around the offenders; the full list is plain text at the top of the page (`<scene-id>/<step>: <kind> "<text>" <size>px`), in `window.__deckAudit` and in the console. Anything inside `data-audit="ignore"` is skipped; the engine uses it for small chrome such as `<Shot>`'s URL bar and `<Code>`'s title bar.

## Building blocks

- `@engine/components/Shot.vue`: a screenshot in a browser or window frame. Put images in `decks/<deck>/public/shots/` and pass `src="/shots/x.png"`; with no `src` it shows a placeholder.
  `live="https://…"` embeds a real, clickable site instead (`zoom` < 1 shows more of the page). It loads when its scene is on stage or one away. While you're clicking in the site, keys go to the site; move the mouse off the frame and the deck keys work again. The site must allow framing (no `X-Frame-Options` / `frame-ancestors`); for sites that don't, `external` shows a launch card that opens it in a reused new tab.
- `@engine/components/Code.vue`: code with simple highlighting, per-step line focus (`:focus="{ 1: [3], 2: { lines: [5], token: 'foo' } }"`) and per-step callouts.
- `@engine/components/BigNumber.vue`: a huge number that counts, optionally inside a ring that draws itself in sync.

  ```vue
  <BigNumber :to="6836" ring label="loads" />
  <BigNumber :from="10" :to="1" :size="330" :at="1" tone="accent-2" suffix="×" />
  ```

  | Prop | Default | |
  |---|---|---|
  | `to` | (required) | the final value |
  | `from` | `0` | where the count starts |
  | `at` | `0` | build step that starts the count; `0` = when the scene comes on stage. Before it, the number shows `from` |
  | `duration` / `delay` | `1400` / `300` | ms |
  | `ring` | `false` | a circle around the number and label, drawn in sync with the count. With a ring the component is a square as big as the ring |
  | `tone` | `'accent'` | ring colour: `'accent'` (`--deck-accent`) or `'accent-2'` (`--deck-accent-2`) |
  | `format` | `'grouped'` | `'grouped'` (6,836, `Intl.NumberFormat('en-US')`), `'plain'` (6836) or a function `(n) => string` |
  | `decimals` | `0` | digits after the point, while counting too |
  | `prefix` / `suffix` | `''` | e.g. `prefix="$"`, `suffix="%"` |
  | `label` | `''` | line under the number (or a `#label` slot); inherits the text colour |
  | `size` | `240` | font size of the number, px |

  It re-counts every time its scene comes on stage, and shows the final value when the scene is past, in the overview and in thumbnails. The number uses `var(--display-font, inherit)` with tabular numerals. Its parts have zero-specificity classes (`.big-number`, `.bn-num`, `.bn-label`, `.bn-ring`), so a theme can restyle them.
- `@engine/useCount.js`: `useCount(trigger, from, to, { duration, delay, decimals })` returns a ref with an animated number that re-runs whenever `trigger` (a ref or getter, e.g. the scene's `active`) becomes true. `useCounter(…)` takes the same arguments and returns `{ value, progress }`, with `progress` the eased 0…1 of the run (what `<BigNumber>`'s ring follows).
- `docs/presentation-guide.md` plus the deck's `brief.md`: hand both to Claude chat when writing a talk; it produces a `scene-description.md` for the coding agent.

## Speaker notes and sync

Notes live in `decks/<deck>/notes.json`, keyed by scene id. Open **`/notes`** (e.g. http://localhost:5173/notes) on your laptop screen, in another tab or window, or on another device. It shows the current scene's notes white on black, scaled to fill the window, plus the scene number, the next scene and the clock. Notes are per scene, not per build step.

To edit, press **E** (or ✎ Edit) on `/notes` while running `npm run dev`: the notes for the current scene become a text box and save to `notes.json` as you type. Saving never reloads the deck, and every open window gets the new text straight away. Editing only works from the presenting machine itself. Production builds include the notes read-only.

`/notes` and `?presenter` follow the deck in both directions, so arrow keys or the clicker on them move the deck too:
- **Same browser:** BroadcastChannel. This also works in the built version.
- **Other device (phone or tablet):** the dev server relays messages over its websocket. Run `npm run dev:lan` so other devices can reach it, then open `http://<laptop-ip>:5173/notes`. This only works with the dev server, and it exposes the dev server on the network, so use it on a network you trust.
