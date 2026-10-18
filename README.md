# can-present

A small Vue + Vite engine for talks on an infinite canvas: every scene is a 1920×1080 card placed somewhere on a big 2D surface, and the camera flies and zooms between them, Prezi style. Scenes can sit inside other scenes (the camera dives in), build up step by step, embed live websites, and come with a synced presenter view and a big-text notes screen.

The engine lives in `engine/` and knows nothing about any particular talk. Each talk is a folder under `decks/`.

```bash
npm install
npm run dev                      # default deck, http://localhost:5173
npm run deck -- dev example      # any deck (see "Choosing a deck")
```

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
  main.js                   entry: picks the deck view, /notes or ?presenter; sets title and favicon from the deck
  App.vue                   the canvas, camera, overview, progress bar
  Presenter.vue Notes.vue   ?presenter and /notes
  useDeck.js                shared state, keys, URL hash, sync between windows
  useStep.js Step.vue       build steps inside a scene
  useCount.js               animated numbers
  camera.js layout.js       camera maths; nest() and the ghost "covers the canvas" placement
  notes.js signals.js
  SceneFrame.vue ScenePreview.vue
  components/Code.vue Shot.vue
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
docs/
  presentation-guide.md     what the engine can do, for writing a talk with Claude chat
scripts/
  deck.mjs                  npm run deck: dev / lan / build / preview / check for any deck
  check.mjs                 npm run check: the deck lint
AGENTS.md                   rules and orientation for coding agents (CLAUDE.md points at it)
```

Scenes import engine pieces through `@engine/…` (e.g. `import Step from '@engine/Step.vue'`). The engine reaches the active deck only through `@deck/deck.js`.

## Make a new deck

1. Copy `decks/example` to `decks/<your-deck>`.
2. In `deck.js`, set `id`, `title` and `icon` (an emoji; it becomes the favicon).
3. Run it with `DECK=<your-deck>`, or make it the default in `package.json`.

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

## Building blocks

- `@engine/components/Shot.vue`: a screenshot in a browser or window frame. Put images in `decks/<deck>/public/shots/` and pass `src="/shots/x.png"`; with no `src` it shows a placeholder.
  `live="https://…"` embeds a real, clickable site instead (`zoom` < 1 shows more of the page). It loads when its scene is on stage or one away. While you're clicking in the site, keys go to the site; move the mouse off the frame and the deck keys work again. The site must allow framing (no `X-Frame-Options` / `frame-ancestors`); for sites that don't, `external` shows a launch card that opens it in a reused new tab.
- `@engine/components/Code.vue`: code with simple highlighting, per-step line focus (`:focus="{ 1: [3], 2: { lines: [5], token: 'foo' } }"`) and per-step callouts.
- `@engine/useCount.js`: an animated number that re-runs whenever its scene comes on stage.
- `docs/presentation-guide.md` plus the deck's `brief.md`: hand both to Claude chat when writing a talk; it produces a `scene-description.md` for the coding agent.

## Speaker notes and sync

Notes live in `decks/<deck>/notes.json`, keyed by scene id. Open **`/notes`** (e.g. http://localhost:5173/notes) on your laptop screen, in another tab or window, or on another device. It shows the current scene's notes white on black, scaled to fill the window, plus the scene number, the next scene and the clock. Notes are per scene, not per build step.

To edit, press **E** (or ✎ Edit) on `/notes` while running `npm run dev`: the notes for the current scene become a text box and save to `notes.json` as you type. Saving never reloads the deck, and every open window gets the new text straight away. Editing only works from the presenting machine itself. Production builds include the notes read-only.

`/notes` and `?presenter` follow the deck in both directions, so arrow keys or the clicker on them move the deck too:
- **Same browser:** BroadcastChannel. This also works in the built version.
- **Other device (phone or tablet):** the dev server relays messages over its websocket. Run `npm run dev:lan` so other devices can reach it, then open `http://<laptop-ip>:5173/notes`. This only works with the dev server, and it exposes the dev server on the network, so use it on a network you trust.
