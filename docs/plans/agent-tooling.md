# Plan: agent tooling (batch A)

Branch: `decks-folder`. Goal: make it cheap and reliable for a coding agent (Claude Code, Codex, Copilot) to build a **new** deck. Most of the time and tokens go on visual verification by screenshot and on hand-transcribing content. So: give text feedback for mechanical mistakes, one-screenshot visual checks, a scaffold that does the transcription, and skills that encode the workflow.

Read first: `AGENTS.md`, `README.md`, `docs/presentation-guide.md`, `decks/example/` (all files), `engine/main.js`, `engine/useDeck.js`, `engine/SceneFrame.vue`, `engine/ScenePreview.vue`, `engine/Step.vue`, `engine/useStep.js`, `engine/vite.js`, `vite.config.js`, `engine/components/Code.vue`, `engine/components/Shot.vue`, `engine/styles/engine.css`.

Constraints: no new npm dependencies (Vite's JS API, Node built-ins and Vue are enough). `decks/shovelling-umbraco` must not change at all. `engine/` stays talk-agnostic (the grep in AGENTS.md rule 2 returns nothing). Docs are updated in the same commit as the feature (AGENTS.md rule 1).

## 1. `npm run deck` — one wrapper, no env-var syntax

`scripts/deck.mjs`, wired as `"deck": "node scripts/deck.mjs"`:

```
npm run deck -- dev [deck]        # vite dev server
npm run deck -- lan [deck]        # dev server on the network (--host)
npm run deck -- build [deck]
npm run deck -- preview [deck]
npm run deck -- check [deck]      # see 2
```

`[deck]` defaults to package.json `canPresent.deck`. It sets `process.env.DECK` and uses Vite's JavaScript API (`createServer`, `build`, `preview`) with the normal `vite.config.js`. Don't spawn a shell. Extra args after the deck name (e.g. `--port 5180`) are passed through for dev, lan and preview. Unknown command → usage text. Keep the existing `dev`, `dev:lan`, `build` and `preview` scripts. Add `"check": "node scripts/deck.mjs check"`.

## 2. `npm run check` — text lint of a deck

`scripts/check.mjs` (exported function, called by deck.mjs). It loads the deck exactly as the app does: a Vite server in middleware mode (`appType: 'custom'`), then `ssrLoadModule('@deck/deck.js')`, then close the server. For every scene, it gets the SFC source path. The simplest way is to read the deck.js source and map import names to files. Don't rely on component internals.

Findings are `error` (exit code 1) or `warn`. One line each: `ERROR  <scene-id>  <message>`, then a summary line. `--json` prints the same as JSON.

Errors:
- duplicate ids; ids that aren't kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`)
- `parent` that doesn't exist
- a scene with no `component` or no `at` (except `ghost` with `at: null`)
- inferred build steps **greater** than `steps` (builds that can't be reached)

Warnings:
- inferred build steps **less** than `steps` (dead clicks). Inference is a heuristic over the scene's SFC source:
  - literal `:at="n"` / `:until="n"` on `<Step>`
  - numeric keys of literal `:focus="{…}"` / `:callouts="{…}"` objects
  - `step >= n` / `step.value >= n` → n; `step > n` → n+1; `step === n` → n
  
  If the scene uses a non-literal `:at` (e.g. `:at="i"`) or nothing is found, report the inference as unknown and skip both step checks for that scene. Never guess.
- a scene with no `notes.json` entry, or an empty one; a `notes.json` key with no scene
- top-level scenes (not nested, not ghost) whose cards overlap on the canvas. Use the rotated rectangle (1920×1080 × s, rotated r° around x/y) and a real polygon intersection test (SAT), not bounding boxes. Give a small tolerance.
- a nested scene whose card isn't inside its parent's card
- `/shots/…` or `/assets/…` paths referenced in the deck's scene/component sources (string literals and CSS `url()`) that don't exist in `decks/<deck>/public/`. List them as a TODO, since the speaker supplies screenshots.
- an SFC whose template root doesn't have the class `slide`

**Calibrate on the real talk.** `npm run check -- shovelling-umbraco` must report 0 errors. If it flags something in the talk, decide whether it's real (then report it to me, don't change the talk) or a false positive (then fix the check). `npm run check -- example` must be clean.

## 3. `?sheet` — the whole deck in one screenshot

New engine page `engine/Sheet.vue`, selected in `engine/main.js` when the query has `sheet` (before `presenter`). It must **not** import `useDeck.js`, which has side effects: keys, hash, BroadcastChannel. Import `@deck/deck.js` directly.

- A grid (4 columns by default; `?sheet&cols=3`) of every scene, in deck order, each rendered with `SceneFrame` at its last step (`preview` on, so live iframes stay placeholders, and `active` off), scaled to the tile like `ScenePreview`.
- A label under each tile: number, id, title, `steps`, and flags (`skip`, `ghost`, `in <parent>`).
- `?sheet&steps` renders one tile per build step (0…steps) for each scene, for checking builds.
- `?sheet&only=id1,id2` limits it to some scenes.
- **Audit**, about 1.5 s after mount (fonts loaded, transitions settled), for each tile:
  - text elements (elements with a non-whitespace direct text node) whose computed `font-size` < 26px;
  - text elements whose box extends outside the 1920×1080 card. Measure in card pixels, so divide the client rect offsets by the tile scale.
  - the `.slide` root overflowing (`scrollWidth > 1920 || scrollHeight > 1080`).
  
  Skip anything inside `[data-audit="ignore"]`. Mark the engine's own small chrome with it: Shot's URL bar and launch card labels, and Code's title bar, if they're under 26px.
- Show the results three ways:
  - a red badge with the count on each tile, with the offending elements outlined;
  - a plain-text findings list at the top of the page (`<scene-id>/<step>: <kind> "<first 40 chars of text>" <size>px`), so `get_page_text` returns it;
  - `window.__deckAudit` = the findings array, plus `console.table`.
- Styling: engine tokens only, on `--deck-canvas`.

Run `?sheet` on the talk and include the findings count in your report. Expect some, e.g. small diagram labels. Don't change the talk.

## 4. `npm run new-deck` — scaffold, optionally from a scene description

`scripts/new-deck.mjs`, wired as `"new-deck": "node scripts/new-deck.mjs"`:

```
npm run new-deck -- <id> [--title "…"] [--icon 🎬] [--from path/to/scene-description.md]
```

It refuses to overwrite an existing `decks/<id>`. It copies `templates/deck/` (new; not under `decks/`, so it can't be selected as a deck) and fills in id/title/icon.

`templates/deck/` contains:
- `deck.js`: the same header comment as the example's.
- `theme.css`: every engine token set; slide variants `slide--dark`, `slide--light`, `slide--accent`; `.kicker`, `.h1`, `.h2`, `.lead`, `.accent`, `.callout`, `.callout--green`, `.card`, `.fineprint`. A neutral but good-looking palette, with comments saying what to change for a brand.
- `notes.json`
- `brief.md`: the sections the guide expects (the talk, how to work with the speaker, visual language, deck components, canvas layout, scenes), with `TODO:` placeholders.
- `scenes/Title.vue`
- `public/shots/.gitkeep`

With `--from`, it parses the format defined in `docs/presentation-guide.md`. Be tolerant: `–`, `—` or `-` in headings, extra whitespace, missing fields.
- Deck title from `# Scene description: <title>` (unless `--title` is given).
- For each `### <n>. <id> – <Title>`:
  - **Background**: maps to a theme variant. Unknown words become `slide--dark`, with a TODO.
  - **Builds**: count the numbered items, or 0 for "none".
  - **Notes**: the bullets, joined with `\n`, keeping the bullet text.
  - **On screen / Animation / Position**: kept verbatim.
- One scene file per scene (`PascalCase(id).vue`), so the stub renders and navigates straight away:
  - a top comment with On screen, Animation, Builds and Position, verbatim;
  - the right slide variant, the scene title as the `.h2`;
  - one `<Step :at="n">` per build, containing that build's text.
- `deck.js` entries with id, title, component and `steps`. Default layout: a left-to-right path, 2300px apart, gently alternating y (±250) and r (±2°). If a Position says "inside …", add a `// TODO: nest inside <x> (see Position)` comment on that entry.
- `notes.json` from the notes.
- The "Assets needed" section goes into `brief.md`.
- A copy of the source at `decks/<id>/scene-description.md`.

At the end it prints the next steps: run, check, sheet, then fill in the scenes.

Add `docs/examples/scene-description.example.md`: a short (5–6 scene) but complete example in the guide's format, with one nested scene, one code scene and one scene with builds. It's the parser's fixture and a format example for agents.

**Test it:** `npm run new-deck -- scaffold-test --from docs/examples/scene-description.example.md`, then `npm run check -- scaffold-test` (no errors) and `npm run deck -- build scaffold-test`, then delete `decks/scaffold-test`. Don't commit it.

## 5. Skills: portable across Claude Code, Codex and Copilot

Canonical skills live in **`.agents/skills/<name>/SKILL.md`**. Codex reads `.agents/skills`; Copilot reads `.agents/skills`, `.github/skills` and `.claude/skills`. Claude Code reads `.claude/skills`, so add **`.claude/skills/<name>/SKILL.md` stubs**: the same frontmatter, and a body that says only to read and follow `.agents/skills/<name>/SKILL.md`. Frontmatter is `name` (lowercase-hyphen, same as the folder) and `description` only, so it works everywhere. Front-load the trigger words in `description`.

`build-deck`: turn a scene description (or a user's topic, via write-talk) into a finished deck. It covers:
- **The procedure:** `new-deck --from` → theme from the brand → scenes in order → layout pass → `check` → `?sheet` (and `?sheet&steps` for scenes with builds) → spot-check flights and the overview in the browser.
- **Layout rules of thumb:**
  - spacing 2200–2400px between neighbours;
  - rotations within ±3°;
  - long flights for act changes;
  - regions tell the story in overview;
  - nested slots: the parent draws the box, and the box is 16:9;
  - `s` > 1 for "bigger than normal".
- **The theme recipe:**
  - which tokens matter;
  - fonts via `@fontsource/*` imported in deck.js (offline at the venue; adding a fontsource package is the one allowed dependency, ask first);
  - contrast rules;
  - alternating backgrounds.
- **What to use for what:** the toolbox mapped to engine components and to the AGENTS.md pattern index.
- **The definition of done:** check clean, sheet audit clean or every finding explained, every scene has notes, build passes, a TODO list of missing assets for the speaker.
- Under about 150 lines. It links to the README and AGENTS.md instead of repeating them.

`write-talk`: when the user wants to create or rework a talk in this repo:
- follow `docs/presentation-guide.md` interactively;
- capture the talk and visual language in `decks/<id>/brief.md` (template: `templates/deck/brief.md`);
- write `decks/<id>/scene-description.md` in the guide's format;
- then offer to scaffold with `new-deck --from` and continue with build-deck.

It points to the guide, it doesn't copy it.

## 6. Docs

- `AGENTS.md`:
  - Commands: the `deck` wrapper as the primary way to run things (keep the env-var form as a footnote), `check`, `?sheet`, `new-deck`.
  - A short "Skills" section listing both skills with their `.agents/skills/…` paths, so agents without skill support can read them.
  - Verification step 2 uses check + sheet before any screenshots.
  - The table row "Building or editing a deck" mentions build-deck.
- `README.md`: commands, `?sheet`, `check`, `new-deck`, and `templates/`, `scripts/`, `.agents/` in the layout.
- `docs/presentation-guide.md`: no change. These are builder tools, not things a talk can do.

## Commits

Commit `AGENTS.md`, `CLAUDE.md`, the README line and this plan first (already written, uncommitted). Then one commit per section above, each building. Leave the pre-existing `package-lock.json` change unstaged. End messages with a blank line and `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Report

Commits; the output of `npm run check` for both decks; the `?sheet` audit count for both decks and a few sample findings for the talk; the scaffold test results; anything in the talk the check flagged as real; judgement calls.
