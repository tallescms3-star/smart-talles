/* SMART-TALLES-CATALOG-FILTER-V5 */
(function () {
  'use strict';

  var BOX_ID = 'stCatalogFilterV4';
  var INPUT_ID = 'stCatalogFilterInputV4';
  var STYLE_ID = 'stCatalogFilterStyleV5';
  var observer = null;

  function norm(v) {
    return String(v || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function root() { return document.getElementById('brandCards'); }

  function getCards() {
    var r = root();
    if (!r) return [];
    var grid = r.querySelector('.accessory-grid');
    if (grid) return Array.from(grid.children);
    return Array.from(r.children);
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
      '.st-catalog-hidden-v5{display:none!important}' +
      '@media(max-width:600px){#' + BOX_ID + '{padding:10px 12px}#' + INPUT_ID + '{font-size:15px}#' + BOX_ID + ' .st-filter-count{display:none}}';
    document.head.appendChild(s);
  }

  function apply() {
    var input = document.getElementById(INPUT_ID);
    var box = document.getElementById(BOX_ID);
    if (!input) return;

    var q = norm(input.value);
    var list = getCards();
    var visible = 0;

    list.forEach(function (card) {
      if (!card || card.id === BOX_ID) return;
      var match = !q || norm(card.textContent).indexOf(q) !== -1;
      card.classList.toggle('st-catalog-hidden-v5', !match);
      if (match) visible++;
    });

    var count = box && box.querySelector('.st-filter-count');
    if (count) {
      count.textContent = q ? (visible + ' resultado' + (visible === 1 ? '' : 's')) : '';
    }
  }

  function install() {
    var r = root();
    if (!r || !r.parentElement) return false;

    addStyle();

    if (!document.getElementById(BOX_ID)) {
      var box = document.createElement('div');
      box.id = BOX_ID;
      box.innerHTML =
        '<span class="st-search-icon">🔎</span>' +
        '<input id="' + INPUT_ID + '" type="search" autocomplete="off" ' +
        'placeholder="Pesquisar no catálogo: modelo, marca, nome ou SKU..." ' +
        'aria-label="Pesquisar no catálogo">' +
        '<span class="st-filter-count"></span>';

      r.parentElement.insertBefore(box, r);

      var input = document.getElementById(INPUT_ID);
      input.addEventListener('input', apply);
      input.addEventListener('search', apply);
    }

    if (observer) observer.disconnect();
    observer = new MutationObserver(function () {
      window.requestAnimationFrame(apply);
    });
    observer.observe(r, {childList:true, subtree:true});

    apply();
    return true;
  }

  function boot() {
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (install() || tries >= 80) clearInterval(timer);
    }, 250);

    document.addEventListener('change', function (e) {
      if (e.target && (e.target.id === 'categorySelect' || e.target.id === 'brand' || e.target.id === 'model')) {
        setTimeout(install, 80);
        setTimeout(apply, 180);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
