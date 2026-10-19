import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolveDeck, deckSync, deckNotes, deckStatic, ENGINE_DIR } from './engine/vite.js'

// Active deck: $DECK, else "canPresent": { "deck": … } in package.json. See README.
const deck = resolveDeck()

export default defineConfig({
  plugins: [vue(), deckSync(), deckNotes(deck.notes), deckStatic()],
  resolve: {
    alias: {
      '@engine': ENGINE_DIR,
      '@deck': deck.dir,
    },
  },
  publicDir: deck.publicDir,
  build: { outDir: `dist/${deck.id}`, emptyOutDir: true },
  server: {
    port: 5173,
    // notes.json is data, not code: saving it must never hot-reload the deck mid-talk
    watch: { ignored: ['**/decks/*/notes.json'] },
  },
})
