import { createApp } from 'vue'
// Bundled locally (not Google Fonts) so the deck works without venue wifi.
import '@fontsource/libre-caslon-text/400.css'
import '@fontsource/libre-caslon-text/400-italic.css'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/700.css'
import '@deck/theme.css'
import App from './App.vue'
import Presenter from './Presenter.vue'

import Notes from './Notes.vue'

const page = location.pathname.replace(/\/+$/, '').endsWith('/notes')
  ? Notes
  : new URLSearchParams(location.search).has('presenter')
    ? Presenter
    : App
createApp(page).mount('#app')
