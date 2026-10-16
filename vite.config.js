import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Relays deck navigation between every connected browser (deck, /notes, other devices)
// over Vite's own dev-server websocket. See src/engine/useDeck.js.
const deckSync = () => ({
  name: 'deck-sync',
  configureServer(server) {
    server.ws.on('deck:msg', (data) => server.ws.send('deck:msg', data))
  },
})

export default defineConfig({
  plugins: [vue(), deckSync()],
  server: { port: 5173 },
})
