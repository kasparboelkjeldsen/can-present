# Kraftvaerk brand kit

Kraftvaerk's look from its PowerPoint template, ready for any deck: palette, fonts, engine tokens,
the slide variants, the logo on every card, and a few components.

```js
// deck.js
import '@brands/kraftvaerk'   // fonts + theme.css
import './theme.css'          // the deck's own additions (may be empty)
```

Scaffold a deck with it already wired: `npm run new-deck -- <id> --brand kraftvaerk`.

## What's in it

| File | What it is |
|---|---|
| `theme.css` | palette (`--k-*`), fonts, `--deck-*` / `--code-*` tokens, `.slide` + variants, logo mark, `.kicker`, `.h1`/`.h2`, `.lead`, `.num`, `.card`, `.callout`, `.foot`, `.fineprint` |
| `index.js` | imports the fonts (`@fontsource`: Libre Caslon Text, DM Sans, JetBrains Mono) and `theme.css`; exports `logoBlack` / `logoWhite` (image URLs) |
| `assets/kraftvaerk-logo-{black,white}.svg` | the official wordmark, cropped |
| `components/DiagonalLine.vue` | the template's diagonal, a thin line that draws itself on entrance (`x1 y1 x2 y2` in card px, `delay`, `duration`, `width`); coloured by the slide's `--accent` |
| `components/SectionOpener.vue` | a whole red section-opener scene: `<SectionOpener n="02" title="…" />` |

```js
import DiagonalLine from '@brands/kraftvaerk/components/DiagonalLine.vue'
import { logoBlack } from '@brands/kraftvaerk'
```

## Palette and rules

| Token | Colour | Use |
|---|---|---|
| `--k-dark` | `#3d3d3f` | dark slides; text on sand, grey and red |
| `--k-dark-deep` | `#2c2c2e` | the canvas, code blocks |
| `--k-sand` | `#eeede9` | light slides |
| `--k-grey` | `#aba79c` | grey slides |
| `--k-red` | `#ff8071` | section openers, closing cards |
| `--k-green` | `#c3f240` | accents on dark (and grey) only |
| `--k-light` | `#f7f6f2` | text on dark |
| `--k-panel` / `--k-muted` | `#4a4a4d` / `#6b6a66` | cards on dark / secondary text on sand |

- Slide variants: `slide--dark`, `slide--sand`, `slide--grey`, `slide--red`. Alternate neighbours.
- Green never on sand or red; text on grey and red is always dark.
- The logo sits bottom-left on every card; `.no-mark` hides it (e.g. where a photo bleeds there),
  `.mark-white` / `.mark-black` force a colour.
- Headlines in Libre Caslon Text, body in DM Sans.

`decks/shovelling-umbraco` predates the kit and keeps its own copy of the theme.
