# TS Queen Mary — six design directions

Six complete, working websites I built for Friends of TS Queen Mary, to show at the
meeting on **Saturday 10 October 2026**. Published at
[tsqm-dev.rajkumar.codes](https://tsqm-dev.rajkumar.codes).

Five are directions for the charity site. The sixth is the operating company
site, the investor-facing one, and it carries a working booking simulation.

```
showcase/          the site that gets published
  index.html       the gallery of six
  t1-draught/ ... t6-cruises/
  assets/          fonts, shared CSS/JS, artwork, previews
shots/             screenshots of each template
tools/             screenshot, generator and check scripts
```

The client proposal and my meeting notes are deliberately not in this repo. This
one is public so GitHub Pages can serve it; those live in a private folder
alongside it.

---

## Look at it locally

```bash
cd "/Users/raj/Developer/New Parent/showcase" && python3 -m http.server 4321
```

Then <http://127.0.0.1:4321>. No build step and no dependencies — it is plain
HTML, CSS and JavaScript on purpose, so it will still open in five years and it
can be hosted anywhere.

The hidden Fabergé page on every template opens with **1234**. Find it via the
small brass diamond at the very bottom of each site, or go straight to
`/t1-draught/collection.html`.

---

## Publish it to tsqm-dev.rajkumar.codes

### 1. Push to GitHub

```bash
cd "/Users/raj/Developer/New Parent" && git remote add origin git@github.com:<you>/tsqm-showcase.git && git push -u origin main
```

### 2. Turn on Pages

Repository -> **Settings -> Pages** -> Source: **Deploy from a branch** ->
Branch `main`, folder `/showcase` -> Save.

If GitHub does not offer `/showcase` as a folder, it only lists `/` and `/docs`
— either rename `showcase` to `docs`, or use the Action in step 4 instead.

### 3. Point the subdomain at it

In your DNS for `rajkumar.codes`, add:

| Type | Name | Value |
|---|---|---|
| CNAME | `tsqm-dev` | `<you>.github.io.` |

`showcase/CNAME` already contains `tsqm-dev.rajkumar.codes`, so GitHub picks the
domain up on its own. Tick **Enforce HTTPS** once the certificate issues — that
takes a few minutes and occasionally up to an hour.

### 4. If you would rather deploy with an Action

Settings -> Pages -> Source: **GitHub Actions**, then add
`.github/workflows/pages.yml`:

```yaml
name: Pages
on: { push: { branches: [main] } }
permissions: { pages: write, id-token: write, contents: read }
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: github-pages
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: { path: showcase }
      - uses: actions/deploy-pages@v4
```

### Before you send the link

- [ ] Open it on your own phone, on mobile data, not office wifi
- [ ] Check all six load and the showcase bar moves between them
- [ ] Check the hidden page opens with 1234 on at least two of them
- [ ] Run the booking flow on template 6 end to end
- [ ] `noindex` is on every page — keep it there until the client says otherwise

---

## Checks

```bash
node tools/check-css.mjs      # catches silently-invalid CSS and 16px headings
node tools/test-booking.mjs   # drives the booking flow and checks the arithmetic
node tools/shots.mjs          # re-renders every screenshot
```

`check-css.mjs` exists because `clamp(2.3rem,1.7rem+2.8vw,4rem)` is invalid: CSS
maths needs spaces around the `+`, and the browser drops the whole declaration
without warning. Eight of those got in before I spotted it.

---

## What is not real yet

- **Photographs.** All artwork is drawn SVG. The archive has not arrived.
- **Fundraising figures.** £4.8m of £10m comes from the brief and needs
  confirming against the accounts before anything is published.
- **Fabergé records.** Illustrative. The charity has not supplied the real ones.
- **The hidden page.** A browser-side code, clearly labelled as a demonstration
  on the page itself. The production model is in the proposal.
