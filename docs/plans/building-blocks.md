# Plan: engine building blocks (batch B)

Branch: `decks-folder`. Goal: the toolbox in `docs/presentation-guide.md` promises diagrams and big numbers "cost nothing", but today they only exist inside the Shovelling Umbraco talk, styled for Kraftvaerk. Promote them to the engine as `<BigNumber>` and `<Diagram>`, themed through tokens, and turn `decks/example` into a kitchen sink with one scene per toolbox block. The user approved the API below; implement it as specified and flag any deviation.

Read first: `AGENTS.md`, `README.md`, `docs/presentation-guide.md`, the `build-deck` skill in `.agents/skills/`, `decks/example/` (all files), `engine/useStep.js`, `engine/useCount.js`, `engine/Step.vue`, `engine/layout.js`, `engine/styles/engine.css`, `engine/Sheet.vue`, `scripts/check.mjs`. Reference implementations to learn from (read them, but **never edit them**): `decks/shovelling-umbraco/scenes/Map.vue` + `scenes/map/geometry.js` (diagram, timer reveal, packets, nested slots), `OneInstance.vue` and `Numbers.vue` (count + ring).

Constraints: no new dependencies. `decks/shovelling-umbraco` must not change at all. `engine/` stays talk-agnostic (the AGENTS.md grep returns nothing). Engine colours are `--deck-*` tokens only. The guide, README, AGENTS.md pattern index and the build-deck skill are updated in the same commits as the features (AGENTS.md rule 1).

## 1. `<BigNumber>` (`engine/components/BigNumber.vue`)

```vue
<BigNumber :to="6836" ring label="loads" />
<BigNumber :from="10" :to="1" :size="330" :at="1" tone="accent-2" suffix="×" />
```

- Props:
  - `to` (required), `from` (default 0), `at` (build step that triggers the count; default 0 means "when the scene comes on stage")
  - `duration` (1400), `delay` (300)
  - `ring` (bool), `tone` (`accent` | `accent-2`, for the ring)
  - `format` (`grouped` default, using `Intl.NumberFormat('en-US')`; `plain`; or a function), `decimals` (0), `prefix`, `suffix`
  - `label` (or a `#label` slot), `size` (px of the number, default 240)
- Behaviour: built on `useCount`, which may need extending for decimals and a step trigger; keep its existing API working because the talk uses it.
  - Counts when triggered.
  - Shows the final value when the scene is past, in the overview (`step === Infinity`) and in `preview`.
  - Re-counts each time the scene comes on stage.
  - The ring draws itself in sync with the count, using the `pathLength="1"` dash trick.
- Styling:
  - The number uses `font-family: var(--display-font, inherit)` with tabular numerals.
  - Ring colour is `--deck-accent` / `--deck-accent-2`. The label inherits the colour.
  - Add `--display-font` to the token docs.

## 2. `<Diagram>` (`engine/diagram.js` + `engine/components/Diagram.vue`)

The definition lives in a plain `.js` file, so the scene and `deck.js` share it:

```js
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

The scene: `<Diagram :diagram="arch">` with optional `#node-<id>` slots (slot props: `{ node, shown }`) that replace a node's default content.

deck.js uses the same definition:
- `steps: arch.steps`
- `at: nest(ARCH, arch.slot('inside'))`
- `revealAt: arch.revealAt('api')` in steps mode, or `revealDelay: arch.revealDelay('api')` in timer mode.

### `defineDiagram(def)`

Validates the definition and throws clear errors for unknown node ids in edges, packets and slots, or for a missing `x/y/w/h`. Returns the normalised definition plus helpers:
- `steps`: in steps mode, the highest node or edge `at`; 0 in timer mode.
- `slot(name)` → `{ cx, cy, w, h }` in the scene's 1920×1080 space. A slot's `cx`/`cy` are relative to its node's top-left. Slots are 16:9, so `h = w * 9 / 16`.
- `revealAt(nodeId)` → the step that node appears on.
- `revealDelay(nodeId)` → in timer mode, the ms at which that node's stage appears, plus 150.

### Nodes

- An absolutely positioned rounded box (radius from `--radius`), showing `label` (bold, at least 26px) and an optional `sub`.
- `tone` sets the colours from tokens:
  - `default` (`--deck-paper` background, `--deck-ink` text)
  - `ink` (inverse)
  - `accent` (`--deck-accent` / `--deck-on-accent`)
  - `ghost` (transparent, dashed border in `currentColor`)
- `class` adds deck classes. `at` defaults to 1 in steps mode and stage 1 in timer mode.
- A node appears with a pop animation; reuse the `<Step>` mechanics or the same CSS.

### Edges

- `from`/`to` are node ids; `at` defaults to the later of its two nodes.
- Auto-routing:
  - Pick the facing sides: if the horizontal gap between the boxes is at least the vertical gap, use left/right sides; otherwise top/bottom.
  - Connect the side midpoints. If they don't line up, route H-V-H (or V-H-V) with the elbow halfway.
  - `offset` (px) shifts both endpoints perpendicular to the side, for parallel lanes.
  - `path` (an SVG path string) overrides the routing.
- Arrows: an arrowhead at `to`; `both` adds one at `from`; `arrow: false` gives none. Markers use `context-stroke` or a per-colour marker; colour comes from `--deck-ink`, or the edge's `tone`.
- Drawing:
  - The edge draws itself (dash trick) after both nodes are visible.
  - Arrowheads stay hidden until the line has drawn; Map.vue shows how, since markers ignore the dash.
  - `label` sits at the path's midpoint, offset off the line, at least 22px. It's an SVG text inside the diagram, so mark it `data-audit="ignore"` if it's under 26px. Better: default it to 26px.

### Packets

- Pills (rounded rect plus text) that loop along their edge's path with SMIL `animateMotion`; `reverse` uses `keyPoints="1;0" keyTimes="0;1" calcMode="linear"`.
- `dur` (default 3.6s), `delay` (s).
- They fade in and out at the ends, like Map.vue.
- They start only once their edge is drawn, and don't render in `preview`.
- Pill width is measured from the text (`getComputedTextLength` after mount), with a character-count fallback.
- Colours: `--deck-ink` pill with `--deck-paper` text, or the packet's `tone`.

### Slots

Dark translucent rounded rectangles drawn in the scene at `slot(name)`, shown together with their node. This is where nested scenes sit.

### Reveal

- **steps:** follows the scene's `useStep().step`, so past and overview show everything.
- **timer:** reproduces Map.vue's logic exactly.
  - Stages advance on the listed ms after the scene comes on stage.
  - Coming back from a later scene (step was Infinity) shows everything at once.
  - When not on stage and not past, the diagram is at stage 0.
  - Clean up timers.

### Check and sheet

- `scripts/check.mjs`: when an SFC uses `<Diagram`, don't report its step inference as unknown. Note instead that steps come from the diagram, and skip the comparison.
- `?sheet`: make sure diagrams render at their final state in tiles (no timers in preview).

## 3. `decks/example` becomes the kitchen sink

One scene per toolbox block in `docs/presentation-guide.md`, each small, good-looking and commented so an agent can copy it. The order should flow as a mini-talk "about can-present", and the overview layout should tell a story (a path with one dive).
1. **title**: headline + kicker (keep the existing one, without the dashed nesting box).
2. **cards**: three cards popping in on clicks (theme `.card` + `<Step anim="pop">`).
3. **number**: `<BigNumber>` with ring and a punchline on a step.
4. **code**: the existing walkthrough.
5. **diagram**: `<Diagram>` in steps mode with three or four nodes, edges, packets and one slot.
6. **inside**: a scene nested in the diagram's slot (replaces today's title-box nesting), placed with `nest(…, arch.slot(…))` and `revealAt`.
7. **screens**: two tilted `<Shot>` placeholders.
8. **live**: `<Shot live="https://example.com/">` or a launch card. Use a site that allows framing; if unsure, use `external`.
9. **loop**: a small looping SVG illustration (CSS/SMIL, about 40 lines, themed by tokens).
10. **takeaway**: a ghost scene (`ghost: true, at: null`).
11. **fallback**: `skip: true` (X jumps there).
12. **thanks**.

Every scene gets notes. The example's `.kicker` is 24px today, which the sheet audit flags: make it 26px like the template. The kitchen sink should audit clean. Add `.card` and anything else needed to the example theme. Keep the example theme's own look; don't copy Kraftvaerk.

## 4. Docs

- `docs/presentation-guide.md`: the toolbox rows for Big number and Diagram describe what's now real (ring, formats, packets, self-building diagrams, nested slots, timer vs steps). Mention that the example deck shows every block.
- `README.md`: Building blocks section with both components' props, and the `defineDiagram` helpers. Add `--display-font` to the token table.
- `AGENTS.md` pattern index: point Big number and Diagram at the engine components and at the example scenes first; keep the talk files as "more elaborate" references.
- `.agents/skills/build-deck/SKILL.md`: update "what to use for what".
- `templates/deck/theme.css`: include `.card` and `--display-font` if missing.

## Done when

1. `npm run check -- example` and `-- shovelling-umbraco` show 0 errors; `npm run build` works for both decks.
2. `?sheet` on example: every scene renders, and the audit is clean or every finding is explained. `?sheet&steps&only=diagram,number,cards` shows the builds correctly.
3. In a browser: the diagram builds step by step, edges draw after their nodes, packets flow and reverse correctly, and the nested scene appears on its step with the camera diving into the slot. BigNumber counts and re-counts on return, and shows its final value in the overview.
4. The grep in AGENTS.md returns nothing, and `git diff main -- decks/shovelling-umbraco` shows only the earlier moves.
5. Small commits (BigNumber; Diagram; check/sheet tweaks; kitchen sink; docs, or docs folded into each feature commit), each building, each ending with a blank line and `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Leave `package-lock.json` unstaged.

## Report

Commits; check output for both decks; sheet audit for example; what you verified in the browser and how; deviations from the API; anything unverified.
