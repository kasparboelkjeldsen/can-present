# Brief: Shovelling Umbraco Into Other People's WordPress

> **For Claude (chat):** read this together with `docs/presentation-guide.md`. The guide says what the engine can do and the `scene-description.md` format; this file is the talk, the speaker and the deck's look. Where they disagree, this file wins.

## The talk

- **Title:** Shovelling Umbraco Into Other People's WordPress
- **Event:** Umbraco Meetup, 22 October 2026
- **Speaker:** Kaspar Boel Kjeldsen (kjeldsen.dev). Head of Umbraco at Kraftvaerk, Umbraco MVP.
- **Audience:** Umbraco developers and people around them. They know Umbraco well and have opinions about WordPress.
- **Tone:** funny, self-aware, technically real. The title is the joke; the content should still teach something.
- **Length:** ask Kaspar if it isn't settled yet. As a rule of thumb, plan for 1–2 minutes per scene, so a 25-minute slot is roughly 15–25 scenes.

## How to work with Kaspar

1. **Story first.** Agree on the arc (hook → problem → how → demo → payoff) before discussing any visuals.
2. **Then scenes.** Break the arc into scenes. One idea per scene. If a scene needs more than about 3 sentences of explanation, split it.
3. **Then visuals.** For each scene, pick one strong visual idea from the guide's toolbox. Don't decorate every scene. Mix big-statement scenes with dense ones.
4. **Then write `scene-description.md`** in the guide's format. Kaspar hands it to the coding agent.

Ask before inventing facts about his code, clients or numbers. Use `TODO:` in the description for anything he still has to supply. Kaspar takes the screenshots.

## Visual language

The deck uses the **Kraftvaerk** palette, lightly: big type, lots of space, few words per scene. All of it lives in `theme.css`.

| Token | Colour | Use |
|---|---|---|
| dark (Functional Black) | `#3d3d3f` | dark slide background; text on sand, grey, red and green |
| dark deep | `#2c2c2e` | the canvas behind the scenes, code blocks |
| sand | `#eeede9` | light slide background; text and kicker text on dark buttons |
| grey (Pleasant Grey) | `#aba79c` | grey slide background |
| red (Power Red) | `#ff8071` | section-opener slides, the wavy underline on a focused code token, end of the progress bar |
| green (Athletic Green) | `#c3f240` | the accent: kickers, highlights, diagonals, code keywords |
| light | `#f7f6f2` | text on dark |
| Umbraco blue | `#3544b1` | anything Umbraco (semantic, used sparingly) |
| WP blue | `#3858e9` | anything WordPress (semantic, used sparingly) |

**Colour rules:** green only on dark or grey, never on sand or red. Text on grey and red is always dark. Each slide sets an `--accent`: green on dark and grey, dark on sand and red. Use the accent for "the important word".

- **Scene backgrounds:** `slide--dark`, `slide--sand`, `slide--grey`, `slide--red` (red for section openers). Alternate them so the flights look good.
- **Fonts:** Libre Caslon Text (regular, serif) for headlines (`.h1` 150px, `.h2` 112px); DM Sans for body (`.lead` 46px) and kickers; JetBrains Mono for code. All bundled locally, so the deck works without venue wifi.
- **Kicker:** a pill above the headline, uppercase, letter-spaced. Dark with sand text on light slides, green with dark text on dark slides.
- **Callout:** a speech bubble next to code or screenshots (dark on light slides, sand on dark slides, `tone: 'green'` for the payoff).
- **Card:** white rounded card with a soft shadow.
- **Kraftvaerk logo:** bottom-left on every slide, 28px high: the official white logo on dark slides, the black one on sand, grey and red (`public/assets/kraftvaerk-logo-white.svg` / `-black.svg`, cropped to the wordmark). Force one per scene with `.mark-white` / `.mark-black`, opt out with `.no-mark`.
- **Fine print:** bottom-right, 26px, for "abridged" notes on code scenes.

## Deck-specific components (`components/`)

| Component | What it is |
|---|---|
| `UmbracoMark`, `WordPressMark` | the two logos as SVG (`inline` to use inside another `<svg>`) |
| `Shovel` | the cartoon shovel |
| `ShovelLoop` | the title animation: the shovel digs into a pile of Umbraco logos and flings one into the WordPress logo (made for dark backgrounds) |
| `DsaLogo` | the client's logo (`public/assets/dsa-logo.svg`) |
| `DiagonalLine` | the Kraftvaerk diagonal: a thin line rising left to right, drawn on entrance, in the slide's accent colour |

## Canvas layout

Umbraco side on the left (x < -2000), the bridge around x = 0, WordPress side on the right (x > 2000). Act 1 heads out to WordPress land, act 2 comes back across the bridge into the map and its nested scenes, act 3 is the live demo far out on the right, act 4 comes home. The takeaway (`control-plane`) is a ghost scene over the whole canvas.

## Scenes

The scenes in `deck.js`, in stage order. Nested scenes live in a slot of the `map` diagram and fade in as the map builds itself.

| # | id | Title | Steps | Notes |
|---|---|---|---|---|
| 1 | `title` | Title | 0 | |
| 2 | `the-ask` | The ask | 1 | |
| 3 | `iframe` | What about an iframe? | 1 | |
| 4 | `one-line` | The entire integration | 4 | |
| 5 | `two-outfits` | Two outfits | 2 | each click lifts one site's job carousel out of its screenshot |
| 6 | `what-happened` | What actually happened | 3 | |
| 7 | `map` | How it works | 0 | builds itself on a timer |
| 8 | `bootstrap` | The component wakes up | 3 | nested in `map` |
| 9 | `who-am-i` | Who am I? | 3 | nested in `map` |
| 10 | `the-policy` | The policy, at runtime | 5 | nested in `map` |
| 11 | `what-to-wear` | What do I wear? | 4 | nested in `map` |
| 12 | `cache` | Cached, but not stale | 3 | nested in `map` |
| 13 | `the-section` | The remote control | 7 | |
| 14 | `dangerous-bits` | The dangerous bits | 4 | |
| 15 | `live-kicker` | Live | 0 | |
| 16 | `live-demo` | Punching a hole | 0 | live site |
| 17 | `fallback` | Fallback | 0 | skipped; X jumps here if the demo dies |
| 18 | `numbers` | The numbers | 2 | |
| 19 | `tomorrow` | Today it's a carousel | 2 | |
| 20 | `control-plane` | The takeaway | 0 | ghost over the whole canvas |
| 21 | `thanks` | Thanks | 0 | |
