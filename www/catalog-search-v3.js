/* SMART-TALLES-CATALOG-SEARCH-V3 */
(function () {
  'use strict';

  var INPUT_ID = 'stCatalogSearchV3';
  var BOX_ID = 'stCatalogSearchBoxV3';
  var cardsRoot = null;
  var observer = null;

  function norm(v) {
    return String(v || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function findCardsRoot() {
    return document.getElementById('brandCards') ||
           document.querySelector('[id*="brandCards"]');
  }

  function ensureStyles() {
    if (document.getElementById('stCatalogSearchStyleV3')) return;
    var s = document.createElement('style');
    s.id = 'stCatalogSearchStyleV3';
    s.textContent = `
      #${BOX_ID} {
        width:100%; box-sizing:border-box; margin:14px 0 18px;
        padding:12px 14px; border:1px solid #d7e2ec; border-radius:14px;
        background:#f8fbfe; display:flex; align-items:center; gap:10px;
        box-shadow:0 2px 8px rgba(0,0,0,.04);
      }
      #${BOX_ID} .st-search-icon {font-size:20px; flex:0 0 auto}
      #${INPUT_ID} {
        width:100%; border:0; outline:0; background:transparent;
        font-size:16px; color:#102a43; min-height:30px;
      }
      #${INPUT_ID}::placeholder {color:#7890a5}
      #${BOX_ID} .st-count {
        font-size:12px; color:#607d94; white-space:nowrap;
      }
      .st-search-hidden-v3 { display:none !important; }
      @media(max-width:600px){
        #${BOX_ID}{padding:10px 12px}
        #${INPUT_ID}{font-size:15px}
        #${BOX_ID} .st-count{display:none}
      }
    `;
    document.head.appendChild(s);
  }

  function getCardElements(root) {
    var all = Array.from(root.children);
    if (all.length) return all;
    return Array.from(root.querySelectorAll(':scope > *'));
  }

  function applyFilter() {
    var root = cardsRoot || findCardsRoot();
    var input = document.getElementById(INPUT_ID);
    var box = document.getElementById(BOX_ID);
    if (!root || !input) return;
    cardsRoot = root;

    var q = norm(input.value);
    var cards = getCardElements(root);
    var visible = 0;

    cards.forEach(function(card) {
      if (!card || card.id === BOX_ID) return;
      var text = norm(card.textContent || '');
      var match = !q || text.indexOf(q) !== -1;
      card.classList.toggle('st-search-hidden-v3', !match);
      if (match) visible++;
    });

    var count = box && box.querySelector('.st-count');
    if (count) {
      count.textContent = q ? (visible + ' resultado' + (visible === 1 ? '' : 's')) : '';
    }
  }

  function installBox() {
    var root = findCardsRoot();
    if (!root || !root.parentElement) return false;

    cardsRoot = root;
    ensureStyles();

    if (document.getElementById(BOX_ID)) {
      applyFilter();
      return true;
    }

    var box = document.createElement('div');
    box.id = BOX_ID;
    box.innerHTML =
      '<span class="st-search-icon">🔎</span>' +
      '<input id="' + INPUT_ID + '" type="search" autocomplete="off" ' +
      'placeholder="Pesquisar no catálogo: modelo, marca, nome ou SKU..." ' +
      'aria-label="Pesquisar no catálogo">' +
      '<span class="st-count"></span>';

    root.parentElement.insertBefore(box, root);

    var input = document.getElementById(INPUT_ID);
    input.addEventListener('input', applyFilter);
    input.addEventListener('search', applyFilter);

    if (observer) observer.disconnect();
    observer = new MutationObserver(function () {
      window.requestAnimationFrame(applyFilter);
    });
    observer.observe(root, { childList:true, subtree:true });

    applyFilter();
    return true;
  }

  function boot() {
    var tries = 0;
    var timer = setInterval(function() {
      tries++;
      if (installBox() || tries >= 60) clearInterval(timer);
    }, 250);

    // Reinstala se o catálogo trocar o conteúdo/estrutura.
    document.addEventListener('change', function(e) {
      if (e.target && (e.target.id === 'categorySelect' || e.target.id === 'brand' || e.target.id === 'model')) {
        setTimeout(installBox, 100);
        setTimeout(applyFilter, 250);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
