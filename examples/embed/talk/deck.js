// A small deck written the way a project that installs can-present writes one: everything from
// 'can-present', the theme on .can-present (theme.css) so it stays out of the page round it.
import { nest } from 'can-present'
import './theme.css'
import Title from './scenes/Title.vue'
import Moves from './scenes/Moves.vue'
import Inside from './scenes/Inside.vue'
import Stat from './scenes/Stat.vue'
import Thanks from './scenes/Thanks.vue'

const moves = { x: 2500, y: 350, r: 3 }

export default {
  id: 'embedded',
  title: 'A deck in a blog post',
  scenes: [
    { id: 'title', title: 'Title', component: Title, at: { x: 0, y: 0, r: -2 } },
    { id: 'moves', title: 'Three moves', component: Moves, steps: 3, at: moves },
    // sits in the third card of `moves`: the camera dives into it
    { id: 'inside', title: 'Inside a card', component: Inside, parent: 'moves', revealAt: 3, at: nest(moves, { cx: 1480, cy: 690, w: 380 }) },
    { id: 'stat', title: 'A number', component: Stat, at: { x: 2300, y: 2100, r: -3 } },
    { id: 'thanks', title: 'Thanks', component: Thanks, at: { x: -100, y: 1900, r: 2 } },
  ],
  // speaker notes, for view="presenter" and view="notes" (?view=presenter on this example)
  notes: {
    title: 'A deck, in a page that is not a deck.',
    moves: '[PRESS] fly\n[PRESS] build\n[PRESS] dive',
    inside: 'A scene inside a scene.',
    stat: 'Counts as it comes on stage.',
    thanks: 'Thanks.',
  },
}
