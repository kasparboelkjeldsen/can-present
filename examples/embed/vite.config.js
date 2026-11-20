import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// The embed example (npm run embed): a small Vue app that uses can-present as a package.
// 'can-present' resolves to the package build in lib/ (npm run build:lib, which `npm run embed` runs
// first), so this is what another project gets from npm. With EMBED_FROM=source it resolves to
// engine/index.js instead: no build step, and engine edits hot-reload.
const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../..')
const fromSource = process.env.EMBED_FROM === 'source'
const entry = fromSource ? 'engine/index.js' : 'lib/can-present.js'
const css = fromSource ? 'engine/styles/engine.css' : 'lib/can-present.css'

export default defineConfig({
  root: here,
  plugins: [vue()],
  resolve: {
    alias: [
      { find: /^can-present\/style\.css$/, replacement: path.join(root, css) },
      { find: /^can-present$/, replacement: path.join(root, entry) },
    ],
    dedupe: ['vue'],
  },
  server: { port: 5182, fs: { allow: [root] } },
  build: { outDir: path.join(root, 'dist/embed-example'), emptyOutDir: true },
})
