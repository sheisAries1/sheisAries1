// Home page, built from small section components.
import { PRODUCTS, productById } from './data.js';
import { HERO, PREVIEW, LOGOS, BENEFITS, STEPS, TESTIMONIALS, TIERS, FAQ } from './content.js';
import { esc, money, icons, wishButton } from './ui.js';

// ---------- Shared building blocks ----------

export function sectionHead({ eyebrow, title, text = '', align = 'center', id = '' }) {
  return `
    <header class="section-head section-head--${align}" data-reveal>
      <p class="eyebrow">${eyebrow}</p>
      <h2 class="display"${id ? ` id="${id}"` : ''}>${title}</h2>
      ${text ? `<p class="section-head__text">${text}</p>` : ''}
    </header>`;
}

const section = (id, inner, cls = '') => `<section class="band ${cls}" id="${id}" aria-labelledby="${id}-title">${inner}</section>`;

function initials(name) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('');
}

function avatar(t) {
  return `<span class="avatar" data-initials="${esc(initials(t.name))}">
    <img src="${t.avatar}" alt="" width="48" height="48" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">
  </span>`;
}

const stars = (n = 5) => `<span class="stars" aria-label="${n} out of 5 stars">${icons.star.repeat(n)}</span>`;

// ---------- Sections ----------

function hero() {
  const era = productById('the-era-rose-gold');
  return `
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero__text">
        <p class="pill" data-reveal><span class="pill__dot"></span>${HERO.eyebrow}</p>
        <h1 class="display" id="hero-title" data-reveal>${HERO.title}</h1>
        <p class="lede" data-reveal>${HERO.lede}</p>
        <div class="hero__ctas" data-reveal>
          <a class="btn btn--primary" href="#/product/${era.id}" data-magnetic>Shop The Era ${icons.arrow}</a>
          <a class="btn btn--glass" href="#preview" data-scroll>Try the finishes</a>
        </div>
        <ul class="hero__proof" data-reveal>
          <li>${stars()} <span><strong>4.9</strong> from 1,200+ reviews</span></li>
          <li>${icons.globe}<span>Ships worldwide</span></li>
        </ul>
      </div>
      <div class="hero__stage" data-reveal>
        <div class="glass hero__card" data-tilt>
          <span class="glass__sheen" aria-hidden="true"></span>
          <div class="hero__plate"><img src="${era.image}" alt="The Era watch in rose gold with a white dial" width="350" height="605"></div>
        </div>
        <div class="glass float-chip float-chip--a">${icons.award}<span><strong>2 years</strong> guarantee</span></div>
        <div class="glass float-chip float-chip--b"><span class="float-chip__price">${money(era.price)}</span><span>The Era — Rose Gold</span></div>
      </div>
    </section>`;
}

function preview() {
  const first = productById(PREVIEW[0].id);
  return section('preview', `
    ${sectionHead({ eyebrow: 'Interactive preview', id: 'preview-title', title: 'Find your finish', text: 'Switch between our best-selling watches. Move your cursor over the watch to catch the light.' })}
    <div class="preview glass" data-reveal>
      <span class="glass__sheen" aria-hidden="true"></span>
      <div class="preview__stage" data-tilt>
        <img id="pvImg" src="${first.image}" alt="${esc(first.name)} — ${esc(first.variant)}">
        <span class="preview__floor" aria-hidden="true"></span>
      </div>
      <div class="preview__panel">
        <p class="eyebrow" id="pvKicker">${esc(first.name)}</p>
        <h3 class="preview__title" id="pvTitle">${esc(first.variant)}</h3>
        <p class="preview__price" id="pvPrice">${money(first.price)}</p>
        <p class="preview__desc" id="pvDesc">${esc(first.description)}</p>
        <div class="swatches" role="radiogroup" aria-label="Choose a watch">
          ${PREVIEW.map((v, i) => {
            const p = productById(v.id);
            return `<button type="button" class="swatch" role="radio" aria-checked="${i === 0}" tabindex="${i === 0 ? 0 : -1}"
              data-pv="${i}" style="--sw:${v.swatch}"><span class="swatch__dot"></span><span>${esc(p.name)}<small>${esc(p.variant)}</small></span></button>`;
          }).join('')}
        </div>
        <dl class="specs" id="pvSpecs"></dl>
        <div class="preview__actions">
          <button class="btn btn--primary" type="button" id="pvAdd" data-magnetic>Add to cart</button>
          <a class="btn btn--glass" id="pvLink" href="#/product/${first.id}">Full details</a>
          <span id="pvWish">${wishButton(first)}</span>
        </div>
      </div>
    </div>`, 'band--preview');
}

function logoCloud() {
  return `
    <section class="logos" aria-label="Stocked and featured by">
      <p class="logos__label" data-reveal>Stocked and featured by</p>
      <div class="logos__track" data-reveal>
        <ul>${LOGOS.map((l, i) => `<li class="logo-mark logo-mark--${i % 3}">${l}</li>`).join('')}</ul>
        <ul aria-hidden="true">${LOGOS.map((l, i) => `<li class="logo-mark logo-mark--${i % 3}">${l}</li>`).join('')}</ul>
      </div>
    </section>`;
}

function benefits() {
  return section('benefits', `
    ${sectionHead({ eyebrow: 'Why PearlyBeau', id: 'benefits-title', title: 'Bought with confidence' })}
    <div class="benefits">
      ${BENEFITS.map((b, i) => `
        <article class="benefit" data-reveal style="--d:${i * 90}ms">
          <span class="benefit__icon glass">${icons[b.icon]}</span>
          <h3>${b.title}</h3>
          <p>${b.text}</p>
        </article>`).join('')}
    </div>`);
}

function bento() {
  return section('craft', `
    ${sectionHead({ eyebrow: 'The details', id: 'craft-title', title: 'Made to be <em>worn</em>, not kept in a drawer' })}
    <div class="bento">
      <a class="tile tile--hero glass" href="#/brand" data-reveal>
        <img src="images/about.jpg" alt="A rose gold PearlyBeau watch worn with a silk sleeve" loading="lazy">
        <div class="tile__body tile__body--over">
          <p class="eyebrow">Our story</p>
          <h3>Female-led, from Lagos, since June 2021.</h3>
          <span class="tile__more">Who we are ${icons.arrow}</span>
        </div>
      </a>
      <div class="tile tile--stat tile--s1 glass" data-reveal style="--d:60ms">
        <span class="glass__sheen" aria-hidden="true"></span>
        <p class="stat">316L</p>
        <h3>Surgical-grade steel</h3>
        <p>Hypoallergenic and tarnish resistant, polished by hand.</p>
      </div>
      <div class="tile tile--stat tile--s2 glass" data-reveal style="--d:120ms">
        <span class="glass__sheen" aria-hidden="true"></span>
        <p class="stat">3 ATM</p>
        <h3>Splash resistant</h3>
        <p>Rain and hand washing are fine. Remove before swimming.</p>
      </div>
      <a class="tile tile--photo glass" href="#/shop/jewelry" data-reveal style="--d:60ms">
        <img src="images/cat-jewelry.jpg" alt="Layered bar and coin necklaces on a black pouch" loading="lazy">
        <div class="tile__body tile__body--over"><h3>Layers that stack</h3><span class="tile__more">Jewelry ${icons.arrow}</span></div>
      </a>
      <div class="tile tile--movement glass" data-reveal style="--d:120ms">
        <span class="glass__sheen" aria-hidden="true"></span>
        <div class="mini-dial" aria-hidden="true"><span class="mini-dial__h" id="dialH"></span><span class="mini-dial__m" id="dialM"></span><span class="mini-dial__s" id="dialS"></span></div>
        <div>
          <h3>Japanese quartz</h3>
          <p>Accurate to seconds a month. This dial is running on your local time.</p>
        </div>
      </div>
      <a class="tile tile--wide glass" href="#/shop/eyewear" data-reveal style="--d:180ms">
        <img src="images/cat-eyewear.jpg" alt="Shady #002 sunglasses in black acetate" loading="lazy">
        <div class="tile__body">
          <p class="eyebrow">Eyewear</p>
          <h3>Shady #002</h3>
          <p>Black acetate, smoke lenses, full UV400 protection.</p>
          <span class="tile__more">Shop eyewear ${icons.arrow}</span>
        </div>
      </a>
    </div>`);
}

function howItWorks() {
  return section('how', `
    ${sectionHead({ eyebrow: 'How it works', id: 'how-title', title: 'From our studio to your wrist' })}
    <ol class="steps-row">
      ${STEPS.map((s, i) => `
        <li class="step glass" data-reveal style="--d:${i * 100}ms">
          <span class="glass__sheen" aria-hidden="true"></span>
          <span class="step__num">0${i + 1}</span>
          <h3>${s.title}</h3>
          <p>${s.text}</p>
        </li>`).join('')}
    </ol>`);
}

function testimonials() {
  const [lead, ...rest] = TESTIMONIALS;
  return section('reviews', `
    ${sectionHead({ eyebrow: 'Reviews', id: 'reviews-title', title: 'Worn and loved', text: '4.9 out of 5 from 1,200+ verified buyers.' })}
    <div class="reviews">
      <figure class="review review--lead glass" data-reveal>
        <span class="glass__sheen" aria-hidden="true"></span>
        ${stars()}
        <blockquote class="display">“${lead.quote}”</blockquote>
        <figcaption>${avatar(lead)}<span><strong>${lead.name}</strong>${lead.role} · ${lead.product}</span></figcaption>
      </figure>
      ${rest.map((t, i) => `
        <figure class="review glass" data-reveal style="--d:${(i % 2) * 90}ms">
          ${stars()}
          <blockquote>“${t.quote}”</blockquote>
          <figcaption>${avatar(t)}<span><strong>${t.name}</strong>${t.role} · ${t.product}</span></figcaption>
        </figure>`).join('')}
    </div>`);
}

function pricing() {
  return section('pricing', `
    ${sectionHead({ eyebrow: 'Pricing', id: 'pricing-title', title: 'Honest prices, no markups', text: 'We sell direct from our studio, so you pay for the watch, not a shop front.' })}
    <div class="tiers">
      ${TIERS.map((t, i) => `
        <article class="tier glass ${t.featured ? 'tier--featured' : ''}" data-reveal style="--d:${i * 90}ms">
          <span class="glass__sheen" aria-hidden="true"></span>
          ${t.featured ? '<span class="tier__flag">Most loved</span>' : ''}
          <h3>${t.name}</h3>
          <p class="tier__text">${t.text}</p>
          <p class="tier__price"><small>from</small> ${money(t.from)}</p>
          <ul class="ticks">${t.perks.map((p) => `<li>${icons.check}${p}</li>`).join('')}</ul>
          <a class="btn ${t.featured ? 'btn--primary' : 'btn--glass'} btn--block" href="${t.href}" ${t.featured ? 'data-magnetic' : ''}>${t.cta}</a>
        </article>`).join('')}
    </div>
    <p class="tiers__note" data-reveal>Prices in naira. Use code <strong>WELCOME10</strong> for 10% off your first order.</p>`);
}

function faq() {
  return section('faq', `
    <div class="faq">
      ${sectionHead({ eyebrow: 'FAQ', id: 'faq-title', title: 'Good to know', text: 'Still unsure? Call <a href="tel:+2349114819336">+234 911 481 9336</a> and talk to a person.', align: 'left' })}
      <div class="faq__list glass" data-reveal>
        ${FAQ.map(([q, a], i) => `
          <details class="qa" ${i === 0 ? 'open' : ''}>
            <summary>${q}<span class="qa__icon" aria-hidden="true"></span></summary>
            <div class="qa__body"><p>${a}</p></div>
          </details>`).join('')}
      </div>
    </div>`);
}

function finalCta() {
  const best = PRODUCTS.filter((p) => p.bestseller).slice(0, 3);
  return `
    <section class="band band--cta" aria-labelledby="cta-title">
      <div class="cta glass" data-reveal>
        <span class="glass__sheen" aria-hidden="true"></span>
        <div class="cta__text">
          <p class="eyebrow">The Era Collection</p>
          <h2 class="display" id="cta-title">Your new everyday watch is <em>one click</em> away.</h2>
          <p>Free delivery in Nigeria over ₦150,000, a 2 year guarantee and 14-day returns.</p>
          <div class="hero__ctas">
            <a class="btn btn--primary" href="#/shop/watches" data-magnetic>Shop watches ${icons.arrow}</a>
            <a class="btn btn--glass" href="#/shop/giftshop">Browse gifts</a>
          </div>
        </div>
        <div class="cta__stack" aria-hidden="true">
          ${best.map((p) => `<img src="${p.image}" alt="" loading="lazy">`).join('')}
        </div>
      </div>
    </section>`;
}

// ---------- Behaviour ----------

function mountPreview(root) {
  const box = root.querySelector('.preview');
  if (!box) return;
  const img = box.querySelector('#pvImg');
  const swatches = [...box.querySelectorAll('.swatch')];
  let current = 0;

  function show(i, focus = false) {
    current = i;
    const v = PREVIEW[i];
    const p = productById(v.id);
    swatches.forEach((s, j) => {
      s.setAttribute('aria-checked', String(j === i));
      s.tabIndex = j === i ? 0 : -1;
    });
    if (focus) swatches[i].focus();
    img.classList.add('is-swapping');
    setTimeout(() => {
      img.src = p.image;
      img.alt = `${p.name} — ${p.variant}`;
      img.classList.remove('is-swapping');
    }, 180);
    box.querySelector('#pvKicker').textContent = p.name;
    box.querySelector('#pvTitle').textContent = p.variant;
    box.querySelector('#pvPrice').textContent = money(p.price);
    box.querySelector('#pvDesc').textContent = p.description;
    box.querySelector('#pvLink').href = `#/product/${p.id}`;
    box.querySelector('#pvWish').innerHTML = wishButton(p);
    box.querySelector('#pvSpecs').innerHTML = [
      ['Case', v.case], ['Strap', v.strap], ['Movement', 'Japanese quartz'], ['Water', '3 ATM'],
    ].map(([k, val]) => `<div><dt>${k}</dt><dd>${val}</dd></div>`).join('');
  }

  box.addEventListener('click', (e) => {
    const s = e.target.closest('[data-pv]');
    if (s) show(+s.dataset.pv);
    if (e.target.closest('#pvAdd')) {
      document.dispatchEvent(new CustomEvent('pb:add', { detail: { id: PREVIEW[current].id, qty: 1, option: null } }));
    }
  });
  box.querySelector('.swatches').addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    show((current + step + PREVIEW.length) % PREVIEW.length, true);
  });
  show(0);
}

// The small dial in the bento grid shows the visitor's local time.
function mountDial(root) {
  const h = root.querySelector('#dialH');
  if (!h) return () => {};
  const m = root.querySelector('#dialM');
  const s = root.querySelector('#dialS');
  const tick = () => {
    const d = new Date();
    const sec = d.getSeconds();
    const min = d.getMinutes() + sec / 60;
    const hr = (d.getHours() % 12) + min / 60;
    h.style.transform = `rotate(${hr * 30}deg)`;
    m.style.transform = `rotate(${min * 6}deg)`;
    s.style.transform = `rotate(${sec * 6}deg)`;
  };
  tick();
  const timer = setInterval(() => (h.isConnected ? tick() : clearInterval(timer)), 1000);
  return timer;
}

export function home() {
  return {
    title: 'Pearlybeau | Quality Watches, Eyewear & Jewelry',
    html: [hero(), logoCloud(), preview(), benefits(), bento(), howItWorks(), testimonials(), pricing(), faq(), finalCta()].join(''),
    mount(root) {
      mountPreview(root);
      mountDial(root);
      root.querySelectorAll('[data-scroll]').forEach((a) => a.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }));
    },
  };
}
