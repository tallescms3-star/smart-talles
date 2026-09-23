/* SMART-TALLES-CATALOG-FILTER-SAFE-V2 */
(function(){
  'use strict';
  const WRAP_ID='smartTallesCatalogFilterV2';
  const INPUT_ID='smartTallesCatalogFilterInputV2';
  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  let input=null, observer=null;

  function css(){
    if(document.getElementById('smartTallesCatalogFilterCssV2')) return;
    const s=document.createElement('style'); s.id='smartTallesCatalogFilterCssV2';
    s.textContent=`
      #${WRAP_ID}{display:flex!important;align-items:center;gap:10px;width:100%;box-sizing:border-box;margin:14px 0 16px;padding:12px 14px;border:1px solid rgba(0,0,0,.12);border-radius:12px;background:#fff;box-shadow:0 3px 12px rgba(0,0,0,.08);position:relative;z-index:20}
      #${WRAP_ID} .stcf-icon{font-size:21px;line-height:1}
      #${INPUT_ID}{display:block!important;flex:1;min-width:0;border:1px solid #b8b8b8;border-radius:9px;padding:11px 13px;font-size:16px;outline:none;background:#fff;color:#222}
      #${INPUT_ID}:focus{border-color:#777;box-shadow:0 0 0 2px rgba(0,0,0,.08)}
      #${WRAP_ID} .stcf-count{font-size:12px;white-space:nowrap;opacity:.7}
      @media(max-width:600px){#${WRAP_ID}{padding:10px}.stcf-count{display:none}#${INPUT_ID}{font-size:15px}}
      .stcf-hidden{display:none!important}
    `; document.head.appendChild(s);
  }

  function getCards(){
    const box=document.getElementById('brandCards');
    if(!box) return [];
    return Array.from(box.children);
  }

  function apply(){
    const q=norm(input?.value);
    const cards=getCards();
    let shown=0;
    cards.forEach(card=>{
      const text=norm(card.textContent||'');
      const ok=!q || text.includes(q);
      card.classList.toggle('stcf-hidden',!ok);
      if(ok) shown++;
    });
    const count=document.getElementById('smartTallesCatalogFilterCountV2');
    if(count) count.textContent=q ? `${shown} encontrado${shown===1?'':'s'}` : `${cards.length} produto${cards.length===1?'':'s'}`;
  }

  function ensure(){
    css();
    const cards=document.getElementById('brandCards');
    if(!cards || !cards.parentElement) return false;
    let wrap=document.getElementById(WRAP_ID);
    if(!wrap){
      wrap=document.createElement('div'); wrap.id=WRAP_ID;
      wrap.innerHTML='<span class="stcf-icon">🔎</span><input id="'+INPUT_ID+'" type="search" placeholder="Pesquisar no catálogo: modelo, marca ou nome..." autocomplete="off" aria-label="Pesquisar no catálogo"><span id="smartTallesCatalogFilterCountV2" class="stcf-count"></span>';
      cards.parentElement.insertBefore(wrap,cards);
      input=wrap.querySelector('#'+INPUT_ID);
      input.addEventListener('input',apply);
    } else input=wrap.querySelector('#'+INPUT_ID);
    apply();
    return true;
  }

  function start(){
    if(observer) observer.disconnect();
    observer=new MutationObserver(()=>{ if(!document.getElementById(WRAP_ID)) ensure(); else apply(); });
    observer.observe(document.body,{childList:true,subtree:true});
    ensure();
    setTimeout(ensure,300); setTimeout(ensure,1000); setTimeout(ensure,2000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
