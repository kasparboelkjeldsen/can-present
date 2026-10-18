import { createApp } from 'vue'
import './styles/engine.css'
// The active deck (picked in vite.config.js). Its deck.js imports the deck's own theme and fonts.
import deck from '@deck/deck.js'

// Title and favicon come from the deck (Presenter and Notes prefix the title when they mount).
document.title = deck.title ?? deck.id
if (deck.icon) {
  let link = document.querySelector('link[rel="icon"]')
  if (!link) link = document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'icon' }))
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${deck.icon}</text></svg>`
  link.href = 'data:image/svg+xml,' + encodeURIComponent(svg)
}

// Pages load on demand: App, Presenter and Notes share useDeck.js, which binds keys, the URL hash
// and window sync as soon as it's imported. ?sheet (Sheet.vue) must not get any of that.
const params = new URLSearchParams(location.search)
const page = location.pathname.replace(/\/+$/, '').endsWith('/notes')
  ? import('./Notes.vue')
  : params.has('sheet')
    ? import('./Sheet.vue')
    : params.has('presenter')
      ? import('./Presenter.vue')
      : import('./App.vue')
page.then((m) => createApp(m.default).mount('#app'))
