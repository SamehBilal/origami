(function () {
  'use strict';

  const { models, legend } = window.ORIGAMI;
  const app = document.getElementById('app');
  const LEVELS = { easy: 'Easy', medium: 'Intermediate', hard: 'Advanced' };
  const STORE_KEY = 'origami-made';

  // ---------- storage (never required for the app to work) ----------
  function getMade() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }
  function setMade(id, value) {
    const made = getMade();
    if (value) made[id] = true; else delete made[id];
    try { localStorage.setItem(STORE_KEY, JSON.stringify(made)); } catch (e) { /* ignore */ }
  }

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const diagram = (inner, label) =>
    `<svg class="dg" viewBox="0 0 200 200" role="img" aria-label="${esc(label)}">${inner}</svg>`;

  // ---------- legend ----------
  const legendEl = document.getElementById('legend');
  const legendBtn = document.getElementById('legendBtn');
  legendEl.innerHTML = legend.map((l) =>
    `<div class="legend-item"><svg class="dg" viewBox="0 0 56 28" aria-hidden="true">${l.svg}</svg><span>${esc(l.label)}</span></div>`
  ).join('');
  legendBtn.addEventListener('click', () => {
    const open = legendEl.hidden;
    legendEl.hidden = !open;
    legendBtn.setAttribute('aria-expanded', String(open));
  });

  // ---------- home ----------
  let filter = 'all';

  function renderHome() {
    document.title = 'Origami Folds';
    const made = getMade();
    const list = models.filter((m) => filter === 'all' || m.level === filter);
    const chips = [['all', 'All models'], ['easy', 'Easy'], ['medium', 'Intermediate']]
      .map(([k, label]) => `<button class="chip" type="button" data-filter="${k}" aria-pressed="${filter === k}">${label}</button>`)
      .join('');

    app.innerHTML = `
      <p class="intro">Pick a model and follow the diagrams one fold at a time. Every step shows where to crease and which way the paper moves.</p>
      <div class="filters" role="group" aria-label="Filter by difficulty">${chips}</div>
      <ul class="grid">
        ${list.map((m) => {
          const final = m.steps[m.steps.length - 1];
          return `<li><a class="card panel" href="#/model/${m.id}/1">
            <div class="card-art">${diagram(final.svg, 'Finished ' + m.name)}${made[m.id] ? '<span class="made-flag">Made ✓</span>' : ''}</div>
            <div class="card-body">
              <h2>${esc(m.name)}</h2>
              <p>${esc(m.blurb)}</p>
              <div class="meta"><span class="badge ${m.level}">${LEVELS[m.level]}</span><span>${m.steps.length} steps</span><span>· ${esc(m.paper)}</span></div>
            </div>
          </a></li>`;
        }).join('')}
      </ul>`;

    app.querySelectorAll('[data-filter]').forEach((b) =>
      b.addEventListener('click', () => { filter = b.dataset.filter; renderHome(); }));
  }

  // ---------- model / step viewer ----------
  let current = null; // { model, index }

  function renderModel(model, index) {
    const total = model.steps.length;
    index = Math.max(0, Math.min(total - 1, index));
    const sameModel = current && current.model === model;
    current = { model, index };
    const step = model.steps[index];
    const isLast = index === total - 1;
    const made = getMade()[model.id];
    document.title = `${model.name} — step ${index + 1} · Origami Folds`;

    app.innerHTML = `
      <div class="model-top">
        <a class="btn ghost" href="#/">← All models</a>
        <h1>${esc(model.name)}</h1>
        <span class="badge ${model.level}">${LEVELS[model.level]}</span>
      </div>
      <div class="viewer">
        <div class="stage" id="stage">
          <span class="step-num" aria-hidden="true">${index + 1}</span>
          <div class="fade-in">${diagram(step.svg, `Step ${index + 1}: ${step.text}`)}</div>
        </div>
        <section class="instructions panel" aria-live="polite">
          <p class="counter">Step ${index + 1} of ${total}</p>
          <h2>${esc(step.title)}</h2>
          <p class="text">${esc(step.text)}</p>
          ${step.tip ? `<p class="tip"><strong>Tip:</strong> ${esc(step.tip)}</p>` : ''}
          <ol class="dots" aria-label="Steps">
            ${model.steps.map((s, i) => `<li><button type="button" data-step="${i}" class="${i < index ? 'done' : ''}" ${i === index ? 'aria-current="step"' : ''} aria-label="Step ${i + 1}: ${esc(s.title)}">${i + 1}</button></li>`).join('')}
          </ol>
          ${isLast ? `<div class="done-box">
              <p>🎉 You folded a ${esc(model.name.toLowerCase())}!</p>
              <button type="button" class="btn ${made ? 'ghost' : ''}" id="madeBtn">${made ? 'Marked as made ✓' : 'I made it!'}</button>
            </div>` : ''}
          <div class="nav-buttons" style="margin-top:14px">
            <button type="button" class="btn ghost" id="prevBtn" ${index === 0 ? 'disabled' : ''}>← Back</button>
            ${isLast
              ? '<a class="btn" href="#/">More models →</a>'
              : '<button type="button" class="btn" id="nextBtn">Next →</button>'}
          </div>
        </section>
      </div>
      <section class="overview">
        <h2>All steps</h2>
        <ol>
          ${model.steps.map((s, i) => `<li><button type="button" data-step="${i}" ${i === index ? 'aria-current="step"' : ''}>${diagram(s.svg, `Step ${i + 1}`)}<span>${i + 1}. ${esc(s.title)}</span></button></li>`).join('')}
        </ol>
      </section>`;

    const go = (i) => { location.hash = `#/model/${model.id}/${i + 1}`; };
    app.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => go(+b.dataset.step)));
    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');
    if (prev) prev.addEventListener('click', () => go(index - 1));
    if (next) next.addEventListener('click', () => go(index + 1));
    const madeBtn = document.getElementById('madeBtn');
    if (madeBtn) madeBtn.addEventListener('click', () => {
      setMade(model.id, !getMade()[model.id]);
      renderModel(model, index);
      if (getMade()[model.id]) toast('Nice work! Saved to your collection.');
    });

    // Swipe between steps on touch screens.
    const stage = document.getElementById('stage');
    let sx = null, sy = null;
    stage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      sx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0 && index < total - 1) go(index + 1);
        if (dx > 0 && index > 0) go(index - 1);
      }
    });

    if (!sameModel) window.scrollTo(0, 0);
  }

  // ---------- routing ----------
  function route() {
    const m = location.hash.match(/^#\/model\/([\w-]+)(?:\/(\d+))?/);
    if (m) {
      const model = models.find((x) => x.id === m[1]);
      if (model) { renderModel(model, (parseInt(m[2], 10) || 1) - 1); return; }
    }
    current = null;
    renderHome();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  document.addEventListener('keydown', (e) => {
    if (!current || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest && e.target.closest('input, textarea')) return;
    const { model, index } = current;
    if (e.key === 'ArrowRight' && index < model.steps.length - 1) location.hash = `#/model/${model.id}/${index + 2}`;
    if (e.key === 'ArrowLeft' && index > 0) location.hash = `#/model/${model.id}/${index}`;
    if (e.key === 'Escape') location.hash = '#/';
  });

  // ---------- toast ----------
  let toastTimer;
  function toast(msg) {
    let el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.remove(), 2600);
  }

  // ---------- PWA: install + offline ----------
  const installBtn = document.getElementById('installBtn');
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.hidden = false;
  });
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.hidden = true;
  });
  window.addEventListener('appinstalled', () => { installBtn.hidden = true; toast('Installed! Fold anywhere, even offline.'); });

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  route();
})();
