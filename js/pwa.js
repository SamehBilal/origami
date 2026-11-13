/* The site as an app (same approach as the Ahmed Khaled Tawfik site): registers sw.js, runs the
   header's install button (or shows the steps on iPhone/iPad), and uses Notify() to say when the
   app is installed, when the connection drops or comes back, when it is ready offline, and when a
   new version is ready. After a few minutes of folding it invites you to install the app. */
(function () {
  'use strict';
  var Notify = window.Notify || function () { return { dismiss: function () {}, el: document.createElement('div') }; };
  var html = document.documentElement;
  var standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var deferred = null;
  var installBtn = document.getElementById('installBtn');
  if (standalone) html.classList.add('is-app');

  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, String(v)); } catch (e) { return null; }
  }

  /* ---------- install ---------- */
  function canOffer() { return !standalone && !!(deferred || ios); }
  function syncButton() { if (installBtn) installBtn.hidden = !canOffer(); }

  function install() {
    if (deferred) {
      deferred.prompt();
      deferred.userChoice.then(function () { deferred = null; syncButton(); });
      return;
    }
    if (ios) {
      Notify('In Safari, tap Share <b>⎋</b>, then “Add to Home Screen”.',
        { title: 'Install Origami Folds', html: true, ttl: 9000 });
    }
  }
  if (installBtn) installBtn.addEventListener('click', install);

  window.addEventListener('beforeinstallprompt', function (ev) { ev.preventDefault(); deferred = ev; syncButton(); });

  /* Chrome on a phone fires appinstalled when the install is accepted (while it is still being added)
     and often again once it is there; tell the user once, when it is really done. */
  var installing = null, wait = 0, told = false;
  var mobile = /android|mobi/i.test(navigator.userAgent);
  function installed() {
    if (told) return;
    told = true; clearTimeout(wait);
    if (installing && installing.dismiss) installing.dismiss();
    Notify('Origami Folds is on your home screen now. Fold anywhere — even offline.', { type: 'success', title: 'Installed' });
  }
  window.addEventListener('appinstalled', function () {
    deferred = null; standalone = true; syncButton();
    if (told) return;
    if (!mobile || installing) return installed();
    installing = Notify('Adding Origami Folds to your home screen… a moment.', { ttl: 10000 });
    wait = setTimeout(installed, 10000);
  });
  syncButton();

  /* ---------- connection ---------- */
  window.addEventListener('offline', function () {
    Notify('You’re offline. Every model and diagram still works.', { type: 'warning', title: 'Offline', ttl: 6000 });
  });
  window.addEventListener('online', function () {
    Notify('Back online.', { type: 'success', ttl: 2500 });
  });

  /* ---------- after a while: invite to install ----------
     Time spent with the app in view adds up across visits; after three minutes a note offers to
     install it. "Later" (or closing it) puts it off for two weeks. Never shown in the installed app. */
  var INVITE_AFTER = 3 * 60 * 1000, INVITE_PAUSE = 14 * 864e5;
  var invited = false;
  function invite() {
    if (invited || standalone || !canOffer() || document.visibilityState !== 'visible') return;
    if (Date.now() - (+store('origami-invite-off') || 0) < INVITE_PAUSE) return;
    invited = true;
    var n = Notify(
      'Install Origami Folds to open it in one tap and fold without the internet.' +
      '<span class="ns-actions">' +
        '<button type="button" class="ns-action" data-do="install">Install the app</button>' +
        '<button type="button" class="ns-action ns-later" data-do="later">Later</button>' +
      '</span>',
      { title: 'Take your folds with you', html: true, ttl: 0 });
    n.el.addEventListener('click', function (ev) {
      if (ev.target.closest('.ns-close')) { store('origami-invite-off', Date.now()); return; }
      var b = ev.target.closest('[data-do]');
      if (!b) return;
      store('origami-invite-off', Date.now());
      n.dismiss();
      if (b.getAttribute('data-do') === 'install') install();
    });
  }
  if (!standalone) {
    var tick = 15000;
    setInterval(function () {
      if (document.visibilityState !== 'visible' || invited) return;
      var t = (+store('origami-browse-ms') || 0) + tick;
      store('origami-browse-ms', t);
      if (t >= INVITE_AFTER) invite();
    }, tick);
  }

  /* ---------- service worker: offline ready + updates ---------- */
  /* (?shot = tools/build-images.js taking the manifest screenshots: no worker, no notes) */
  if (!('serviceWorker' in navigator) || location.protocol === 'file:' || /[?&]shot\b/.test(location.search)) return;
  var reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', function () { if (reloading) location.reload(); });

  function offerUpdate(worker) {
    var n = Notify('A newer version of Origami Folds is ready. <span class="ns-actions"><button type="button" class="ns-action">Update now</button></span>',
      { title: 'Update', html: true, ttl: 0 });
    var btn = n.el.querySelector('.ns-action');
    if (btn) btn.addEventListener('click', function () { reloading = true; worker.postMessage('skipWaiting'); n.dismiss(); });
  }

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js', { scope: './' }).then(function (reg) {
      if (reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg.waiting);
      reg.addEventListener('updatefound', function () {
        var w = reg.installing;
        if (!w) return;
        w.addEventListener('statechange', function () {
          if (w.state !== 'installed') return;
          if (navigator.serviceWorker.controller) offerUpdate(w);           /* an update */
          else if (!store('origami-offline-told')) {                         /* the first install */
            store('origami-offline-told', 1);
            Notify('Every model is saved on this device — it works offline now.', { type: 'success', title: 'Ready offline' });
          }
        });
      });
      /* look for a new version when the app comes back to the front */
      document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') reg.update().catch(function () {}); });
    }).catch(function () {});
  });
})();
