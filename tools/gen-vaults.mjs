#!/usr/bin/env node
// Generate the hidden collection page for every template. The vault is one proposed feature shown
// six ways, so the structure is deliberately identical and only the skin changes.
import { writeFile } from 'node:fs/promises'

const ROOT = decodeURIComponent(new URL('../showcase/', import.meta.url).pathname)

const THEMES = {
  't1-draught': {
    ground: '#0B0C0E', ink: '#F5F1E8', rule: '#9C7B3F', accent: '#C9A961',
    display: "'Bodoni Moda', Didot, Georgia, serif", text: "'Inter', system-ui, sans-serif",
    egg: ['#2d4a63', '#0e1a26'], shell: '#1a2630',
  },
  't2-brass': {
    ground: '#1C1711', ink: '#F7F3EA', rule: '#B08D4F', accent: '#D9B870',
    display: "'Cormorant Garamond', Georgia, serif", text: "'Jost', system-ui, sans-serif",
    egg: ['#6b4f2a', '#241a0f'], shell: '#2a2118',
  },
  't3-tidewater': {
    ground: '#0E1A1C', ink: '#EEF5F3', rule: '#7FA9A2', accent: '#A8CCC4',
    display: "'Marcellus', Georgia, serif", text: "'Inter', system-ui, sans-serif",
    egg: ['#2a5450', '#0c1a1b'], shell: '#15262a',
  },
  't4-blueprint': {
    ground: '#0C1420', ink: '#E6EEF6', rule: '#3E7FA8', accent: '#6FB3D8',
    display: "'IBM Plex Mono', monospace", text: "'IBM Plex Sans', system-ui, sans-serif",
    egg: ['#17405c', '#07131d'], shell: '#102030',
  },
  't5-nocturne': {
    ground: '#07080B', ink: '#F2EADC', rule: '#9A7B3A', accent: '#D4A854',
    display: "'Prata', Georgia, serif", text: "'Jost', system-ui, sans-serif",
    egg: ['#4a3517', '#0d0a06'], shell: '#15110b',
  },
  't6-cruises': {
    ground: '#0A1020', ink: '#F4F1EA', rule: '#A98B4E', accent: '#CBA961',
    display: "'Italiana', Georgia, serif", text: "'Inter', system-ui, sans-serif",
    egg: ['#1d2f55', '#070b16'], shell: '#101a2e',
  },
}

// Two egg records, drawn rather than photographed - there are no photographs yet.
function egg(t, i) {
  const [a, b] = t.egg
  const tall = i === 0
  return `
          <svg viewBox="0 0 320 420" role="img" aria-label="${i === 0
            ? 'The King of the Oceans Egg: silver and gold, guilloché enamelled, on a scrolled stand.'
            : 'The Clyde Egg: enamel over an engine-turned ground, with a gold band.'}">
            <defs>
              <radialGradient id="eg${i}" cx="38%" cy="28%">
                <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
              </radialGradient>
            </defs>
            <ellipse cx="160" cy="180" rx="${tall ? 90 : 86}" ry="${tall ? 119 : 114}" fill="url(#eg${i})" stroke="${t.rule}" stroke-width="1.2"/>
            <g fill="none" stroke="${t.accent}" stroke-width=".6" opacity=".45">
              <ellipse cx="160" cy="180" rx="62" ry="102"/>
              <ellipse cx="160" cy="180" rx="32" ry="84"/>
              <ellipse cx="160" cy="180" rx="${tall ? 90 : 86}" ry="58"/>
              ${tall ? '<ellipse cx="160" cy="180" rx="90" ry="26"/>' : ''}
            </g>
            <path d="M${tall ? 70 : 74} 180h${tall ? 180 : 172}" stroke="${t.accent}" stroke-width="1.5"/>
            <ellipse cx="160" cy="${tall ? 63 : 68}" rx="12" ry="8" fill="${t.accent}"/>
            <path d="M126 ${tall ? 300 : 294}c14 21 54 21 68 0" fill="none" stroke="${t.rule}" stroke-width="1.4"/>
            <path d="M119 ${tall ? 320 : 316}h82l-10 45h-62z" fill="${t.shell}" stroke="${t.rule}" stroke-width="1.2"/>
            <rect x="105" y="${tall ? 365 : 361}" width="110" height="12" rx="2" fill="${t.shell}" stroke="${t.rule}" stroke-width="1.2"/>
          </svg>`
}

function page(dir, t) {
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Collection</title>
<meta name="robots" content="noindex, nofollow, noarchive, noimageindex">
<meta name="referrer" content="no-referrer">
<link rel="stylesheet" href="../assets/css/base.css">
<link rel="stylesheet" href="../assets/css/fonts.css">
<link rel="stylesheet" href="../assets/css/vault.css">
<style>
  // This template's own world. Structure is shared; the skin is not.
  :root {
    --v-ground: ${t.ground}; --v-ink: ${t.ink}; --v-rule: ${t.rule}; --v-accent: ${t.accent};
    --v-display: ${t.display}; --v-text: ${t.text};
  }
</style>
</head>
<body data-template="${dir}" class="vault-body">

<div data-vault>
  <div class="gate" data-vault-gate>
    <div class="gate__in">
      <svg class="gate__egg" viewBox="0 0 120 160" aria-hidden="true">
        <ellipse cx="60" cy="92" rx="46" ry="58" fill="none" stroke="currentColor" stroke-width="1"/>
        <path d="M14 92h92" stroke="currentColor" stroke-width="1" opacity=".55"/>
        <ellipse cx="60" cy="92" rx="30" ry="48" fill="none" stroke="currentColor" stroke-width=".6" opacity=".4"/>
        <ellipse cx="60" cy="92" rx="14" ry="30" fill="none" stroke="currentColor" stroke-width=".6" opacity=".3"/>
      </svg>

      <h1 class="gate__h">Private collection</h1>
      <p class="gate__p">This page is not listed anywhere. Enter the four-digit code you were given.</p>

      <form data-vault-form novalidate>
        <label class="sr-only" for="code">Four-digit code</label>
        <input id="code" class="gate__code" data-vault-input inputmode="numeric" autocomplete="off"
               maxlength="4" placeholder="&#8226;&#8226;&#8226;&#8226;" aria-describedby="gate-err">
        <p class="gate__err" id="gate-err" data-vault-error role="alert"></p>
      </form>

      <p class="gate__demo">
        <b>This is a demonstration.</b> The code is <b>1234</b> and it is checked in your browser,
        so what you are seeing is the <i>experience</i>, not the security. The live build works
        differently: no password at all, access by single-use link sent to a named person, the
        address returning an ordinary &#8220;page not found&#8221; to everyone else, and every
        photograph watermarked with the viewer&#8217;s name as it is served. Section 9 of the
        proposal sets that out properly.
      </p>

      <p class="gate__back"><a href="index.html">Back to the site</a></p>
    </div>
  </div>

  <div class="vault" data-vault-content>
    <header class="vault__hdr">
      <div class="vault__wrap">
        <h1 class="vault__title">The Theo Faberg&#233; Collection</h1>
        <p class="vault__sub">Held by Friends of TS Queen Mary &#183; Viewed by Iain Sim &#183; <span id="stamp"></span></p>
        <hr class="vault__rule">
      </div>
    </header>

    <main class="vault__wrap">
      <article class="vitrine">
        <div class="vitrine__img">${egg(t, 0)}<hr class="vault__rule" style="margin-top:1.4rem"></div>
        <div class="vitrine__rec">
          <h2>The King of the Oceans Egg</h2>
          <p class="vitrine__meta">Edition 5 of 250 &#183; 1977</p>
          <hr class="vault__rule">
          <p>Sterling silver and gold, guilloch&#233; enamelled in deep blue. Height 210mm.</p>
          <hr class="vault__rule">
          <h3>Inside</h3>
          <p>Neptune in gold and silver, trident in one hand, a roped miniature pearl egg in the other.</p>
          <hr class="vault__rule">
          <h3>Provenance</h3>
          <p>Commissioned by the St Petersburg Collection. Held by the charity for the benefit of the restoration.</p>
        </div>
      </article>

      <article class="vitrine">
        <div class="vitrine__img">${egg(t, 1)}<hr class="vault__rule" style="margin-top:1.4rem"></div>
        <div class="vitrine__rec">
          <h2>The Clyde Egg</h2>
          <p class="vitrine__meta">Edition 12 of 150 &#183; 1983</p>
          <hr class="vault__rule">
          <p>Enamel over an engine-turned ground, mounted on a silver-gilt stand. Height 185mm.</p>
          <hr class="vault__rule">
          <h3>Inside</h3>
          <p>A miniature paddle steamer in gold, on a ground of lapis.</p>
          <hr class="vault__rule">
          <h3>Condition</h3>
          <p>Enamel sound throughout. Minor rubbing to the gilding at the foot, consistent with handling.</p>
        </div>
      </article>

      <p class="vault__note">
        The records shown are illustrative &#8212; the charity has not yet supplied the real ones.
        Valuation, insurance reference and current location are deliberately absent: in the live
        build they are restricted at field level, so an editor updating a caption never sees them.
      </p>

      <footer class="vault__ftr">
        <p>These records are confidential. In the live build every image carries the viewer&#8217;s
        name and the time it was served, and the collection closes after twenty minutes without activity.</p>
        <p style="margin-top:1rem"><a href="index.html">Back to the site</a></p>
      </footer>
    </main>
  </div>
</div>

<script src="../assets/js/core.js"></script>
<script>
  document.getElementById('stamp').textContent =
    new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
</script>
</body>
</html>
`
}

for (const [dir, theme] of Object.entries(THEMES)) {
  await writeFile(`${ROOT}${dir}/collection.html`, page(dir, theme))
  console.log(`  ${dir}/collection.html`)
}
console.log('\nSix hidden pages, one source of truth for the disclaimer.')
