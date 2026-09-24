/* SMART-TALLES-CATALOG-FILTER-V6 */
(function(){
'use strict';
var BOX_ID='stCatalogFilterV4', INPUT_ID='stCatalogFilterInputV4';
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
function root(){return document.getElementById('brandCards');}
function cards(){
 var r=root(); if(!r)return [];
 var g=r.querySelector('.accessory-grid');
 return g ? Array.from(g.children) : Array.from(r.children).filter(function(e){return e&&e.nodeType===1;});
}
function style(){
 if(document.getElementById('stCatalogFilterStyleV6'))return;
 var s=document.createElement('style');s.id='stCatalogFilterStyleV6';
 s.textContent='#'+BOX_ID+'{width:100%;box-sizing:border-box;margin:16px 0 18px;padding:12px 14px;background:#f8fbfe;border:1px solid #d7e2ec;border-radius:14px;display:flex;align-items:center;gap:10px}#'+BOX_ID+' .st-search-icon{font-size:20px}#'+INPUT_ID+'{flex:1;min-width:0;border:0;outline:0;background:transparent;font-size:16px;color:#102a43;min-height:30px}.st-catalog-hidden-v6{display:none!important}#brandCards .accessory-grid>.accessory-card.st-catalog-hidden-v6{display:none!important}@media(max-width:600px){#'+INPUT_ID+'{font-size:15px}}';
 document.head.appendChild(s);
}
function box(){
 var r=root();if(!r)return;
 var existing=document.getElementById(BOX_ID); if(existing){ var oldInput=existing.querySelector('#'+INPUT_ID); if(oldInput && !oldInput.__stV6Bound){ oldInput.addEventListener('input',apply); oldInput.__stV6Bound=true; } return existing; }
 style();
 var b=document.createElement('div');b.id=BOX_ID;
 b.innerHTML='<span class="st-search-icon">🔎</span><input id="'+INPUT_ID+'" type="search" autocomplete="off" placeholder="Pesquisar no catálogo: modelo, marca, nome ou SKU..."><span class="st-filter-count"></span>';
 r.parentNode.insertBefore(b,r);
 b.querySelector('#'+INPUT_ID).addEventListener('input',apply);
 return b;
}
function apply(){
 var i=document.getElementById(INPUT_ID),b=document.getElementById(BOX_ID);if(!i||!b)return;
 var q=norm(i.value), n=0;
 cards().forEach(function(c){var show=!q||norm(c.textContent||c.innerText).indexOf(q)!==-1;c.classList.toggle('st-catalog-hidden-v6',!show);if(show)n++;});
 var c=b.querySelector('.st-filter-count');if(c)c.textContent=q?(n+' encontrado'+(n===1?'':'s')):'';
}
function refresh(){box();setTimeout(apply,0);}
function init(){style();refresh();var r=root();if(!r||r.__stV6)return;r.__stV6=true;new MutationObserver(refresh).observe(r,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();