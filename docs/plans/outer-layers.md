# Plan: outer layers (keep zooming out)

Branch: `decks-folder`. Requested by the user: "You know how we have the option of having some text in front of all the scenes, how far can that go? Could we keep zooming out to reveal more text?"

This is a playground feature: see AGENTS.md rule 5. Aim for about 15 minutes, with light verification.

Read first: `AGENTS.md`, `README.md`, `engine/layout.js` (`nest`, `coverAll`, `placeGhosts`), `engine/useDeck.js`, `engine/App.vue` (`viewFor`, `overviewView`, the scene classes, ghost CSS, grid), `engine/formation.js` (the roles), `engine/components/Detail.vue`, `scripts/check.mjs`, `decks/example/deck.js`.

## The idea

At the end of a talk the camera pulls back, and the whole talk turns out to sit in a tiny spot of a much bigger card, for example the dot on an "i". Another click, and that card turns out to be the full stop of an even bigger sentence. Each layer is an ordinary scene that the engine places *around* what came before. Because the van Wijk flight is logarithmic, a 50× pull-back takes only a little longer than a normal flight.

## deck.js

```js
{ id: 'bigger',  component: Bigger,  outer: { hole: { cx: 1210, cy: 380, w: 36 } } },
{ id: 'biggest', component: Biggest, outer: { hole: { cx: 1702, cy: 640, w: 30 } } },
```

- `outer.hole` is a box `{ cx, cy, w }` (16:9) in the outer card's own 1920×1080 space. It's the reverse of `nest()`: the engine scales and positions the outer card so that its hole lands exactly on what it wraps.
- **What a layer wraps:**
  - the first outer scene (in `scenes` order) wraps **the talk**, using the same bounding box the overview uses (top-level, non-ghost, non-outer scenes, rotation included). Factor that into one shared function in `layout.js` and use it in both places;
  - each later outer scene wraps **the previous outer scene's card**.
- The hole is 16:9 and the box being wrapped generally isn't, so fit the box inside the hole, centred, the way the overview does with `max(bw, bh·W/H)`.
- Outer scenes have no `at` (the engine sets it), no `parent`, and aren't `ghost` or `formation`. Rotation is 0.
- **Placement:** add `placeOuter(scenes)` next to `placeGhosts` and call it from the same place. Ghosts are placed first and keep covering only the talk.

## Behaviour

- **Hidden until reached:** an outer scene is visible only while the current scene index is ≥ its own index. It fades in over about 1 s, like a ghost, and going back hides it again. Otherwise its giant letters would show at the edge of normal scenes and in the overview. In `?sheet` and presenter thumbnails it renders as a normal card.
- **Overview (O):** skip outer scenes, as it skips ghosts, so O still frames the talk.
- **Formation:** outer cards get the `fade` role, like ghosts. If an outer scene comes right after a formation scene, the normal "cards go home while the camera pulls back" behaviour should just work. Check it once.
- **Stacking and visuals:** outer cards are transparent, with no card shadow or radius, so they read as text written on the canvas. They paint *under* the talk's cards, which they wrap; giving them `z-index` below normal scenes is fine.
- **Dot grid:** the stage grid moves with the camera. Check it at the outermost layer: if it turns into mush or moiré at extreme zoom-out, fade it out or space it out by zoom. Pick whichever is simplest.
- **Precision:** Chrome's compositor works in 32-bit floats. Keep the total zoom ratio (talk width ÷ outermost card width, in world units) reasonable. In `check.mjs`, warn when it goes over 10,000×.

## check.mjs

- validate `outer.hole`: a number box, `w > 0`, inside the card (reuse the shape of `validateFrames`' messages if convenient);
- error on an outer scene with `at`, `parent`, `ghost` or `formation`;
- exclude outer scenes from the overlap warnings;
- add the total-ratio warning above.

## Example deck: "the talk was a word"

Add two scenes after `thanks`. The formation sends the cards home as the camera pulls back.

1. **`bigger`:** one big line of text on the canvas, where the talk sits inside the dot of an "i". Suggested copy: "All of that fits in the dot of an i." You choose the copy, and the hole is where the dot is.
   - When the speck of talk gets too small to read, a real dot fades in at the hole: `<Detail :until="…">` with an accent circle, so it scrubs with the camera.
   - Draw the "i" and the dot yourself, e.g. a dotless ı followed by your own dot element, so the hole's coordinates are exact rather than depending on font metrics.
2. **`biggest`:** a short sentence in which the whole `bigger` card is the full stop. Suggested copy: "It's canvases all the way down." The full stop can also fade in as a real dot once `bigger` is a speck.

Notes for both scenes in `notes.json`. Keep text on these cards within the deck's usual sizes. They're normal cards at their own scale.

## Docs

- `docs/presentation-guide.md`:
  - a toolbox row: "Outer layers: pull back past the whole talk to reveal it was a tiny part of a bigger card (the dot on an i), as many times as you like"
  - a cost-tier entry
  - one line for the scene-description format (which spot of the outer card holds what came before)
- `README.md`: the `outer` field.
- AGENTS.md: a pattern-index row.
- The build-deck skill's table.
- The comment block at the top of `decks/example/deck.js`.

## Verification (light)

- `npm run deck -- build example` and `build shovelling-umbraco`.
- `npm run check` on both. The talk deck should show only its existing warning.
- `?sheet` audit on example.
- The rule 2 grep.
- One look in the browser:
  - screenshots at `#bigger` and `#biggest`
  - the overview (O) still framing only the talk
  - a normal scene showing no stray giant letters
- **Don't** record flights or measure frame times. The parent session will record a video afterwards. The Claude Browser pane is hidden, so rAF barely runs and flights won't play there. Screenshots at a hash are fine, because the camera snaps.
- Say what you didn't check.

## Environment notes

- Node comes from fnm. In PowerShell, prefix commands with `fnm env --shell powershell | Out-String | Invoke-Expression;`. In Git Bash, use `git -C` and absolute paths.
- Run `npm run deck -- dev example --port 5180 --strictPort` in the background. Vite's watcher can miss edits: if the DOM doesn't change, restart and reload.
- Leave the scratchpad worktree `rec-wt` alone.
- `package-lock.json` has an unrelated unstaged change: don't commit it.

Commits: one for the engine (with docs, check.mjs and this plan), one for the example scenes. Each builds. End messages with a blank line and `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Don't push.

## Report (short)

- the commits
- the zoom ratios of the two layers
- what the screenshots show
- check and build results
- any deviations
- anything unverified
