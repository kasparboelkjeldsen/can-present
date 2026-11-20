// can-present as a package: a deck inside another Vue app.
//
//   import { CanPresent } from 'can-present'
//   import 'can-present/style.css'
//   import deck from './talk/deck.js'
//   <CanPresent :deck="deck" />
//
// A scene imports its building blocks from here too (in this repo's own decks they come from
// '@engine/…', the same files). The engine's own page (main.js: one deck filling the window, picked
// by the dev server) is not part of the package. README "Embedding a deck in a Vue app".
//
// This list is also what a packed deck can use: `npm run pack-deck` reads it (scripts/pack.mjs) to
// point a deck's '@engine/<file>' imports at these names. Keep each line as `export { … } from './<file>'`.
import './styles/engine.css'

// the deck itself
export { default as CanPresent } from './CanPresent.vue'
export { createDeck, useDeck, DECK_KEY } from './useDeck.js'
// a deck that arrives as a file (npm run pack-deck): README "A deck as a file"
export { default as CanPresentPlayer } from './CanPresentPlayer.vue'
export { loadDeck, parseDeck, DECK_FILE_FORMAT, DECK_FILE_VERSION } from './play.js'

// inside a scene
export { default as Step } from './Step.vue'
export { default as Code } from './components/Code.vue'
export { default as Shot } from './components/Shot.vue'
export { default as BigNumber } from './components/BigNumber.vue'
export { default as Detail } from './components/Detail.vue'
export { default as Diagram } from './components/Diagram.vue'
export { default as QrCode } from './components/QrCode.vue'
export { default as ScenePreview } from './ScenePreview.vue'
export { useStep } from './useStep.js'
export { useCamera } from './cameraState.js'
export { useCount, useCounter, fmtNum } from './useCount.js'
export { asset, setAssetBase } from './asset.js'

// in deck.js: placing scenes, diagrams, rides along their wires
export { W, H, nest, talkBounds, coverAll } from './layout.js'
export { defineDiagram, ride } from './diagram.js'
