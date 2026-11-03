import './styles.css';
import { GUIDES, CATEGORIES, TICKET_TYPES, byId } from './data/guides.js';
import { TOOLS, TOOL_GROUPS } from './data/tools.js';
import { DEPARTMENTS } from './data/departments.js';
import { LANGS, t, getLang, setLang } from './i18n.js';
import { searchGuides } from './search.js';
import { $, $$, esc, rich, store, toast, copy } from './util.js';

// ───────────────────────── service worker / offline ─────────────────────────
let swReady = false;
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true, onOfflineReady() { swReady = true; renderStatus(); route(); } });
  });
  navigator.serviceWorker.ready.then(() => { swReady = !!navigator.serviceWorker.controller || swReady; renderStatus(); });
  if (navigator.serviceWorker.controller) swReady = true;
}
const savedOffline = () => swReady;

let installEvt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; if (currentRoute === 'home') route(); });
window.addEventListener('appinstalled', () => { installEvt = null; store.set('fg-installed', true); if (currentRoute === 'home') route(); });
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

window.addEventListener('online', renderStatus);
window.addEventListener('offline', renderStatus);

// ───────────────────────── icons ─────────────────────────
const ICON = {
  home: '<path d="M3 11l9-7 9 7v9H3z"/>',
  guides: '<path d="M5 4h11l3 3v13H5z M9 10h7 M9 14h7"/>',
  figures: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z M12 12l8-4.5 M12 12v9 M12 12L4 7.5"/>',
  tools: '<path d="M14 6l4 4-9 9H5v-4z M13 7l4 4"/>',
  ticket: '<path d="M4 6h6v5H4z M14 13h6v5h-6z M10 8.5h4v7"/>',
  poster: '<path d="M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h2v2h-2z M18 18h2v2h-2z"/>'
};
const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;
const CAT_MASK = {
  printer: "M6 2h12v6H6zM2 9h20v9h-4v4H6v-4H2z",
  monitor: "M2 3h20v14H2zM8 19h8v2H8z",
  wifi: "M12 18a2 2 0 110 4 2 2 0 010-4zM2 8a15 15 0 0120 0l-2 2a12 12 0 00-16 0zM6 12a9 9 0 0112 0l-2 2a6 6 0 00-8 0z",
  mail: "M2 4h20v16H2zM2 4l10 8 10-8",
  db: "M3 5a9 3 0 0118 0v14a9 3 0 01-18 0z",
  app: "M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z",
  tower: "M4 2h10v20H4zM16 8h4v14h-4z",
  server: "M3 3h18v5H3zM3 10h18v5H3zM3 17h18v5H3z"
};
const mask = (k) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='${CAT_MASK[k]}'/></svg>`)}")`;

// ───────────────────────── chrome ─────────────────────────
const NAV = [
  { r: 'home', href: '#/', icon: 'home', key: 'home' },
  { r: 'guides', href: '#/guides', icon: 'guides', key: 'guides' },
  { r: 'figures', href: '#/figures', icon: 'figures', key: 'figures' },
  { r: 'tools', href: '#/tools', icon: 'tools', key: 'tools' },
  { r: 'ticket', href: '#/ticket', icon: 'ticket', key: 'ticket' }
];

function renderChrome() {
  $('#app').innerHTML = `
    <header class="top">
      <a class="mark" href="#/" aria-label="ICT Field Guide home">ICT</a>
      <a class="brand" href="#/"><b>ICT Field Guide</b><span>${t('tagline')}</span></a>
      <div class="sp"></div>
      <div class="status" id="status"></div>
      <div class="lang" role="group" aria-label="Language">${LANGS.map((l) => `<button data-lang="${l.id}" title="${l.name}" aria-pressed="${l.id === getLang()}">${l.label}</button>`).join('')}</div>
    </header>
    <div class="body">
      <nav class="side" aria-label="Sections">
        <div class="lbl">${t('sectionGuide')}</div>
        ${NAV.slice(0, 4).map((n) => `<a href="${n.href}" data-r="${n.r}">${svg(n.icon)}${n.r === 'tools' ? t('toolsLong') : t(n.key)}</a>`).join('')}
        <div class="lbl">${t('sectionTicket')}</div>
        <a href="#/ticket" data-r="ticket">${svg('ticket')}${t('ticket')}</a>
        <a href="#/poster" data-r="poster">${svg('poster')}${t('poster')}</a>
        <div class="foot">${GUIDES.length} guides · v${__APP_VERSION__}<br>${getLang() !== 'en' ? esc(t('langNote')) : ''}</div>
      </nav>
      <main class="main" id="main" tabindex="-1"></main>
    </div>
    <nav class="tabs" aria-label="Sections">
      ${NAV.map((n) => `<a href="${n.href}" data-r="${n.r}">${svg(n.icon)}${t(n.key)}</a>`).join('')}
    </nav>`;
  $$('.lang button').forEach((b) => b.addEventListener('click', (e) => {
    const wrap = b.parentElement;
    // On narrow screens the picker shows only the current language: first tap opens it.
    if (getComputedStyle(wrap.querySelector('[aria-pressed="false"]') || b).display === 'none' && !wrap.classList.contains('open')) { wrap.classList.add('open'); e.stopPropagation(); return; }
    wrap.classList.remove('open');
    setLang(b.dataset.lang); renderChrome(); route();
  }));
  renderStatus();
}

function renderStatus() {
  const el = $('#status'); if (!el) return;
  const online = navigator.onLine;
  const saved = savedOffline() ? GUIDES.length : 0;
  el.className = `status${online ? ' is-online' : ''}`;
  el.title = saved ? 'All guides are saved on this device' : 'Guides not saved for offline use yet';
  const filled = Math.round((saved / GUIDES.length) * 10);
  el.innerHTML = `
    <svg class="bars" viewBox="0 0 22 14" aria-hidden="true"><rect x="0" y="10" width="3" height="4"/><rect x="5" y="7" width="3" height="7"/><rect x="10" y="4" width="3" height="10" class="off"/><rect x="15" y="0" width="3" height="14" class="off"/><path d="M0 0L22 14" class="slash"/></svg>
    <div><span class="k">${online ? t('online') : t('noSignal')}</span><span class="v"><span class="meter">${'▮'.repeat(filled)}<span style="opacity:.3">${'▮'.repeat(10 - filled)}</span></span> ${t('savedCount', saved, GUIDES.length)}</span></div>
    <span class="sr">${online ? t('online') : t('offline')}</span>`;
}

// ───────────────────────── helpers ─────────────────────────
const catName = (id) => CATEGORIES.find((c) => c.id === id)?.name || id;
const opened = () => store.get('fg-opened', {});
function popular(n = 4) {
  const o = opened();
  const defaults = ['share-printer-ip', 'outlook-setup', 'no-internet', 'printer-offline'];
  const ranked = Object.keys(o).filter((id) => byId[id]).sort((a, b) => o[b] - o[a]);
  return [...new Set([...ranked, ...defaults])].slice(0, n).map((id) => byId[id]);
}
const guideRow = (g) => `<a class="row" href="#/g/${g.id}"><div class="t"><b>${esc(g.title)}</b><small>${esc(catName(g.cat))} · ${g.steps.length} ${t('steps')} · ${g.minutes} ${t('min')}</small></div><span class="arrow">→</span></a>`;
const trip = () => store.get('fg-trip', { dept: DEPARTMENTS[0], type: 'software' });

// ───────────────────────── views ─────────────────────────
function viewHome() {
  const tp = trip();
  const tripGuides = GUIDES.filter((g) => g.tickets.includes(tp.type)).slice(0, 5);
  const saved = savedOffline();
  const showInstall = !isStandalone();
  return `
  <section class="screen">
    <div class="card trip-card">
      <div class="stub"><span>${t('beforeLeave')}</span><span>${new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}</span></div>
      <div class="perf" aria-hidden="true"></div>
      <div class="inner">
        <div class="qr" aria-hidden="true"></div>
        <div style="flex:1;min-width:0">
          <p class="trip">${t('goingTo')} <select id="dept" aria-label="Department">${DEPARTMENTS.map((d) => `<option ${d === tp.dept ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select> ${t('forA')} <select id="ttype" aria-label="Ticket type">${TICKET_TYPES.map((x) => `<option value="${x.id}" ${x.id === tp.type ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></p>
          <div class="slip">
            ${tripGuides.map((g) => `<a class="ln" href="#/g/${g.id}"><span>${esc(g.title)}</span><i></i><em class="${saved ? '' : 'no'}">${saved ? t('savedOffline') : t('notSaved')}</em></a>`).join('')}
            <div class="tot">${saved ? t('tripTotalSaved', GUIDES.length) : t('tripTotalNotSaved')}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="hero">
      <div>
        <div class="eyebrow">${t('stuck')}</div>
        <h1>${t('heroA')}<br>${t('heroB')}</h1>
        <form class="search" role="search" id="sform">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
          <input id="q" type="search" placeholder="${esc(t('searchPh'))}" aria-label="${esc(t('searchPh'))}" autocomplete="off" enterkeyhint="search"><kbd>/</kbd>
        </form>
        <div class="hints">${t('tryLabel')}: ${['printer offline', 'outlook sync', 'ORA-12154', 'ups beeping', 'no internet'].map((h) => `<a href="#/search?q=${encodeURIComponent(h)}">${esc(h)}</a>`).join('')}</div>
      </div>
<pre class="ascii" aria-hidden="true">
   .--------------------------------.
   |  ICT FIELD GUIDE   ::  v${__APP_VERSION__.padEnd(7)}|
   |--------------------------------|
   |  $ ping printer                |
   |  Reply ... time=1ms ttl=128    |
   |  $ net start spooler           |
   |  > The Print Spooler service   |
   |    was started successfully.   |
   |  $ ticket --resolved           |
   '--------------------------------'
        ___________________
       /  _____________   /|
      /  /____________/  / |
     /__________________/  |
     |  [=====]   o o   |  /
     |__________________| /
     '------------------'
</pre>
    </div>

    <h2>${t('browse')}</h2>
    <div class="grid">
      ${CATEGORIES.map((c, i) => `<a class="cat${i === 0 ? ' hot' : ''}" href="#/guides/${c.id}"><span class="n">${t('guidesCount', GUIDES.filter((g) => g.cat === c.id).length)}</span><b>${esc(c.name)}</b><span class="ic" style="--m:${mask(c.icon)}"></span></a>`).join('')}
    </div>

    <h2>${t('popular')}</h2>
    <div class="list">${popular().map(guideRow).join('')}
      <a class="row" href="#/figures/printer"><div class="t"><b>How a laser printer prints, step by step</b><small>${t('figures')} · 3D</small></div><span class="arrow">→</span></a>
    </div>

    ${showInstall ? `<div class="card install">
      <div><div class="eyebrow">${t('installEyebrow')}</div><b>${t('installTitle')}</b><p>${t('installBody')}</p>${isIos() ? `<p class="mono" style="font-size:12px;margin-top:8px">${t('installIos')}</p>` : ''}<a class="install-link" href="#/g/install-field-guide">${t('installSteps')} →</a></div>
      ${installEvt ? `<button class="btn light" id="install">⤓ ${t('installBtn')}</button>` : ''}
    </div>` : `<p class="note">${t('installed')} · ${GUIDES.length} guides</p>`}
  </section>`;
}
function bindHome() {
  const fit = (sel) => { // size the inline selects to their chosen text
    if (CSS.supports('field-sizing', 'content')) return;
    const m = document.createElement('span'); m.style.cssText = 'position:absolute;visibility:hidden;font:inherit;font-weight:800;white-space:pre';
    m.textContent = sel.options[sel.selectedIndex].text; sel.parentNode.appendChild(m); sel.style.width = `${m.offsetWidth + 6}px`; m.remove();
  };
  ['dept', 'ttype'].forEach((id) => {
    const sel = $('#' + id); fit(sel);
    sel.addEventListener('change', () => { store.set('fg-trip', { dept: $('#dept').value, type: $('#ttype').value }); route(); });
  });
  $('#sform').addEventListener('submit', (e) => { e.preventDefault(); const q = $('#q').value.trim(); if (q) location.hash = `#/search?q=${encodeURIComponent(q)}`; });
  $('#install')?.addEventListener('click', async () => { if (!installEvt) return; installEvt.prompt(); await installEvt.userChoice; installEvt = null; route(); });
}

function viewSearch(q) {
  const res = searchGuides(GUIDES, q);
  return `<section class="screen">
    <form class="search" role="search" id="sform"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
      <input id="q" type="search" value="${esc(q)}" aria-label="${esc(t('searchPh'))}" placeholder="${esc(t('searchPh'))}" autocomplete="off" enterkeyhint="search"></form>
    <p class="eyebrow" style="margin-top:18px">${t('results', res.length)}</p>
    <div class="list">${res.length ? res.map(guideRow).join('') : `<p>${t('noResults')}</p>`}</div>
  </section>`;
}
function bindSearch() {
  const inp = $('#q'); inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length);
  let tmr;
  inp.addEventListener('input', () => { clearTimeout(tmr); tmr = setTimeout(() => { history.replaceState(null, '', `#/search?q=${encodeURIComponent(inp.value)}`); const list = searchGuides(GUIDES, inp.value); $('.list').innerHTML = list.length ? list.map(guideRow).join('') : `<p>${t('noResults')}</p>`; $('.screen .eyebrow').textContent = t('results', list.length); }, 120); });
  $('#sform').addEventListener('submit', (e) => e.preventDefault());
}

function viewGuides(cat) {
  const list = cat ? GUIDES.filter((g) => g.cat === cat) : GUIDES;
  return `<section class="screen">
    <div class="eyebrow">${t('guides')}</div>
    <h1 class="sm">${cat ? esc(catName(cat)) : t('guides')}</h1>
    <div class="filters" role="group">
      <button data-cat="" aria-pressed="${!cat}">${t('allCats')}</button>
      ${CATEGORIES.map((c) => `<button data-cat="${c.id}" aria-pressed="${c.id === cat}">${esc(c.name.split(' (')[0])}</button>`).join('')}
    </div>
    <div class="list">${list.map(guideRow).join('')}</div>
  </section>`;
}
function bindGuides() { $$('.filters button').forEach((b) => b.addEventListener('click', () => { location.hash = b.dataset.cat ? `#/guides/${b.dataset.cat}` : '#/guides'; })); }

const PROMPT = { cmd: 'C:\\>', ps: 'PS>', sh: '$' };
function viewGuide(id) {
  const g = byId[id];
  if (!g) return `<section class="screen"><h1 class="sm">Guide not found</h1><p><a href="#/guides">${t('guides')} →</a></p></section>`;
  const o = opened(); o[id] = (o[id] || 0) + 1; store.set('fg-opened', o);
  const done = store.get(`fg-done-${id}`, []);
  const confirm = t('confirm');
  return `<section class="screen">
    <div class="crumbs"><a href="#/guides">${t('guides')}</a> / <a href="#/guides/${g.cat}">${esc(catName(g.cat))}</a></div>
    <h1 class="sm">${esc(g.title)}</h1>
    <p class="lede">${rich(g.summary, confirm)}</p>
    <div class="meta"><span>⏱ ${g.minutes} ${t('min')}</span><span>${esc(g.level)}</span><span>${esc(g.platform)}</span>
      ${g.reviewedBy ? `<span class="stamp ok">${esc(t('reviewedBy', g.reviewedBy))}</span>` : `<span class="stamp warn">${t('notReviewed')}</span>`}</div>
    <div class="guide">
      <div>
        <ol class="steps">
          ${g.steps.map((s, i) => `<li class="card${done.includes(i) ? ' done' : ''}" data-i="${i}"><b>${rich(s.t, confirm)}</b><p>${rich(s.b, confirm)}</p>
            ${s.cmd ? `<div class="term${s.shell === 'info' ? ' info' : ''}"><code>${s.shell && PROMPT[s.shell] ? s.cmd.split('\n').map((l) => `<span class="ps">${PROMPT[s.shell]}</span> ${rich(l, confirm)}`).join('\n') : rich(s.cmd, confirm)}</code>${s.shell !== 'info' ? `<button data-copy="${i}">copy</button>` : ''}</div>` : ''}</li>`).join('')}
        </ol>
        ${g.warn ? `<div class="card caution">${rich(g.warn, confirm)}</div>` : ''}
        <div class="card done-bar">
          <div><b>${t('fixed')}</b> <span style="color:var(--muted);font-size:14px">${t('fixedBody')}</span></div>
          <div class="acts"><input class="ticketno" id="ticketno" placeholder="Ticket #" value="${esc(store.get('fg-ticketno', ''))}" aria-label="Ticket number"><button class="btn ghost" id="ask">${t('askSenior')}</button><button class="btn" id="note">✓ ${t('copyNote')}</button></div>
        </div>
      </div>
      <aside class="aside">
        ${g.need.length ? `<div class="card"><h3>${t('youNeed')}</h3><ul class="need">${g.need.map((n) => `<li>${rich(n, confirm)}</li>`).join('')}</ul></div>` : ''}
        ${g.figure ? `<div class="card"><h3>${t('seeHow')}</h3><a class="btn ghost" href="#/figures/${g.figure}">${g.figure === 'printer' ? 'Laser printer' : 'UPS'} in 3D →</a></div>` : ''}
        ${g.related.length ? `<div class="card"><h3>${t('related')}</h3><ul>${g.related.filter((r) => byId[r]).map((r) => `<li><a href="#/g/${r}">${esc(byId[r].title)}</a></li>`).join('')}</ul></div>` : ''}
      </aside>
    </div>
  </section>`;
}
function bindGuide(id) {
  const g = byId[id]; if (!g) return;
  const key = `fg-done-${id}`;
  $$('.steps li').forEach((li) => li.addEventListener('click', (e) => {
    if (e.target.closest('button, a, .term')) return;
    li.classList.toggle('done');
    store.set(key, $$('.steps li.done').map((x) => +x.dataset.i));
  }));
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    const s = g.steps[+b.dataset.copy];
    await copy(s.cmd.replace(/\[\[|\]\]/g, '')); b.textContent = t('copied'); setTimeout(() => (b.textContent = 'copy'), 1200);
  }));
  const ticket = () => { const v = $('#ticketno').value.trim(); store.set('fg-ticketno', v); return v; };
  const doneSteps = () => $$('.steps li.done').map((x) => +x.dataset.i + 1);
  $('#note').addEventListener('click', async () => {
    const tp = trip(); const n = ticket(); const d = doneSteps();
    const txt = [`ICT ticket ${n ? '#' + n : ''} · ${tp.dept}`.trim(), `Issue: ${g.title}`, `Fixed using ICT Field Guide steps: ${d.length ? d.join(', ') : 'all'}`, `Status: resolved, user confirmed`].join('\n');
    toast((await copy(txt)) ? t('copied') : txt);
  });
  $('#ask').addEventListener('click', async () => {
    const tp = trip(); const n = ticket(); const d = doneSteps(); const next = d.length ? Math.max(...d) + 1 : 1;
    const txt = `Hi, I'm at ${tp.dept}${n ? ' on ticket #' + n : ''}. Stuck on step ${Math.min(next, g.steps.length)} of "${g.title}" (${g.steps[Math.min(next, g.steps.length) - 1].t}). Can you help?`;
    if (navigator.share) { try { await navigator.share({ text: txt }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    toast((await copy(txt)) ? t('copied') : txt);
  });
}

const FIGS = {
  printer: { title: 'How a laser printer puts toner on paper', line: 'Static draws the page, heat makes it stay. Seven steps from tray to output.', load: () => import('./figures/printer.js'), guide: 'paper-jam',
    art: '  ________________\n |  [LCD]   ::::  |\n |  _____________ |\n | |  (o) [###]  ||\n | |______________||\n |__[ tray ]______|' },
  ups: { title: 'How a UPS keeps a PC on in a power cut', line: 'A battery and a 4 ms switch. Move the load and watch the runtime change.', load: () => import('./figures/ups.js'), guide: 'ups-beeping',
    art: '   _______        __\n  | o o   |      |  |\n  | [===] |------|__|\n  | [BAT] |      /__\\\n  |_______|' }
};
function viewFigures() {
  return `<section class="screen">
    <div class="eyebrow">${t('figures')}</div>
    <h1 class="sm">Press the buttons. Watch it work.</h1>
    <p class="lede">Each figure is a 3D machine you can turn around. Every number on screen comes from one small model of the real device.</p>
    <div class="fig-cards">${Object.entries(FIGS).map(([id, f]) => `<a class="card fig-card" href="#/figures/${id}"><pre aria-hidden="true">${esc(f.art)}</pre><b>${esc(f.title)}</b><small>${esc(f.line)}</small></a>`).join('')}</div>
    <p class="note">More figures planned: all-in-one PC, network switch, monitor, CPU tower.</p>
  </section>`;
}
let disposeFig = null;
function viewFigure(id) {
  const f = FIGS[id];
  if (!f) return viewFigures();
  return `<section class="screen">
    <div class="crumbs"><a href="#/figures">${t('figures')}</a></div>
    <h1 class="sm">${esc(f.title)}</h1>
    <div id="figroot"><div class="card" style="padding:40px;text-align:center" class="mono">Loading 3D…</div></div>
    <p class="note">Numbers are typical values for this class of device, not one exact model. Sources and assumptions are listed in src/figures/models.js. Related guide: <a href="#/g/${f.guide}">${esc(byId[f.guide].title)}</a>.</p>
  </section>`;
}
async function bindFigure(id) {
  const f = FIGS[id]; if (!f) return;
  const root = $('#figroot');
  try {
    const [{ mountFigure }, mod] = await Promise.all([import('./figures/engine.js'), f.load()]);
    if (!document.body.contains(root)) return;
    disposeFig = mountFigure(root, mod.default);
  } catch (e) {
    root.innerHTML = `<div class="card caution">This figure needs WebGL, which this browser has turned off. The guides still work.</div>`;
    console.error(e);
  }
}

function viewTools(group) {
  const list = TOOLS.filter((x) => !group || x.g === group);
  const confirm = t('confirm');
  return `<section class="screen">
    <div class="eyebrow">${t('toolsLong')}</div>
    <h1 class="sm">ICT tools and spares</h1>
    <p class="lede">${t('inventoryLede')}</p>
    <div class="filters" role="group"><button data-g="" aria-pressed="${!group}">${t('allCats')}</button>${TOOL_GROUPS.map((g) => `<button data-g="${g.id}" aria-pressed="${g.id === group}">${esc(g.name)}</button>`).join('')}</div>
    <div class="inv">${list.map((x) => `<div class="card tool"><div class="pic" aria-hidden="true">${esc(x.art)}</div><div><b>${esc(x.name)}</b><small>${esc(x.use)}</small><div class="st"><span>${rich(x.where, confirm)}</span><span>qty ${x.qty ?? '<span class="ph">count</span>'}</span>${x.guide ? `<a href="#/g/${x.guide}">guide →</a>` : ''}</div></div></div>`).join('')}</div>
    <p class="note">Locations and counts marked in amber still need to be filled in by the ICT store. Edit src/data/tools.js.</p>
  </section>`;
}
function bindTools() { $$('.filters button').forEach((b) => b.addEventListener('click', () => { location.hash = b.dataset.g ? `#/tools/${b.dataset.g}` : '#/tools'; })); }

function viewTicket() {
  return `<section class="screen">
    <div class="eyebrow">${t('why')}</div>
    <h1 class="sm">${t('flowTitle')}</h1>
    <div class="flow">
      <div class="card node"><span class="k">01</span><b>Complaint</b><small>Staff raise a ticket on the ICT Support dashboard or walk into the ICT office.</small></div>
      <div class="card node"><span class="k">02</span><b>Assigned</b><small>The supervisor assigns it. The intern gets the "Task Assigned" email.</small></div>
      <div class="card node me"><span class="k">03 · Field Guide</span><b>Intern fixes it on site</b><small>Opened from the QR poster in the ICT office before leaving. Works offline on site.</small></div>
      <div class="card node"><span class="k">04</span><b>Reports back</b><small>Copies a resolution note from the guide and sends it to the supervisor.</small></div>
      <div class="card node"><span class="k">05</span><b>Closed</b><small>The supervisor ticks it resolved on the dashboard.</small></div>
    </div>
    <div class="why">
      <div class="card"><b>${t('before')}</b><pre>intern stuck at step 3
 └─ walks back to the office
     └─ hunts for a senior who "knows printers"
         └─ ticket waits, staff wait</pre></div>
      <div class="card" style="border-color:var(--green-2)"><b>${t('after')}</b><pre>intern stuck at step 3
 └─ opens the guide (works offline)
     └─ follows the checked steps
         └─ ticket closed on the first visit</pre></div>
    </div>
  </section>`;
}

function appUrl() { return location.href.split('#')[0]; }
function viewPoster() {
  return `<section class="screen">
    <div class="no-print" style="display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:16px">
      <div><div class="eyebrow">${t('poster')}</div><p style="margin:4px 0 0;color:var(--muted)">Print this and put it up in the ICT office.</p></div>
      <button class="btn" id="print">${t('print')}</button>
    </div>
    <div class="poster">
      <div class="head">ICT Field Guide</div>
      <h1>Scan before you leave.</h1>
      <canvas id="qr" aria-label="QR code for ${esc(appUrl())}"></canvas>
      <ol><li>Scan this code with your phone camera.</li><li>Tap <b>Install</b> (iPhone: Share → Add to Home Screen). Stuck? Search “install” in the app.</li><li>Every guide now opens with no network.</li></ol>
      <div class="url">${esc(appUrl())}</div>
    </div>
  </section>`;
}
async function bindPoster() {
  $('#print').addEventListener('click', () => print());
  const QR = await import('qrcode');
  QR.toCanvas($('#qr'), appUrl(), { width: 640, margin: 1, color: { dark: '#14201B', light: '#F3F1EA' }, errorCorrectionLevel: 'M' });
}

// ───────────────────────── router ─────────────────────────
let currentRoute = '';
function route() {
  if (disposeFig) { disposeFig(); disposeFig = null; }
  const hash = location.hash.replace(/^#/, '') || '/';
  const [path, qs] = hash.split('?');
  const parts = path.split('/').filter(Boolean);
  const q = new URLSearchParams(qs || '').get('q') || '';
  let html = '', bind = () => {}, r = 'home';
  switch (parts[0]) {
    case undefined: html = viewHome(); bind = bindHome; break;
    case 'search': html = viewSearch(q); bind = bindSearch; r = 'search'; break;
    case 'guides': html = viewGuides(parts[1]); bind = bindGuides; r = 'guides'; break;
    case 'g': html = viewGuide(parts[1]); bind = () => bindGuide(parts[1]); r = 'guides'; break;
    case 'figures': html = parts[1] ? viewFigure(parts[1]) : viewFigures(); bind = parts[1] ? () => bindFigure(parts[1]) : () => {}; r = 'figures'; break;
    case 'tools': html = viewTools(parts[1]); bind = bindTools; r = 'tools'; break;
    case 'ticket': html = viewTicket(); r = 'ticket'; break;
    case 'poster': html = viewPoster(); bind = bindPoster; r = 'poster'; break;
    default: html = viewHome(); bind = bindHome;
  }
  currentRoute = r;
  const main = $('#main');
  main.innerHTML = html; main.scrollTop = 0;
  $$('[data-r]').forEach((a) => (a.dataset.r === r ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  bind();
  const h1 = $('#main h1'); document.title = h1 && r !== 'home' ? `${h1.textContent} · ICT Field Guide` : 'ICT Field Guide';
}

document.addEventListener('keydown', (e) => {
  if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); location.hash = '#/search?q='; }
});
window.addEventListener('hashchange', route);
document.documentElement.lang = getLang();
renderChrome();
route();
