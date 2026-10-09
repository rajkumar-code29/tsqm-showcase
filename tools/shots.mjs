#!/usr/bin/env node
// Screenshot every template, full page and above-the-fold, at desktop and phone.
import { chromium } from '/Users/raj/MyGitFiles/TSQM_website/node_modules/playwright/index.mjs'
import { mkdir } from 'node:fs/promises'

const BASE = 'http://127.0.0.1:4321'
// decodeURIComponent because the folder name has a space in it, and a URL
// pathname keeps that as %20 - which silently creates a second directory.
const OUT = decodeURIComponent(new URL('../shots/', import.meta.url).pathname)

const ALL = ['t1-draught', 't2-brass', 't3-tidewater', 't4-blueprint', 't5-nocturne', 't6-cruises']
const only = process.argv.slice(2)
const templates = only.length ? only : ALL

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()

for (const t of templates) {
  for (const [label, width, height, full] of [
    ['desktop', 1440, 900, false],
    ['full', 1440, 900, true],
    ['phone', 390, 844, false],
  ]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
    const res = await page.goto(`${BASE}/${t}/`, { waitUntil: 'networkidle' }).catch(() => null)

    if (!res || !res.ok()) {
      console.log(`  ${t.padEnd(14)} ${label.padEnd(8)} — not found`)
      await page.close()
      continue
    }

    // Let the reveal observers and the waterline settle before capturing.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(900)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)

    await page.screenshot({ path: `${OUT}${t}-${label}.jpg`, fullPage: full, quality: 86, type: 'jpeg' })
    console.log(`  ${t.padEnd(14)} ${label.padEnd(8)} ok`)
    await page.close()
  }

  // The hidden page, already unlocked, so the proposal can show what is behind it.
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const res = await page.goto(`${BASE}/${t}/collection.html`, { waitUntil: 'networkidle' }).catch(() => null)
  if (res && res.ok()) {
    await page.fill('[data-vault-input]', '1234').catch(() => {})
    await page.waitForTimeout(1400)
    await page.screenshot({ path: `${OUT}${t}-vault.jpg`, quality: 86, type: 'jpeg' })
    console.log(`  ${t.padEnd(14)} ${'vault'.padEnd(8)} ok`)
  }
  await page.close()
}

await browser.close()
console.log(`\nwrote to ${OUT}`)
