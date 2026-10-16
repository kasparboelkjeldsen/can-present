import { createApp } from 'vue'
import '@fontsource/lato/400.css'
import '@fontsource/lato/700.css'
import '@fontsource/lato/900.css'
import '@fontsource/lato/400-italic.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/700.css'
import './styles/theme.css'
import App from './App.vue'
import Presenter from './Presenter.vue'

const isPresenter = new URLSearchParams(location.search).has('presenter')
createApp(isPresenter ? Presenter : App).mount('#app')
