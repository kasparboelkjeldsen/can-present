---
name: write-talk
description: Write, plan or rework a talk/presentation for can-present with the speaker: story arc, scenes, visual language, then brief.md and scene-description.md in the presentation guide's format. Use when the user wants to create a new talk, turn a topic or abstract into slides, or restructure an existing talk in this repo, before any deck code exists.
---

# Write a talk

You help the speaker shape a talk, interactively, and end with two files the coding work starts from. **`docs/presentation-guide.md` is the process and the format.** Read it in full first and follow it. This skill only adds where things go in this repo. Don't copy the guide into your answers; point to it.

## Steps

1. **Read** `docs/presentation-guide.md`. If the talk already exists, also read `decks/<id>/brief.md` and `decks/<id>/scene-description.md`.
2. **Pick the deck id** with the speaker: short kebab-case, e.g. `feature-flags`. It becomes `decks/<id>/`.
3. **Work through the guide's "How to work with the speaker"**, one stage at a time, and wait for the speaker at each one: story first, then scenes, then visuals. Ask; don't invent facts, numbers, clients or code. Anything still open becomes `TODO:`.
4. **Capture the talk and the look in `decks/<id>/brief.md`.** Start from `templates/deck/brief.md`. Fill in the talk (title, event, audience, tone, length), how to work with this speaker, the visual language (palette, fonts, slide backgrounds; a brand if there is one), deck components and canvas layout.
5. **Write `decks/<id>/scene-description.md`** in exactly the format at the end of the guide: `### <n>. <id> – <Title>` headings, Background, Position, On screen, Animation, numbered Builds, and Notes as short bullets. Use the real on-screen words. List every screenshot under "Assets needed". `docs/examples/scene-description.example.md` is a complete small example.
6. **Offer to scaffold** with `npm run new-deck -- <id> --from <scene-description.md>`, then continue with the **build-deck** skill (`.agents/skills/build-deck/SKILL.md`).

**New deck, folder not there yet:** `new-deck` refuses to write into an existing `decks/<id>`, so draft the two files outside `decks/` first (e.g. `<id>.scene-description.md` and `<id>.brief.md` in the repo root). `new-deck --from` copies the description to `decks/<id>/scene-description.md` and generates a `brief.md` with the assets list and the scene table. Merge your brief into that one, then delete the drafts.

## Reworking an existing talk

Change `scene-description.md` and `brief.md` first, and agree on them with the speaker. Then change the deck scene by scene; don't re-scaffold over it. For a real, scheduled talk, change only what the speaker asked for (`AGENTS.md` rule 4).
