// Drive the booking flow the way an investor would in the meeting. If any of this fails, the demo
// fails in the room - which is the one place it must not.
import { chromium } from '/Users/raj/MyGitFiles/TSQM_website/node_modules/playwright/index.mjs'

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
p.on('pageerror', (e) => errors.push(e.message))
await p.goto('http://127.0.0.1:4321/t6-cruises/', { waitUntil: 'networkidle' })

const total = () => p.textContent('#total').catch(() => '(none)')
const ok = (label, cond) => console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${label}`)

// Day sailing: 2 adults at £95 = £190
await p.click('[data-voy="doon"]')
ok('cabin step disabled for a day sailing', await p.isDisabled('[data-room="prom"]'))
await p.click('[data-date="Sat 15 May"]')
ok('day sailing, 2 adults = £190', (await total()) === '£190')

// Add a child at half fare: +£47.50
await p.click('[data-step="children"][data-dir="1"]')
ok('one child at half fare = £237.50', (await total()) === '£237.50')

// Extras: engine room £20pp x 3 heads = £60
await p.check('[data-extra="engine"]')
ok('engine room tour, 3 heads = £297.50', (await total()) === '£297.50')

// Switch to the 5-night voyage; cabin becomes required
await p.click('[data-voy="isles"]')
ok('cabin step enabled for an overnight', !(await p.isDisabled('[data-room="boat"]')))
ok('confirm disabled until a cabin is chosen', await p.isDisabled('#go'))
await p.click('[data-date="Mon 7 Jun"]')
await p.click('[data-room="boat"]')
// Boat Deck £265 x 5 nights x (2 adults + 1 child at 0.5) = £3312.50, + engine £20 x 3 = £60
ok('Boat Deck, 5 nights, 2.5 fares + extras = £3,372.50', (await total()) === '£3,372.50')
ok('confirm now enabled', !(await p.isDisabled('#go')))

// Confirm
await p.click('#go')
await p.waitForTimeout(600)
const ref = (await p.textContent('.conf__ref').catch(() => '')) || ''
ok('booking reference issued (' + ref.trim() + ')', /^QMC-[A-Z2-9]{6}$/.test(ref.trim()))
ok('confirmation states nothing was charged', (await p.textContent('.conf')).includes('no payment was taken'))

console.log(errors.length ? `\n  JS errors: ${errors.join('; ')}` : '\n  No JavaScript errors.')
await b.close()
