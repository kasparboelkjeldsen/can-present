#!/usr/bin/env node
// npm run import-pptx -- <file.pptx> [--out <dir>] [--deck <id> [--brand <name>] [--title "…"]] [--no-render]
//
// Reads a PowerPoint file and writes what a person (or an agent) needs to rebuild it as a deck,
// into imports/<name>/ (gitignored: client material):
//
//   slides.md              every slide in reading order: title, text with levels and bold, tables
//                          as tables, images with their file and place, notes, and flags such as
//                          "this slide is one big picture" (rebuild it from the render)
//   slides.json            the same, as data
//   renders/NN.png         each slide as PowerPoint draws it, 1920×1080, plus renders/contact.png
//                          (needs PowerPoint on Windows; skipped elsewhere or with --no-render)
//   media/sNN-<name>.ext   every picture, cropped the way the slide crops it, named after its slide
//                          and alt text, odd formats converted (gif → png, big opaque png → jpg)
//   theme.json/.css        the pptx theme's colours and fonts, as suggested tokens
//   scene-description.md   a draft in the format of docs/presentation-guide.md, one scene per slide
//
// With --deck <id> it then scaffolds decks/<id> from that draft (npm run new-deck -- <id> --from …,
// --brand passed on) and copies the media to decks/<id>/public/assets/pptx/.
//
// A .pptx is a zip of XML: jszip opens it, fast-xml-parser reads it, sharp does the images.
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { spawnSync } from 'node:child_process'
import JSZip from 'jszip'
import { XMLParser } from 'fast-xml-parser'
import sharp from 'sharp'
import { ROOT, DECKS_DIR } from '../engine/vite.js'

const USAGE = `Usage: npm run import-pptx -- <file.pptx> [options]

  --out <dir>      where to write (default: imports/<file name>/)
  --deck <id>      also scaffold decks/<id> from the draft scene description, with the media in
                   decks/<id>/public/assets/pptx/
  --brand <name>   with --deck: build it on brands/<name>/ (e.g. kraftvaerk)
  --title "…"      with --deck: the deck title (default: the first slide's title)
  --no-render      skip the slide renders (they need PowerPoint on Windows)`

function fail(msg) {
  console.error(msg + '\n\n' + USAGE)
  process.exit(1)
}

function parseArgs(argv) {
  const out = { file: null, out: null, deck: null, brand: null, title: null, render: true }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '-h' || a === '--help') { console.log(USAGE); process.exit(0) }
    if (a === '--no-render') { out.render = false; continue }
    const m = /^--(out|deck|brand|title)(?:=(.*))?$/.exec(a)
    if (m) {
      const v = m[2] ?? argv[++i]
      if (v == null) fail(`--${m[1]} needs a value`)
      out[m[1]] = v
    } else if (a.startsWith('-')) fail(`Unknown option: ${a}`)
    else if (!out.file) out.file = a
    else fail(`Unexpected argument: ${a}`)
  }
  return out
}

// ---------------------------------------------------------------- small helpers

/** "Hej! Vi er Kraftvaerk" → "hej-vi-er-kraftvaerk" (æ ø å spelled out, at most `max` chars) */
export function slug(s, max = 40) {
  const flat = String(s).toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa').replace(/ß/g, 'ss')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  if (flat.length <= max) return flat
  const cut = flat.slice(0, max)
  return (cut.includes('-') ? cut.slice(0, cut.lastIndexOf('-')) : cut).replace(/-+$/, '')
}

// Office's automatic alt text says nothing a file name needs
const altClean = (s) => String(s ?? '')
  .replace(/\s*Description automatically generated( with (low|medium|high) confidence)?/gi, '')
  .replace(/^(a|an)\s+(close-up of\s+(a|an)\s+)?/i, '')
  .trim()

const pad2 = (n) => String(n).padStart(2, '0')
const pct = (v) => Math.round(v * 1000) / 10

// ---------------------------------------------------------------- XML (fast-xml-parser, preserveOrder)

const parser = new XMLParser({
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: '',
  trimValues: false,
  parseTagValue: false,
  parseAttributeValue: false,
  htmlEntities: true, // alt text carries &#xA; line breaks
})

const tagOf = (n) => Object.keys(n).find((k) => k !== ':@')
const kids = (n) => (n && Array.isArray(n[tagOf(n)]) ? n[tagOf(n)] : [])
const attr = (n, a) => n?.[':@']?.[a]
const child = (n, tag) => kids(n).find((c) => tagOf(c) === tag)
const childrenOf = (n, tag) => kids(n).filter((c) => tagOf(c) === tag)
/** the first node down a chain of tags: dig(sp, 'p:spPr', 'a:xfrm') */
const dig = (n, ...tags) => tags.reduce((cur, t) => (cur ? child(cur, t) : null), n)
function* walk(n) {
  for (const c of kids(n)) {
    yield c
    yield* walk(c)
  }
}
const all = (n, tag) => [...walk(n)].filter((c) => tagOf(c) === tag)
const textOf = (n) => kids(n).map((c) => (tagOf(c) === '#text' ? c['#text'] : textOf(c))).join('')

// ---------------------------------------------------------------- the package

class Package {
  constructor(zip) { this.zip = zip; this.cache = new Map() }
  has(p) { return !!this.zip.file(p) }
  async xml(p) {
    if (!this.cache.has(p)) {
      const f = this.zip.file(p)
      this.cache.set(p, f ? parser.parse(await f.async('string')) : null)
    }
    return this.cache.get(p)
  }
  async bytes(p) { return this.zip.file(p)?.async('nodebuffer') ?? null }
  /** a part's relationships: { rId: { type, target (resolved part path), external } } */
  async rels(p) {
    const relsPath = path.posix.join(path.posix.dirname(p), '_rels', path.posix.basename(p) + '.rels')
    const doc = await this.xml(relsPath)
    const out = {}
    if (!doc) return out
    const root = doc.find((n) => tagOf(n) === 'Relationships')
    for (const r of childrenOf(root, 'Relationship')) {
      const external = attr(r, 'TargetMode') === 'External'
      const t = attr(r, 'Target')
      out[attr(r, 'Id')] = {
        type: attr(r, 'Type').split('/').pop(),
        target: external ? t : t.startsWith('/') ? t.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(p), t)),
        external,
      }
    }
    return out
  }
}
const rootOf = (doc, tag) => doc?.find((n) => tagOf(n) === tag)

// ---------------------------------------------------------------- geometry

const xfrmBox = (x) => {
  const off = child(x, 'a:off'), ext = child(x, 'a:ext')
  if (!off || !ext) return null
  return { x: +attr(off, 'x'), y: +attr(off, 'y'), w: +attr(ext, 'cx'), h: +attr(ext, 'cy') }
}
/** a group's child coordinates → the slide's */
function groupTransform(grpSp, outer) {
  const x = dig(grpSp, 'p:grpSpPr', 'a:xfrm')
  const box = x && xfrmBox(x)
  const chOff = child(x, 'a:chOff'), chExt = child(x, 'a:chExt')
  if (!box || !chOff || !chExt) return outer
  const sx = box.w / (+attr(chExt, 'cx') || box.w), sy = box.h / (+attr(chExt, 'cy') || box.h)
  const ox = +attr(chOff, 'x'), oy = +attr(chOff, 'y')
  return (b) => outer({ x: box.x + (b.x - ox) * sx, y: box.y + (b.y - oy) * sy, w: b.w * sx, h: b.h * sy })
}

/** placeholder boxes of a layout or master: { 'type:title': box, 'idx:1': box } */
async function placeholderBoxes(pkg, part) {
  const doc = await pkg.xml(part)
  const out = {}
  const tree = dig(doc?.find((n) => tagOf(n)?.startsWith('p:')), 'p:cSld', 'p:spTree') // p:sldLayout or p:sldMaster
  for (const sp of all(tree, 'p:sp')) {
    const ph = dig(sp, 'p:nvSpPr', 'p:nvPr', 'p:ph')
    const x = dig(sp, 'p:spPr', 'a:xfrm')
    if (!ph || !x) continue
    const box = xfrmBox(x)
    if (attr(ph, 'type')) out['type:' + attr(ph, 'type')] ??= box
    if (attr(ph, 'idx')) out['idx:' + attr(ph, 'idx')] ??= box
  }
  return out
}

// ---------------------------------------------------------------- text

/**
 * a txBody → [{ text (markdown, **bold** runs), plain, level, bullet, bold, size }] (empty ones
 * dropped). size: the largest explicit font size in pt (0 when it's inherited from the layout).
 */
function paragraphs(txBody) {
  const out = []
  for (const p of childrenOf(txBody, 'a:p')) {
    const pPr = child(p, 'a:pPr')
    const runs = []
    for (const c of kids(p)) {
      const t = tagOf(c)
      const rPr = child(c, 'a:rPr')
      if (t === 'a:r' || t === 'a:fld') runs.push({ text: textOf(child(c, 'a:t') ?? {}), bold: attr(rPr, 'b') === '1', size: +(attr(rPr, 'sz') ?? 0) / 100 })
      else if (t === 'a:br') runs.push({ text: '\n', bold: false, size: 0 })
    }
    const plain = runs.map((r) => r.text).join('').replace(/\u000b/g, '\n')
    if (!plain.trim()) continue
    const words = runs.filter((r) => r.text.trim())
    const bold = words.length > 0 && words.every((r) => r.bold)
    const text = bold ? plain.trim() : runs.map((r) => (r.bold && r.text.trim() ? `**${r.text.trim()}**${/\s$/.test(r.text) ? ' ' : ''}` : r.text)).join('').trim()
    out.push({
      text: text.replace(/\s*\n\s*/g, ' / '),
      plain: plain.trim(),
      level: +(attr(pPr, 'lvl') ?? 0),
      bullet: !!(child(pPr, 'a:buChar') || child(pPr, 'a:buAutoNum')),
      bold,
      size: Math.max(0, ...words.map((r) => r.size)),
    })
  }
  return out
}

// ---------------------------------------------------------------- one slide

async function readSlide(pkg, part, n, size) {
  const doc = await pkg.xml(part)
  const sld = rootOf(doc, 'p:sld')
  const rels = await pkg.rels(part)
  const layoutRel = Object.values(rels).find((r) => r.type === 'slideLayout')
  let layoutName = null
  let phBoxes = {}
  if (layoutRel) {
    const ldoc = await pkg.xml(layoutRel.target)
    layoutName = attr(dig(rootOf(ldoc, 'p:sldLayout'), 'p:cSld'), 'name') ?? null
    phBoxes = await placeholderBoxes(pkg, layoutRel.target)
    const masterRel = Object.values(await pkg.rels(layoutRel.target)).find((r) => r.type === 'slideMaster')
    if (masterRel) {
      const mBoxes = await placeholderBoxes(pkg, masterRel.target)
      for (const [k, v] of Object.entries(mBoxes)) phBoxes[k] ??= v
    }
  }

  const slide = {
    n, part, layout: layoutName, hidden: attr(sld, 'show') === '0',
    title: null, texts: [], tables: [], images: [], charts: [], diagrams: 0, notes: '', clicks: 0, flags: [],
  }
  const rel = (box) => box && { x: pct(box.x / size.w), y: pct(box.y / size.h), w: pct(box.w / size.w), h: pct(box.h / size.h) }

  async function visit(nodes, tf) {
    for (const node of nodes) {
      const t = tagOf(node)
      if (t === 'mc:AlternateContent') {
        const choice = child(node, 'mc:Choice') ?? child(node, 'mc:Fallback')
        if (choice) await visit(kids(choice), tf)
      } else if (t === 'p:grpSp') {
        await visit(kids(node), groupTransform(node, tf))
      } else if (t === 'p:sp') {
        const ph = dig(node, 'p:nvSpPr', 'p:nvPr', 'p:ph')
        const phType = ph ? attr(ph, 'type') ?? 'body' : null
        const x = dig(node, 'p:spPr', 'a:xfrm')
        let box = x ? xfrmBox(x) : null
        if (box) box = tf(box)
        else if (ph) box = phBoxes['idx:' + attr(ph, 'idx')] ?? phBoxes['type:' + phType] ?? null
        const paras = paragraphs(child(node, 'p:txBody'))
        if (!paras.length) continue
        const isTitle = phType === 'title' || phType === 'ctrTitle'
        if (['sldNum', 'dt', 'ftr'].includes(phType)) continue
        slide.texts.push({ role: isTitle ? 'title' : phType === 'subTitle' ? 'subtitle' : ph ? 'body' : 'text', box, paragraphs: paras })
      } else if (t === 'p:pic') {
        const blip = dig(node, 'p:blipFill', 'a:blip')
        const svg = blip && all(blip, 'asvg:svgBlip')[0]
        const embed = attr(svg, 'r:embed') ?? attr(blip, 'r:embed')
        const media = embed && rels[embed]
        if (!media || media.external) continue
        const src = dig(node, 'p:blipFill', 'a:srcRect')
        const crop = src ? Object.fromEntries(['l', 't', 'r', 'b'].map((k) => [k, Math.max(0, +(attr(src, k) ?? 0) / 100000)])) : null
        const cNvPr = dig(node, 'p:nvPicPr', 'p:cNvPr')
        const x = dig(node, 'p:spPr', 'a:xfrm')
        slide.images.push({
          media: media.target, alt: altClean(attr(cNvPr, 'descr')), name: attr(cNvPr, 'name') ?? '',
          crop: crop && Object.values(crop).some((v) => v > 0) ? crop : null,
          box: x ? tf(xfrmBox(x)) : null,
        })
      } else if (t === 'p:graphicFrame') {
        const box = tf(xfrmBox(child(node, 'p:xfrm')) ?? { x: 0, y: 0, w: 0, h: 0 })
        const data = all(node, 'a:graphicData')[0]
        const uri = attr(data, 'uri') ?? ''
        if (uri.endsWith('/table')) {
          const rows = all(data, 'a:tr').map((tr) => childrenOf(tr, 'a:tc').map((tc) => paragraphs(child(tc, 'a:txBody'))))
          slide.tables.push({ box, rows })
        } else if (uri.endsWith('/chart')) {
          const c = all(data, 'c:chart')[0]
          const r = c && rels[attr(c, 'r:id')]
          slide.charts.push({ box, part: r?.target ?? null, ...(r ? await readChart(pkg, r.target) : {}) })
        } else if (uri.endsWith('/diagram')) {
          slide.diagrams++
          const dm = all(data, 'dgm:relIds')[0]
          const r = dm && rels[attr(dm, 'r:dm')]
          const ddoc = r && (await pkg.xml(r.target))
          const words = ddoc ? all(ddoc[ddoc.length - 1], 'a:t').map(textOf).filter((s) => s.trim()) : []
          if (words.length) slide.texts.push({ role: 'smartart', box, paragraphs: words.map((w) => ({ text: w, plain: w, level: 0, bullet: true, bold: false })) })
        }
      }
    }
  }

  const tree = dig(sld, 'p:cSld', 'p:spTree')
  await visit(kids(tree), (b) => b)

  // the background picture, if the slide has its own
  const bgBlip = all(dig(sld, 'p:cSld', 'p:bg') ?? {}, 'a:blip')[0]
  if (bgBlip && rels[attr(bgBlip, 'r:embed')]) slide.images.unshift({ media: rels[attr(bgBlip, 'r:embed')].target, alt: 'slide background', name: 'background', crop: null, box: { x: 0, y: 0, w: size.w, h: size.h } })

  // reading order: top to bottom in bands of ~4% of the height, then left to right
  const band = size.h * 0.04
  const order = (a, b) => (a.box && b.box ? Math.round(a.box.y / band) - Math.round(b.box.y / band) || a.box.x - b.box.x : 0)
  slide.texts.sort(order)
  slide.images.sort(order)
  for (const item of [...slide.texts, ...slide.tables, ...slide.images, ...slide.charts]) item.at = rel(item.box)

  // the title: the title placeholder; else (decks built from plain text boxes) the paragraphs set in
  // the largest font, if headline-sized; else a short text near the top
  const titleBox = slide.texts.find((t) => t.role === 'title')
  const join = (ps) => ps.map((p) => p.plain).join(' ').replace(/\s+/g, ' ').trim()
  if (titleBox) slide.title = join(titleBox.paragraphs)
  else {
    const sized = slide.texts.flatMap((t) => t.paragraphs.map((p) => ({ t, p }))).filter(({ p }) => p.size >= 24 && p.plain.trim().length >= 3)
    const top = Math.max(0, ...sized.map(({ p }) => p.size))
    const block = sized.find(({ p }) => p.size === top)?.t
    // a short first line of a text near the top ("Tech partnerskaber" above its subtitle)
    const fits = (p) => p && p.plain.trim().length >= 3 && p.plain.length <= 60
    const first = slide.texts.find((t) => t.box && t.box.y < size.h * 0.4 && fits(t.paragraphs[0]))?.paragraphs[0]
    if (block) slide.title = join(block.paragraphs.filter((p) => p.size === top))
    else if (first) slide.title = join([first])
    if (slide.title?.length > 90) slide.title = null
  }

  // colours the slide sets directly (fills, lines, text), hex → count: the real palette when the
  // theme is Office's default
  slide.colours = {}
  for (const c of all(sld, 'a:srgbClr')) {
    const v = '#' + String(attr(c, 'val')).toLowerCase()
    slide.colours[v] = (slide.colours[v] ?? 0) + 1
  }

  // clicks: animations that start on a click
  const timing = child(sld, 'p:timing')
  if (timing) slide.clicks = all(timing, 'p:cTn').filter((c) => attr(c, 'nodeType') === 'clickEffect').length

  // speaker notes
  const notesRel = Object.values(rels).find((r) => r.type === 'notesSlide')
  if (notesRel) {
    const ndoc = await pkg.xml(notesRel.target)
    for (const sp of all(rootOf(ndoc, 'p:notes'), 'p:sp')) {
      const ph = dig(sp, 'p:nvSpPr', 'p:nvPr', 'p:ph')
      if (attr(ph, 'type') === 'body') slide.notes = paragraphs(child(sp, 'p:txBody')).map((p) => p.plain).join('\n')
    }
  }

  // flags
  const chars = slide.texts.reduce((s, t) => s + t.paragraphs.reduce((a, p) => a + p.plain.length, 0), 0) + slide.tables.length * 100
  const big = slide.images.find((i) => i.box && i.box.w * i.box.h >= 0.7 * size.w * size.h)
  if (big && chars < 20) slide.flags.push('picture: one big image and almost no text. Probably a picture of a slide: rebuild it from the render')
  if (!chars && !slide.images.length && !slide.charts.length) slide.flags.push('empty: no text or pictures of its own (only the layout)')
  if (slide.hidden) slide.flags.push('hidden in the pptx')
  if (slide.clicks) slide.flags.push(`${slide.clicks} click animation${slide.clicks > 1 ? 's' : ''} in the pptx`)
  if (slide.charts.length) slide.flags.push(`${slide.charts.length} chart${slide.charts.length > 1 ? 's' : ''}: data below, redraw it`)
  if (slide.diagrams) slide.flags.push('SmartArt: its text is listed, redraw the shape from the render')
  return slide
}

/** a chart part → { kind, title, series: [{ name, categories, values }] } */
async function readChart(pkg, part) {
  const doc = await pkg.xml(part)
  const plot = all(rootOf(doc, 'c:chartSpace'), 'c:plotArea')[0]
  if (!plot) return {}
  const kindNode = kids(plot).find((c) => /Chart$/.test(tagOf(c)))
  const pts = (n) => (n ? all(n, 'c:pt').map((p) => textOf(child(p, 'c:v'))) : [])
  const series = all(kindNode ?? {}, 'c:ser').map((s) => ({
    name: all(child(s, 'c:tx') ?? {}, 'c:v').map(textOf)[0] ?? '',
    categories: pts(child(s, 'c:cat')),
    values: pts(child(s, 'c:val')),
  }))
  const title = all(all(rootOf(doc, 'c:chartSpace'), 'c:title')[0] ?? {}, 'a:t').map(textOf).join('')
  return { kind: kindNode ? tagOf(kindNode).replace(/^c:/, '') : null, title, series }
}

// ---------------------------------------------------------------- theme

async function readTheme(pkg, presRels) {
  const masterRel = Object.values(presRels).find((r) => r.type === 'slideMaster')
  const themeRel = masterRel && Object.values(await pkg.rels(masterRel.target)).find((r) => r.type === 'theme')
  const doc = themeRel && (await pkg.xml(themeRel.target))
  if (!doc) return null
  const theme = rootOf(doc, 'a:theme')
  const scheme = all(theme, 'a:clrScheme')[0]
  const colours = {}
  for (const c of kids(scheme)) {
    const k = tagOf(c).replace(/^a:/, '')
    const v = child(c, 'a:srgbClr') ? attr(child(c, 'a:srgbClr'), 'val') : attr(child(c, 'a:sysClr'), 'lastClr')
    if (v) colours[k] = '#' + v.toLowerCase()
  }
  const font = (tag) => attr(dig(all(theme, tag)[0], 'a:latin'), 'typeface') ?? null
  return { name: attr(theme, 'name') ?? null, colours, fonts: { headings: font('a:majorFont'), body: font('a:minorFont') } }
}

function themeCss(theme) {
  const c = theme.colours
  return `/* Suggested tokens from the pptx theme "${theme.name ?? ''}". Copy what fits into the deck's theme.css
   (or use a brand kit: npm run new-deck -- <id> --brand <name>). Check contrast before using the accents as text.
   If the slides set their own colours (--pptx-used-*, most used first), those are usually the real palette. */
:root {
${Object.entries(c).map(([k, v]) => `  --pptx-${k}: ${v};`).join('\n')}
${Object.keys(theme.used ?? {}).map((v, i) => `  --pptx-used-${i + 1}: ${v};`).join('\n')}

  --deck-ink: ${c.dk1 ?? '#000000'};
  --deck-paper: ${c.lt1 ?? '#ffffff'};
  --deck-accent: ${c.accent1 ?? '#ff7849'};
  --deck-accent-2: ${c.accent2 ?? '#ff5d73'};
  --deck-canvas: ${c.dk2 ?? c.dk1 ?? '#111111'};

  /* fonts: headings "${theme.fonts.headings}", body "${theme.fonts.body}". Bundle them with @fontsource if they're free fonts */
  --serif: '${theme.fonts.headings}', Georgia, serif;
  --sans: '${theme.fonts.body}', system-ui, sans-serif;
}
`
}

// ---------------------------------------------------------------- media

/**
 * Writes one picture to media/: cropped as on the slide, odd formats converted, transparent margins
 * trimmed. Returns { file, w, h, format } or { file, unsupported } when sharp can't read it.
 */
async function writeMedia(pkg, img, base, dir) {
  const buf = await pkg.bytes(img.media)
  if (!buf) return null
  const head = buf.subarray(0, 512).toString('utf8')
  if (/<svg[\s>]/i.test(head) || img.media.toLowerCase().endsWith('.svg')) {
    fs.writeFileSync(path.join(dir, base + '.svg'), buf)
    return { file: base + '.svg', format: 'svg' }
  }
  let meta
  try { meta = await sharp(buf).metadata() } catch {
    const ext = path.posix.extname(img.media).replace(/[^.a-z0-9]/gi, '').slice(0, 5) || '.bin'
    fs.writeFileSync(path.join(dir, base + ext), buf)
    return { file: base + ext, unsupported: true }
  }
  let pipe = sharp(buf, { animated: false }).rotate()
  if (img.crop) {
    const { l, t, r, b } = img.crop
    const left = Math.round(meta.width * l), top = Math.round(meta.height * t)
    const width = Math.max(1, Math.round(meta.width * (1 - l - r))), height = Math.max(1, Math.round(meta.height * (1 - t - b)))
    pipe = pipe.extract({ left, top, width: Math.min(width, meta.width - left), height: Math.min(height, meta.height - top) })
  }
  if (meta.hasAlpha) {
    // margins as transparent as the corner go; keep the image if that leaves nothing
    try {
      const trimmed = await pipe.clone().trim({ threshold: 1 }).toBuffer({ resolveWithObject: true })
      if (trimmed.info.width > 4 && trimmed.info.height > 4) pipe = sharp(trimmed.data)
    } catch {}
  }
  pipe = pipe.resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
  // photos as jpg; anything with transparency (logos, cut-outs) stays png
  const asJpg = !meta.hasAlpha && (meta.format === 'jpeg' || (buf.length > 300_000 && meta.format !== 'gif'))
  const file = base + (asJpg ? '.jpg' : '.png')
  const info = await (asJpg ? pipe.jpeg({ quality: 86, mozjpeg: true }) : pipe.png({ compressionLevel: 9 })).toFile(path.join(dir, file))
  return { file, w: info.width, h: info.height, format: asJpg ? 'jpg' : 'png' }
}

// ---------------------------------------------------------------- renders

const RENDER_PS1 = `param([string]$Pptx, [string]$Out, [int]$W, [int]$H)
$ErrorActionPreference = 'Stop'
$wasRunning = [bool](Get-Process POWERPNT -ErrorAction SilentlyContinue)
$app = New-Object -ComObject PowerPoint.Application
try {
  # ReadOnly, Untitled = false, WithWindow = false
  $pres = $app.Presentations.Open($Pptx, -1, 0, 0)
  try {
    foreach ($s in $pres.Slides) { $s.Export((Join-Path $Out ('{0:D2}.png' -f $s.SlideIndex)), 'PNG', $W, $H) }
  } finally { $pres.Close() }
} finally {
  # only quit PowerPoint if we started it: never close the speaker's own window
  if (-not $wasRunning) { $app.Quit() }
  [void][Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}
`

/** Each slide as PNG via PowerPoint (Windows). Returns a reason string when it couldn't. */
function render(file, dir) {
  if (process.platform !== 'win32') return 'renders need PowerPoint on Windows (open the pptx and export the slides as PNG into renders/ by hand)'
  const ps1 = path.join(os.tmpdir(), `can-present-render-${process.pid}.ps1`)
  fs.writeFileSync(ps1, RENDER_PS1)
  fs.mkdirSync(dir, { recursive: true })
  const r = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', ps1, '-Pptx', path.resolve(file), '-Out', path.resolve(dir), '-W', '1920', '-H', '1080'], { encoding: 'utf8', timeout: 300_000 })
  fs.rmSync(ps1, { force: true })
  if (r.status !== 0) return `PowerPoint couldn't render the slides (${(r.stderr || r.stdout || r.error?.message || 'unknown error').trim().split('\n')[0]})`
  return null
}

/** renders/contact.png: every render in one grid, numbered */
async function contactSheet(dir, slides) {
  const files = slides.map((s) => path.join(dir, `${pad2(s.n)}.png`)).filter((f) => fs.existsSync(f))
  if (!files.length) return null
  const W = 480, H = 270, L = 34, cols = 4, gap = 12
  const rows = Math.ceil(files.length / cols)
  const tiles = await Promise.all(files.map(async (f, i) => {
    const s = slides.find((x) => path.basename(f) === `${pad2(x.n)}.png`)
    const label = `${pad2(s.n)}  ${(s.title ?? s.layout ?? '').replace(/[<>&"]/g, '').slice(0, 44)}`
    const img = await sharp(f).resize(W, H, { fit: 'contain', background: '#222' }).toBuffer()
    const text = Buffer.from(`<svg width="${W}" height="${L}"><rect width="100%" height="100%" fill="#111"/><text x="8" y="23" font-family="Segoe UI, Arial, sans-serif" font-size="18" fill="#eee">${label}</text></svg>`)
    return [
      { input: img, left: gap + (i % cols) * (W + gap), top: gap + Math.floor(i / cols) * (H + L + gap) },
      { input: text, left: gap + (i % cols) * (W + gap), top: gap + Math.floor(i / cols) * (H + L + gap) + H },
    ]
  }))
  const out = path.join(dir, 'contact.png')
  await sharp({ create: { width: gap + cols * (W + gap), height: gap + rows * (H + L + gap), channels: 3, background: '#2a2a2a' } })
    .composite(tiles.flat()).png().toFile(out)
  return out
}

/** dark / light / accent, from the render's average colour */
async function backgroundOf(renderFile) {
  if (!fs.existsSync(renderFile)) return null
  const { channels } = await sharp(renderFile).stats()
  const [r, g, b] = channels.map((c) => c.mean)
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  if (lum < 0.4) return 'dark'
  return Math.max(r, g, b) - Math.min(r, g, b) > 50 ? 'accent' : 'light'
}

// ---------------------------------------------------------------- writing

function tableMd(rows) {
  const cell = (paras) => paras.map((p) => (p.bullet ? '• ' : '') + (p.bold ? `**${p.text}**` : p.text)).join('<br>').replace(/\|/g, '\\|') || ' '
  const w = Math.max(...rows.map((r) => r.length))
  const lines = rows.map((r) => `| ${Array.from({ length: w }, (_, i) => cell(r[i] ?? [])).join(' | ')} |`)
  lines.splice(1, 0, `|${' --- |'.repeat(w)}`)
  return lines.join('\n')
}

const at = (a) => (a ? `at x ${a.x}% y ${a.y}%, ${a.w}% × ${a.h}%` : 'position unknown')

function slideMd(s) {
  const out = [`## ${pad2(s.n)} · ${s.title ? `"${s.title}"` : '(no title)'}`, '']
  out.push(`- layout: ${s.layout ?? '?'}${s.render ? ` · render: \`${s.render}\`` : ''}${s.background ? ` · background: ${s.background}` : ''}`)
  for (const f of s.flags) out.push(`- **${f.split(':')[0]}**${f.includes(':') ? ':' + f.split(':').slice(1).join(':') : ''}`)
  out.push('')
  for (const t of s.texts) {
    if (t.role === 'title') continue
    out.push(`**${t.role}** (${at(t.at)})`, '')
    for (const p of t.paragraphs) out.push(`${'  '.repeat(p.level)}${p.bullet ? '- ' : ''}${p.bold && !p.bullet ? `**${p.text}**` : p.text}`)
    out.push('')
  }
  for (const t of s.tables) out.push(`**table** (${t.rows.length}×${Math.max(...t.rows.map((r) => r.length))}, ${at(t.at)})`, '', tableMd(t.rows), '')
  for (const c of s.charts) {
    out.push(`**chart** ${c.kind ?? ''}${c.title ? ` "${c.title}"` : ''} (${at(c.at)})`, '')
    for (const ser of c.series ?? []) out.push(`- ${ser.name || 'series'}: ${ser.categories.map((k, i) => `${k} = ${ser.values[i]}`).join(', ') || ser.values.join(', ')}`)
    out.push('')
  }
  if (s.images.length) {
    out.push('**images**', '')
    for (const i of s.images) out.push(`- \`${i.file ?? i.media}\`${i.w ? ` ${i.w}×${i.h}` : ''}${i.unsupported ? ' (format sharp can\'t read: see the render)' : ''}${i.alt ? ` "${i.alt}"` : ''}${i.crop ? ' (cropped as on the slide)' : ''}, ${at(i.at)}`)
    out.push('')
  }
  if (s.notes) out.push('**notes**', '', ...s.notes.split('\n').map((l) => `> ${l}`), '')
  return out.join('\n')
}

/** the draft scene description (docs/presentation-guide.md's format), one scene per slide */
function sceneDescription(meta, slides, theme) {
  const ids = new Set()
  const quote = (x) => `"${x.length > 600 ? x.slice(0, 600) + '…' : x}"`
  // an untitled slide is named after its first words ("Når det digitale spiller en vigtig…")
  const firstWords = (s) => {
    const p = s.texts.flatMap((t) => t.paragraphs).find((x) => x.plain.trim().length >= 3)
    const words = (p?.plain ?? '').split(/\s+/).filter(Boolean)
    return words.length ? words.slice(0, 6).join(' ') + (words.length > 6 ? '…' : '') : null
  }
  const scenes = slides.map((s, i) => {
    const title = s.title ?? firstWords(s) ?? `Slide ${s.n}`
    let id = slug(title, 32) || `slide-${pad2(s.n)}`
    if (/^\d/.test(id)) id = 'slide-' + id
    const base = id
    for (let k = 2; ids.has(id); k++) id = `${base}-${k}`
    ids.add(id)
    const onScreen = [
      `(pptx slide ${s.n}${s.render ? `, ${s.render} in the import` : ''})`,
      ...s.flags.map((f) => `TODO: ${f}`),
      `headline "${title}"`,
      ...s.texts.filter((t) => t.role !== 'title').map((t) => quote(t.paragraphs.map((p) => p.plain.replace(/\s*\n\s*/g, ' ')).join(' / '))),
      ...s.tables.map((t) => `a table, ${t.rows.length} rows (in slides.md)`),
      ...s.charts.map((c) => `a ${c.kind ?? ''} chart${c.title ? ` "${c.title}"` : ''} (data in slides.md)`),
      ...s.images.filter((im) => im.file).map((im) => `image /assets/pptx/${im.file}${im.alt ? ` (${im.alt})` : ''}`),
    ]
    return [
      `### ${i + 1}. ${id} – ${title}`,
      `- **Background:** ${s.background ?? 'TODO: dark, light or accent'}`,
      `- **Position:** ${i === 0 ? 'start of the path' : 'TODO'}`,
      `- **On screen:** ${onScreen.join('; ')}`,
      '- **Animation:** the content rises in',
      '- **Builds:** none',
      '- **Notes:**',
      ...(s.notes ? s.notes.split('\n').filter((l) => l.trim()).map((l) => `  - ${l.trim()}`) : ['  - TODO']),
    ].join('\n')
  })
  const media = slides.flatMap((s) => s.images.filter((i) => i.file && !i.unsupported).map((i) => `- /assets/pptx/${i.file} – from slide ${s.n}${i.alt ? `: ${i.alt}` : ''}`))
  return `# Scene description: ${meta.title}

## Overview
- Source: ${meta.source}, ${slides.length} slides, imported ${new Date().toISOString().slice(0, 10)} (npm run import-pptx)
- Running time: TODO
- Arc: TODO (one scene per pptx slide so far: merge, split and reorder before building)
- Canvas layout: TODO
- Recurring motifs: TODO${theme ? `\n- pptx theme: ${Object.entries(theme.colours).filter(([k]) => /^(dk|lt|accent)/.test(k)).map(([k, v]) => `${k} ${v}`).join(', ')}; fonts ${theme.fonts.headings} / ${theme.fonts.body}; colours used on the slides: ${Object.keys(theme.used ?? {}).slice(0, 8).join(', ') || 'none'}` : ''}

## Assets needed
${media.join('\n') || '- none'}

## Scenes

${scenes.join('\n\n')}
`
}

// ---------------------------------------------------------------- main

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.file) fail('Missing <file.pptx>.')
  if (!fs.existsSync(args.file)) fail(`${args.file} not found`)
  if (!/\.pptx$/i.test(args.file)) fail('Only .pptx files (save a .ppt as .pptx in PowerPoint first).')
  if (args.brand && !args.deck) fail('--brand goes with --deck')
  if (args.deck && fs.existsSync(path.join(DECKS_DIR, args.deck))) fail(`decks/${args.deck} already exists (import-pptx never overwrites a deck)`)

  const name = slug(path.basename(args.file, path.extname(args.file)), 60) || 'import'
  const out = path.resolve(args.out ?? path.join(ROOT, 'imports', args.deck ?? name))
  const mediaDir = path.join(out, 'media')
  const renderDir = path.join(out, 'renders')
  fs.rmSync(mediaDir, { recursive: true, force: true })
  fs.mkdirSync(mediaDir, { recursive: true })
  const relOut = (p) => path.relative(out, p).split(path.sep).join('/')

  const pkg = new Package(await JSZip.loadAsync(fs.readFileSync(args.file)))
  const presPart = 'ppt/presentation.xml'
  const pres = rootOf(await pkg.xml(presPart), 'p:presentation')
  const presRels = await pkg.rels(presPart)
  const sz = child(pres, 'p:sldSz')
  const size = { w: +attr(sz, 'cx'), h: +attr(sz, 'cy') }
  const parts = childrenOf(child(pres, 'p:sldIdLst'), 'p:sldId').map((s) => presRels[attr(s, 'r:id')]?.target).filter(Boolean)

  // renders first: PowerPoint is the slow part, and the background guess reads them
  let renderNote = null
  if (args.render) {
    console.log('Rendering the slides with PowerPoint…')
    fs.rmSync(renderDir, { recursive: true, force: true })
    renderNote = render(args.file, renderDir)
    if (renderNote) console.log('  ' + renderNote)
  } else renderNote = fs.existsSync(path.join(renderDir, '01.png')) ? null : 'skipped (--no-render)' // an earlier run's renders are reused

  const slides = []
  for (const [i, part] of parts.entries()) slides.push(await readSlide(pkg, part, i + 1, size))

  const names = new Set()
  for (const s of slides) {
    const r = path.join(renderDir, `${pad2(s.n)}.png`)
    if (fs.existsSync(r)) {
      s.render = relOut(r)
      s.background = await backgroundOf(r)
    }
    for (const [j, img] of s.images.entries()) {
      let base = `s${pad2(s.n)}-${slug(img.alt, 32) || slug(img.name, 24) || 'image-' + (j + 1)}`
      const stem = base
      for (let k = 2; names.has(base); k++) base = `${stem}-${k}`
      names.add(base)
      Object.assign(img, await writeMedia(pkg, img, base, mediaDir))
    }
  }
  const contact = renderNote ? null : await contactSheet(renderDir, slides)

  const theme = await readTheme(pkg, presRels)
  // the colours the slides set directly, most used first (often the real brand when the theme is Office's)
  const used = {}
  for (const s of slides) for (const [c, k] of Object.entries(s.colours)) used[c] = (used[c] ?? 0) + k
  const colours = Object.entries(used).sort((a, b) => b[1] - a[1]).slice(0, 12)
  if (theme) theme.used = Object.fromEntries(colours)
  for (const s of slides) delete s.colours
  const source = path.basename(args.file)
  const title = args.title ?? slides.find((s) => s.title)?.title ?? name
  const strip = ({ box, ...rest }) => rest
  const data = {
    source, slides: slides.length, size: { w: size.w / 12700, h: size.h / 12700, unit: 'pt' }, theme,
    renders: renderNote ? null : 'renders/', contact: contact ? relOut(contact) : null,
    slideList: slides.map((s) => ({ ...s, texts: s.texts.map(strip), tables: s.tables.map(strip), images: s.images.map(strip), charts: s.charts.map(strip) })),
  }
  fs.writeFileSync(path.join(out, 'slides.json'), JSON.stringify(data, null, 2))
  if (theme) {
    fs.writeFileSync(path.join(out, 'theme.json'), JSON.stringify(theme, null, 2))
    fs.writeFileSync(path.join(out, 'theme.css'), themeCss(theme))
  }
  const flagged = slides.filter((s) => s.flags.length)
  fs.writeFileSync(path.join(out, 'slides.md'), `# ${source}

${slides.length} slides · ${data.size.w}×${data.size.h} pt · renders: ${renderNote ?? '`renders/NN.png`, all of them in `' + (data.contact ?? '') + '`'}
${theme ? `\nTheme "${theme.name}": ${Object.entries(theme.colours).map(([k, v]) => `${k} \`${v}\``).join(', ')} · fonts: ${theme.fonts.headings} / ${theme.fonts.body} (suggested tokens: \`theme.css\`)\n` : ''}
Colours set on the slides themselves, most used first: ${colours.map(([c, k]) => `\`${c}\` ×${k}`).join(', ') || 'none'}. When they differ from the theme's, they're the real palette.

Look at the render of a slide before rebuilding it: positions are % of the slide, text is in reading order.
${flagged.length ? `\n**Flagged:** ${flagged.map((s) => `${pad2(s.n)} (${s.flags.map((f) => f.split(':')[0]).join(', ')})`).join(' · ')}\n` : ''}
${slides.map(slideMd).join('\n')}`)
  const descFile = path.join(out, 'scene-description.md')
  fs.writeFileSync(descFile, sceneDescription({ title, source }, slides, theme))

  const rel = (p) => path.relative(process.cwd(), p) || '.'
  const images = slides.reduce((n, s) => n + s.images.length, 0)
  console.log(`\nImported ${source}: ${slides.length} slides, ${images} images → ${rel(out)}/`)
  console.log(`  slides.md               read this first${contact ? `\n  ${relOut(contact).padEnd(24)}every slide at a glance` : ''}`)
  console.log(`  scene-description.md    draft, one scene per slide`)
  if (flagged.length) console.log(`  flagged: ${flagged.map((s) => `${s.n} ${s.flags.map((f) => f.split(':')[0]).join('/')}`).join(', ')}`)

  if (args.deck) {
    const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'new-deck.mjs'), args.deck, '--from', descFile, '--title', title, ...(args.brand ? ['--brand', args.brand] : [])], { stdio: 'inherit' })
    if (r.status !== 0) process.exit(r.status ?? 1)
    const assets = path.join(DECKS_DIR, args.deck, 'public', 'assets', 'pptx')
    fs.mkdirSync(assets, { recursive: true })
    for (const f of fs.readdirSync(mediaDir)) fs.copyFileSync(path.join(mediaDir, f), path.join(assets, f))
    console.log(`\nCopied ${fs.readdirSync(assets).length} images to decks/${args.deck}/public/assets/pptx/ (served as /assets/pptx/…).`)
    console.log(`The import stays in ${rel(out)}/ (renders, slides.md): keep it next to you while building.`)
  } else {
    console.log(`\nNext: npm run import-pptx -- "${args.file}" --deck <id> [--brand <name>]   (or new-deck --from the draft)`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
