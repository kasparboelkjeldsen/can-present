// Playing a deck file: a deck packed without the engine (npm run pack-deck → <deck>.canpresent,
// scripts/pack.mjs, which describes the file). loadDeck() turns one into the same object a deck.js
// exports, for <CanPresent :deck>; <CanPresentPlayer src> does both.
//
//   const deck = await loadDeck('/talks/my-talk.canpresent')   // a URL, the file's text, its parsed JSON, or a Blob / File
//
// A deck file holds the deck's code (its scenes are Vue components), and loading it runs that code
// in this page, with this page's Vue and this copy of the engine. So only load files you would also
// load as a script, and a page whose Content-Security-Policy forbids eval can't load them at all.
import * as Vue from 'vue'
import * as engine from './index.js'
import { registerFiles } from './asset.js'

export const DECK_FILE_FORMAT = 'can-present-deck'
export const DECK_FILE_VERSION = 1
const ENGINE_VERSION = typeof __CAN_PRESENT_VERSION__ === 'string' ? __CAN_PRESENT_VERSION__ : null

const fail = (msg) => { throw new Error(`[can-present] ${msg}`) }

// what the deck's code gets as the engine: a name this copy doesn't have is said plainly, instead of
// showing up as "undefined is not a function" somewhere on stage
function engineFor(file) {
  return new Proxy(engine, {
    get(target, key) {
      if (typeof key === 'string' && !(key in target) && key !== 'default' && key !== '__esModule' && key !== 'then') {
        fail(`the deck "${file.id}" needs "${key}" from can-present, which this version${ENGINE_VERSION ? ` (${ENGINE_VERSION})` : ''} doesn't have. It was packed with ${file.engine ?? 'another version'}.`)
      }
      return target[key]
    },
  })
}

// a url(/shots/x.png) in the deck's CSS points into its public/ folder, which is in the file
const inlineCssUrls = (css, files) =>
  css.replace(/url\((['"]?)(\/[^'")]+)\1\)/g, (m, q, ref) => (files[ref] ? `url(${q}${files[ref]}${q})` : m))

function addStyles(file) {
  if (!file.css || typeof document === 'undefined') return
  // one sheet per deck id: loading the same deck again (a newer file) replaces it
  let el = [...document.head.querySelectorAll('style[data-can-present-deck]')].find((s) => s.dataset.canPresentDeck === file.id)
  if (!el) {
    el = document.createElement('style')
    el.dataset.canPresentDeck = file.id
    document.head.appendChild(el)
  }
  el.textContent = inlineCssUrls(file.css, file.files ?? {})
}

/**
 * A deck file's content (its text, or the parsed JSON) → the deck, ready for <CanPresent :deck>.
 * Adds the deck's styles to the page. Throws if it isn't a deck file this version can play.
 */
export function parseDeck(content) {
  let file = content
  if (typeof content === 'string') {
    try { file = JSON.parse(content) } catch { fail('not a can-present deck file (it should be JSON)') }
  }
  if (!file || file.format !== DECK_FILE_FORMAT) fail('not a can-present deck file')
  if (file.version !== DECK_FILE_VERSION) fail(`this deck file is format version ${file.version}; this version of can-present plays version ${DECK_FILE_VERSION}`)
  if (typeof file.code !== 'string' || typeof file.id !== 'string') fail('this deck file is incomplete (no code, or no id)')
  if (ENGINE_VERSION && file.engine && file.engine !== ENGINE_VERSION) {
    console.warn(`[can-present] the deck "${file.id}" was packed with can-present ${file.engine}; this is ${ENGINE_VERSION}. If it misbehaves, pack it again.`)
  }

  // the code is one script that leaves the deck in `__canPresentDeck`, given `Vue` and `CanPresent`
  const made = new Function('Vue', 'CanPresent', `${file.code}\nreturn __canPresentDeck`)(Vue, engineFor(file))
  const deck = made?.default ?? made
  if (!deck || !Array.isArray(deck.scenes)) fail(`the deck "${file.id}" has no scenes`)

  const files = file.files && Object.keys(file.files).length ? file.files : null
  if (files) registerFiles(files)
  addStyles(file)
  // raw: a deck holds components, which must not become reactive when the page keeps it in a ref()
  return Vue.markRaw({
    ...deck,
    id: file.id, // the id its CSS is scoped to (<CanPresent> puts it on the box as data-deck)
    notes: deck.notes ?? file.notes ?? {},
    files,
  })
}

/**
 * loadDeck(source) → Promise of the deck. `source`: the URL of a deck file, a Blob / File (a file
 * input, a drop), the file's text, or its parsed JSON. `init` goes to fetch() for a URL.
 */
export async function loadDeck(source, init) {
  if (typeof Blob !== 'undefined' && source instanceof Blob) return parseDeck(await source.text())
  if (typeof source === 'string' && !source.trimStart().startsWith('{')) {
    const res = await fetch(source, init)
    if (!res.ok) fail(`couldn't load the deck file ${source} (HTTP ${res.status})`)
    return parseDeck(await res.text())
  }
  return parseDeck(source)
}
