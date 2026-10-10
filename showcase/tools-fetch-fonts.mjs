#!/usr/bin/env node
// Fetch every typeface the six templates use, latin subset, self-hosted.
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const OUT = join(process.cwd(), 'assets', 'fonts')
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

const FACES = [
  // 1 · Draught - interwar liner-poster Didone, as the real build uses
  ['bodoni-moda',    'Bodoni+Moda:opsz,wght@6..96,500'],
  ['inter',          'Inter:wght@400..700'],
  // Gallery display face. Same pairing as the Afroscots site: Poppins reads
  // cleanly at every size, which Bodoni does not.
  ['poppins',        'Poppins:wght@400;500;600;700'],
  // 2 · Brass & Bone - Deco-era elegance
  ['cormorant',      'Cormorant+Garamond:wght@300;400;600'],
  ['jost',           'Jost:wght@300;400;500'],
  // 3 · Tidewater - light, classical, airy
  ['marcellus',      'Marcellus'],
  // 4 · Blueprint - drawing-office technical
  ['plex-mono',      'IBM+Plex+Mono:wght@300;400;500'],
  ['plex-sans',      'IBM+Plex+Sans:wght@300;400;600'],
  // 5 · Nocturne - high-contrast evening serif
  ['prata',          'Prata'],
  // 6 · Queen Mary Cruises - the commercial brand
  ['italiana',       'Italiana'],
]

function latinUrls(css) {
  // Google returns one @font-face block per subset, each preceded by a comment
  // naming it. We want `latin` only - `latin-ext` roughly doubles the size for
  // characters this site will never render.
  return css
    .split('/*')
    .map((c) => '/*' + c)
    .filter((b) => /^\/\*\s*latin\s*\*\//.test(b))
    .map((b) => b.match(/url\((https:\/\/[^)]+\.woff2)\)/)?.[1])
    .filter(Boolean)
}

await mkdir(OUT, { recursive: true })
let total = 0

for (const [name, spec] of FACES) {
  const css = await (
    await fetch(`https://fonts.googleapis.com/css2?family=${spec}&display=swap`, {
      headers: { 'User-Agent': UA },
    })
  ).text()

  const urls = [...new Set(latinUrls(css))]
  if (!urls.length) {
    console.warn(`  ${name.padEnd(14)} no latin block found — skipped`)
    continue
  }

  let i = 0
  for (const url of urls) {
    const bytes = Buffer.from(await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer())
    const file = urls.length > 1 ? `${name}-${++i}.woff2` : `${name}.woff2`
    await writeFile(join(OUT, file), bytes)
    total += bytes.byteLength
    console.log(`  ${file.padEnd(20)} ${(bytes.byteLength / 1024).toFixed(1).padStart(7)} KB`)
  }
}

console.log(`\n  ${(total / 1024).toFixed(1)} KB total. Each template loads only its own two.`)
