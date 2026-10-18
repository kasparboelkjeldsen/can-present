# Plan: three things PowerPoint and Prezi can't do

Branch: `decks-folder`. Three camera/canvas effects, each a single short moment in a talk, each shown off in `decks/example`. They're implemented **one at a time, in order** (Part 1, then 2, then 3), each by its own agent, with a review in between. **Only do the part you were asked to do.**

Read first, every part: `AGENTS.md`, `README.md`, `docs/presentation-guide.md`, `engine/App.vue`, `engine/camera.js`, `engine/useDeck.js`, `engine/SceneFrame.vue`, `engine/useStep.js`, `engine/layout.js`, `engine/diagram.js`, `engine/components/Diagram.vue`, `scripts/check.mjs`, `engine/Sheet.vue`, and all of `decks/example/`. Also `git log --oneline -8` to see what the previous parts did.

## Shared constraints

- **Nothing changes for decks that don't use a feature.** `decks/shovelling-umbraco` is a real talk on 22 Oct 2026: don't edit any of its files, and its flights, timing and look must be identical. Check this in the browser (a few flights including a dive into `map`, the overview, `#numbers`), not just by reading code.
- `engine/` stays talk-agnostic (the AGENTS.md grep returns nothing). Colours come only from `--deck-*` tokens.
- **Performance:** 60 fps on a laptop is the bar. No per-frame Vue re-render of every scene; drive animation through the existing reactive camera or CSS transforms. Measure with `performance.now()` frame deltas during the effect, and report the numbers.
- **Respect `prefers-reduced-motion`:** fall back to the normal flight / an instant change.
- No new dependencies.
- Thumbnails stay calm: the presenter view (`ScenePreview`, `preview` = true) and `?sheet` never run these effects. They show the scene's resting state.
- Docs in the same commit as the feature (AGENTS.md rule 1):
  - `docs/presentation-guide.md` ("What the deck is", toolbox, cost tiers, and the layout vocabulary where relevant)
  - `README.md` (the deck.js fields and APIs)
  - the AGENTS.md pattern index
  - `.agents/skills/build-deck/SKILL.md` ("what to use for what")
  - `scripts/check.mjs` validates the new deck.js fields (errors for malformed values or bad references).
- `npm run check` (both decks: 0 errors), `npm run deck -- build <deck>` (both), and a clean `?sheet` audit on example.
- Commits end with a blank line and `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Leave `package-lock.json` unstaged. Don't push.
- Node comes from fnm. In PowerShell, prefix commands with `fnm env --shell powershell | Out-String | Invoke-Expression;`. In Git Bash, use `git -C` and absolute paths instead of `cd`.
- Vite's watcher sometimes misses edits on this machine. If the DOM doesn't reflect your change, restart the dev server and reload; changing only the hash doesn't reload.
- Verify in a real browser (the Claude Browser pane), with screenshot sequences during the motion. Stop every server you start.

## Part 1: Ride the packet (`via`)

**The moment:** the camera *becomes* a packet. Instead of the usual zoom-out-pan-in, the flight into a scene leaves along a diagram edge (or any path), follows its curve and elbows at close range with a pill riding at the centre of the screen, and then dives into the destination.

**API**

```js
import { ride } from '@engine/diagram.js'
{ id: 'inside', …, via: ride(arch, 0, ARCH, { label: 'scenes', zoom: 2.2 }) }
```

- `via` on a scene describes the flight **into** it from the previous scene in deck order. Going back (←) from it to the previous scene plays the same ride reversed. Any other move (overview click, hash, Home/End, X, skipping over it) uses the normal flight.
- `ride(diagram, edgeIndex, parentAt, opts)` turns the edge's path from the diagram's 1920×1080 space into world coordinates, using the same transform as `nest()`. Options:
  - `label` (pill text; none means no pill)
  - `zoom` (how close the camera rides: the card's on-screen scale during the ride, default about 2)
  - `reverse` (ride the edge backwards)
  - `tone` (pill colour, like packets)
  - `speed` (world px/s at ride zoom, sensible default)
- A lower-level form exists for any path: `via: { path: 'M… ', space: parentAt, label, zoom, … }`. `ride()` is sugar over it. The path can be any SVG path in a parent's local space.
- **Flight:** three phases that read as one continuous motion, with no stop between them.
  1. Fly from the current view to the path's start at ride zoom (a van Wijk-style zoom, eased in).
  2. Follow the path at a constant on-screen speed. The camera rotates at most slightly (an optional `bank` of a few degrees into turns, off by default).
  3. Fly from the path's end into the destination's view (eased out).
- Sample the path with an off-screen `SVGPathElement` (`getTotalLength` / `getPointAtLength`), and precompute the samples once per ride.
- Total duration is clamped to roughly 1.5–4 s.
- **The pill** sits in the world layer at the current path point (so it's at the screen centre while riding). It's styled like a Diagram packet and themed by tokens, appears at the start of phase 2 and disappears at the end.
- While a ride runs, a new navigation cancels it cleanly and flies normally from wherever the camera is.
- Arrows on the edge may stay as they are. The real packets on that edge may keep flowing.

**Example deck:** make the dive from `diagram` into `inside` a ride along the `import` edge carrying "scenes". Add one more nested scene living in a slot of the Browser node (e.g. "one big canvas"), reached by riding the render edge out of the engine. Its story: what the browser does with the scenes. Adjust the diagram slightly if the browser box needs room for a slot. Update notes.

**Check:** `via` must reference a valid path/edge. Warn if the scene before a `via` scene isn't the path's natural start (e.g. not the parent or a sibling), since a ride from far away looks odd.

## Part 2: Zoom that reveals detail (camera framing per step, `<Detail>`)

**The moment:** content depends on how close the camera is, like a map. From afar a box says "API". As the camera moves in, its endpoints fade in. Closer still, one endpoint's real code appears. It's one smooth "powers of ten" dive inside a single scene, driven by clicks.

**API**

1. **Camera framing per build step:** `frames` on a scene in deck.js.
   ```js
   { id: 'deeper', steps: 3, frames: { 1: { cx: 1200, cy: 640, w: 480 }, 3: { cx: 1302, cy: 655, w: 60 } }, at: … }
   ```
   - On a step with a frame, the camera flies to that box (in the card's local 1920×1080 space, 16:9, `w` in card px) instead of the whole card. Steps without a key keep the previous frame, and step 0 is the whole card.
   - Use the normal van Wijk flight between frames, so zooms of 30× feel smooth.
   - Leaving the scene, or entering it from elsewhere, works as today. Coming back with ← enters at the last step's frame.
   - In the overview and thumbnails, frames are ignored.
2. **Camera zoom for scenes:** `useStep()` gains `zoom`, a computed number: the card's on-screen scale. 1 means the card exactly fills the stage, 0.1 means far away, 8 means 8× in. It comes from a shared camera module (move `cam` out of App.vue into e.g. `engine/cameraState.js` so scenes can read it without an import cycle). In thumbnails, `zoom` is 1.
3. **`<Detail>`** (`engine/components/Detail.vue`): `<Detail :from="2" :to="6" tag="div">…</Detail>` shows its content only while `zoom` is within the range.
   - It fades over a soft band: opacity ramps from `from × 0.7` to `from`, and back down from `to` to `to × 1.3`. The fade scrubs with the camera rather than running as a timed transition, so the content materialises *while* you zoom.
   - `:until="0.3"` is shorthand for `to`, e.g. a giant label that's only readable from far away, as in the overview.
   - Content faded out is `visibility: hidden` and doesn't take pointer events.
4. **Sharpness:** text must stay crisp at 30×. Check that the world transform doesn't leave rasterised text blurry at deep zoom (avoid `will-change: transform` on large layers during frames, or toggle it). Show a screenshot at the deepest frame.

**Sheet:** in `?sheet&steps`, draw the step's frame box as an outline on its tile.

**Example deck:** a new scene, `deeper`, a "powers of ten" in 3–4 clicks.
- **The idea:** a can-present scene seen from afar is one shape. Zooming in shows it's made of a scene, then a component, then a line of code, then a single character. At the bottom, the character turns out to contain the title scene itself, recursively: zooming into the dot of an "i" reveals the deck. End the scene there.
- Use `<Detail>` at each level so content materialises as you zoom. Keep text at least 26px *at the zoom level it's read at*. The sheet audit measures the card at zoom 1, so mark the deep-zoom content `data-audit="ignore"` and explain why in a comment.
- **Also add one overview easter egg:** a `<Detail :until="0.25">` label on a scene that only shows when zoomed far out, e.g. region names readable in the overview.
- **Check:** `frames` keys must be integers from 1 to `steps`, and boxes must be inside the card.

## Part 3: The deck rearranges itself (`formation`)

**The moment:** at the end, the camera pulls back over the whole talk, and then every card *moves*. They leave the path and swing into a new formation around the final scene (a ring that slowly orbits, a grid, a spiral, or the points of a shape) in one staggered, springy motion. Leaving the scene sends them home.

**API**

```js
{ id: 'finale', component: Finale, at: { x: …, y: … }, formation: { shape: 'ring', spin: 60 } }
```

- `formation` on a scene: when that scene is on stage, every other non-ghost, non-skipped, top-level card moves to a formation slot. Nested cards move with their parent. Skipped and ghost cards fade out.
- Shapes:
  - `ring` (radius auto-fitted to the card count, optional `spin` = seconds per orbit, applied as a slow rotation of the whole formation)
  - `grid` (`cols`, auto by default)
  - `spiral`
  - `points` (an array of `[x, y]` relative to the formation scene's centre, for custom shapes)
  - `fn(i, n) → { x, y, r?, s? }`

  Card scale in the formation is auto-fitted (`s` option to override). The order follows deck order.
- **Choreography,** one press:
  1. The camera pulls back to frame the *normal* layout (about 700 ms).
  2. The cards fly to their slots with a staggered delay (about 40–60 ms apart), a springy ease and a little overshoot rotation, while the camera eases to frame the formation.
  3. Optionally the ring starts orbiting.

  Leaving reverses it: cards go home, then the normal flight. Total under about 3 s.
- Implement the card motion with CSS transform transitions on the existing scene elements, with per-card `transition-delay`. Make sure the transform functions interpolate cleanly (same function list, same order). Don't animate per frame in JS for 20+ cards.
- The overview (O) during a formation shows the normal layout. Thumbnails and the sheet ignore formations.
- **Check:** shape is valid, at most one formation scene per deck (warn otherwise), and the formation scene isn't nested or a ghost.

**Example deck:** turn the ending into the finale.
- After the loop, the takeaway stays as it is.
- The last scene becomes the finale: the thanks card in the centre, all the other scenes orbiting it as a ring.
- Make it delightful but short. The thanks text can reference what just happened ("every scene in this deck just came back to say goodbye").
- Place it so the pull-back reads well.
- Notes.

## Report (every part)

- commits
- `check` and build output for both decks
- sheet audit
- the frame-time numbers during the effect
- exactly what you verified in the browser, including that the talk behaves identically
- deviations
- anything unverified
