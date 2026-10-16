import { inject, computed } from 'vue'

/**
 * Inside a scene:
 *   step    – current build step (Infinity when the scene is "done": past / overview)
 *   active  – this scene is the one on stage
 *   near    – on stage or one away (use it to preload heavy stuff like iframes)
 *   preview – rendered as a thumbnail (presenter window), skip heavy/live things
 */
export function useStep() {
  return {
    step: inject('scene-step', computed(() => Infinity)),
    active: inject('scene-active', computed(() => false)),
    near: inject('scene-near', computed(() => true)),
    preview: inject('scene-preview', computed(() => false)),
  }
}
