# can-present

A small Vue + Vite engine for talks on an infinite canvas: every scene is a 1920×1080 card placed somewhere on a big 2D surface, and the camera flies and zooms between them, Prezi style. Scenes can sit inside other scenes (the camera dives in), build up step by step, embed live websites, and come with a synced presenter view and a big-text notes screen.

**Live demo: [kasparboelkjeldsen.github.io/can-present](https://kasparboelkjeldsen.github.io/can-present/)**, the example deck (`decks/example`), rebuilt on every push to `main`. Press → to move on, O for the overview; the speaker notes are at [`/notes`](https://kasparboelkjeldsen.github.io/can-present/notes/) and the whole deck on one page at [`?sheet`](https://kasparboelkjeldsen.github.io/can-present/?sheet).

The engine lives in `engine/` and knows nothing about any particular talk. Each talk is a folder under `decks/`.

```bash
npm install
npm run dev                      # default deck, http://localhost:5173
npm run deck -- dev example      # any deck (see "Choosing a deck")
npm run check -- example         # lint a deck (see "Checking a deck")
npm run compile -- example       # the whole deck in one HTML file (see "One file")
npm run new-deck -- my-talk      # start a new deck (see "Make a new deck")
npm run import-pptx -- talk.pptx # read a PowerPoint into a draft deck (see "From a PowerPoint")
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
npm run deck -- build [deck]      # → dist/<deck>/  (--base <name>: for a subpath, see "Hosting a build")
npm run deck -- preview [deck]    # serve the build (same --base as the build)
npm run deck -- compile [deck]    # → dist/<deck>.html, one self-contained file (see "One file")
npm run deck -- check [deck]      # lint it (see "Checking a deck")
```

`[deck]` defaults to `canPresent.deck`. Options after the deck name go to Vite for `dev`, `lan` and `preview`: `--port 5180`, `--host [address]`, `--open`, `--strictPort`. `scripts/deck.mjs` drives Vite's JavaScript API with the normal `vite.config.js`.

**A deck's own Vite config.** If `decks/<deck>/vite.config.js` exists, its default export (a plain Vite config object) is merged over the base config with Vite's `mergeConfig`. Use it for things only that talk needs, e.g. a dev-server proxy that puts a demo site on the deck's own origin so it can run in a same-origin iframe:

```js
// decks/<deck>/vite.config.js
export default {
  server: { proxy: { '/umbraco': { target: 'https://localhost:44343', secure: false, ws: true } } },
}
```

A proxy only exists under `npm run deck -- dev`; builds and `compile` don't have one.

It may also list `customElements`: tag prefixes of web components the deck's templates use (e.g. a design system's, `customElements: ['uui-']`). Vue then leaves those tags alone instead of looking for a Vue component of that name. The field is taken out before the merge; the deck imports and registers the components itself.

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
  camera.js layout.js       camera maths; nest(), the ghost "covers the canvas" placement and the outer layers' placeOuter()
  ride.js RidePill.vue      `via` rides: a flight that follows a path with a pill at the centre of the screen
  cameraState.js frames.js  the shared camera (a scene's `zoom`); `frames`: per build step, the camera shows a box of the card
  formation.js              `formation`: while a scene is on stage, the other cards leave their places and gather round it
  hand.js                   `hand`: the flight into a scene folds the deck into a hand of cards and draws that one out
  flip.js                   `back` / `flip`: a scene on the back of a card, which turns over to show it
  notes.js signals.js asset.js   asset(): public-folder paths with the build's base (subpath hosting), or inlined in one-file builds
  SceneFrame.vue ScenePreview.vue
  components/Code.vue Shot.vue BigNumber.vue Diagram.vue Detail.vue QrCode.vue
  diagram.js                defineDiagram(): a <Diagram>'s nodes, edges, packets and slots, shared with deck.js; ride()
  styles/engine.css         base styles, <Step> and .rise/.fade-in animations, engine tokens with defaults
  vite.js                   deck selection, the dev-server plugins and notes/index.html in builds (used by vite.config.js)
.github/workflows/pages.yml the example deck on GitHub Pages (see "Hosting a build")
decks/
  shovelling-umbraco/       Umbraco Meetup, 22 Oct 2026
    deck.js                 export default { id, title, icon, scenes }
    theme.css               palette, fonts, slide primitives, engine token values
    notes.json              speaker notes, keyed by scene id
    brief.md                the talk, for Claude chat (with docs/presentation-guide.md)
    scenes/ components/
    public/                 served at / (shots/, assets/)
  example/                  the kitchen sink: one scene per building block, as a mini-talk
brands/
  kraftvaerk/               a brand kit: theme, fonts, logo, components; decks import '@brands/kraftvaerk' (see "Brand kits")
templates/
  deck/                     what npm run new-deck copies (not a deck itself)
imports/                    npm run import-pptx output (gitignored: client material)
docs/
  presentation-guide.md     what the engine can do, for writing a talk with Claude chat
  examples/                 scene-description.example.md: the format, and new-deck's test fixture
scripts/
  deck.mjs                  npm run deck: dev / lan / build / preview / compile / check for any deck
  compile.mjs               npm run compile: a deck as one self-contained HTML file
  check.mjs                 npm run check: the deck lint
  new-deck.mjs              npm run new-deck: scaffold a deck, optionally from a scene description and on a brand kit
  import-pptx.mjs           npm run import-pptx: a .pptx → renders, slides.md, media, a draft scene description
AGENTS.md                   rules and orientation for coding agents (CLAUDE.md points at it)
.agents/skills/             agent skills: write-talk, build-deck (.claude/skills/ has stubs pointing here)
```

Scenes import engine pieces through `@engine/…` (e.g. `import Step from '@engine/Step.vue'`) and brand kits through `@brands/…`. The engine reaches the active deck only through `@deck/deck.js`.

## Make a new deck

```bash
npm run new-deck -- <id> [--title "…"] [--icon 🎬] [--from path/to/scene-description.md] [--brand <name>]
```

This copies `templates/deck/` to `decks/<id>/` and fills in the id, title and icon. It never overwrites an existing deck. The template has `deck.js`, a neutral `theme.css` (every engine token set, `slide--dark` / `slide--light` / `slide--accent`, `.kicker`, `.h1`, `.h2`, `.lead`, `.accent`, `.callout`, `.callout--green`, `.card`, `.fineprint`), `notes.json`, a `brief.md` with `TODO:`s, `scenes/Title.vue` and `public/shots/`.

With `--from`, it reads a scene description in the format of `docs/presentation-guide.md` (example: `docs/examples/scene-description.example.md`) and scaffolds the whole deck:

- one scene file per scene (`the-check` → `scenes/TheCheck.vue`) with On screen, Animation, Builds and Position copied into a top comment, the slide variant from **Background** (anything that isn't dark, light or accent becomes `slide--dark` with a TODO), the title as the `.h2`, and one `<Step :at="n">` per numbered build;
- `deck.js` entries with `steps`, laid out left to right 2300px apart (a scene whose Position says "inside …" gets a `// TODO: nest inside …` comment);
- `notes.json` from the **Notes** bullets, the "Assets needed" list in `brief.md`, and a copy of the description at `decks/<id>/scene-description.md`.

With `--brand <name>`, the deck is built on `brands/<name>/` (see "Brand kits"): `deck.js` imports `'@brands/<name>'` before its own `theme.css`, which starts empty, the stub scenes use the brand's slide variants (`brand.json` maps dark / light / accent to them, e.g. `slide--sand` for light), and `brief.md` points at the brand's README for the visual language.

Then run it with `npm run deck -- dev <id>`, or make it the default in `package.json`. You can also copy `decks/example` by hand: it has one small, commented scene per building block (cards, big number, code, diagram with a nested scene and rides along its wires, screenshots, live site, looping SVG, a "powers of ten" zoom, a card that turns over to show its back, a QR code, ghost takeaway, fallback, a finale where the deck rearranges itself, and two outer layers where the talk turns out to be the dot on an i), so it's also the place to copy a scene from.

`deck.js` imports the deck's own CSS and fonts. `theme.css` defines the look of a `.slide` and sets the engine tokens (all optional, defaults in `engine/styles/engine.css`):

| Token | Used for |
|---|---|
| `--deck-canvas` | canvas behind the scenes, page background |
| `--deck-grid` | dot grid on the canvas |
| `--deck-ink` | dark UI: default text, reset button, window frames, launch cards, code callout text |
| `--deck-paper` | light UI: text on ink buttons, code callout background |
| `--deck-accent` / `--deck-on-accent` | highlights (overview labels, key hints, timer, progress start, live-site ring, code keywords) and text on them |
| `--deck-accent-2` | progress bar end, error text on /notes, and the wavy underline on a focused code token unless `--code-mark` is set |
| `--code-bg` / `--code-line-hot` | `<Code>` background and focused-line background |
| `--code-mark` | optional: the wavy underline on a focused code token (default `--deck-accent-2`); match it to your `callout--green` so it doesn't read as a lint error |
| `--sans` `--serif` `--mono` `--ease-out` `--ease-spring` `--radius` | type and motion |
| `--display-font` | font of `<BigNumber>`'s number (optional; unset, it inherits the slide's font) |

`<Code>` callouts also use the deck's `.callout` class for their shape (and `.callout--green` for `tone: 'green'`), so define those in your theme.

## Brand kits

A brand kit is a company's look, shared by every deck that uses it, in `brands/<name>/`:

| File | |
|---|---|
| `index.js` | what `import '@brands/<name>'` loads: the fonts (`@fontsource`) and `theme.css`; may export asset URLs (e.g. `logoBlack`) |
| `theme.css` | palette, every engine token, `.slide` and its variants, the slide primitives (`.kicker`, `.h1`, `.h2`, `.lead`, `.card`, `.callout`, …), the logo on every card |
| `brand.json` | `{ "name", "variants": { "dark", "light", "accent" } }`: which slide variants `new-deck --brand` uses for those backgrounds |
| `assets/`, `components/` | logos and brand components, imported as `@brands/<name>/components/X.vue` (assets through relative `url()`s in the CSS, so they're bundled and work in `compile`) |
| `README.md` | the palette, the rules (which colour on which background) and the components |

A deck on a kit imports it in `deck.js` (`import '@brands/kraftvaerk'`, then `import './theme.css'` for its own additions). `check` follows a scene whose root is a brand component (e.g. `<SectionOpener>`) for the `slide` class. The kit lives outside `engine/`, so the engine stays talk-agnostic. Kits so far: `kraftvaerk` (palette, Libre Caslon Text / DM Sans, the logo bottom-left on every card, `DiagonalLine`, `SectionOpener`).

## From a PowerPoint: `npm run import-pptx`

```bash
npm run import-pptx -- talk.pptx [--out <dir>] [--deck <id> [--brand <name>] [--title "…"]] [--renderer html|powerpoint] [--no-render]
```

Reads a `.pptx` (a zip of XML: `jszip`, `fast-xml-parser`, `sharp`; no Python, no LibreOffice, no Office) and writes `imports/<name>/` (gitignored, since decks converted from slides are usually client material):

- `slides.html`: every slide drawn as HTML by [PPTX2HTML](https://github.com/g21589/PPTX2HTML) (MIT; layouts and masters, gradients, crops, embedded fonts, charts, SmartArt). Open it in a browser.
- `renders/NN.png` and `renders/contact.png`: every slide as a 1920×1080 picture, and all of them in one grid. By default (`--renderer html`) these are `slides.html` photographed by `playwright-core` in the Chrome or Edge installed on the machine (any OS; without either, `npx playwright-core install chromium`). `slides.md` names the renderer and lists what PPTX2HTML approximated or skipped. `--renderer powerpoint` exports them from PowerPoint itself instead (Windows with Office, through PowerShell; it never closes a PowerPoint window you have open). `--no-render` skips both and reuses an earlier run's renders.
- **PPTX2HTML is pinned to an exact commit** (`devDependencies` in `package.json`; it isn't on npm under its own name, and npm's `pptx2html` is an unrelated old fork). Update it deliberately: change the commit, re-run an import you know (renders and `slides.html` side by side with `--renderer powerpoint`), and look before committing.
- `slides.md`, read this first: per slide its title (the title placeholder, else the biggest text), the layout name, text in reading order with levels, bullets and **bold**, tables as tables, chart data, SmartArt text, images with file, size, alt text and position (% of the slide), speaker notes, and flags: *picture* (one big image and almost no text: a picture of a slide, rebuild it from the render), *empty*, *hidden*, click animations, charts. At the top: the pptx theme's colours and fonts, and the colours the slides set themselves, most used first (the real palette when the theme is Office's default).
- `slides.json`: the same, as data.
- `media/sNN-<alt text>.png|jpg|svg`: every picture, cropped the way the slide crops it, transparent margins trimmed, gif/tiff converted, big opaque images as jpg, at most 2400px.
- `theme.json` / `theme.css`: the theme as suggested tokens.
- `scene-description.md`: a draft in the guide's format, one scene per slide (id and title from the slide title, background guessed from the render, On screen with every text, table, chart and image path, notes from the speaker notes).

With `--deck <id>` it goes on to run `new-deck <id> --from` that draft (with `--brand` and `--title` passed on) and copies the media to `decks/<id>/public/assets/pptx/`, so the stub deck renders straight away. The draft is a starting point, not a design: merge, split and reorder slides, and rebuild each scene from its render (the build-deck skill's "From a PowerPoint" section).

## Adding a scene

1. Create `decks/<deck>/scenes/Thing.vue` with a `.slide` root (the slide variants come from the deck's theme). The canvas is a fixed 1920×1080.
2. Register it in the deck's `deck.js` with an `id`, `title`, `steps` and `at: { x, y, r, s }` (its centre on the canvas, rotation in degrees, scale).
   - Nest a scene inside another with `at: nest(parentAt, { cx, cy, w })` (from `@engine/layout.js`) and `parent: '<id>'`. `revealAt` makes it wait for a build step of the parent; `revealDelay` (ms) delays its fade-in.
   - `skip: true` steps over it in normal navigation (X or `#id` still reaches it).
   - `ghost: true` with `at: null` hovers over the whole canvas and only shows while on stage.
   - `via` makes the flight into the scene ride a path, usually a diagram edge (see **Rides** under "Building blocks").
   - `frames` moves the camera within the scene on its build steps: `{ 2: { cx, cy, w } }` frames that box of the card on step 2 (see **Zoom into detail** under "Building blocks").
   - `onlyOnStage: true`: the card only shows while it's the scene on stage (not in the overview), so it may share its spot with another card (`check` doesn't flag the overlap; formations leave it out). E.g. a closing card in the spot an outer layer's hole wraps, so punching back in from the outer layers lands on it. `onlyOnStage: { fade: 200 }` also makes leaving it a two-step move: the card fades out in that many ms (every card coming back fades in as fast), and only then does the camera move. E.g. an outer layer with a black background that should clear before you punch back in.
   - `outer: { hole: { cx, cy, w } }` makes the scene an outer layer: it has no `at`, and the engine scales and places it round the whole talk so that the hole (a 16:9 box in its own 1920×1080 space) lands on it; a later outer scene wraps the one before (see **Outer layers** under "Building blocks").
   - `back: '<id>'` makes the scene the back of that card: it has no `at`, and → from the front's last step turns the card over to show it; `flip: { axis, dir, tilt }` tunes the turn (see **Cards with a back** under "Building blocks").
   - `formation` makes every other card gather round the scene while it's on stage, e.g. `{ shape: 'ring', spin: 60 }` on the last scene (see **The deck rearranges itself** under "Building blocks").
   - Fields the engine doesn't know are left alone, so a deck can add its own (e.g. a value its `layers` read per scene).
   - `hand: true` (or `{ hold, spread, s }`) makes the flight in from the previous scene a card trick: the deck folds into a hand of cards and this scene's card is drawn out (see **The deck folds into a hand** under "Building blocks").
3. For builds, use `<Step :at="n" anim="up|down|left|right|pop|blur|fade|dim">`, or `useStep()` for custom logic (`step`, `active`, `near`, `preview`, and `zoom`: the card's on-screen scale).
   Add `class="rise"` (plus `style="--d: n"` to stagger) or `fade-in` for entrance animations that replay each time the scene comes on stage, or hook `.is-active` in scene CSS.

## Hosting a build

`npm run deck -- build <deck>` writes a plain static site to `dist/<deck>/`: `index.html`, `notes/index.html` (so `/notes` works on hosts without a SPA fallback; `?notes` works too), `deck-notes.json` (the notes, read-only) and `assets/`. Copy that folder to any web server. Everything that needs no dev server still works: the canvas, the overview, `?presenter`, `/notes` and `?sheet`, and windows in the same browser stay in sync. Editing notes (E on `/notes`) and syncing with other devices need `npm run dev`.

For a site under a subpath, such as GitHub Pages' `https://<owner>.github.io/<repo>/`, build with that path as the base:

```bash
npm run deck -- build example --base can-present
npm run deck -- preview example --base can-present   # http://localhost:4173/can-present/
```

Write it without slashes: Git Bash rewrites `/can-present/` into a Windows path (the script catches that and says so). Files from a deck's `public/` folder are referenced from the site root (`/shots/x.png`), and Vue leaves such paths alone, so anything that loads one needs the base. `<Shot src>` adds it for you; in a deck's own markup use `asset()` from `@engine/asset.js` (`<img :src="asset('/shots/x.png')">`). CSS `url(/…)` and imported files are rewritten by Vite.

**The example deck on GitHub Pages** ([live](https://kasparboelkjeldsen.github.io/can-present/)). `.github/workflows/pages.yml` runs `check` and builds `decks/example` with the repository name as its base on every push to `main` (or by hand: Actions → "Example deck on Pages" → Run workflow), and publishes it. One-time setup: Settings → Pages → Source: "GitHub Actions". Only the example deck is published. Pages needs a public repository, or a paid plan for a private one, and the published site is public either way.

## One file: `npm run compile`

```bash
npm run compile -- no-dumb-questions                 # → dist/no-dumb-questions.html
npm run compile -- example --out ~/Desktop/talk.html # anywhere else
```

Packs a deck into a single HTML file with everything inside: open it straight from disk (no server), mail it, put it on a USB stick. It's the same Vite build, run in memory with code splitting off (`scripts/compile.mjs`), then stitched together: the JS is one inline module, the CSS one `<style>`, fonts and imported images are `data:` URLs (the woff fallbacks of `@fontsource` are dropped; every current browser uses the woff2), the notes are a JSON block, and the deck's `public/` folder is a JSON block of `data:` URLs keyed by path. `asset()` returns those, CSS `url(/…)` that points into `public/` is rewritten, and as a safety net, markup that names a public file without `asset()` (`<img src="/shots/x.png">`) is pointed at the inlined copy when it appears. Sizes: the example deck is about 0.2 MB; screenshots count at their full size (plus a third for base64), and it warns over 50 MB.

In the file: the canvas, overview, `?presenter`, `?notes` (not `/notes`) and `?sheet` all work, and windows of the same file sync with each other (checked over http; browsers differ in how they treat `file://` pages, so test yours). Not in it: live sites (`<Shot live>`) and QR targets still need the network, notes are read-only, and there's no syncing to other devices (that needs the dev server). A `public/` path that doesn't exist (`check` warns about those) stays a broken link, as in any build.

## Checking a deck

```bash
npm run check -- [deck]           # or: npm run deck -- check [deck]
npm run -s check -- [deck] --json # the same findings as JSON
```

A text lint that loads `deck.js` through Vite, the way the app does, and reads each scene's source. It prints `ERROR  <scene-id>  <message>` or `WARN …` lines and a summary, and exits 1 if there are errors.

- **Errors:** a `deck.js` that doesn't load (e.g. `ride()` with an edge index the diagram doesn't have, or `defineDiagram()` with an unknown node), duplicate ids, ids that aren't kebab-case, a `parent` that doesn't exist, a scene without `component` or `at` (a ghost may use `at: null`), build steps used beyond `steps` (unreachable), a malformed `via` (no path, a path that isn't SVG path data, no `space`, an unknown option, a `zoom`, `speed`, `bank` or `tone` out of range), malformed `frames` (a key that isn't a build step from 1 to `steps`, a box that isn't `{ cx, cy, w }` with numbers, or one that isn't inside the 1920×1080 card), a malformed `formation` (an unknown shape or option, `spin` under 5 s or on a grid, `cols` on anything but a grid or not a whole number from 2, `s` or `radius` not > 0, `points` that aren't `[x, y]` pairs, a shape function that doesn't return `{ x, y }`) or a formation scene that's nested or a ghost, a malformed `outer` (no `hole`, a hole that isn't `{ cx, cy, w }` with numbers and `w > 0` inside the 1920×1080 card) or an outer scene with `at`, `parent`, `ghost` or `formation`, a bad `back` or `flip` (a front that doesn't exist, two backs for one card, a front that isn't an ordinary top-level card, nested scenes in the front or the back, a back with its own `at`, `parent`, `ghost`, `outer`, `formation` or `skip`, `flip` on a scene without `back`, an unknown option or a bad `axis`, `dir` or `tilt`), a bad `hand` (an unknown option, `hold`, `spread` or `s` out of range, a drawn card that is nested, a ghost, an outer layer, the back of a card, `onlyOnStage` or the formation scene).
- **Warnings:** fewer build steps used than `steps` (dead clicks), scenes without notes (or empty ones), `notes.json` keys with no scene, top-level cards that overlap on the canvas, a nested card that isn't inside its parent, `/shots/…` and `/assets/…` paths that don't exist in `public/` yet (the speaker's TODO list), a scene root without class `slide`, a `<QrCode>` whose literal `url` isn't `http(s)://` or `mailto:` (or that has no `url`), a `via` that never plays (on the first scene or on a `skip` scene), a `via` whose previous scene isn't the path's scene or nested in it (a ride from far away looks odd), a `via` whose `space` isn't any scene's `at` (so that can't be checked), a second `formation` (only the first is used), `frames` or `via` on the formation scene (ignored), a formation on a `skip` scene, `points` for fewer cards than move (the rest fade out), outer layers whose outermost card is over 10,000× the talk's width, a back that doesn't come right after its front (the card never turns over), a `hand` on the first or a `skip` scene (it never plays) or with a `via` (ignored). Outer scenes and backs don't count for the overlap warnings, and neither does a card wholly inside one at least twice its size: that's a card set into another on purpose (nesting by geometry, `at: nest(…)` without `parent`, so it can still turn over and join a formation or the hand). For the `slide` class, a scene whose root is one of the deck's own wrapper components (imported from a relative `.vue` file) counts if the wrapper's root has it, up to three wrappers deep.

Build steps are inferred from literal `<Step :at="n">` / `:until="n"`, `<BigNumber :at="n">`, `<QrCode :at="n">`, the numeric keys of literal `:focus` / `:callouts` objects, and `step >= n`, `step > n`, `step === n`, plus the keys of the scene's `frames` in `deck.js`. If a scene uses anything non-literal (e.g. `:at="i"`), its steps are listed as "not inferred" and not checked. A scene that draws a `<Diagram>` takes its steps from the diagram (`steps: arch.steps` in `deck.js`), so it's listed under "Build steps from a <Diagram>" and not compared.

## The sheet: the whole deck on one page

Open **`?sheet`** (e.g. http://localhost:5173/?sheet) to see every scene in a grid, in deck order, each at its last build step (a scene without builds shows its finished state, as in the overview). Live sites stay placeholders, a `<Diagram>` on a timer shows its final state without packets, and a `<BigNumber>` shows its final value. Under each tile: number, id, title, `steps` and flags (`skip`, `ghost`, `outer`, `in <parent>`, `back of <id>`, `formation`, `hand`; tiles always show the normal card, never the formation). A tile on a step with a camera frame (`frames`) has the frame's box outlined in the accent colour (a ring marks one too small to see) and `frame n · 34×` (its zoom) under it; the tile itself always shows the whole card at zoom 1, so deep-zoom `<Detail>`s stay hidden. Click a tile to open that scene.

| Query | |
|---|---|
| `?sheet&cols=3` | number of columns (default 4) |
| `?sheet&steps` | one tile per build step (0…steps), for checking builds |
| `?sheet&only=id1,id2` | just these scenes |

About 1.5 s after it loads, the sheet audits every tile: text smaller than 26px, text that sticks out of the 1920×1080 card, and a `.slide` whose content overflows. Each tile gets a red badge with its count and outlines around the offenders; the full list is plain text at the top of the page (`<scene-id>/<step>: <kind> "<text>" <size>px`), in `window.__deckAudit` and in the console. Anything inside `data-audit="ignore"` is skipped; the engine uses it for small chrome such as `<Shot>`'s URL bar and `<Code>`'s title bar.

## Building blocks

- `@engine/components/Shot.vue`: a screenshot in a browser or window frame. Put images in `decks/<deck>/public/shots/` and pass `src="/shots/x.png"`; with no `src` it shows a placeholder. The path gets the build's base automatically; for your own `<img>`s use `asset()` from `@engine/asset.js` (see "Hosting a build").
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
- `@engine/components/QrCode.vue`: a link to take home. A short label, the link as text and a QR code whose dots fall onto the canvas when its scene comes on stage: the three finder squares thud down first, then the timing and alignment patterns, then the data rains in from the centre outwards, each dot falling from near the viewer (big and faint, in perspective) with its shadow tightening under it and a small bounce. About 2.4 s from the first drop to the last landing, whatever the size of the code; then it's one crisp SVG path.

  ```vue
  <QrCode url="https://github.com/kasparboelkjeldsen/can-present" label="The code for this deck" />
  <QrCode :url="feedbackUrl" label="Tell me how it went" :size="560" :at="1" ec="Q" layout="below" />
  ```

  | Prop | Default | |
  |---|---|---|
  | `url` | (required) | what the code encodes. Keep it short: a shorter URL is a coarser code that scans from further back |
  | `label` | `''` | the short description shown with it |
  | `text` | the URL without `https://`, `www.` or a trailing slash | the link as displayed. It's selectable text (one click selects all of it), so the speaker can copy it |
  | `showUrl` | `true` | `false` hides the link |
  | `layout` | `'right'` | `'right'`: label and link right of the code. `'below'`: under it, centred. `'none'`: the code only |
  | `size` | `520` | px of the code itself (modules are rounded to whole px, so it's within half a module of this). The tile adds a quiet zone of 4 modules on every side |
  | `ec` | `'M'` | error correction, `'L'` / `'M'` / `'Q'` / `'H'`. The smallest QR version that fits is used |
  | `at` | `0` | build step it drops on; `0` = when the scene comes on stage. Before it, the code and its text are hidden (the space is kept) |
  | `delay` | `100` | ms before the first dot falls, counted from when the camera has landed (the drop waits for the flight, ride or `frames` move to finish, at most 4.5 s) |
  | `tone` | `'paper'` | `'paper'`: `--deck-ink` modules on a `--deck-paper` tile. `'ink'`: the same tile on a dark `--deck-ink` mat, so the code reads as an object on a light slide |

  Scannability comes first: modules are always dark on a light tile (if the theme's `--deck-ink` isn't clearly darker than its `--deck-paper`, it falls back to black on white and warns in the console), square, with no gaps, and the label and link are at least 26px (`clamp()`ed from the code size). Until the camera lands, the code and its text are hidden, so the dots fall onto a card the audience is already looking at. The drop replays every time the scene comes on stage; past the scene, in the overview, in the presenter view and on `?sheet` it's the finished code. With `prefers-reduced-motion` it fades in. Encoding is [`qrcode-generator`](https://www.npmjs.com/package/qrcode-generator) (MIT, bundled, so it works offline), UTF-8 byte mode. The drop is CSS (one element and one shadow per dark module, transforms and opacity only); codes bigger than about version 5 fall in small chunks of modules (2×1, 2×2, 3×2 …), so there are only ever a few hundred drops. Its parts have zero-specificity classes (`.qr-code`, `.qr-tile`, `.qr-svg`, `.qr-text`, `.qr-label`, `.qr-link`), so a theme can restyle them.
- `@engine/components/Diagram.vue` + `@engine/diagram.js`: boxes connected by lines that draw themselves, packets flowing along them, and 16:9 slots for nested scenes. The definition lives in a plain `.js` file next to the scene, so the scene and `deck.js` share it:

  ```js
  // decks/<deck>/scenes/arch.js
  import { defineDiagram } from '@engine/diagram.js'
  export const arch = defineDiagram({
    reveal: 'steps',                          // or { timer: [1000, 1300, 1600] }
    nodes: {
      browser: { x: 100,  y: 450, w: 260, h: 180, label: 'Browser', at: 1 },
      api:     { x: 700,  y: 380, w: 440, h: 320, label: 'API', sub: 'Node 22', at: 2, tone: 'accent' },
      db:      { x: 1450, y: 450, w: 260, h: 180, label: 'Postgres', at: 3, tone: 'ghost' },
    },
    edges: [
      { from: 'browser', to: 'api', label: 'HTTPS' },
      { from: 'api', to: 'db', both: true, offset: -20 },
    ],
    packets: [
      { edge: 0, label: 'GET /jobs' },
      { edge: 0, label: '200 OK', reverse: true, delay: 1.8 },
    ],
    slots: { inside: { node: 'api', cx: 220, cy: 200, w: 300 } },
  })
  ```

  The scene draws it with `<Diagram :diagram="arch" />`. It covers the whole slide, in the scene's 1920×1080 space. A `#node-<id>` slot (slot props `{ node, shown }`) replaces a box's label and sub with your own content. In `deck.js`:

  ```js
  { id: 'arch', component: Arch, steps: arch.steps, at: ARCH },
  { id: 'inside', component: Inside, parent: 'arch', at: nest(ARCH, arch.slot('inside')), revealAt: arch.revealAt('api') },
  // timer mode: revealDelay: arch.revealDelay('api') instead of revealAt
  ```

  | | Fields |
  |---|---|
  | `reveal` | `'steps'` (default): each node and edge appears on its build step, following the scene's `step` (past and overview show everything). `{ timer: [ms, …] }`: no clicks; stage n appears that many ms after the scene comes on stage, coming back from a later scene shows everything at once, and thumbnails show the final state |
  | node | `x`, `y`, `w`, `h` (required, the box), `label` (bold), `sub`, `at` (step, or timer stage; default 1), `tone`: `'default'` (`--deck-paper` box, `--deck-ink` text), `'ink'` (inverse), `'accent'` (`--deck-accent` / `--deck-on-accent`), `'ghost'` (dashed outline in the text colour); `class` (extra classes). Boxes pop in |
  | edge | `from`, `to` (node ids), `at` (default: the later of its nodes; never earlier), `label` (26px, at the midpoint), `both` (arrowheads at both ends), `arrow: false` (none), `offset` (px, shifts both ends along their sides for parallel lanes), `path` (an SVG path string instead of the auto-route), `tone`: `'ink'` (default, `--deck-ink`), `'paper'`, `'accent'`, `'accent-2'`, `'current'` (the text colour). Auto-routing joins the facing side midpoints (left/right if the boxes are further apart horizontally than vertically, else top/bottom), with an elbow halfway if they don't line up. The line draws itself once both boxes are there; arrowheads and label follow |
  | packet | `edge` (index into `edges`), `label`, `reverse` (flows `to` → `from`), `dur` (s, default 3.6), `delay` (s), `tone`: `'ink'` (default: `--deck-ink` pill, `--deck-paper` text), `'paper'`, `'accent'`, `'accent-2'`. Pills loop along the edge once it has drawn, fading in and out at the ends; not in thumbnails |
  | slot | `node`, `cx`, `cy` (centre, relative to the node's top-left), `w` (16:9, so `h = w × 9/16`). Drawn as a dark translucent box that appears with its node: the place for a nested scene |

  `defineDiagram()` throws a clear error for an unknown node id in an edge, packet or slot, a missing `x`/`y`/`w`/`h`, or an unknown tone. Its helpers: `steps` (steps mode: the highest node or edge `at`; 0 in timer mode), `slot(name)` → `{ cx, cy, w, h }` in the scene's space (for `nest()`), `revealAt(id)` → the step a node appears on, `revealDelay(id)` → timer mode: the ms at which the node's stage appears, plus 150. Every part has a zero-specificity class (`.dg-node`, `.dg-node--accent`, `.dg-label`, `.dg-sub`, `.dg-slot`, `.dg-line`, `.dg-elabel`, `.dg-packet`), so a theme can restyle it.
- **Rides** (`via` in `deck.js`, `ride()` from `@engine/diagram.js`): the camera *becomes* a packet. Instead of zooming out, panning and zooming back in, the flight into a scene flies to the start of a path at close range, follows it (curves, elbows) at a constant speed with a pill riding at the centre of the screen, and then dives into the scene. It reads as one continuous motion, 1.5–4 s in total.

  ```js
  import { ride } from '@engine/diagram.js'
  { id: 'inside', …, parent: 'arch', at: nest(ARCH, arch.slot('inside')),
    via: ride(arch, 0, ARCH, { label: 'scenes', zoom: 2.2 }) },
  // any SVG path, in the local 1920×1080 space of a card placed at `space`:
  { id: 'other', …, via: { path: 'M200 800 C600 200 1200 900 1700 300', space: ARCH, label: 'GET /' } },
  ```

  `ride(diagram, edgeIndex, parentAt, opts)` rides edge `edgeIndex` of a `defineDiagram()` diagram drawn by the scene placed at `parentAt` (the same transform as `nest()`). It throws for an edge the diagram doesn't have, and returns the lower-level form, `{ path, space, …opts }`.

  | Option | Default | |
  |---|---|---|
  | `label` | none | the pill's text; no label, no pill |
  | `zoom` | `2` | how close the camera rides: the path's card's on-screen scale (1 = the card fills the screen) |
  | `reverse` | `false` | ride the path from its end (an edge from `to` to `from`) |
  | `tone` | `'ink'` | pill colour, like packets: `'ink'`, `'paper'`, `'accent'`, `'accent-2'`. The pill uses the packet classes (`.dg-packet`, `.dg-packet--<tone>`), so a theme that restyles packets restyles it |
  | `speed` | `400` | card px per second along the path (the path's own 1920×1080 units); the total is then fitted into 1.5–4 s |
  | `bank` | `0` | degrees the camera leans into turns (a few at most; -15 to 15 allowed) |

  When it plays: `via` is the flight **into** its scene from the previous scene in deck order (skip scenes are stepped over, as with →), and ← from it plays the same ride backwards. Every other move (overview, a click there, the URL hash from elsewhere, Home/End, X, skipping over it) is a normal flight, and so is a move made while a ride runs: the ride is cut short, its pill fades and the camera flies from wherever it is. With `prefers-reduced-motion` the flight is always normal, and the presenter view and `?sheet` never ride. The real packets on the edge keep flowing, so give the ride pill its own tone or label.
- **Zoom into detail** (`frames` in `deck.js`, `@engine/components/Detail.vue`): a "powers of ten" dive inside one scene, driven by clicks. On a build step with a frame, the camera flies to that box of the card instead of the whole card, and `<Detail>` shows content only once the camera is close enough to read it, so it materialises while the camera moves, like a map.

  ```js
  // deck.js: per build step, a box { cx, cy, w } in the card's 1920×1080 space (16:9, w in card px)
  { id: 'deeper', component: Deeper, steps: 3, at: { x: 4600, y: 4650 },
    frames: { 1: { cx: 1200, cy: 640, w: 480 }, 3: { cx: 1302, cy: 655, w: 60 } } },
  ```

  ```vue
  <Detail :from="2" :to="6">endpoints</Detail>   <!-- while the card is 2–6× in -->
  <Detail :from="20" tag="span">the code</Detail> <!-- only once it's 20× in -->
  <Detail :until="0.25">ACT 2</Detail>            <!-- only from far away, e.g. the overview -->
  ```

  - **`frames`**: a step without a key keeps the previous step's frame; step 0 is always the whole card. Moving between frames is the normal van Wijk flight, so a 30× (or 500×) zoom feels smooth. Entering the scene from elsewhere flies to the frame of the step you land on (← from the next scene lands on the last step's frame), leaving it is a normal flight, and a `via` ride into or out of the scene works the same way. The overview, the presenter view and `?sheet` ignore frames. With `prefers-reduced-motion`, a frame change within the scene is an instant cut.
  - **`zoom`** (`useStep()`): the card's on-screen scale, following the camera: 1 = the card exactly fills the stage, 0.1 = far away, 8 = 8× in. It's 1 in thumbnails. It's computed lazily, so a camera move only costs something in scenes that read it.
  - **`<Detail>`** props: `from` (default 0) and `to` (default none) are zooms; `until` is shorthand for `to`; `tag` (default `'div'`; `'g'` inside an `<svg>`). The opacity ramps up from `from × 0.7` to `from` and down from `to` to `to × 1.3`, written straight to the element as the camera moves (no re-render, no timer). Faded out, the content is `visibility: hidden` and takes no pointer events. Thumbnails are at zoom 1, so they show what the card shows at rest.
  - **Sharp at depth.** The camera is one CSS transform without `will-change`, so the browser draws the text at its final size at any zoom (checked at 537×). Write deep content at normal sizes in its own 1920×1080 box, scaled down with a `transform` (`decks/example/scenes/deeper.js`, `box()`), rather than in tiny font sizes. Position anything you zoom far into with `transform`, not `left`/`top`: the browser rounds those to whole pixels, and at 500× a fraction of a pixel is dozens of pixels on screen. Text in deep `<Detail>`s is sized for the zoom it's read at, so the sheet's audit (which measures at zoom 1) can't judge it: mark it `data-audit="ignore"`.
- **Cards with a back** (`back` / `flip` in `deck.js`, `engine/flip.js`): a scene can be the other side of a card. Instead of flying on, the camera pulls back until the card is an object on the canvas (about 1.45× its width), the card turns over (lifting a little, with a few degrees of wobble on the other axis, a growing shadow and a sheen as it goes edge-on), and the camera pushes back in on the back. About 1.7 s. ← from the back turns it back.

  ```js
  { id: 'code', component: Walkthrough, steps: 2, at: { x: 6900, y: 300, r: -1 } },
  { id: 'code-back', component: CodeBack, back: 'code', flip: { axis: 'y' } },   // the other side of `code`
  ```

  | `flip` option | default | |
  |---|---|---|
  | `axis` | `'y'` | `'y'` turns the card like a page, `'x'` tips it over like a sign |
  | `dir` | `1` | `1` or `-1`: which way it turns |
  | `tilt` | `8` | degrees on the other axis at mid-turn (-30 to 30): the wobble that keeps it from looking mechanical |

  - The back scene has **no `at`**: the engine copies its front's. `flip` is optional and only goes on the back.
  - **When it plays:** → from the front's last step when the back comes next in deck order, and ← from the back. Every other route (the URL hash, Home/End, the overview, X) shows the face the deck is at and flies normally: the back is up from the moment the deck reaches it (also in the overview), the front before that. A new move during the turn cuts it short and snaps to the right face.
  - The arriving face turns over already drawn: its `rise` / `fade-in` entrances don't replay when it goes on stage (as the card touches down). Its own builds (`<Step>`) and other `.is-active` animations still run from there. A scene with its own CSS entrance under `.is-active` can switch it off the same way: the arriving card carries `.is-flipped-in`, e.g. `:global(.is-flipped-in .my-scene .panel) { animation: none; }` (wrap the whole selector: in scoped CSS Vue drops anything after a `:global(…)` prefix). Design the back so it reads as the obvious other side of the card.
  - **Limits:** one back per card; the front is an ordinary top-level card (not a ghost, outer, back, formation or `skip` scene), and neither side has nested scenes (they're separate cards and wouldn't turn with it). `check` errors on each. In a **formation** the pair counts as one card: the front moves into the formation and the back fades, so a card that's already turned shows its front there (and hides it again when the cards go home).
  - With `prefers-reduced-motion` the arriving face fades in over the other, with no turn and no camera move. `?sheet` and the presenter thumbnails show both sides as normal cards (the sheet marks the back `back of <id>`). At rest both faces keep their plain 2D transform; the 3D part (`perspective()` and the rotations, appended after the card's own transform, so the perspective is the same at any scale) only exists during the turn, driven per frame through CSS variables on the two elements.
- **The deck rearranges itself** (`formation` in `deck.js`, `engine/formation.js`): usually the ending, or with `release` a transition into a scene. On the scene with a `formation`, the camera pulls back over the whole talk, then every other card leaves its place and swings round into a formation around that scene, one after another, on a springy ease (a little overshoot, then it settles), while the camera closes in on the formation; a spinning one then starts to orbit. Leaving the scene sends every card home and then flies on as usual. About 2–2.5 s in, under 2 s out.

  ```js
  { id: 'thanks', component: Thanks, at: { x: 2300, y: 2450 }, formation: { shape: 'ring', spin: 60 } },
  ```

  | Option | | |
  |---|---|---|
  | `shape` | `'ring'` (default) | `'ring'`: an oval in the stage's proportions round the scene, sized to the card count. `'grid'`: rows of cards round the scene, which takes the middle 2×2 cells. `'spiral'`: outwards from the top, clockwise. `'points'`: one card per `points` entry. Or a function `(i, n) => ({ x, y, r?, s? })`: card `i` of `n`, world px from the scene's centre, its rotation (deg) and scale |
  | `spin` | none | seconds per orbit (at least 5; negative turns anticlockwise). The formation slowly rotates round the scene with every card kept upright. Not for `grid` |
  | `s` | auto | the cards' scale in the formation (all the same size; auto-fitted so they don't overlap each other or the scene) |
  | `radius` | auto | `ring`: the oval's horizontal radius; `spiral`: where it starts (world px) |
  | `until` | none | the build step on which the formation lets go: the cards go home while the camera moves in on the scene's own card (e.g. `until: 1`, then the card can change on that click). Without it the formation holds until you leave the scene |
  | `release` | none | ms: the formation lets go by itself, that long after the cards have landed (the cards go home while the camera moves in on the card). A formation as a transition into a scene, e.g. the other cards spelling a word round it. Not with `until` |
  | `cols` | auto | `grid`: the number of columns (2 or more) |
  | `points` | | `shape: 'points'`: `[[x, y], …]`, world px from the scene's centre; cards beyond the last point fade out |

  Who moves: every top-level card except the formation scene, in deck order (slot 1 is the first scene). A nested card rides in its parent's slot. `skip` and `ghost` cards fade out, and so does anything nested in them. The formation scene stays where it is (give it `r: 0` so it lines up with the upright cards) and keeps its rounded corners and shadow; the camera frames the formation, so its own text is read at about a third of normal size (a ring of 9 round a card at scale 1): write it big.

  A deck can have several formation scenes, e.g. a word spelled on the way into one scene (`release`) and a ring round the last. The cards keep the last formation's way of writing their places once they've gone home, and switch (invisibly) when the next one starts. The formation scene must be top-level, not a ghost; its `frames` and `via` are ignored. The choreography plays for any arrival (→, ←, Home/End, the URL hash, a click in the overview), and the overview (O) during a formation shows the normal layout, with the cards going home and coming back when you return. With `prefers-reduced-motion` the cards jump straight to their places and the camera flies normally. The presenter view, `/notes` and `?sheet` never show it. The motion is CSS (a transform transition per card, and an animated `--fx-spin` for the orbit); the transform of a moving card is one function list both at home and in the formation, so a deck without a formation keeps exactly the transforms it had. While the cards are out, `useStep().zoom` (and so `<Detail>`) still measures them at their home scale.
- **The deck folds into a hand** (`hand` in `deck.js`, `engine/hand.js`): a card trick as the flight into a scene. → from the previous scene in deck order: the camera pulls back over the talk, every card swings round into a fan like playing cards held in a hand (tilted, overlapping, in deck order), the hand holds for a moment, then this scene's card is drawn out (it slides up out of the fan and straightens on a springy ease) and the camera dives into it. Once the card fills the screen, every card snaps home behind it, so nothing moves on screen, and the deck carries on. About 5–6 s in all.

  ```js
  { id: 'numbers', component: Numbers, at: { x: 17800, y: 3000 }, hand: true },
  { id: 'loop', component: Loop, at: { … }, hand: { hold: 1600, spread: 110 } },
  ```

  | Option | Default | |
  |---|---|---|
  | `hold` | `1200` | ms the full hand is held before the card is drawn |
  | `spread` | from the card count (5° a card, 50°–140°) | degrees from the first card in the fan to the last |
  | `s` | `1` | the cards' scale in the hand: all the same size, whatever their own scale |

  Who's in the hand: every top-level card in deck order; a nested card rides in its parent; the two faces of a card that turns over share a place (the one that's up shows); `ghost`, `outer`, `skip` and `onlyOnStage` cards fade out while it's up. The hand sits in the middle of the talk (the overview's centre), and the camera frames it. The scene being left stays on stage until the card is drawn; from then on the drawn scene is, so its entrances (`rise`, a `<BigNumber>` or `useCount` counting from the start) play while the camera dives in. In the hand it shows its finished state, like any card that isn't on stage.

  When it plays: only → from the previous scene in deck order (skip scenes stepped over, as with `via`). ←, the URL hash, Home/End, X and the overview fly normally, and any move during the trick (the overview included) snaps every card home and flies from where the camera is. With `prefers-reduced-motion` it's a normal flight. The presenter view and `?sheet` never show it (the sheet flags the scene `hand`). The drawn card must be an ordinary top-level card (not nested, a ghost, an outer layer, the back of a card, `onlyOnStage` or the formation scene); a `via` on it is ignored (`check` errors and warns). Use it once per talk, at a turn where "out of everything we've seen, this one" is the point. Like the formation, each card's transform is one function list at home, in the hand and drawn out, so CSS swings it round the fan's pivot.
- **Outer layers** (`outer` in `deck.js`, `placeOuter()` in `engine/layout.js`): keep zooming out past the end of the talk. An outer scene is the reverse of `nest()`: you say where in *its* card the thing it wraps goes, and the engine scales and places it. The first outer scene (in deck order) wraps the talk (the box the overview frames: every scene except ghosts and outer ones), each later one wraps the previous outer card. The wrapped box is fitted inside the hole, centred. `wraps: '<id>'` wraps that one card instead (an ordinary top-level card): e.g. a card that floods with a colour turns out to sit in a letter of that colour. While such a layer (or a later one round it) is on stage, the rest of the talk fades away so only that card sits in the hole.

  ```js
  { id: 'bigger',  component: Bigger,  outer: { hole: { cx: 1530, cy: 550, w: 36 } } },  // the talk is the dot on an i
  { id: 'biggest', component: Biggest, outer: { hole: { cx: 1560, cy: 671, w: 30 } } },  // that card is a full stop
  ```

  - **Draw the spot yourself** at the hole's coordinates (e.g. a dotless `ı` and your own dot, or your own full stop) instead of relying on font metrics, and share the numbers between the scene and `deck.js` (`decks/example/scenes/outer.js`). Fade in a real dot with `<Detail :until="4">` once what it wraps is a speck. Use HTML text on these cards, not SVG `<text>`: Chrome sizes SVG text from its on-screen scale, which goes wrong on a card scaled thousands of times.
  - An outer scene has no `at`, `parent`, `ghost` or `formation` (`check` errors), and is upright. It's text on the canvas: give its root a transparent slide variant (`slide--canvas` in the example); the engine drops the card's shadow and corners and paints it under the talk (each layer under the one it wraps).
  - It's hidden until the deck reaches it (fading in over 1 s), and hidden again when you go back, so its giant letters never show round normal scenes. The overview (O) frames the talk only; formations fade outer cards like ghosts, so an outer scene right after a formation scene gets the usual "cards go home while the camera pulls back". `?sheet` and the presenter thumbnails show it as a normal card.
  - **Keep the total ratio reasonable.** Each layer multiplies the zoom (1920 ÷ hole width, about 50× for a 36 px hole); the flight is logarithmic, so a 50× pull-back is only a little longer than a normal one. Chrome composites in 32-bit floats, so `check` warns when the outermost card is over 10,000× the talk's width.
- **Deck layers** (`layers` in `deck.js`): the deck's own components outside any card, for things that belong to the whole talk.

  ```js
  import { defineAsyncComponent } from 'vue'
  const Decor = defineAsyncComponent(() => import('./components/Decor.vue'))
  export default { id, title, scenes, layers: { under: Decor, over: Surface, stage: Mood } }
  ```

  | Layer | Where | Good for |
  |---|---|---|
  | `under` | in the camera's world, under the cards (world px, like a card's `at`) | canvas decor seen between cards and mid-flight |
  | `over` | in the camera's world, over the cards | something that travels between cards without being re-created (e.g. one live iframe that lands on a box of whichever card is on stage) |
  | `stage` | fixed on the 1920×1080 stage, over the world, under the deck's chrome | screen effects: vignette, grain, writing a CSS variable onto `:root` |

  A layer component can use `useDeck()` (scenes, `idx`, `step`, `overview`) and the shared camera (`cam` from `@engine/cameraState.js`), but then **load it lazily** (`defineAsyncComponent`, as above): `useDeck.js` imports `deck.js`, so a static import would be circular. It has no `useStep()` (it isn't in a scene). Only the deck window renders layers: not the presenter view, `/notes` or `?sheet`. Layers are drawn as they are; nothing in the engine moves, hides or fades them for overview, formations or hands.
- `@engine/useCount.js`: `useCount(trigger, from, to, { duration, delay, decimals })` returns a ref with an animated number that re-runs whenever `trigger` (a ref or getter, e.g. the scene's `active`) becomes true. `useCounter(…)` takes the same arguments and returns `{ value, progress }`, with `progress` the eased 0…1 of the run (what `<BigNumber>`'s ring follows).
- `docs/presentation-guide.md` plus the deck's `brief.md`: hand both to Claude chat when writing a talk; it produces a `scene-description.md` for the coding agent.

## Speaker notes and sync

Notes live in `decks/<deck>/notes.json`, keyed by scene id. Open **`/notes`** (e.g. http://localhost:5173/notes) on your laptop screen, in another tab or window, or on another device. It shows the current scene's notes white on black, scaled to fill the window, plus the scene number, the next scene and the clock. Notes are per scene, not per build step.

To edit, press **E** (or ✎ Edit) on `/notes` while running `npm run dev`: the notes for the current scene become a text box and save to `notes.json` as you type. Saving never reloads the deck, and every open window gets the new text straight away. Editing only works from the presenting machine itself. Production builds include the notes read-only, at `/notes` (or `?notes`) on any static host.

`/notes` and `?presenter` follow the deck in both directions, so arrow keys or the clicker on them move the deck too:
- **Same browser:** BroadcastChannel. This also works in the built version.
- **Other device (phone or tablet):** the dev server relays messages over its websocket. Run `npm run dev:lan` so other devices can reach it, then open `http://<laptop-ip>:5173/notes`. This only works with the dev server, and it exposes the dev server on the network, so use it on a network you trust.
