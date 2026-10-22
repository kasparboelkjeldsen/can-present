# Brief: No dumb questions

> **For Claude (chat):** read this together with `docs/presentation-guide.md`. The guide says what the engine can do and the `scene-description.md` format; this file is the talk, the speaker and the deck's look. Where they disagree, this file wins.

## The talk

- **Title:** No dumb questions
- **What it is:** an explainer, not a talk. It's read (or walked through one-to-one), so there are **no speaker notes**: every card carries its own explanation. `notes.json` is deliberately empty, and `npm run check` warns about that once per scene.
- **Who made it, for whom:** Kaspar, for a coworker who sits in a decision group about AI and agentic coding, feels out of his depth, and asked for "the dumb questions". It doubles as a refresher for Kaspar, a generalist rather than an ML specialist.
- **Audience:** a mid/senior developer who uses AI daily through something like Copilot but has never looked at what's underneath. Smart, not a specialist.
- **Tone:** Kurzgesagt-style: zoom in and out, helicopter and deep dive, treat the reader as smart. Maths is fine if it's dead simple and explained. Text can be denser than in a talk, but every card must still read like a slide.
- **Length:** 37 cards, self-paced. About 30–40 minutes if someone talks it through.
- **The device:** "But what does that mean?" (the pink bubble) comes before each zoom into the next layer down.

## How to work with the speaker

1. **Story first.** Agree on the arc before discussing any visuals.
2. **Then scenes.** One idea per scene. If a scene needs more than about 3 sentences of explanation, split it.
3. **Then visuals.** For each scene, pick one strong visual idea from the guide's toolbox. Don't decorate every scene.
4. **Then write `scene-description.md`** in the guide's format and hand it to the coding agent.

Ask before inventing facts. Things that are facts about the office, not about the field:

- **The office box:** Ubuntu, running **DeepSeek V4 Flash**. We assume **4 × RTX PRO 6000 (Blackwell, 96 GB each, 1.8 TB/s)**, so 384 GB in total (it may turn out to be 3 cards). The card count and model live in `GPU` in `scenes/box.js`: the total, the "what fits" line and the tokens-per-second maths follow from it, but re-read `what-fits` after changing it (with 3 cards, 288 GB, the squeezed V4.1 Flash at ≈ 250 GB gets tight).
- **Which runner the box uses** (Ollama, LM Studio or vLLM) isn't known; the diagram says "Ollama / vLLM".

Field facts used (as of late 2026, rounded): Llama 3 vocabulary 128,256 tokens; Llama 3 70B has 80 layers and 8,192 numbers per token; Llama 3 was pre-trained on about 15 trillion tokens; Llama 3.3 70B in bf16 is about 140 GB in 30 files; DeepSeek V4 Flash has 284B weights, 13B used per token, ≈ 160 GB as released (mixed FP4/FP8); DeepSeek V4.1 Flash (Sept 2026, updated as V4.1-Flash-1017 on 17 Oct 2026) has 552B weights, ≈ 510 GB as released, ≈ 250 GB as Unsloth's 1-bit GGUF, and DeepSeek's API now routes the old V4 Flash name to it; DeepSeek V4 Pro has 1.6T weights (≈ 800 GB at 4 bits is the formula's estimate, not a published size); gpt-oss-120b is about 65 GB. The token ids on `tokens` and the percentages on `next-token` and `attention` are illustrative, and say so on the card.

## Visual language

Explainer-video flat: a deep night blue, warm paper, one sunny yellow, a pink for the recurring question, a mint for payoffs. All of it lives in `theme.css`.

| Token | Colour | Use |
|---|---|---|
| night | `#14163a` | dark slide background; text on light and accent slides |
| night-2 | `#23275a` | cards and panels on dark slides |
| paper | `#f7f2e7` | light slide background; text on dark slides |
| sun | `#ffc93c` | the accent: kickers, highlights, the important word (on light slides: `#9a5800`); act openers and the finale are sun slides |
| pink | `#ff5c8a` | the "But what does that mean?" bubble, ride pills, things that don't fit |
| mint | `#3fe0b5` | payoffs: "close", "fits", the green callout |
| `--tok-0` … `--tok-5` | yellow, pink, mint, sky, lilac, orange | token chips, one colour per token |

- **Scene backgrounds:** `slide--dark`, `slide--light`, and `slide--accent` (sun) for the act openers and the finale. Neighbours alternate.
- **Fonts:** DM Sans (400/700/800) and JetBrains Mono (400/700), bundled with `@fontsource/*` (already dependencies of the repo).
- **Text sizes:** `.h1` 140px, `.h2` 96px (84–88px on a few crowded cards), `.lead` 44px, kicker and `.fineprint` 26px (the minimum).
- **Kicker:** a pill above the headline, uppercase, letter-spaced, in the slide's accent.
- **Callout:** `<Code>` callouts; `tone: 'green'` (mint) for the payoff line.
- **Card:** rounded, flat, soft shadow.
- **Fine print:** bottom-right, 26px: "numbers illustrative", sources.

## Deck components (`components/`)

| Component | What it is |
|---|---|
| `Tok.vue` | a token chip: a rounded mono pill in one of six colours, optionally with its token id under it, `hot` (ringed in pink) or `dim` |
| `Why.vue` | the pink speech bubble, "But what does that mean?" (slot overrides the text) |
| `ActLabel.vue` | an act's name in giant letters, only shown from far away (`<Detail :until>`), so the overview reads as four labelled rows |

Shared geometry: `scenes/inside.js`, `scenes/box.js`, `scenes/harness.js` (the three diagrams, with the slots their nested scenes live in), `scenes/geometry.js` (the hand-drawn slots in `vectors` and `layer`).

## Canvas layout

Four rows, one act each, snaking down: act 1 (the LLM) left → right along the top, act 2 (the model) right → left, act 3 (the harness) left → right, act 4 (the agent) right → left. Each act opener (`title`, `act-model`, `act-harness`, `act-agent`) shows its act's name from far away. The finale, `the-stack`, sits in the middle of the canvas; every other card orbits it.

Dives: `inside` (bigger than normal) → `vectors` (ridden in along the tokens → vectors wire) → `dot-product`; `inside` → `layer` → `attention` and `weights`; `the-box` → `inference` (ridden in along the disk → GPUs wire); `harness` → `agent-loop` (ridden in as a tool call from the model). `cloud` is the back of `local`.

## Assets needed

- none: everything is drawn in the deck

## Scenes

The scenes in `deck.js`, in stage order.

| # | id | Title | Steps | Notes |
|---|---|---|---|---|
| 1 | `title` | No dumb questions | 0 | act 1 label from afar |
| 2 | `four-words` | Four words | 5 | |
| 3 | `next-token` | It predicts the next token | 3 | |
| 4 | `tokens` | A token is a piece of text | 2 | |
| 5 | `inside` | One token, start to finish | 0 | diagram, builds itself; s 1.4 |
| 6 | `vectors` | Each token becomes a list of numbers | 2 | in `inside`, ridden in |
| 7 | `dot-product` | How close? Multiply, then add. | 3 | in `vectors` |
| 8 | `layer` | Each layer does two things | 0 | in `inside` |
| 9 | `attention` | Which words matter to “it”? | 4 | in `layer` |
| 10 | `weights` | Where the knowledge lives | 3 | in `layer` |
| 11 | `training` | Training: guess, check, nudge | 3 | |
| 12 | `llm-recap` | So, an LLM is… | 3 | |
| 13 | `act-model` | How do you get DeepSeek into the machine? | 1 | act 2 label from afar |
| 14 | `the-file` | It's a folder of files | 3 | |
| 15 | `size-math` | How big is a model? | 4 | |
| 16 | `runners` | The file needs a player | 4 | |
| 17 | `the-box` | The box in the office | 0 | diagram, builds itself; s 1.3 |
| 18 | `inference` | Why GPUs? Why that speed? | 3 | in `the-box`, ridden in |
| 19 | `what-fits` | So, can we run DeepSeek? | 5 | |
| 20 | `local` | Run it yourself | 0 | front of a card |
| 21 | `cloud` | Rent it (an API) | 0 | back of `local` |
| 22 | `open-closed` | Can you download the file? | 3 | |
| 23 | `act-harness` | The model can only write text | 1 | act 3 label from afar |
| 24 | `simple-chat` | A chat app in 13 lines | 3 | |
| 25 | `harness` | The model asks. The harness does. | 1 | diagram, builds itself; s 1.3 |
| 26 | `agent-loop` | An agent in 11 lines | 3 | in `harness`, ridden in |
| 27 | `copilot` | Copilot is a harness | 1 | |
| 28 | `claude-code` | Same loop, plus a lot | 5 | |
| 29 | `context` | A harness decides what the model sees | 6 | |
| 30 | `act-agent` | Agentic coding | 1 | act 4 label from afar |
| 31 | `the-loop` | The check is the secret | 0 | looping SVG |
| 32 | `ladder` | From autocomplete to agent | 5 | |
| 33 | `spec-driven` | Write down the what | 5 | |
| 34 | `this-deck` | This explainer was built that way | 0 | |
| 35 | `good-bad` | Where it shines, where it doesn't | 2 | |
| 36 | `questions` | Good questions to ask | 5 | |
| 37 | `the-stack` | Four words | 0 | finale: ring formation |
