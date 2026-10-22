/* SMART-TALLES - CORRECAO DEFINITIVA FILTRO + WHATSAPP */
(function(){
'use strict';

var WA='https://wa.me/5589999447494';
var timer=null;

function isAccessories(){
  var c=document.getElementById('categorySelect');
  return c && (c.value==='Acessórios' || c.value==='Acessorios');
}

function getBrandCards(){
  return document.getElementById('brandCards');
}

function getCards(){
  var root=getBrandCards();
  if(!root) return [];
  return Array.prototype.slice.call(root.querySelectorAll('.accessory-grid > .accessory-card'));
}

function filterCards(){
  var input=document.getElementById('st-filtro-acessorios-definitivo');
  var cards=getCards();
  if(!input) return;

  var term=(input.value||'').trim().toLocaleLowerCase('pt-BR');
  var found=0;

  cards.forEach(function(card){
    var text=(card.textContent||'').toLocaleLowerCase('pt-BR');
    var ok=!term || text.indexOf(term)!==-1;
    card.style.display=ok ? 'flex' : 'none';
    if(ok) found++;
  });

  var status=document.getElementById('st-filtro-status-definitivo');
  if(status) status.textContent=term ? (found+' de '+cards.length+' acessório(s) encontrado(s).') : '';
}

function createFilter(){
  var root=getBrandCards();
  if(!root || !isAccessories()) return;

  var old=document.getElementById('st-filtro-wrap-definitivo');
  if(old) return;

  var wrap=document.createElement('div');
  wrap.id='st-filtro-wrap-definitivo';
  wrap.style.cssText='width:100%;margin:0 0 12px 0;box-sizing:border-box;display:flex;gap:8px;align-items:center;position:relative;z-index:20;';

  var input=document.createElement('input');
  input.id='st-filtro-acessorios-definitivo';
  input.type='search';
  input.placeholder='🔎 Pesquisar / filtrar acessórios...';
  input.autocomplete='off';
  input.style.cssText='flex:1;width:100%;box-sizing:border-box;padding:12px 14px;border:1px solid #d5dde5;border-radius:12px;background:#fff;font-size:15px;color:#222;outline:none;';

  var clear=document.createElement('button');
  clear.type='button';
  clear.textContent='Limpar';
  clear.style.cssText='padding:11px 13px;border:0;border-radius:10px;background:#eef5f8;color:#0b638f;font-weight:700;cursor:pointer;';

  wrap.appendChild(input);
  wrap.appendChild(clear);

  var status=document.createElement('div');
  status.id='st-filtro-status-definitivo';
  status.style.cssText='font-size:12px;color:#687580;min-height:16px;margin:0 0 10px 2px;';

  root.parentNode.insertBefore(wrap,root);
  root.parentNode.insertBefore(status,root);

  input.addEventListener('input',filterCards);
  clear.addEventListener('click',function(){
    input.value='';
    filterCards();
    input.focus();
  });
}

function removeFilter(){
  ['st-filtro-wrap-definitivo','st-filtro-status-definitivo'].forEach(function(id){
    var e=document.getElementById(id);
    if(e && e.parentNode) e.parentNode.removeChild(e);
  });
}

function refresh(){
  if(isAccessories()){
    createFilter();
    filterCards();
  }else{
    removeFilter();
  }
}

function whatsappClick(ev){
  var el=ev.target;
  while(el && el!==document.body){
    var txt=((el.innerText||el.textContent||'')+'').trim().toLocaleLowerCase('pt-BR');
    var aria=(el.getAttribute && (el.getAttribute('aria-label')||'')).toLocaleLowerCase('pt-BR');
    var href=(el.getAttribute && (el.getAttribute('href')||'')).toLowerCase();

    if(txt.indexOf('atendimento whatsapp')!==-1 ||
       txt==='whatsapp' ||
       aria.indexOf('whatsapp')!==-1 ||
       href.indexOf('wa.me')!==-1 ||
       href.indexOf('whatsapp.com')!==-1){
      ev.preventDefault();
      ev.stopPropagation();
      window.location.href=WA;
      return false;
    }
    el=el.parentElement;
  }
}

function install(){
  refresh();

  var select=document.getElementById('categorySelect');
  if(select) select.addEventListener('change',function(){
    setTimeout(refresh,50);
    setTimeout(refresh,300);
    setTimeout(refresh,800);
  });

  document.addEventListener('click',whatsappClick,true);

  var root=getBrandCards();
  if(root){
    var obs=new MutationObserver(function(){
      clearTimeout(timer);
      timer=setTimeout(function(){
        if(isAccessories()){
          createFilter();
          filterCards();
        }
      },120);
    });
    obs.observe(root,{childList:true,subtree:true});
  }

  var tries=0;
  var interval=setInterval(function(){
    tries++;
    refresh();
    if(tries>=40) clearInterval(interval);
  },250);
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',install);
}else{
  install();
}
})();
