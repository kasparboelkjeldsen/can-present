<script setup>
// The host app: an ordinary page with its own styles and scrolling, and three decks in the text.
// The first two are the same deck.js, but two decks as far as the page goes: each has its own place,
// camera and keys. The first is driven from outside too (v-model, and the ref's methods).
// The third arrives as a deck file (public/example.canpresent, which `npm run embed` packs from
// decks/example) and is played by <CanPresentPlayer>.
import { ref } from 'vue'
import { CanPresent, CanPresentPlayer } from 'can-present'
import deck from './talk/deck.js'

// ?file=<name> plays public/<name>.canpresent instead: pack any deck into this folder to try it here
//   npm run pack-deck -- <deck> --out examples/embed/public/<deck>.canpresent
const asked = new URLSearchParams(location.search).get('file')
const file = /^[\w-]+$/.test(asked ?? '') ? asked : 'example'
const played = ref('')
const failed = ref('')
const talk = ref(null)
const scene = ref('title')
const step = ref(0)
const full = ref(false)
</script>

<template>
  <article class="post">
    <p class="date">20 November 2026</p>
    <h1>A deck in a blog post</h1>
    <p>
      This page is a plain Vue app with its own fonts, colours and scrolling. The deck below is a
      component in the text: as wide as the column, 16:9, and it only takes the arrow keys once you
      have clicked it (or tabbed to it). Until then they scroll the page, as they should.
    </p>

    <CanPresent ref="talk" v-model:scene="scene" v-model:step="step" :deck="deck" sync class="deck" @fullscreen="full = $event" />

    <p class="status" data-testid="status">
      The page knows where the deck is: scene <code>{{ scene }}</code>, step <code>{{ step }}</code><template v-if="full">, full screen</template>.
      And it can drive it:
      <button type="button" @click="talk.prev()">back</button>
      <button type="button" @click="talk.next()">next</button>
      <button type="button" @click="talk.go('stat')">go('stat')</button>
      <button type="button" @click="talk.toggleFullscreen()">full screen</button>
    </p>

    <h2>Any box</h2>
    <p>
      Without a height the box is 16:9. Give it one and the stage is fitted inside, with the canvas
      round it. This one is a narrow strip, starts on another scene and has no controls of its own:
    </p>

    <CanPresent :deck="deck" scene="stat" :chrome="false" class="deck deck--strip" />

    <h2>A deck from a file</h2>
    <p>
      The two decks above are part of this app: their scenes are compiled with it. This one isn't.
      It's a deck file, <code>{{ file }}.canpresent</code>, that the page fetches and plays (by
      default the engine's own example deck, packed with <code>npm run pack-deck -- example</code>).
      The file has the deck's scenes, theme and notes in it, but no engine: it uses this page's.
    </p>

    <CanPresentPlayer :src="`/${file}.canpresent`" class="deck" data-testid="played" @load="played = $event.title" @error="failed = $event.message">
      <template #loading>Loading the deck…</template>
    </CanPresentPlayer>
    <p class="status" data-testid="played-status">{{ played ? `Playing "${played}" from the file.` : failed || 'Not loaded yet.' }}</p>

    <p v-for="n in 6" :key="n" class="filler">
      The rest of the post goes on for a while, so there is something to scroll. Paragraph {{ n }} of
      six says nothing more than that: the page scrolls, the decks stay where they are in the text,
      and neither of them noticed the other moving.
    </p>
  </article>
</template>

<style>
/* the page's own look: nothing here is can-present's */
body { margin: 0; background: #fbfaf7; color: #26272b; font: 19px/1.7 Georgia, 'Times New Roman', serif; }
.post { max-width: 760px; margin: 0 auto; padding: 64px 24px 120px; }
.post h1 { font-size: 46px; line-height: 1.15; margin: 0 0 24px; }
.post h2 { font-size: 28px; margin: 48px 0 12px; }
.post .date { margin: 0 0 8px; color: #8a8478; font-size: 15px; letter-spacing: 0.08em; text-transform: uppercase; }
.post .deck { margin: 32px 0; border-radius: 12px; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18); }
.post .deck--strip { height: 220px; }
.post .status { font: 15px/1.9 system-ui, sans-serif; color: #5d5a52; }
.post .status button { margin-left: 6px; padding: 3px 12px; border: 1px solid #c9c4b8; border-radius: 999px; background: #fff; font: inherit; cursor: pointer; }
.post .status button:hover { background: #26272b; color: #fff; border-color: #26272b; }
.post code { padding: 2px 6px; border-radius: 4px; background: #efece4; font: 14px ui-monospace, Consolas, monospace; }
</style>
