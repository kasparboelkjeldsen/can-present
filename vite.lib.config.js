import fs from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { ENGINE_DIR } from './engine/vite.js'

// The package build (npm run build:lib): engine/index.js → lib/can-present.js + lib/can-present.css,
// what `import { CanPresent } from 'can-present'` gets in another Vue app. Vue stays the app's own
// (a peer dependency); everything else the engine uses is bundled in. No deck is involved: the
// engine's own page (engine/main.js, vite.config.js) isn't part of it.
export default defineConfig({
  plugins: [vue()],
  publicDir: false,
  // the package's version, for the deck-file check (engine/play.js)
  define: { __CAN_PRESENT_VERSION__: JSON.stringify(JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version) },
  build: {
    outDir: 'lib',
    emptyOutDir: true,
    lib: {
      entry: `${ENGINE_DIR}/index.js`,
      formats: ['es'],
      fileName: 'can-present',
      cssFileName: 'can-present',
    },
    rollupOptions: { external: ['vue'] },
  },
})
