// Files in a deck's public/ folder are referenced from the site root ("/shots/x.png"). A build for a
// subpath (npm run deck -- build <deck> --base /repo/, e.g. GitHub Pages) moves that root, and Vue
// leaves such paths alone, so anything that loads a public file goes through asset():
//   asset('/shots/x.png') → '/repo/shots/x.png' (unchanged with the default base '/')
// Full URLs, protocol-relative ones and relative paths are returned as they are.
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '')

export function asset(path) {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return path
  return BASE && !path.startsWith(BASE + '/') ? BASE + path : path
}
