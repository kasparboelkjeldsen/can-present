import { createApp } from 'vue'
import './styles/engine.css'
// The active deck (picked in vite.config.js). Its deck.js imports the deck's own theme and fonts.
import deck from '@deck/deck.js'
import App from './App.vue'
import Presenter from './Presenter.vue'
import Notes from './Notes.vue'

// Title and favicon come from the deck (Presenter and Notes prefix the title when they mount).
document.title = deck.title ?? deck.id
if (deck.icon) {
  let link = document.querySelector('link[rel="icon"]')
  if (!link) link = document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'icon' }))
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${deck.icon}</text></svg>`
  link.href = 'data:image/svg+xml,' + encodeURIComponent(svg)
}

const page = location.pathname.replace(/\/+$/, '').endsWith('/notes')
  ? Notes
  : new URLSearchParams(location.search).has('presenter')
    ? Presenter
    : App
createApp(page).mount('#app')
