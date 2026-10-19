# Plan: flip a card to show another scene on its back

Branch: `decks-folder`. Requested by the user: "Flip a scene and show another scene on the backside of it. The camera zooms out a bit, enough that you get a sense of 3D from the scene flipping on an axis or two, without going complete 3D."

This is a playground feature, so it falls under AGENTS.md rule 5: aim for about 15 minutes of work and light verification.

Read first:
- `AGENTS.md` and `README.md`
- `engine/App.vue`: `flyTo`, the ride section (`rideBetween` and `rideTo` are the model for a custom camera move between two neighbouring scenes), the formation section, `sceneStyle` and the scene classes
- `engine/layout.js` and `engine/useDeck.js`: `placeGhosts` and `placeOuter` are the model for "the engine sets `at`"
- `engine/formation.js`: the roles
- `scripts/check.mjs`
- `decks/example/deck.js`

## deck.js

```js
{ id: 'code', component: Walkthrough, steps: 2, at: { x: 6900, y: 300, r: -1 } },
{ id: 'code-back', component: CodeBack, back: 'code', flip: { axis: 'y' } },   // the other side of `code`
```

- `back: '<front id>'` makes the scene the back face of that card. The engine copies the front's `at`, so the back has no `at` of its own.
- `flip` is optional and only goes on the back scene. It takes:
  - `axis`: `'y'`, the default, turns the card like a page; `'x'` tips it over like a sign
  - `dir`: `1 | -1`
  - `tilt`: degrees on the other axis at mid-flip, default about 8. This is the "axis or two" from the request. It gives a little wobble so the turn doesn't look mechanical.
- **Constraints, with a `check` error for each:**
  - one back per front;
  - the front isn't a ghost, outer, back, formation or `skip` scene, and has no nested children;
  - the back isn't a ghost, outer, formation or skip scene, has no `parent` and no nested children.

  "No nested children" is fine for a first version. Nested cards are separate world cards and wouldn't turn with it.

## Rendering

- **Two sibling `.scene` elements at the same place:** keep front and back as two ordinary scene elements, so each keeps its own `is-active`, step and preview logic. Both get `backface-visibility: hidden`. The front turns by θ and the back by θ + 180°, about the same axis.
- **The transform:** add the 3D part *after* the card's own 2D part, inside its transform:

  `translate(…) rotate(r) scale(s) perspective(P) rotateY(θ) rotateX(tilt)`

  The perspective is then in card px and looks the same at any `s`. Use something like P = 2600 card px, and tune it until it reads as "a card turning on the table", not a fisheye. The world container stays 2D, so its flattening is fine.
- **Which face shows:** the back shows when the deck is at the back scene or anywhere after it in deck order. Before that, the front shows. The overview and hash jumps follow the same rule. `?sheet` and presenter thumbnails show each scene flat, as now.
- **Making it feel physical** (all cheap, all on the flipping card only):
  - a lift: the card scales to about 1.05 at mid-flip;
  - a bigger, softer shadow;
  - a faint sheen or shade over the face that goes with |sin θ|.

  Keep the 2D look at rest exactly as it is now.
- Back scenes overlap their fronts on purpose, so leave them out of `check`'s overlap warnings.

## The move

Moving **from the front to its back** — forward from the front's last step when the back is next in deck order — plays a flip instead of a flight. ← from the back plays it in reverse. Every other route (a hash jump, Home/End, the overview, X) just snaps the face to the rule above and flies normally. That mirrors `rideBetween`.

The flip has four phases, on one timeline of about 1.5–1.8 s total. Tune it until it feels good.

1. The camera pulls back from the card to about 1.4× the card's width, which is enough to see it as an object on the canvas. Ease-in-out.
2. The card turns, starting as the pull-back is about halfway done. Ease-in-out, with the tilt peaking in the middle.
3. The camera pushes back in to the card, slightly overlapping the end of the turn.
4. The back scene becomes `is-active` when the turn lands, not when it starts, so its entrance animations (`rise`, `fade-in`, `--d`) play on the visible face. The same goes for the front going back.

- Drive θ from the same rAF timeline as the camera, the way the ride drives its pill. Write it to a reactive object or a CSS variable on the two elements, so App doesn't re-render per frame.
- A new move while a flip is running cuts it short: the card snaps to the face the new target needs.
- With `prefers-reduced-motion`, cross-fade the two faces with no turn and no camera move.
- If the front scene has `frames`, the flip starts from the frame the camera is in. That's fine.

## Formation

For a formation, a flip pair counts as one card. The back scene gets the `fade` role, and the front moves as usual. A pair that's already flipped would then show its front in the ring. That's acceptable for v1; just say so in the README.

## Example deck

Give the `code` scene a back side: **`code-back`**, "what that code makes". The front shows a deck.js snippet, so the back should show the result: for example a mini canvas of a few cards with the camera frame, built with the deck's theme classes. Keep it simple, and make it look like the obvious other side of the card. Use the default `axis: 'y'`.

Add notes for `code-back`. Update the deck.js header comment.

## Docs

- `docs/presentation-guide.md`:
  - a toolbox row: "Flip: the card turns over on the canvas to show another scene on its back (question/answer, before/after, code/result)"
  - a cost-tier entry
  - one line for the scene-description format ("back of <scene>")
- `README.md`: `back` and `flip`, and the limits (no nested children; the formation shows the front).
- `AGENTS.md`: a pattern-index row.
- The build-deck skill's table.

## Verification (light)

- **Build:** `npm run deck -- build example` and `build shovelling-umbraco`.
- **Check:** run `npm run check` on both. The talk deck should give only its existing warning.
- **Sheet and grep:** the `?sheet` audit on example, and the rule 2 grep.
- **Screenshots:**
  - at `#code/2`, showing the front;
  - at `#code-back`, showing the back with the right way round, not mirrored;
  - at `#screens`, a later scene, with the card still showing its back in the overview (O).
- **Mid-flip:** freeze one mid-flip state by hand (set θ ≈ 90° and 135°), and check that the perspective and lift look right and nothing is mirrored.
- **Don't** record flights or measure frame times. The parent session records a video afterwards. Flights don't play in the hidden Browser pane.
- Say what you didn't check.

## Environment notes

- **Node** comes from fnm. In PowerShell, prefix commands with `fnm env --shell powershell | Out-String | Invoke-Expression;`. In Git Bash, use `git -C` and absolute paths.
- **Dev server:** run `npm run deck -- dev example --port 5180 --strictPort` in the background. Vite's watcher can miss edits: restart and reload if the DOM doesn't change.
- Leave the scratchpad worktree `rec-wt` alone.
- `package-lock.json` has an unrelated unstaged change. Don't commit it.

**Commits:** one for the engine (with docs, check.mjs and this plan), and one for the example scene. Each builds. End messages with a blank line and `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Don't push.

## Report (short)

- the commits
- what the screenshots show
- check and build results
- any deviations
- anything unverified
