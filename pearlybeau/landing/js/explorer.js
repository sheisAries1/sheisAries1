// Interactive product preview: pick a watch, pair a cuff, add both to the real bag.
import { productById } from '../../js/data.js';
import { WATCH_IDS, CUFF_FOR, SWATCH } from './content.js';
import { esc, money, shopLink, cutout } from './components.js';

export function initExplorer(root, { onAdd }) {
  if (!root) return;
  const stage = root.querySelector('[data-ex-stage]');
  const info = root.querySelector('[data-ex-info]');
  const swatches = root.querySelector('[data-ex-swatches]');
  const pair = root.querySelector('[data-ex-pair]');
  let current = WATCH_IDS[0];

  swatches.innerHTML = WATCH_IDS.map((id, i) => {
    const p = productById(id);
    return `<label class="swatch" title="${esc(p.name)} — ${esc(p.variant)}">
      <input type="radio" name="watch" value="${id}" ${i === 0 ? 'checked' : ''}>
      <span class="swatch__chip" style="--chip:${SWATCH[id]}"></span>
      <span class="swatch__label">${esc(p.name)}<small>${esc(p.variant)}</small></span>
    </label>`;
  }).join('');

  function render(animate = true) {
    const watch = productById(current);
    const cuff = productById(CUFF_FOR[current]);
    const paired = pair.checked;
    const total = watch.price + (paired ? cuff.price : 0);

    stage.innerHTML = `
      <div class="ex-watch ${animate ? 'is-swapping' : ''}">
        <img src="${cutout(watch)}" alt="${esc(watch.name)} ${esc(watch.variant)}">
        <img class="ex-reflection" src="${cutout(watch)}" alt="" aria-hidden="true">
      </div>
      <div class="ex-cuff ${paired ? 'is-on' : ''}" aria-hidden="${!paired}">
        <img src="${cutout(cuff)}" alt="${esc(cuff.name)} cuff">
      </div>`;

    info.innerHTML = `
      <p class="kicker">${esc(watch.name)}${watch.badges.includes('New') ? ' <span class="tag">New</span>' : ''}</p>
      <h3>${esc(watch.variant)}</h3>
      <p class="ex-desc">${esc(watch.description)}</p>
      <ul class="ex-specs">${watch.details.slice(0, 4).map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
      <p class="ex-total" aria-live="polite"><span class="serif">${money(total)}</span>
        <small>${paired ? `${esc(watch.name)} + ${esc(cuff.name)} cuff` : 'Watch only'}</small></p>`;

    root.querySelector('[data-ex-pair-label]').textContent = `Pair with the ${cuff.name} cuff (+${money(cuff.price)})`;
    root.querySelector('[data-ex-link]').href = shopLink(`product/${watch.id}`);
  }

  swatches.addEventListener('change', (e) => {
    if (e.target.name !== 'watch') return;
    current = e.target.value;
    render();
  });
  pair.addEventListener('change', () => render(false));

  root.querySelector('[data-ex-add]').addEventListener('click', () => {
    const ids = [current, ...(pair.checked ? [CUFF_FOR[current]] : [])];
    onAdd(ids);
  });

  render(false);
}

// Lagos local time: the hero readout, and the hands on the movement dial.
export function initLagosTime(el) {
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', timeZone: 'Africa/Lagos' });
  const now = () => fmt.format(new Date()).split(':').map(Number);
  const tick = () => { if (el) el.textContent = now().slice(0, 2).map((n) => String(n).padStart(2, '0')).join(':'); };
  tick();
  setInterval(tick, 15000);

  // Start each hand's rotation part-way through its cycle so the dial shows the real time.
  const [h, m, s] = now();
  document.querySelectorAll('.dial').forEach((dial) => {
    dial.querySelector('.dial__hand--h').style.animationDelay = `-${(h % 12) * 3600 + m * 60 + s}s`;
    dial.querySelector('.dial__hand--m').style.animationDelay = `-${m * 60 + s}s`;
    dial.querySelector('.dial__hand--s').style.animationDelay = `-${s}s`;
  });
}
