// The booking simulation. Everything runs in the browser and nothing is charged.

(function () {
  'use strict';

  const VOYAGES = {
    doon:  { name: 'Doon the Watter',    nights: 0, dayFare: 95,  dates: ['Sat 15 May', 'Sun 16 May', 'Sat 22 May', 'Sun 23 May'] },
    firth: { name: 'The Firth Overnight', nights: 2, dayFare: 0,  dates: ['Fri 28 May', 'Fri 11 Jun', 'Fri 25 Jun', 'Fri 9 Jul'] },
    isles: { name: 'The Western Isles',   nights: 5, dayFare: 0,  dates: ['Mon 7 Jun', 'Mon 21 Jun', 'Mon 5 Jul'] },
  };

  const ROOMS = { prom: 'Promenade', boat: 'Boat Deck', denny: 'The Denny Suite' };

  const state = { voyage: null, date: null, room: null, rate: 0, adults: 2, children: 0, extras: {} };

  const $ = (id) => document.getElementById(id);
  const money = (n) =>
    '£' + n.toLocaleString('en-GB', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

  // Price
  function compute() {
    const v = state.voyage ? VOYAGES[state.voyage] : null;
    if (!v) return { lines: [], total: 0 };

    const lines = [];
    // A child counts as half an adult for fare purposes, throughout.
    const fareUnits = state.adults + state.children * 0.5;
    const heads = state.adults + state.children;

    if (v.nights === 0) {
      lines.push({ k: `${v.name} — ${state.adults} adult${state.adults === 1 ? '' : 's'}`, v: v.dayFare * state.adults });
      if (state.children) lines.push({ k: `${state.children} child${state.children === 1 ? '' : 'ren'} at half fare`, v: v.dayFare * 0.5 * state.children });
    } else if (state.room) {
      const cabin = state.rate * v.nights * fareUnits;
      lines.push({ k: `${ROOMS[state.room]} — ${v.nights} nights × ${fareUnits} fare${fareUnits === 1 ? '' : 's'}`, v: cabin });
    }

    for (const [key, on] of Object.entries(state.extras)) {
      if (!on) continue;
      const el = document.querySelector(`[data-extra="${key}"]`);
      if (!el) continue;
      const cost = Number(el.dataset.cost);
      const per = el.dataset.per;
      const label = el.closest('.chk').querySelector('b').textContent;
      lines.push({ k: per === 'person' ? `${label} × ${heads}` : label, v: per === 'person' ? cost * heads : cost });
    }

    return { lines, total: lines.reduce((sum, l) => sum + l.v, 0) };
  }

  // Render
  function render() {
    const v = state.voyage ? VOYAGES[state.voyage] : null;

    // Step 2 - dates follow the chosen voyage
    const dates = $('dates');
    if (v) {
      dates.innerHTML = v.dates
        .map((d) => `<button type="button" class="opt" data-date="${d}" aria-pressed="${state.date === d}"><b>${d}</b><span>2027</span></button>`)
        .join('');
      $('datehint').textContent = 'Departures shown are indicative.';
    } else {
      dates.innerHTML = '';
      $('datehint').textContent = 'Pick a voyage first.';
    }

    // Step 3 - a day sailing needs no cabin. Disable rather than hide.
    const needsRoom = !!v && v.nights > 0;
    document.querySelectorAll('#rooms .opt').forEach((b) => {
      b.disabled = !needsRoom;
      b.setAttribute('aria-pressed', String(needsRoom && state.room === b.dataset.room));
    });
    $('roomhint').textContent = !v
      ? 'Pick a voyage first.'
      : needsRoom
        ? `Rate is per person per night, ${v.nights} nights.`
        : 'Day sailings do not need a cabin.';

    // Tick the steps that are satisfied
    const done = { s1: !!v, s2: !!state.date, s3: !needsRoom || !!state.room, s4: state.adults > 0, s5: true };
    for (const [id, ok] of Object.entries(done)) $(id).toggleAttribute('data-done', ok);

    // Summary
    const { lines, total } = compute();
    const ready = done.s1 && done.s2 && done.s3 && state.adults > 0;

    if (!lines.length) {
      $('sumempty').hidden = false;
      $('sumlines').hidden = true;
      $('sumtotal').hidden = true;
    } else {
      $('sumempty').hidden = true;
      $('sumlines').hidden = false;
      $('sumtotal').hidden = false;
      $('sumlines').innerHTML =
        `<div class="sum__line"><span>Departure</span><b>${state.date || '—'}</b></div>` +
        `<div class="sum__line"><span>Guests</span><b>${state.adults} adult${state.adults === 1 ? '' : 's'}${state.children ? `, ${state.children} child${state.children === 1 ? '' : 'ren'}` : ''}</b></div>` +
        lines.map((l) => `<div class="sum__line"><span>${l.k}</span><b>${money(l.v)}</b></div>`).join('');
      $('total').textContent = money(total);
    }

    $('go').disabled = !ready || total <= 0;
  }

  // Wiring
  document.addEventListener('click', (e) => {
    const voy = e.target.closest('[data-voy]');
    if (voy) {
      state.voyage = voy.dataset.voy;
      state.date = null;
      if (VOYAGES[state.voyage].nights === 0) state.room = null;
      document.querySelectorAll('[data-voy]').forEach((b) => b.setAttribute('aria-pressed', String(b === voy)));
      render();
      return;
    }

    const date = e.target.closest('[data-date]');
    if (date) { state.date = date.dataset.date; render(); return; }

    const room = e.target.closest('[data-room]');
    if (room) { state.room = room.dataset.room; state.rate = Number(room.dataset.rate); render(); return; }

    const step = e.target.closest('[data-step]');
    if (step) {
      const key = step.dataset.step;
      const next = state[key] + Number(step.dataset.dir);
      const min = key === 'adults' ? 1 : 0;
      state[key] = Math.max(min, Math.min(12, next));
      $(key).textContent = state[key];
      render();
      return;
    }

    if (e.target.id === 'go') confirmBooking();
  });

  document.addEventListener('change', (e) => {
    const extra = e.target.closest('[data-extra]');
    if (!extra) return;
    state.extras[extra.dataset.extra] = extra.checked;
    render();
  });

  // Confirmation
  function reference() {
    // No I, O, 0 or 1 - they get misread down a phone line.
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
    return 'QMC-' + out;
  }

  function confirmBooking() {
    const v = VOYAGES[state.voyage];
    const { total } = compute();
    const ref = reference();

    document.querySelector('.book__grid').innerHTML = `
      <div class="conf" style="grid-column:1/-1;max-width:40rem;margin-inline:auto">
        <div class="conf__tick" aria-hidden="true">&#10003;</div>
        <h3 style="font-size:var(--s2)">Reservation held</h3>
        <p class="cap" style="margin-top:.5rem">Your reference</p>
        <p class="conf__ref">${ref}</p>
        <dl>
          <div><dt>Voyage</dt><dd>${v.name}</dd></div>
          <div><dt>Departs</dt><dd>${state.date}</dd></div>
          ${state.room ? `<div><dt>Stateroom</dt><dd>${ROOMS[state.room]}</dd></div>` : ''}
          <div><dt>Guests</dt><dd>${state.adults} adult${state.adults === 1 ? '' : 's'}${state.children ? `, ${state.children} child${state.children === 1 ? '' : 'ren'}` : ''}</dd></div>
          <div style="border:0;padding-top:.8rem"><dt><b>Total</b></dt><dd><b>${money(total)}</b></dd></div>
        </dl>
        <p class="cap" style="margin-top:1.4rem">
          This is a demonstration. Nothing has been reserved, no payment was taken and nothing left
          your browser. In the live build this is the point where Stripe Checkout opens and a
          confirmation email goes out from the signature-verified webhook &#8212; never from this page.
        </p>
        <p style="margin-top:1.4rem"><button class="btn btn--line" type="button" onclick="location.reload()">Start again</button></p>
      </div>`;
    document.getElementById('book').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  render();
})();
