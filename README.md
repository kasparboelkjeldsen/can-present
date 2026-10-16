# Shovelling Umbraco Into Other People's WordPress

Umbraco Meetup, 22 Oct 2026. A Vue + Vite deck on an infinite canvas: the camera flies and zooms between scenes, Prezi style.

```bash
npm install
npm run dev
```

## Keys

| Key | |
|---|---|
| → / Space / PageDown | next step or scene |
| ← / PageUp | back |
| O | overview (click a scene to jump to it) |
| P | presenter window (synced: notes, next scene, timer) |
| F | fullscreen |
| B or . | blackout |
| X | jump to the demo fallback scene (skipped in normal navigation) |
| Home / End | first / last |

The URL hash (`#pipeline/2`) keeps your place across reloads.

## Speaker notes

Open **`/notes`** (e.g. http://localhost:5173/notes) on your laptop screen, in another tab or window, or on another device. It shows the current scene's `notes` from `deck.js`, white on black, scaled to fill the window, plus a small line with the scene number, the next scene and the clock. Notes are per scene, not per build step. A string (multi-line is fine) or an array of bullets both work.

It follows the deck in both directions, so arrow keys or the clicker on the notes page move the deck too:
- **Same browser:** BroadcastChannel. This also works in the built version.
- **Other device (phone or tablet):** the dev server relays messages over its websocket. Run `npm run dev:lan` so other devices can reach it, then open `http://<laptop-ip>:5173/notes`. This only works with the dev server, and it exposes the dev server on the network, so use it on a network you trust.

## Adding a scene

1. Create `src/scenes/Thing.vue` with a `.slide` root (`slide--dark | sand | pink | blue`). The canvas is a fixed 1920×1080.
2. Register it in `src/deck.js` with an `id`, `steps` and `at: { x, y, r, s }` (its place on the canvas).
   `s < 1` nests a scene inside another one, so the camera zooms into it (see `code` inside `pipeline`).
3. For builds, use `<Step :at="n" anim="up|pop|left|right|blur|fade|dim">`, or `useStep()` for custom logic.
   Scene CSS can hook `.is-active` to replay entrance animations each time the scene is shown.

## Building blocks

- `components/Shot.vue`: a screenshot in a browser or window frame. Put images in `public/shots/` and pass `src="/shots/x.png"`; with no `src` it shows a placeholder.
  `live="https://…"` embeds a real, clickable site instead (`zoom` < 1 shows more of the page). It loads when its scene is on stage or one away. While you're clicking in the site, keys go to the site; move the mouse off the frame and the deck keys work again. The site must allow framing (no `X-Frame-Options` / `frame-ancestors`).
- `presentation-guide.md`: hand this to Claude chat when writing the talk; it produces a `scene-description.md` for the coding agent.
- `components/Code.vue`: code with simple highlighting and per-step line focus (`:focus="{ 1: [3], 2: [5, 6] }"`).
- `components/UmbracoMark.vue`, `WordPressMark.vue`, `Shovel.vue`: SVGs. Pass `inline` to use them inside another `<svg>`.
- Palette and typography live in `src/styles/theme.css`. Fonts are bundled locally, so the deck works offline at the venue.
