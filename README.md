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
| Home / End | first / last |

The URL hash (`#pipeline/2`) keeps your place across reloads.

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
