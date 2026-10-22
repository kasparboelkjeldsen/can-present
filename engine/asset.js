// Files in a deck's public/ folder are referenced from the site root ("/shots/x.png"). A build for a
// subpath (npm run deck -- build <deck> --base /repo/, e.g. GitHub Pages) moves that root, and Vue
// leaves such paths alone, so anything that loads a public file goes through asset():
//   asset('/shots/x.png') → '/repo/shots/x.png' (unchanged with the default base '/')
// In a single-file build (npm run compile) the public files are in the page itself, as data: URLs
// keyed by path, and asset() returns those.
// Full URLs, protocol-relative ones and relative paths are returned as they are.
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '')

let embedded
const files = () => {
  if (embedded === undefined) {
    const el = typeof document !== 'undefined' && document.getElementById('deck-files')
    embedded = el ? JSON.parse(el.textContent) : null
  }
  return embedded
}

export function asset(path) {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return path
  const inline = files()?.[path]
  if (inline) return inline
  return BASE && !path.startsWith(BASE + '/') ? BASE + path : path
}

/**
 * Single-file builds only (a no-op otherwise): markup that names a public file without asset(),
 * e.g. <img src="/shots/x.png">, is pointed at the inlined copy, now and whenever the page changes.
 * A safety net for decks written before asset(); new markup should still use asset().
 */
export function inlinePublicPaths(root = document.documentElement) {
  const map = files()
  if (!map) return
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
  new MutationObserver((records) => {
    for (const r of records) r.type === 'attributes' ? fix(r.target) : r.addedNodes.forEach(scan)
  }).observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ATTRS })
}
