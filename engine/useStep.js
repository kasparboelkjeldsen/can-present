import { inject, computed } from 'vue'

/**
 * Inside a scene:
 *   step    – current build step (Infinity when the scene is "done": past / overview)
 *   active  – this scene is the one on stage
 *   near    – on stage or one away (use it to preload heavy stuff like iframes)
 *   preview – rendered as a thumbnail (presenter window), skip heavy/live things
 *   zoom    – the card's on-screen scale, following the camera: 1 = the card exactly fills the
 *             stage, 0.1 = far away, 8 = 8× in (`frames` in deck.js). Always 1 in thumbnails.
 *             <Detail> is built on it.
 */
export function useStep() {
  return {
    step: inject('scene-step', computed(() => Infinity)),
    active: inject('scene-active', computed(() => false)),
    near: inject('scene-near', computed(() => true)),
    preview: inject('scene-preview', computed(() => false)),
    zoom: inject('scene-zoom', computed(() => 1)),
  }
}
