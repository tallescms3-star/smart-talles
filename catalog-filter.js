/* SMART-TALLES-ACCESSORY-CATALOG-FILTER-SAFE-V1 */
(function () {
  'use strict';

  const MODAL_ID = 'safeAccessorySearchModal';
  const BTN_ID = 'safeAccessorySearchLauncher';

  function norm(v) {
    return String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  function injectCss() {
    if (document.getElementById('safeAccessoryCatalogFilterCss')) return;
    const s = document.createElement('style');
    s.id = 'safeAccessoryCatalogFilterCss';
    s.textContent = `
      #${BTN_ID}{margin:8px 0 12px;padding:10px 14px;border:0;border-radius:10px;cursor:pointer;font-weight:700}
      #${MODAL_ID}{position:fixed;inset:0;background:rgba(0,0,0,.62);z-index:99999;display:none;align-items:center;justify-content:center;padding:18px}
      #${MODAL_ID}.open{display:flex}
      .safe-as-box{background:#fff;color:#222;width:min(980px,96vw);max-height:88vh;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.35)}
      .safe-as-head{display:flex;gap:12px;align-items:center;padding:16px 18px;border-bottom:1px solid #ddd}
      .safe-as-head h3{margin:0;flex:1}
      .safe-as-close{border:0;background:transparent;font-size:26px;cursor:pointer}
      #safeAccessoryInput{width:100%;box-sizing:border-box;padding:13px 15px;border:1px solid #bbb;border-radius:10px;font-size:16px}
      .safe-as-results{padding:16px;overflow:auto;max-height:68vh;display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
      .safe-as-card{border:1px solid #ddd;border-radius:14px;padding:12px;background:#fff}
      .safe-as-img{height:145px;display:flex;align-items:center;justify-content:center;margin-bottom:8px}
      .safe-as-img img{max-width:100%;max-height:145px;object-fit:contain}
      .safe-as-title{font-weight:800}
      .safe-as-meta{font-size:13px;opacity:.78;margin:4px 0}
      .safe-as-price{font-weight:800;margin:8px 0}
      .safe-as-add{width:100%;padding:10px;border:0;border-radius:9px;cursor:pointer;font-weight:700}
      .safe-as-add:disabled{opacity:.5;cursor:not-allowed}
      .safe-as-empty{grid-column:1/-1;text-align:center;padding:30px 10px;opacity:.7}
      .safe-as-catalog-filter{display:flex;gap:8px;align-items:center;margin:8px 0 14px}
      #safeCatalogFilterInput{flex:1;min-width:0;padding:10px 12px;border:1px solid #bbb;border-radius:9px}
      @media(max-width:600px){.safe-as-results{grid-template-columns:1fr}.safe-as-img{height:120px}.safe-as-img img{max-height:120px}}
    `;
    document.head.appendChild(s);
  }

  function currentCategory() {
    const el = document.getElementById('categorySelect');
    return el ? el.value : '';
  }

  async function getProducts() {
    const r = await fetch('/api/products', { cache: 'no-store' });
    if (!r.ok) throw new Error('Falha ao carregar produtos');
    const data = await r.json();
    return Array.isArray(data) ? data : [];
  }

  function searchable(p) {
    return [
      p.model,p.name,p.title,p.brand,p.sku,p.category,p.compatibility,
      p.compatibilities,p.compatible,p.compatible_with,p.description
    ].map(norm).join(' ');
  }

  function matchesCategory(p, cat) {
    if (!cat) return true;
    const pc = norm(p.category || 'Telas');
    return cat === 'Acessórios' ? pc.includes('acessor') : !pc.includes('acessor');
  }

  function addToBudget(p) {
    if (typeof window.chooseProduct !== 'function') {
      alert('A função de seleção do produto não está disponível.');
      return;
    }
    window.chooseProduct(p.id);
    setTimeout(() => {
      const add = document.getElementById('add');
      if (add) add.click();
    }, 100);
  }

  function createModal() {
    if (document.getElementById(MODAL_ID)) return;
    const m = document.createElement('div');
    m.id = MODAL_ID;
    m.innerHTML = `
      <div class="safe-as-box">
        <div class="safe-as-head">
          <h3>🔎 Pesquisar catálogo</h3>
          <button class="safe-as-close" type="button" aria-label="Fechar">×</button>
        </div>
        <div style="padding:14px 16px 0">
          <input id="safeAccessoryInput" type="search" placeholder="Digite modelo, marca, SKU, compatibilidade..." autocomplete="off">
        </div>
        <div class="safe-as-results" id="safeAccessoryResults"></div>
      </div>`;
    document.body.appendChild(m);
    m.querySelector('.safe-as-close').onclick = closeModal;
    m.addEventListener('click', e => { if (e.target === m) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
    m.querySelector('#safeAccessoryInput').addEventListener('input', renderModalResults);
  }

  let cache = [];
  let catalogInput = null;

  function showModal() {
    createModal();
    const m = document.getElementById(MODAL_ID);
    m.classList.add('open');
    const i = document.getElementById('safeAccessoryInput');
    i.value = catalogInput ? catalogInput.value : '';
    i.focus();
    renderModalResults();
  }
  function closeModal() {
    const m = document.getElementById(MODAL_ID);
    if (m) m.classList.remove('open');
  }

  function renderModalResults() {
    const q = norm(document.getElementById('safeAccessoryInput')?.value);
    const cat = currentCategory();
    const list = cache.filter(p => matchesCategory(p, cat) && (!q || searchable(p).includes(q))).slice(0,100);
    const box = document.getElementById('safeAccessoryResults');
    if (!box) return;
    if (!list.length) {
      box.innerHTML = '<div class="safe-as-empty">Nenhum produto encontrado.</div>';
      return;
    }
    box.innerHTML = list.map(p => {
      const img = p.image || p.imageUrl || '';
      const title = p.model || p.name || p.title || 'Produto';
      const brand = p.brand ? `<div class="safe-as-meta">${esc(p.brand)}</div>` : '';
      const sku = p.sku ? `<div class="safe-as-meta">SKU: ${esc(p.sku)}</div>` : '';
      const price = Number(p.price || 0);
      return `<div class="safe-as-card">
        <div class="safe-as-img">${img ? `<img src="${escAttr(img)}" alt="${escAttr(title)}">` : '<span>Sem imagem</span>'}</div>
        <div class="safe-as-title">${esc(title)}</div>${brand}${sku}
        <div class="safe-as-price">${price > 0 ? 'R$ ' + price.toFixed(2).replace('.', ',') : 'Preço não informado'}</div>
        <button class="safe-as-add" type="button" data-id="${escAttr(p.id)}" ${price <= 0 ? 'disabled' : ''}>＋ Adicionar ao orçamento</button>
      </div>`;
    }).join('');
    box.querySelectorAll('.safe-as-add').forEach(b => b.onclick = () => {
      const p = cache.find(x => String(x.id) === String(b.dataset.id));
      if (p) { addToBudget(p); closeModal(); }
    });
  }

  function esc(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function escAttr(v) { return esc(v); }

  function findBrandField() {
    return document.getElementById('brand') || document.querySelector('#brandCards')?.parentElement;
  }

  function ensureLauncher() {
    const cat = currentCategory();
    let btn = document.getElementById(BTN_ID);
    if (!btn) {
      btn = document.createElement('button');
      btn.id = BTN_ID;
      btn.type = 'button';
      btn.textContent = '🔎 Pesquisar / Filtrar catálogo';
      btn.onclick = async () => {
        try {
          cache = await getProducts();
          showModal();
        } catch (e) {
          alert('Não foi possível carregar o catálogo.');
        }
      };
      const anchor = findBrandField();
      if (anchor && anchor.parentElement) anchor.parentElement.insertBefore(btn, anchor.nextSibling);
      else document.querySelector('main')?.prepend(btn);
    }
    btn.style.display = cat ? 'inline-block' : 'none';
    btn.textContent = cat === 'Acessórios' ? '🔎 Pesquisar acessórios' : '🔎 Pesquisar / Filtrar catálogo';
  }

  function installCatalogFilter() {
    // Non-destructive: adds a separate live filter above brand cards/catalog.
    if (document.getElementById('safeCatalogFilter')) return;
    const cards = document.getElementById('brandCards');
    if (!cards || !cards.parentElement) return;
    const wrap = document.createElement('div');
    wrap.id = 'safeCatalogFilter';
    wrap.className = 'safe-as-catalog-filter';
    wrap.innerHTML = `<span>🔎</span><input id="safeCatalogFilterInput" type="search" placeholder="Filtrar catálogo por modelo, marca, SKU ou compatibilidade..." autocomplete="off">`;
    cards.parentElement.insertBefore(wrap, cards);
    catalogInput = wrap.querySelector('input');
    catalogInput.addEventListener('input', applyCatalogFilter);
  }

  async function applyCatalogFilter() {
    if (!cache.length) {
      try { cache = await getProducts(); } catch(e) { return; }
    }
    const q = norm(catalogInput?.value);
    const cat = currentCategory();
    const filtered = cache.filter(p => matchesCategory(p, cat) && (!q || searchable(p).includes(q)));
    // Prefer existing renderer when available; otherwise hide/show cards by searchable text.
    if (typeof window.renderBrandCards === 'function' && q) {
      // Current app renderer is not exposed as window in normal script scope, so fallback below.
    }
    const cards = document.querySelectorAll('#brandCards > *');
    if (!q) {
      cards.forEach(c => c.style.display = '');
      return;
    }
    const ids = new Set(filtered.map(p => String(p.id)));
    cards.forEach(c => {
      const id = c.dataset?.id || c.getAttribute('data-id');
      const text = norm(c.textContent);
      c.style.display = (id && ids.has(String(id))) || filtered.some(p => text.includes(norm(p.model || p.name || '___'))) ? '' : 'none';
    });
  }

  function watch() {
    injectCss();
    ensureLauncher();
    installCatalogFilter();
    const cat = document.getElementById('categorySelect');
    if (cat && !cat.dataset.safeCatalogBound) {
      cat.dataset.safeCatalogBound = '1';
      cat.addEventListener('change', () => {
        ensureLauncher();
        if (catalogInput) catalogInput.value = '';
        setTimeout(applyCatalogFilter, 150);
      });
    }
    setTimeout(() => { ensureLauncher(); installCatalogFilter(); }, 500);
    setTimeout(() => { ensureLauncher(); installCatalogFilter(); }, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch);
  else watch();
  window.addEventListener('load', watch);
})();
