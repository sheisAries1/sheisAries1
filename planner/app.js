(() => {
  'use strict';

  /* ---------- Storage ---------- */
  const KEY = 'digital-planner-v1';
  let data = {};
  try { data = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { data = {}; }

  let saveTimer;
  let lastSavedToast = 0;
  function save(silent) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(data));
        if (!silent && Date.now() - lastSavedToast > 5000) { lastSavedToast = Date.now(); toast('Saved'); }
      } catch (e) {
        toast('Not saved: browser storage is blocked');
      }
    }, 350);
  }
  const get = (k, d = '') => (Object.prototype.hasOwnProperty.call(data, k) ? data[k] : d);
  function set(k, v, keepEmpty) {
    if (!keepEmpty && (v === '' || v === false)) delete data[k];
    else data[k] = v;
    save();
  }

  /* ---------- Dates ---------- */
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const ym = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const monday = d => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); return addDays(x, -((x.getDay() + 6) % 7)); };
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const MON_S = MONTHS.map(m => m.slice(0, 3));
  const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const today = () => new Date();

  let week = monday(today());
  let month = new Date(today().getFullYear(), today().getMonth(), 1);

  function weekRange(w) {
    const e = addDays(w, 6);
    return `${MON_S[w.getMonth()]} ${w.getDate()} – ${MON_S[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
  }
  const monthLabel = m => `${MONTHS[m.getMonth()]} ${m.getFullYear()}`;

  const QUOTES = [
    'Small progress is still progress.',
    'Slow down. You are allowed to rest.',
    'Plan the week, then give yourself grace.',
    'Done is better than perfect.',
    'One thing at a time, and that one thing well.',
    'Little by little, a little becomes a lot.',
    'Make space for what matters.',
    'Consistency beats intensity.',
    'You are building something. Keep going.',
    'Focus on the step in front of you.',
    'Rest is part of the plan.',
    'Your pace is still a pace.'
  ];
  const quoteFor = d => QUOTES[Math.floor(d.getTime() / 6048e5) % QUOTES.length];

  /* ---------- Markup helpers ---------- */
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const idOf = k => 'f-' + k.replace(/[^a-zA-Z0-9_-]/g, '_');
  const txt = (k, ph = '', cls = 'line', extra = '') =>
    `<input type="text" id="${idOf(k)}" class="${cls}" data-bind="${k}" placeholder="${esc(ph)}" autocomplete="off" ${extra}>`;
  const num = (k, ph = '0') =>
    `<input type="number" id="${idOf(k)}" class="line num" data-bind="${k}" placeholder="${ph}" inputmode="decimal" step="any" min="0">`;
  const area = (k, ph = '', cls = '', extra = '') =>
    `<textarea id="${idOf(k)}" class="${cls}" data-bind="${k}" placeholder="${esc(ph)}" ${extra}></textarea>`;
  const chk = (k, label, cls = 'circle') =>
    `<input type="checkbox" id="${idOf(k)}" class="${cls}" data-bind="${k}" aria-label="${esc(label)}">`;
  const checkRow = (k, ph = '') => `<div class="check-row">${chk(k + ':c', 'Mark done')}${txt(k + ':t', ph)}</div>`;
  const box = (title, body, cls = '', bodyCls = '') =>
    `<section class="box ${cls}"><h3>${title}</h3><div class="box-body ${bodyCls}">${body}</div></section>`;
  const range = (n, fn) => Array.from({ length: n }, (_, i) => fn(i)).join('');
  const money = v => {
    const cur = get('set:currency', '£');
    const n = Number(v) || 0;
    return (n < 0 ? '−' : '') + cur + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  const numVal = k => Number(get(k, 0)) || 0;

  function head(title, mode) {
    let nav = '';
    if (mode === 'week' || mode === 'month') {
      const label = mode === 'week' ? weekRange(week) : monthLabel(month);
      nav = `<div class="page-nav">
        <button class="icon-btn" data-action="prev" aria-label="Previous ${mode}">‹</button>
        <span class="range">${label}</span>
        <button class="icon-btn" data-action="next" aria-label="Next ${mode}">›</button>
        <button class="pill-btn" data-action="today">This ${mode}</button>
      </div>`;
    }
    return `<header class="page-head"><div><h1>${title}</h1>${nav}</div>
      <blockquote class="quote">${esc(quoteFor(mode === 'month' ? month : week))}</blockquote></header>`;
  }

  /* ---------- Shared keys ---------- */
  const TIMES = ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'];
  const HABITS = ['Early Rise', 'Workout', 'Meditate', 'Read', 'Drink Water', 'No Spend', 'Grateful'];
  const wk = w => 'wk:' + iso(w);

  /* ---------- Pages ---------- */
  const pages = {};

  pages.home = {
    label: 'Home',
    render() {
      const t = today();
      const w = monday(t);
      const di = (t.getDay() + 6) % 7;
      const k = wk(w);
      const links = [
        ['weekly', 'Weekly', 'Schedule, priorities, habits'],
        ['calendar', 'Calendar', 'Month at a glance'],
        ['overview', 'Overview', 'Monthly focus & goals'],
        ['wellness', 'Wellness', 'Mood, sleep & water'],
        ['finance', 'Finance', 'Budget & savings'],
        ['goals', 'Goals', 'Big goals, small steps'],
        ['notes', 'Notes', 'Dotted notebook'],
        ['extras', 'Extras', 'Reading, gratitude, backup']
      ];
      return `
        <div class="home-hero">
          <div>
            <div class="eyebrow">${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][t.getDay()]}</div>
            <h1>${t.getDate()} ${MONTHS[t.getMonth()]}</h1>
          </div>
          <blockquote class="quote">${esc(quoteFor(w))}</blockquote>
        </div>
        <div class="grid-3">
          ${box('Today’s Schedule', `<div class="today-slots">${TIMES.map((tm, s) => `<label for="${idOf(`${k}:s:${di}:${s}`)}">${tm}</label>${txt(`${k}:s:${di}:${s}`, 'Free')}`).join('')}</div>`)}
          ${box('Top Priorities', range(5, i => checkRow(`${k}:p:${i}`)))}
          ${box('Today’s Note', area('cal:' + iso(t), 'Anything to remember today…', 'lined', 'rows="6"'))}
        </div>
        <div class="home-links">
          ${links.map(([id, name, sub]) => `<a class="home-link" href="#${id}"><b>${name}</b><span>${sub}</span></a>`).join('')}
        </div>`;
    }
  };

  pages.calendar = {
    label: 'Calendar', mode: 'month',
    render() {
      const first = new Date(month);
      const lead = (first.getDay() + 6) % 7;
      const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      const cells = Math.ceil((lead + days) / 7) * 7;
      const tIso = iso(today());
      let html = DAYS.map(d => `<div class="cal-hd">${d}</div>`).join('');
      for (let c = 0; c < cells; c++) {
        const n = c - lead + 1;
        if (n < 1 || n > days) { html += '<div class="cal-day pad" aria-hidden="true"></div>'; continue; }
        const d = new Date(first.getFullYear(), first.getMonth(), n);
        const wd = (d.getDay() + 6) % 7;
        html += `<div class="cal-day ${iso(d) === tIso ? 'today' : ''} ${wd > 4 ? 'weekend' : ''}">
          <div class="dn"><span class="wd">${DAYS[wd]}</span><span>${n}</span></div>
          ${area('cal:' + iso(d), '', '', `aria-label="${n} ${MONTHS[d.getMonth()]}"`)}
        </div>`;
      }
      return head('Calendar', 'month') + `<div class="cal">${html}</div>`;
    }
  };

  pages.overview = {
    label: 'Overview', mode: 'month',
    render() {
      const k = 'mo:' + ym(month);
      return head('Monthly Overview', 'month') + `
        <div class="grid-2">
          <div class="col">
            ${box('Monthly Focus', area(k + ':focus', 'What is this month about?', 'lined', 'rows="4"'))}
            ${box('Monthly Goals', range(6, i => checkRow(`${k}:g:${i}`)))}
            ${box('Important Dates', range(8, i => `<div class="date-row">${txt(`${k}:d:${i}:when`, 'Date')}${txt(`${k}:d:${i}:what`, 'Birthday, bill, appointment…')}</div>`))}
          </div>
          <div class="col">
            ${box('To-Do This Month', range(10, i => checkRow(`${k}:t:${i}`)))}
            ${box('What went well', area(k + ':well', '', 'lined', 'rows="5"'))}
            ${box('What to improve', area(k + ':improve', '', 'lined', 'rows="5"'))}
          </div>
        </div>`;
    }
  };

  pages.weekly = {
    label: 'Weekly', mode: 'week',
    render() {
      const k = wk(week);
      const tIso = iso(today());
      const rows = DAYS.map((dn, i) => {
        const d = addDays(week, i);
        return `<div class="sched-row ${iso(d) === tIso ? 'today' : ''}">
          <div class="sched-day"><span>${dn}</span><b>${d.getDate()}</b></div>
          ${TIMES.map((t, s) => `<textarea id="${idOf(`${k}:s:${i}:${s}`)}" class="slot" data-bind="${k}:s:${i}:${s}" placeholder="${t}" aria-label="${dn} ${d.getDate()} ${t}"></textarea>`).join('')}
        </div>`;
      }).join('');
      const habits = `<div class="habits">
          <span></span>${'MTWTFSS'.split('').map(c => `<span class="hd">${c}</span>`).join('')}<span></span>
          ${HABITS.map((h, i) => `
            ${txt('habit:' + i, h, 'line', `data-default="${esc(h)}" aria-label="Habit ${i + 1}"`)}
            ${range(7, d => chk(`${k}:h:${i}:${d}`, `${h} ${DAYS[d]}`, 'circle sm'))}
            <span class="count" data-count="${i}">0/7</span>`).join('')}
        </div>`;
      return head('Weekly Plan', 'week') + `
        <div class="weekly">
          <div class="col">
            ${box('Schedule', `<div class="sched"><div class="sched-head"><span></span>${TIMES.map(t => `<span>${t}</span>`).join('')}</div>${rows}</div>`, '', 'flush')}
            <div class="weekly-bottom">
              ${box('Habit Tracker', habits, '', 'flush')}
              ${box('This Week’s Focus', area(k + ':focus', 'One word, one intention…', 'lined', 'rows="8"'))}
            </div>
          </div>
          <div class="col">
            ${box('Top Priorities', range(5, i => checkRow(`${k}:p:${i}`)))}
            ${box('Tasks', range(6, i => checkRow(`${k}:t:${i}`)))}
            ${box('Notes', area(k + ':notes', '', 'dotted'), 'notes-box', 'flush')}
          </div>
        </div>`;
    },
    refresh() {
      const k = wk(week);
      document.querySelectorAll('[data-count]').forEach(el => {
        const i = el.dataset.count;
        let n = 0;
        for (let d = 0; d < 7; d++) if (get(`${k}:h:${i}:${d}`, false)) n++;
        el.textContent = `${n}/7`;
      });
    }
  };

  const MOODS = [['', '–'], ['5', 'Great'], ['4', 'Good'], ['3', 'Okay'], ['2', 'Low'], ['1', 'Rough']];
  pages.wellness = {
    label: 'Wellness', mode: 'week',
    render() {
      const k = 'wel:' + iso(week);
      const rows = DAYS.map((dn, i) => {
        const d = addDays(week, i);
        return `<div class="day">${dn}<small>${d.getDate()} ${MON_S[d.getMonth()]}</small></div>
          <div><span class="mlabel">Mood</span><select id="${idOf(`${k}:${i}:mood`)}" class="line" data-bind="${k}:${i}:mood" aria-label="Mood ${dn}">${MOODS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></div>
          <div><span class="mlabel">Sleep (hrs)</span>${num(`${k}:${i}:sleep`, '–')}</div>
          <div class="water-cell"><span class="mlabel">Water (glasses)</span><div class="water">${range(8, g => chk(`${k}:${i}:w:${g}`, `${dn} glass ${g + 1}`))}</div></div>
          <div class="move-cell"><span class="mlabel">Movement</span>${txt(`${k}:${i}:move`, 'Walk, yoga, gym…')}</div>`;
      }).join('');
      return head('Wellness', 'week') + `
        <div class="col">
          ${box('Daily Check-in', `<div class="well">
              <div class="hd">Day</div><div class="hd">Mood</div><div class="hd">Sleep</div><div class="hd">Water</div><div class="hd">Movement</div>
              ${rows}</div>`, '', 'flush')}
          <div class="grid-3">
            ${box('This Week', `<div class="stat-row">
              <div class="stat"><b data-stat="sleep">–</b><span>Avg sleep</span></div>
              <div class="stat"><b data-stat="water">0</b><span>Glasses</span></div>
              <div class="stat"><b data-stat="mood">–</b><span>Avg mood</span></div></div>`)}
            ${box('Self-Care', range(6, i => checkRow(`${k}:care:${i}`, ['Skincare', 'Stretch', 'Screen-free hour', 'Call a friend', 'Early night', 'Time outside'][i])))}
            ${box('How I Feel', area(k + ':feel', 'Check in with yourself…', 'lined', 'rows="6"'))}
          </div>
        </div>`;
    },
    refresh() {
      const k = 'wel:' + iso(week);
      let sleep = 0, sn = 0, water = 0, mood = 0, mn = 0;
      for (let i = 0; i < 7; i++) {
        const s = Number(get(`${k}:${i}:sleep`, '')); if (s > 0) { sleep += s; sn++; }
        const m = Number(get(`${k}:${i}:mood`, '')); if (m > 0) { mood += m; mn++; }
        for (let g = 0; g < 8; g++) if (get(`${k}:${i}:w:${g}`, false)) water++;
      }
      const put = (n, v) => { const el = document.querySelector(`[data-stat="${n}"]`); if (el) el.textContent = v; };
      put('sleep', sn ? (sleep / sn).toFixed(1) + 'h' : '–');
      put('water', water);
      put('mood', mn ? MOODS.find(m => m[0] === String(Math.round(mood / mn)))[1] : '–');
    }
  };

  const EXPENSES = ['Rent / mortgage', 'Groceries', 'Utilities', 'Transport', 'Phone & internet', 'Subscriptions', 'Eating out', 'Shopping', 'Health', 'Gifts', 'Savings', 'Other'];
  pages.finance = {
    label: 'Finance', mode: 'month',
    render() {
      const k = 'fin:' + ym(month);
      return head('Finance', 'month') + `
        <div class="summary">
          <div class="stat"><b data-fin="income">–</b><span>Income</span></div>
          <div class="stat"><b data-fin="budget">–</b><span>Budgeted</span></div>
          <div class="stat"><b data-fin="spent">–</b><span>Spent</span></div>
          <div class="stat"><b data-fin="left">–</b><span>Left over</span></div>
        </div>
        <div class="grid-2">
          ${box('Expenses', `<div class="fin-table"><span class="hd">Item</span><span class="hd r">Budget</span><span class="hd r">Actual</span>
            ${range(EXPENSES.length, i => txt(`${k}:e:${i}:n`, EXPENSES[i]) + num(`${k}:e:${i}:b`) + num(`${k}:e:${i}:a`))}</div>`)}
          <div class="col">
            ${box('Income', `<div class="fin-table two"><span class="hd">Source</span><span class="hd r">Amount</span>
              ${range(4, i => txt(`${k}:i:${i}:n`, ['Salary', 'Side hustle', 'Other', ''][i]) + num(`${k}:i:${i}:a`))}</div>`)}
            ${box('Savings Goal', `
              ${txt('fin:save:name', 'What are you saving for?')}
              <div class="fin-table two"><span class="hd">Target</span>${num('fin:save:target')}<span class="hd">Saved so far</span>${num('fin:save:saved')}</div>
              <div class="bar"><i data-fin="savebar"></i></div><div class="muted" data-fin="savetext"></div>`)}
            ${box('Money Notes', area(k + ':notes', 'Bills to pay, reminders…', 'lined', 'rows="5"'))}
          </div>
        </div>`;
    },
    refresh() {
      const k = 'fin:' + ym(month);
      let inc = 0, bud = 0, sp = 0;
      for (let i = 0; i < 4; i++) inc += numVal(`${k}:i:${i}:a`);
      for (let i = 0; i < EXPENSES.length; i++) { bud += numVal(`${k}:e:${i}:b`); sp += numVal(`${k}:e:${i}:a`); }
      const put = (n, v, cls) => { const el = document.querySelector(`[data-fin="${n}"]`); if (el) { el.textContent = v; if (cls !== undefined) el.className = cls; } };
      put('income', money(inc)); put('budget', money(bud)); put('spent', money(sp));
      put('left', money(inc - sp), inc - sp < 0 ? 'neg' : 'pos');
      const target = numVal('fin:save:target'), saved = numVal('fin:save:saved');
      const pct = target ? Math.min(100, Math.round(saved / target * 100)) : 0;
      const bar = document.querySelector('[data-fin="savebar"]'); if (bar) bar.style.width = pct + '%';
      put('savetext', target ? `${pct}% · ${money(Math.max(0, target - saved))} to go` : 'Set a target to track progress');
    }
  };

  pages.goals = {
    label: 'Goals',
    render() {
      return head('Goals') + `<div class="grid-2">${range(6, g => box(`Goal ${g + 1}`, `
        <div class="goal">
          <div class="meta">${txt(`goal:${g}:title`, 'Name your goal', 'line title-in')}${txt(`goal:${g}:date`, 'By when?')}</div>
          <h4>Why it matters</h4>${txt(`goal:${g}:why`, 'My reason…')}
          <h4>Steps</h4>${range(5, s => checkRow(`goal:${g}:s:${s}`, `Step ${s + 1}`))}
          <div class="bar"><i data-goal="${g}"></i></div>
          <div class="pct"><span>Progress</span><span data-goalpct="${g}">0%</span></div>
        </div>`))}</div>`;
    },
    refresh() {
      for (let g = 0; g < 6; g++) {
        let n = 0;
        for (let s = 0; s < 5; s++) if (get(`goal:${g}:s:${s}:c`, false)) n++;
        const bar = document.querySelector(`[data-goal="${g}"]`);
        if (bar) bar.style.width = n * 20 + '%';
        const p = document.querySelector(`[data-goalpct="${g}"]`);
        if (p) p.textContent = n * 20 + '%';
      }
    }
  };

  let noteId = null;
  const notes = () => (Array.isArray(data.notes) ? data.notes : (data.notes = []));
  function stamp(t) {
    const d = new Date(t);
    return `${d.getDate()} ${MON_S[d.getMonth()]} ${d.getFullYear()}`;
  }
  pages.notes = {
    label: 'Notes',
    render() {
      const list = notes().slice().sort((a, b) => b.updated - a.updated);
      if (!list.find(n => n.id === noteId)) noteId = list[0] ? list[0].id : null;
      const cur = list.find(n => n.id === noteId);
      const items = list.length
        ? list.map(n => `<li><button data-action="open-note" data-id="${n.id}" aria-current="${n.id === noteId}"><b data-title="${n.id}">${esc(n.title || 'Untitled')}</b><small>${stamp(n.updated)}</small></button></li>`).join('')
        : '<li class="empty">No notes yet. Start one with New note.</li>';
      const editor = cur
        ? `<input type="text" id="note-title" class="line title-in" data-note="title" placeholder="Title" value="${esc(cur.title)}" autocomplete="off">
           <textarea id="note-body" class="dotted" data-note="body" placeholder="Start writing…">${esc(cur.body)}</textarea>
           <div class="box-actions"><span class="muted">Edited ${stamp(cur.updated)}</span><button class="pill-btn danger" data-action="del-note">Delete note</button></div>`
        : '<div class="empty">Choose a note, or create a new one.</div>';
      return head('Notes') + `<div class="notes-wrap">
          ${box('All Notes', `<ul class="note-list">${items}</ul><div class="box-actions"><button class="pill-btn solid" data-action="new-note">New note</button></div>`, '', 'flush')}
          ${box('Notebook', `<div class="note-editor">${editor}</div>`, '', 'flush')}
        </div>`;
    }
  };

  let confirmReset = false;
  pages.extras = {
    label: 'Extras',
    render() {
      return head('Extras') + `<div class="grid-2">
        ${box('Reading List', range(8, i => `<div class="read-row">${chk(`x:read:${i}:c`, 'Finished')}${txt(`x:read:${i}:t`, 'Title')}${txt(`x:read:${i}:a`, 'Author')}</div>`))}
        ${box('Gratitude', range(8, i => txt(`x:grat:${i}`, i === 0 ? 'Today I am grateful for…' : '')))}
        ${box('Brain Dump', area('x:dump', 'Empty your head here…', 'dotted', 'rows="12"'), '', 'flush')}
        ${box('Settings & Backup', `
          <div class="setting"><label for="${idOf('set:theme')}">Theme</label>
            <select id="${idOf('set:theme')}" class="line" data-bind="set:theme" data-default="light"><option value="light">Light (paper)</option><option value="dark">Dark</option><option value="auto">Match device</option></select></div>
          <div class="setting"><label for="${idOf('set:currency')}">Currency</label>
            <select id="${idOf('set:currency')}" class="line" data-bind="set:currency" data-default="£">${['£', '$', '€', '₦', '¥', '₹', 'R', 'CA$', 'A$'].map(c => `<option>${c}</option>`).join('')}</select></div>
          <p class="muted">Your planner saves automatically on this device. Download a backup to move it to another device, then use Restore there.</p>
          <div class="btn-row">
            <button class="pill-btn solid" data-action="export">Download backup</button>
            <label class="pill-btn" for="import-file">Restore backup</label>
            <input type="file" id="import-file" accept="application/json,.json" hidden>
            <button class="pill-btn danger" data-action="ask-reset">Clear planner</button>
          </div>
          ${confirmReset ? `<div class="confirm">This erases every page on this device. Download a backup first if you might want it.
            <div class="btn-row"><button class="pill-btn danger" data-action="reset">Erase everything</button><button class="pill-btn" data-action="cancel-reset">Keep my planner</button></div></div>` : ''}
        `)}
      </div>`;
    }
  };

  /* ---------- Rendering ---------- */
  const ORDER = ['home', 'calendar', 'overview', 'weekly', 'wellness', 'finance', 'goals', 'notes', 'extras'];
  const pageEl = document.getElementById('page');
  const tabsEl = document.getElementById('tabs');
  let current = 'home';

  const HOME_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.5 11.2l1.3 1.5L5 11.7V21h5.5v-6h3v6H19v-9.3l1.2 1 1.3-1.5z"/></svg>';
  tabsEl.innerHTML = ORDER.map(id =>
    `<a class="tab ${id === 'home' ? 'home' : ''}" href="#${id}" data-tab="${id}" ${id === 'home' ? 'aria-label="Home"' : ''}>${id === 'home' ? HOME_ICON : pages[id].label}</a>`
  ).join('');

  function hydrate() {
    pageEl.querySelectorAll('[data-bind]').forEach(el => {
      const k = el.dataset.bind;
      if (el.type === 'checkbox') el.checked = !!get(k, false);
      else el.value = get(k, el.dataset.default !== undefined ? el.dataset.default : '');
    });
  }

  function render() {
    const p = pages[current];
    pageEl.innerHTML = p.render();
    hydrate();
    if (p.refresh) p.refresh();
    tabsEl.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-current', t.dataset.tab === current ? 'page' : 'false'));
    const active = tabsEl.querySelector('[aria-current="page"]');
    if (active && window.matchMedia('(max-width: 720px)').matches) active.scrollIntoView({ inline: 'center', block: 'nearest' });
    document.title = (current === 'home' ? 'Digital Planner' : pages[current].label + ' · Digital Planner');
  }

  function route() {
    const h = (location.hash || '').slice(1);
    current = pages[h] ? h : 'home';
    confirmReset = false;
    render();
    window.scrollTo(0, 0);
  }

  function applyTheme() {
    const t = get('set:theme', 'light');
    if (t === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
  }

  /* ---------- Events ---------- */
  function onField(e) {
    const el = e.target;
    if (el.dataset.bind) {
      const isBox = el.type === 'checkbox';
      if (isBox && e.type === 'input') return; // handled on change
      set(el.dataset.bind, isBox ? el.checked : el.value, el.dataset.default !== undefined);
      if (el.dataset.bind === 'set:theme') applyTheme();
      const p = pages[current];
      if (p.refresh) p.refresh();
      return;
    }
    if (el.dataset.note && noteId) {
      const n = notes().find(x => x.id === noteId);
      if (!n) return;
      n[el.dataset.note] = el.value;
      n.updated = Date.now();
      const t = pageEl.querySelector(`[data-title="${noteId}"]`);
      if (t && el.dataset.note === 'title') t.textContent = el.value || 'Untitled';
      save();
    }
  }
  pageEl.addEventListener('input', onField);
  pageEl.addEventListener('change', onField);

  pageEl.addEventListener('click', e => {
    const b = e.target.closest('[data-action]');
    if (!b) return;
    const a = b.dataset.action;
    const mode = pages[current].mode;
    if (a === 'prev' || a === 'next') {
      const s = a === 'prev' ? -1 : 1;
      if (mode === 'week') week = addDays(week, 7 * s);
      else month = new Date(month.getFullYear(), month.getMonth() + s, 1);
      render();
    } else if (a === 'today') {
      week = monday(today());
      month = new Date(today().getFullYear(), today().getMonth(), 1);
      render();
    } else if (a === 'new-note') {
      const n = { id: 'n' + Date.now().toString(36), title: '', body: '', updated: Date.now() };
      notes().push(n); noteId = n.id; save(true); render();
      const t = document.getElementById('note-title'); if (t) t.focus();
    } else if (a === 'open-note') {
      noteId = b.dataset.id; render();
    } else if (a === 'del-note') {
      data.notes = notes().filter(n => n.id !== noteId); noteId = null; save(true); render(); toast('Note deleted');
    } else if (a === 'export') {
      exportData();
    } else if (a === 'ask-reset') {
      confirmReset = true; render();
    } else if (a === 'cancel-reset') {
      confirmReset = false; render();
    } else if (a === 'reset') {
      data = {}; confirmReset = false; save(true); applyTheme(); render(); toast('Planner cleared');
    }
  });

  pageEl.addEventListener('change', e => {
    if (e.target.id !== 'import-file' || !e.target.files[0]) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const obj = JSON.parse(r.result);
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('bad');
        data = obj.planner && typeof obj.planner === 'object' ? obj.planner : obj;
        save(true); applyTheme(); render(); toast('Backup restored');
      } catch (err) {
        toast('That file is not a planner backup');
      }
    };
    r.readAsText(e.target.files[0]);
  });

  function exportData() {
    const blob = new Blob([JSON.stringify({ app: 'digital-planner', version: 1, exported: new Date().toISOString(), planner: data }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `planner-backup-${iso(today())}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  const toastEl = document.getElementById('toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1400);
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('pagehide', () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* storage blocked */ } });

  applyTheme();
  route();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
