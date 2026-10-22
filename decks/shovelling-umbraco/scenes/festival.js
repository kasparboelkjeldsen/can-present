// "I'm speaking at Umbraco DK Festival": the outer layer round "1 more thing" (deck.js `outer.hole`).
// The previous layer is the dot on the i of "speaking", so the i is drawn here (a stem and a dot at
// these coordinates), not left to the font. Card px (1920×1080). The site's colours and font (DM Sans).
export const BLUE = 'rgb(76, 210, 255)'
export const URL = 'https://umbracodkfestival.dk/#Billetter'

// line 1: "I'm speak" + ı + "ng at", with the stem centred on the hole
const size = 130
const xHeight = Math.round(size * 0.5)
const baseline = 300
export const LINE1 = { size, baseline, stem: 18, gap: 9, xHeight, dot: 24 }
// the dot's centre: a little above the stem. "1 more thing" (1920 px) fits into 20 px: about 96×
export const HOLE = { cx: 1094, cy: baseline - xHeight - 22, w: 20 }

// DM Sans at line-height 1: the baseline sits 0.841em below the top of the line box
export const lineTop = (baseline, size) => baseline - 0.841 * size

// the speakers, as on the site (portraits in public/speakers)
export const SPEAKERS = [
  { name: 'Sebastiaan Janssen', img: 'sebastiaan-janssen.jpg' },
  { name: 'Lotte Pitcher', img: 'lotte-pitcher.jpg' },
  { name: 'Thomas Martinsen', img: 'thomas-martinsen.png' },
  { name: 'Kaspar Boel Kjeldsen', img: 'kaspar-boel-kjeldsen.png', me: true },
  { name: 'Carl Sargunar', img: 'carl-sargunar.png' },
  { name: 'Phil Whittaker', img: 'phil-whittaker.jpg' },
  { name: 'Matthew Wise', img: 'matthew-wise.jpg' },
  { name: 'Rasmus John Pedersen', img: 'rasmus-john-pedersen.png' },
  { name: 'Alisa Orlova', img: 'alisa-orlova.png' },
  { name: 'Joe Glombek', img: 'joe-glombek.jpg' },
  { name: 'Emma Potter', img: 'emma-potter.jpg' },
]
