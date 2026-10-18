# Plan: QR codes that fall onto the canvas

Branch: `decks-folder`. Requested by the user: "QR support. Short description of what the link is, the actual link and a QR code. Animate the QR code: it could fall into place a dot at a time, almost in 3D, as if falling down onto the canvas."

Read first: `AGENTS.md`, `README.md`, `docs/presentation-guide.md`, `engine/components/BigNumber.vue` (the closest sibling: a themed engine component that animates on entrance and is calm in previews), `engine/useStep.js`, `engine/styles/engine.css`, `engine/Sheet.vue`, `scripts/check.mjs`, `decks/example/deck.js` and its theme.

## The component: `engine/components/QrCode.vue`

```vue
<QrCode url="https://github.com/kasparboelkjeldsen/can-present" label="The code for this deck" />
<QrCode :url="…" label="…" :size="560" :at="1" ec="Q" layout="right" :show-url="true" text="github.com/kasparboelkjeldsen" />
```

- **Props:**
  - `url` (required)
  - `label`: the short description shown with it
  - `text`: the link as displayed. By default it's the URL without `https://`, `www.` or a trailing slash.
  - `size`: px of the code itself, default 520
  - `ec`: error correction `L|M|Q|H`, default `M`
  - `at`: the build step it drops on. The default 0 means when the scene comes on stage.
  - `layout`: `right` (code on the left, label and link to its right), `below` (label and link under the code), or `none` (code only)
  - `showUrl`: default true
  - `tone`: `paper` (default: `--deck-ink` modules on a `--deck-paper` tile) or `ink`
- **Encoding:** add the dependency `qrcode-generator` at **exactly version 1.4.4**. It's MIT-licensed, has no dependencies of its own, is small, and is widely used. It's better than a hand-rolled Reed-Solomon encoder. Pick the smallest version (type number 0 = auto) for `ec`. It's bundled, so it works offline at the venue. This is the one dependency this plan adds; record it in the commit message.
- **Scannability comes first:**
  - always dark modules on a light tile, whatever the theme;
  - a quiet zone of 4 modules around the code (the tile's padding);
  - no rounding or gaps that would break scanning (square modules, at most a tiny visual inset);
  - text in label and link at least 26px (the sheet audit checks it);
  - the link is selectable text, so the speaker can copy it from the deck.

## The animation: dots falling onto the canvas

The feel: the camera looks down at the canvas, and the QR code's dots fall from above (from near the viewer) and land on the surface one by one. Each dot is big and soft while it's high, shrinks with perspective as it falls, and lands with a small bounce. Its shadow on the canvas starts wide and faint, and tightens and darkens as the dot comes down. The order isn't row by row. A pleasing order, for example:

1. The three finder squares drop first as solid blocks, with a satisfying thud (a short squash).
2. The timing and alignment patterns follow.
3. The data modules rain in, in a shuffled order from a seeded PRNG so it's the same every time, biased so it fills from the centre outwards.

- **Total:** about 2–2.8 s from the first drop to the last landing, whatever the QR version. Scale the per-dot stagger to the module count. Each dot's own fall takes about 450–600 ms.
- **3D:** a `perspective` on the code container. Each dot animates from `translateZ(+H)` (e.g. 600–900px toward the viewer), with a little random x/y drift and a slight random tilt, down to `translateZ(0)`. Use CSS keyframes with per-dot `animation-delay` set through a CSS variable: the fall is ease-in (gravity), then a small bounce. Shadows are a separate element per dot (or a cheap pseudo-element) animating its blur, opacity and scale.
- **Performance:** a version 3–5 code has about 600–800 dark modules. Use one element per dark module, absolutely positioned, with transforms and opacity only. Avoid `filter: blur` on hundreds of elements; fake the shadow softness with opacity, scale and a radial gradient. Measure frame times during the drop: 60 fps is the bar. If it isn't reached, merge modules into a few hundred "drops", e.g. 2×1 runs, rather than lowering the quality bar.
- **Replays** each time the scene comes on stage (`.is-active`, or the step reaching `at`), like the other entrance animations.
- **Calm states:** in `preview` (presenter thumbnails, `?sheet`), in the overview and for past scenes, show the finished code with no animation.
- **`prefers-reduced-motion`:** a plain fade-in.
- After landing it's a static, crisp code. Draw it once as a single SVG path for the scanned state, for crispness at any zoom level. The falling dots can be swapped for it, or sit exactly on top of it, so there's no shimmer.

## Example deck

Add a scene `get-the-code` after `deeper` and before `takeaway`:
- a kicker, a short headline like "Take it with you";
- the QR for `https://github.com/kasparboelkjeldsen/can-present`, with the label "The code for this deck" and the link shown.

Notes. Place it on the canvas so the flight and the overview still read well. Mind the formation finale: it's another card in the ring.

## Docs and check

- `docs/presentation-guide.md`: a toolbox row ("QR code: a link with a short label and a code that falls onto the canvas dot by dot; good for 'get the slides', feedback forms, repos"), plus a note to put the real URL in the scene description.
- `README.md`: QrCode's props.
- The AGENTS.md pattern index and the build-deck skill table.
- `scripts/check.mjs`: a literal `<QrCode :at="n">` counts as a build step. Warn on a QrCode `url` literal that isn't `http(s)://` or `mailto:`.

## Verification (required, with evidence)

1. **It scans.** In your own scratchpad (not the repo), install `jsqr` and decode screenshots of the finished QR in the example deck, at the scene's normal zoom and from `?sheet`'s full-size render if practical. It must decode to exactly the URL. Also decode a code made with `ec="H"` and a long URL (a temporary test, reverted).
2. **The animation looks like dots falling onto the canvas.** Take screenshot sequences under a virtual clock: early (finder squares landing), middle (rain) and end. Describe what you see.
3. **Frame times** during the drop, in headless Chrome over CDP (see how earlier parts measured).
4. `npm run check` and build for both decks; `?sheet` audit clean on example. `decks/shovelling-umbraco` is untouched. The AGENTS.md grep over `engine/` returns nothing.

## Environment notes

- Node comes from fnm. In PowerShell, prefix commands with `fnm env --shell powershell | Out-String | Invoke-Expression;`. In Git Bash, use `git -C` and absolute paths instead of `cd`.
- Run the deck with `npm run deck -- dev example --port 5180 --strictPort` in the background. Vite's watcher can miss edits: restart and reload if the DOM doesn't change.
- The Claude Browser pane is hidden, so `requestAnimationFrame` barely runs there. Use headless Chrome over CDP from your scratchpad for sequences and timing. CSS animations under a virtual clock: `document.getAnimations()`, pause them and set `currentTime`. Playwright's headless shell is at `%LOCALAPPDATA%\ms-playwright\chromium_headless_shell-1243\chrome-headless-shell-win64\chrome-headless-shell.exe`.
- The worktree `scratchpad/rec-wt` belongs to the parent session: leave it alone.
- `package-lock.json` has an old unrelated 3-line change. Your dependency install will change it legitimately. Commit the lockfile changes that come from adding `qrcode-generator`, but don't commit the old 3 removed `"peer": true` lines if you can avoid it. If you can't separate them cleanly, say so.

Commits: the component (with its docs), then the example scene. Each builds for both decks. End messages with a blank line and `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Don't push.

## Report

- commits
- the decode results (exact decoded strings)
- what the screenshot sequences show
- frame times
- check, build and sheet results
- deviations
- anything unverified
