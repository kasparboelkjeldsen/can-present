// Files in a deck's public/ folder are referenced from the site root ("/shots/x.png"). A build for a
// subpath (npm run deck -- build <deck> --base /repo/, e.g. GitHub Pages) moves that root, and Vue
// leaves such paths alone, so anything that loads a public file goes through asset():
//   asset('/shots/x.png') → '/repo/shots/x.png' (unchanged with the default base '/')
// In a single-file build (npm run compile) the public files are in the page itself, as data: URLs
// keyed by path, and asset() returns those. A deck played from a deck file (npm run pack-deck,
// play.js) carries its own the same way: asset() returns the file of the deck it's called in.
// Full URLs, protocol-relative ones and relative paths are returned as they are.
//
// The base is the build's own (Vite's `base`). The published package is built with '/', so an app
// that embeds a deck and is hosted under a subpath says so once: setAssetBase(import.meta.env.BASE_URL).
import { inject, hasInjectionContext } from 'vue'
import { DECK_KEY } from './useDeck.js'

let BASE = (import.meta.env?.BASE_URL ?? '/').replace(/\/+$/, '')

/** Where the files that decks name from the site root ("/shots/x.png") really are, e.g. '/blog/'. */
export function setAssetBase(base) {
  BASE = String(base ?? '/').replace(/\/+$/, '')
}

let embedded
const files = () => {
  if (embedded === undefined) {
    const el = typeof document !== 'undefined' && document.getElementById('deck-files')
    embedded = el ? JSON.parse(el.textContent) : null
  }
  return embedded
}

// Files of decks played from a deck file, for asset() calls that aren't in a component (a plain
// module, a timer): there's no telling which deck is asking, so the first deck to bring a path wins.
const played = {}
export function registerFiles(map) {
  for (const key in map) played[key] ??= map[key]
}

export function asset(path) {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return path
  // in a component's setup or render: the files of the deck it belongs to
  const own = hasInjectionContext() ? inject(DECK_KEY, null)?.files : null
  const inline = own?.[path] ?? files()?.[path] ?? played[path]
  if (inline) return inline
  return BASE && !path.startsWith(BASE + '/') ? BASE + path : path
}

/**
 * Markup that names a public file without asset(), e.g. <img src="/shots/x.png">, is pointed at the
 * inlined copy, now and whenever `root` changes. A safety net for decks written before asset(); new
 * markup should still use asset(). A no-op without inlined files: `map` defaults to a single-file
 * build's (npm run compile); <CanPresent> passes a played deck's own, for its own box.
 * → a function that stops watching.
 */
export function inlinePublicPaths(root = document.documentElement, map = files()) {
  if (!map) return () => {}
  const ATTRS = ['src', 'href', 'poster']
  const fix = (el) => {
    for (const a of ATTRS) {
      const v = el.getAttribute(a)
      if (v && map[v]) el.setAttribute(a, map[v])
    }
  }
  const scan = (node) => {
    if (node.nodeType !== 1) return
    fix(node)
    node.querySelectorAll('[src^="/"], [href^="/"], [poster^="/"]').forEach(fix)
  }
  scan(root)
  const observer = new MutationObserver((records) => {
    for (const r of records) r.type === 'attributes' ? fix(r.target) : r.addedNodes.forEach(scan)
  })
  observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ATTRS })
  return () => observer.disconnect()
}
