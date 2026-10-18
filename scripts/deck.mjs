#!/usr/bin/env node
// One entry point for running a deck, without env-var syntax.
//
//   npm run deck -- dev [deck] [--port 5180] [--open] [--strictPort]
//   npm run deck -- lan [deck]        dev server on the network (--host)
//   npm run deck -- build [deck]
//   npm run deck -- preview [deck] [--port 4180]
//
// [deck] defaults to package.json "canPresent.deck". It sets DECK and drives Vite through its
// JavaScript API with the normal vite.config.js, so it behaves exactly like `DECK=x vite …`.
import path from 'node:path'
import { createServer, build, preview } from 'vite'
import { ROOT, resolveDeck } from '../engine/vite.js'

const COMMANDS = ['dev', 'lan', 'build', 'preview']

const USAGE = `Usage: npm run deck -- <command> [deck] [options]

Commands:
  dev [deck]        dev server (http://localhost:5173)
  lan [deck]        dev server reachable from other devices (--host)
  build [deck]      production build → dist/<deck>/
  preview [deck]    serve the production build

[deck] is a folder in decks/ (default: package.json "canPresent.deck").
Options for dev, lan and preview: --port <n>, --host [address], --open, --strictPort`

function usage(msg) {
  if (msg) console.error(msg + '\n')
  console.error(USAGE)
  process.exit(1)
}

/** Splits `[deck] [--flag value …]` into the deck name and the remaining args. */
export function splitArgs(args) {
  const rest = [...args]
  const deck = rest[0] && !rest[0].startsWith('-') ? rest.shift() : undefined
  return { deck, rest }
}

/** --port 5180 --host --open --strictPort → { port: 5180, host: true, open: true, strictPort: true } */
function serverOptions(args) {
  const opts = {}
  for (let i = 0; i < args.length; i++) {
    const [flag, inline] = args[i].split('=')
    const value = () => inline ?? (args[i + 1] && !args[i + 1].startsWith('-') ? args[++i] : undefined)
    switch (flag) {
      case '--port': {
        const v = Number(value())
        if (!Number.isInteger(v)) usage('--port needs a number')
        opts.port = v
        break
      }
      case '--host': opts.host = value() ?? true; break
      case '--open': opts.open = true; break
      case '--strictPort': opts.strictPort = true; break
      default: usage(`Unknown option: ${args[i]}`)
    }
  }
  return opts
}

/** Picks the deck (validating it, with the list of decks on a typo) and sets DECK for vite.config.js. */
export function selectDeck(name) {
  if (name) process.env.DECK = name
  const deck = resolveDeck()
  process.env.DECK = deck.id
  return deck
}

const configFile = path.join(ROOT, 'vite.config.js')

async function main(argv) {
  const [command, ...args] = argv
  if (!command || command === 'help' || command === '--help' || command === '-h') usage()
  if (!COMMANDS.includes(command)) usage(`Unknown command: ${command}`)

  const { deck: name, rest } = splitArgs(args)
  let deck
  try {
    deck = selectDeck(name)
  } catch (e) {
    console.error(e.message)
    process.exit(1)
  }

  if (command === 'build') {
    if (rest.length) usage(`build takes no options (got ${rest.join(' ')})`)
    await build({ root: ROOT, configFile })
    return
  }

  const opts = serverOptions(rest)
  if (command === 'lan' && opts.host == null) opts.host = true

  if (command === 'preview') {
    const server = await preview({ root: ROOT, configFile, preview: opts })
    console.log(`\n  deck: ${deck.id} (production build in dist/${deck.id})`)
    server.printUrls()
    server.bindCLIShortcuts({ print: true })
    return
  }

  const server = await createServer({ root: ROOT, configFile, server: opts })
  await server.listen()
  console.log(`\n  deck: ${deck.id}`)
  server.printUrls()
  server.bindCLIShortcuts({ print: true })
}

main(process.argv.slice(2)).catch((e) => {
  console.error(e?.stack ?? e)
  process.exit(1)
})
