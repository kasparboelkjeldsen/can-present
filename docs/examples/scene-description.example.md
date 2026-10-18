# Scene description: Feature flags without fear

## Overview
- Running time: 10 min, 6 scenes
- Arc: Friday deploys are scary (hook) → what goes wrong when a release is all-or-nothing (problem) → a flag service sits between the app and the dashboard (how) → the SDK check is three lines (detail) → the kill switch (payoff).
- Canvas layout: a path going left to right. The diagram is bigger than normal and the SDK scene is a dive into its "Flag service" box. The kill switch sits far away from everything, for a long dramatic flight.
- Recurring motifs: a small orange flag icon next to every kicker.

## Assets needed
- shots/dashboard-toggle.png – the flag dashboard with the "new-checkout" flag switched off
- live: https://flags.example.com/ – TODO: confirm the demo dashboard URL

## Scenes

### 1. title – Feature flags without fear
- **Background:** dark
- **Position:** start of the path
- **On screen:** kicker "Friday talks"; headline "Feature flags without fear"; under it "Ana Speaker · shipping on Fridays since 2019"
- **Animation:** kicker, headline and subtitle rise in one after another
- **Builds:** none
- **Notes:**
  - Hi, I'm Ana
  - Show of hands: who deploys on a Friday? (pause)

### 2. friday – Friday, 16:55
- **Background:** light
- **Position:** to the right of title, tilted slightly right
- **On screen:** headline "Friday, 16:55"; three cards side by side that pop in one per click
- **Animation:** headline rises in
- **Builds:** 1. card "One big release" 2. card "One bad line" 3. card "Everybody rolls back"
- **Notes:**
  - Every release is all-or-nothing
  - [PRESS] three times, one card each
  - The third card gets a laugh (joke)

### 3. flow – How a flag flows
- **Background:** light
- **Position:** to the right of friday, bigger than normal
- **On screen:** a diagram with three boxes left to right: "Your app", "Flag service", "Dashboard". Wires: app ↔ flag service, dashboard → flag service. A small packet labelled "new-checkout?" flows from the app to the flag service, and "on" flows back.
- **Animation:** the boxes appear left to right, then the wires draw themselves, then the packets start flowing (no clicks)
- **Builds:** none
- **Notes:**
  - The app asks, the service answers
  - The dashboard is where product people flip switches
  - Next we dive into the flag service box

### 4. the-check – Inside the SDK
- **Background:** dark
- **Position:** inside flow's "Flag service" box (nested: the camera dives in)
- **On screen:** a code block titled "checkout.js":
  ```js
  import { flags } from './flags.js'

  export async function checkout(cart) {
    if (await flags.isOn('new-checkout')) {
      return newCheckout(cart)
    }
    return oldCheckout(cart)
  }
  ```
- **Animation:** the code block fades in
- **Builds:** 1. line 4 lights up, callout "One question per request" 2. lines 5–7 light up, callout "The old path stays until you delete it" (green)
- **Notes:**
  - This is the whole integration
  - [PRESS] the check
  - [PRESS] both paths live side by side

### 5. kill-switch – The kill switch
- **Background:** accent
- **Position:** far away from everything, below the path
- **On screen:** kicker "The payoff"; headline "Turn it off. Go home."; the screenshot shots/dashboard-toggle.png in a browser frame, tilted slightly left
- **Animation:** headline rises in, screenshot slides up after it
- **Builds:** none
- **Notes:**
  - Something broke? Flip it off. No deploy, no rollback
  - (pause) That's the whole talk

### 6. thanks – Thanks
- **Background:** dark
- **Position:** to the right of flow, back on the path
- **On screen:** headline "Thanks!"; "slides: TODO: link" and "ana@example.com"
- **Animation:** headline rises in
- **Builds:** none
- **Notes:**
  - Questions
  - TODO: the link to the slides
