import { defineConfig, mergeConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolveDeck, deckSync, deckNotes, deckStatic, ENGINE_DIR } from './engine/vite.js'

// Active deck: $DECK, else "canPresent": { "deck": … } in package.json. See README.
const deck = resolveDeck()

// A deck's own Vite config (decks/<deck>/vite.config.js), merged over the base config below. Its
// `customElements` (tag prefixes, e.g. a design system's web components) tells Vue to leave those
// tags alone instead of looking for Vue components. See README "A deck's own Vite config".
const { customElements = [], ...deckConfig } = deck.viteConfig
  ? (await import(new URL(`file:///${deck.viteConfig.replace(/\\/g, '/')}`).href)).default
  : {}
const isCustomElement = (tag) => customElements.some((prefix) => tag.startsWith(prefix))

const base = defineConfig({
  plugins: [vue({ template: { compilerOptions: { isCustomElement } } }), deckSync(), deckNotes(deck.notes), deckStatic()],
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

// A deck may add its own Vite settings (e.g. a dev-server proxy) in decks/<deck>/vite.config.js,
// merged over the base config. See README "A deck's own Vite config".
export default deck.viteConfig ? mergeConfig(base, deckConfig) : base
