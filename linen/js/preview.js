// Interactive product preview: switch projects, change tabs, approve milestones,
// post updates and send an invoice that gets "paid".
import { PREVIEW_PROJECTS } from './content.js';
import { esc, money, icon } from './components.js';

const projects = structuredClone(PREVIEW_PROJECTS);
let current = projects[0];
let tab = 'overview';

const sum = (list) => list.reduce((s, m) => s + m.amount, 0);
const progress = (p) => Math.round((p.milestones.filter((m) => m.done).length / p.milestones.length) * 100);
const nextDue = (p) => p.milestones.find((m) => !m.done);

export function initPreview(root) {
  if (!root) return;
  const side = root.querySelector('[data-pv-projects]');
  const head = root.querySelector('[data-pv-head]');
  const body = root.querySelector('[data-pv-body]');
  const tabs = root.querySelectorAll('[role="tab"]');
  const toast = root.querySelector('[data-pv-toast]');

  function renderSide() {
    side.innerHTML = projects.map((p) => `
      <li><button type="button" class="pv-project ${p === current ? 'is-on' : ''}" data-project="${p.id}" aria-pressed="${p === current}">
        <span class="pv-dot" style="--c:${p.color}">${p.initials}</span>
        <span><b>${esc(p.client)}</b><small>${esc(p.project)}</small></span>
        <em>${progress(p)}%</em>
      </button></li>`).join('');
  }

  function renderHead() {
    const pct = progress(current);
    head.innerHTML = `
      <div>
        <p class="pv-eyebrow">${esc(current.project)}</p>
        <h3>${esc(current.client)}</h3>
      </div>
      <div class="pv-progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Project progress">
        <span>${pct}% complete</span><i style="--w:${pct}%"></i>
      </div>`;
  }

  function overview() {
    const paid = sum(current.milestones.filter((m) => m.done));
    const due = nextDue(current);
    return `
      <div class="pv-stats">
        <div><small>Paid</small><b>${money(paid)}</b></div>
        <div><small>Outstanding</small><b>${money(sum(current.milestones) - paid)}</b></div>
        <div><small>Next up</small><b>${due ? esc(due.name) : 'All done'}</b></div>
      </div>
      <ul class="pv-feed">
        ${current.updates.map((u) => `<li><b>${esc(u.who)}</b><span>${esc(u.text)}</span><em>${esc(u.when)}</em></li>`).join('')}
      </ul>
      <form class="pv-post" data-pv-post>
        <label class="sr-only" for="pvPost">Post an update</label>
        <input id="pvPost" name="text" placeholder="Post an update for ${esc(current.client)}…" autocomplete="off" maxlength="120">
        <button type="submit">Post</button>
      </form>`;
  }

  function milestones() {
    return `<ul class="pv-miles">${current.milestones.map((m, i) => `
      <li class="${m.done ? 'is-done' : ''}">
        <label>
          <input type="checkbox" data-mile="${i}" ${m.done ? 'checked' : ''}>
          <span class="pv-check">${icon.check}</span>
          <span class="pv-mile-name">${esc(m.name)}</span>
        </label>
        <em>${m.done ? 'Approved' : money(m.amount)}</em>
      </li>`).join('')}</ul>
      <p class="pv-hint">Tick a milestone to approve it. The progress updates everywhere.</p>`;
  }

  function invoice() {
    const due = nextDue(current);
    if (!due) {
      return `<div class="pv-empty"><span>${icon.check}</span><p><b>Fully paid.</b> Every milestone for ${esc(current.client)} is settled.</p></div>`;
    }
    const n = 140 + projects.indexOf(current) * 7 + current.milestones.indexOf(due);
    return `
      <div class="pv-invoice">
        <div class="pv-invoice__head"><b>Invoice #0${n}</b><span class="pv-pill">Draft</span></div>
        <dl>
          <div><dt>${esc(due.name)}</dt><dd>${money(due.amount)}</dd></div>
          <div><dt>VAT (20%)</dt><dd>${money(due.amount * 0.2)}</dd></div>
          <div class="pv-total"><dt>Total</dt><dd>${money(due.amount * 1.2)}</dd></div>
        </dl>
        <button type="button" class="btn btn--solid btn--block" data-send>Send invoice</button>
      </div>`;
  }

  function renderBody() {
    body.innerHTML = { overview, milestones, invoice }[tab]();
    body.setAttribute('aria-labelledby', `pvTab-${tab}`);
  }

  function renderAll() {
    renderSide(); renderHead(); renderBody();
  }

  let toastTimer;
  function flash(html) {
    toast.innerHTML = html;
    toast.classList.add('is-in');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-in'), 2600);
  }

  function selectTab(name, focus = false) {
    tab = name;
    tabs.forEach((t) => {
      const on = t.dataset.tab === name;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    renderBody();
  }

  side.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-project]');
    if (!btn) return;
    current = projects.find((p) => p.id === btn.dataset.project);
    renderAll();
  });

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t.dataset.tab));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      selectTab(next.dataset.tab, true);
    });
  });

  body.addEventListener('change', (e) => {
    const box = e.target.closest('[data-mile]');
    if (!box) return;
    current.milestones[+box.dataset.mile].done = box.checked;
    renderSide(); renderHead(); renderBody();
    body.querySelector(`[data-mile="${box.dataset.mile}"]`)?.focus();
  });

  body.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-pv-post]');
    if (!form) return;
    e.preventDefault();
    const text = form.text.value.trim();
    if (!text) return;
    current.updates.push({ who: 'You', text, when: 'now' });
    renderBody();
    body.querySelector('#pvPost').focus();
    flash(`${icon.check}<span>Update shared with ${esc(current.client)}</span>`);
  });

  body.addEventListener('click', (e) => {
    const send = e.target.closest('[data-send]');
    if (!send) return;
    const due = nextDue(current);
    const project = current;
    send.disabled = true;
    send.textContent = 'Sending…';
    body.querySelector('.pv-pill').textContent = 'Sent';
    setTimeout(() => {
      if (current === project && tab === 'invoice') {
        send.textContent = 'Waiting for payment…';
      }
    }, 700);
    setTimeout(() => {
      due.done = true;
      flash(`${icon.check}<span>${esc(project.client)} paid ${money(due.amount * 1.2)}</span>`);
      if (current === project) renderAll();
      else renderSide();
    }, 1900);
  });

  renderAll();
}
