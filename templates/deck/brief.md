# Brief: __DECK_TITLE__

> **For Claude (chat):** read this together with `docs/presentation-guide.md`. The guide says what the engine can do and the `scene-description.md` format; this file is the talk, the speaker and the deck's look. Where they disagree, this file wins.

## The talk

- **Title:** __DECK_TITLE__
- **Event:** TODO: event, date
- **Speaker:** TODO: name, role, where to find them
- **Audience:** TODO: who they are and what they already know
- **Tone:** TODO: e.g. funny but technically real
- **Length:** TODO: slot length. As a rule of thumb, 1–2 minutes per scene, so a 25-minute slot is roughly 15–25 scenes.

## How to work with the speaker

1. **Story first.** Agree on the arc (hook → problem → how → demo → payoff) before discussing any visuals.
2. **Then scenes.** One idea per scene. If a scene needs more than about 3 sentences of explanation, split it.
3. **Then visuals.** For each scene, pick one strong visual idea from the guide's toolbox. Don't decorate every scene.
4. **Then write `scene-description.md`** in the guide's format and hand it to the coding agent.

Ask before inventing facts about their code, clients or numbers. Use `TODO:` for anything they still have to supply. The speaker takes the screenshots.

TODO: anything particular about this speaker (what they want to avoid, running jokes, things to ask about).

## Visual language

TODO: the brand or look, in a few words. All of it lives in `theme.css`.

| Token | Colour | Use |
|---|---|---|
| ink | `#17191f` | dark slide background; text on light and accent slides |
| paper | `#f5f3ee` | light slide background; text on dark slides |
| orange | `#ff7849` | the accent: kickers, highlights, the important word (on light slides: `#c2410c`) |
| mint | `#7bd389` | the payoff callout |
| rose | `#ff5d73` | second accent: end of the progress bar, focused code token |

- **Scene backgrounds:** `slide--dark`, `slide--light`, `slide--accent` (for section openers). Alternate them so the flights look good.
- **Fonts:** TODO: headline, body and code fonts (bundled with `@fontsource/*` so the deck works offline).
- **Text sizes:** `.h1` 140px, `.h2` 100px, `.lead` 44px, kicker and `.fineprint` 26px (the minimum).
- **Kicker:** a pill above the headline, uppercase, letter-spaced, in the slide's accent.
- **Callout:** a speech bubble next to code or screenshots; `tone: 'green'` (mint) for the payoff.
- **Card:** rounded card with a soft shadow.
- **Fine print:** bottom-right, 26px.

## Deck components (`components/`)

TODO: logos, mascots, recurring motifs this deck has (or "none yet").

| Component | What it is |
|---|---|

## Canvas layout

TODO: how the talk looks in the overview (regions, the path, where the dives happen).

## Assets needed

TODO: screenshots (`public/shots/…`) and other files the speaker has to supply, one line each.

## Scenes

TODO: the scenes in `deck.js`, in stage order.

| # | id | Title | Steps | Notes |
|---|---|---|---|---|
| 1 | `title` | Title | 0 | |
