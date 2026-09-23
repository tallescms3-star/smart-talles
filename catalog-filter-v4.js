/* SMART-TALLES-CATALOG-FILTER-V4 */
(function () {
  'use strict';

  var BOX_ID = 'stCatalogFilterV4';
  var INPUT_ID = 'stCatalogFilterInputV4';
  var STYLE_ID = 'stCatalogFilterStyleV4';
  var lastRoot = null;

  function norm(v) {
    return String(v || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function findRoot() {
    return document.getElementById('brandCards');
  }

  function addStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent =
      '#' + BOX_ID + '{width:100%;box-sizing:border-box;margin:16px 0 18px;padding:12px 14px;background:#f8fbfe;border:1px solid #d7e2ec;border-radius:14px;display:flex;align-items:center;gap:10px;box-shadow:0 2px 8px rgba(0,0,0,.04)}' +
      '#' + BOX_ID + ' .st-search-icon{font-size:20px}' +
      '#' + INPUT_ID + '{flex:1;min-width:0;border:0;outline:0;background:transparent;font-size:16px;color:#102a43;min-height:30px}' +
      '#' + INPUT_ID + '::placeholder{color:#7890a5}' +
      '#' + BOX_ID + ' .st-filter-count{font-size:12px;color:#607d94;white-space:nowrap}' +
      '.st-catalog-hidden-v4{display:none!important}' +
      '@media(max-width:600px){#' + BOX_ID + '{padding:10px 12px}#' + INPUT_ID + '{font-size:15px}#' + BOX_ID + ' .st-filter-count{display:none}}';
    document.head.appendChild(s);
  }

  function cards(root) {
    if (!root) return [];
    return Array.from(root.children).filter(function (el) {
      return el && el.nodeType === 1;
    });
  }

  function apply() {
    var root = lastRoot || findRoot();
    var input = document.getElementById(INPUT_ID);
    var box = document.getElementById(BOX_ID);
    if (!root || !input) return;

    lastRoot = root;
    var q = norm(input.value);
    var list = cards(root);
    var visible = 0;

    list.forEach(function (card) {
      var match = !q || norm(card.textContent).indexOf(q) !== -1;
      card.classList.toggle('st-catalog-hidden-v4', !match);
      if (match) visible++;
    });

    var count = box && box.querySelector('.st-filter-count');
    if (count) {
      count.textContent = q ? (visible + ' resultado' + (visible === 1 ? '' : 's')) : '';
    }
  }

  function install() {
    var root = findRoot();
    if (!root || !root.parentElement) return false;

    lastRoot = root;
    addStyle();

    var existing = document.getElementById(BOX_ID);
    if (!existing) {
      var box = document.createElement('div');
      box.id = BOX_ID;
      box.innerHTML =
        '<span class="st-search-icon">🔎</span>' +
        '<input id="' + INPUT_ID + '" type="search" autocomplete="off" ' +
        'placeholder="Pesquisar no catálogo: modelo, marca, nome ou SKU..." ' +
        'aria-label="Pesquisar no catálogo">' +
        '<span class="st-filter-count"></span>';

      root.parentElement.insertBefore(box, root);

      document.getElementById(INPUT_ID).addEventListener('input', apply);
      document.getElementById(INPUT_ID).addEventListener('search', apply);
    }

    apply();
    return true;
  }

  function boot() {
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (install() || tries >= 80) clearInterval(timer);
    }, 250);

    // O catálogo é redesenhado pelo app.js ao trocar Telas/Acessórios.
    var root = findRoot();
    if (root) {
      var observer = new MutationObserver(function () {
        setTimeout(install, 30);
      });
      observer.observe(root, { childList: true, subtree: true });
    }

    document.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.closest && (t.closest('[data-category]') || t.closest('#brandCards'))) {
        setTimeout(install, 100);
        setTimeout(apply, 250);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
