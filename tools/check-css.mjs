#!/usr/bin/env node
// Catch CSS that is silently invalid. `clamp(2.3rem,1.7rem+2.8vw,4rem)` looks fine and is not.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from '/Users/raj/MyGitFiles/TSQM_website/node_modules/playwright/index.mjs'

const ROOT = decodeURIComponent(new URL('../showcase/', import.meta.url).pathname)

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (p.endsWith('.css')) out.push(p)
  }
  return out
}

let bad = 0
for (const file of walk(ROOT)) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/(?:clamp|calc)\(([^()]*)\)/g)) {
      if (/[0-9a-z%)][+\-][.\d]/.test(m[1])) {
        console.error(`  ${file.replace(ROOT, '')}:${i + 1}  missing spaces: ${m[0]}`)
        bad++
      }
    }
  })
}

const PAGES = ['', 't1-draught/', 't2-brass/', 't3-tidewater/', 't4-blueprint/', 't5-nocturne/', 't6-cruises/']
const browser = await chromium.launch()

for (const path of PAGES) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const res = await page.goto(`http://127.0.0.1:4321/${path}`, { waitUntil: 'networkidle' }).catch(() => null)
  if (!res?.ok()) { await page.close(); continue }

  // A heading that computes to the body's 16px is the signature of the bug.
  const small = await page.evaluate(() =>
    [...document.querySelectorAll('h1, h2')]
      .filter((h) => h.offsetParent !== null && parseFloat(getComputedStyle(h).fontSize) <= 17)
      .map((h) => h.tagName + ': ' + h.textContent.trim().slice(0, 44)))

  if (small.length) {
    console.error(`  /${path} headings stuck at body size:`)
    small.forEach((s) => console.error(`      ${s}`))
    bad += small.length
  } else {
    console.log(`  /${path || 'index'} ok`)
  }
  await page.close()
}

await browser.close()
if (bad) { console.error(`\n${bad} problem(s).`); process.exit(1) }
console.log('\nAll type scales resolve.')
