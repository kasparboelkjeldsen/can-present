// A Vue app that isn't can-present: a blog post with two decks in it. It uses the package the way
// another project would, `import … from 'can-present'` (vite.config.js points that at lib/, the build).
// ?view=presenter and ?view=notes show the deck's other two screens, following the post's first deck.
import { createApp, h } from 'vue'
import { CanPresent } from 'can-present'
import 'can-present/style.css'
import Post from './Post.vue'
import deck from './talk/deck.js'

const view = new URLSearchParams(location.search).get('view')
const app = ['presenter', 'notes'].includes(view)
  ? createApp({ render: () => h(CanPresent, { deck, view, sync: true }) })
  : createApp(Post)
app.mount('#app')
