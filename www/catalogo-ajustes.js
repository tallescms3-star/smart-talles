/* SMART-TALLES - CATALOGO LIMPO FINAL
   Responsabilidades:
   - Acessórios como categoria inicial
   - Visual dos cartões
   - NÃO cria filtro
   - NÃO altera WhatsApp
*/
(function(){
'use strict';

function setAcessorios(){
  var c=document.getElementById('categorySelect');
  if(!c) return false;
  if(c.value!=='Acessórios'){
    if(typeof window.setCategory==='function') window.setCategory('Acessórios');
    else {
      c.value='Acessórios';
      c.dispatchEvent(new Event('change',{bubbles:true}));
    }
  }
  return true;
}

function visual(){
  if(document.getElementById('st-catalogo-limpo-css')) return;
  var s=document.createElement('style');
  s.id='st-catalogo-limpo-css';
  s.textContent=`
#brandCards .accessory-grid{align-items:start!important}
#brandCards .accessory-grid>.accessory-card{
 position:relative!important;display:flex!important;flex-direction:column!important;
 align-items:stretch!important;justify-content:flex-start!important;box-sizing:border-box!important;
 min-width:0!important;min-height:235px!important;height:auto!important;padding:10px!important;
 gap:7px!important;overflow:hidden!important;text-align:left!important;float:none!important;transform:none!important
}
#brandCards .accessory-grid>.accessory-card>img{
 position:static!important;display:block!important;width:100%!important;height:158px!important;
 min-height:158px!important;max-height:158px!important;object-fit:contain!important;
 object-position:center!important;margin:0!important;padding:0!important;box-sizing:border-box!important;
 flex:none!important;order:1!important
}
#brandCards .accessory-grid>.accessory-card>.accessory-info{
 position:static!important;display:flex!important;flex-direction:column!important;
 align-items:flex-start!important;width:calc(100% - 40px)!important;min-width:0!important;
 height:40px!important;max-height:40px!important;margin:0!important;padding:0 2px!important;
 box-sizing:border-box!important;overflow:hidden!important;order:2!important;gap:1px!important
}
#brandCards .accessory-grid>.accessory-card>.accessory-info>b{
 display:-webkit-box!important;width:100%!important;height:38px!important;max-height:38px!important;
 overflow:hidden!important;-webkit-box-orient:vertical!important;-webkit-line-clamp:2!important;
 white-space:normal!important;margin:0!important;padding:0!important;line-height:19px!important;
 font-size:14px!important;font-weight:700!important
}
#brandCards .accessory-grid>.accessory-card>.accessory-info>small{display:none!important}
#brandCards .accessory-grid>.accessory-card>.brand-arrow{
 position:absolute!important;right:8px!important;bottom:8px!important;top:auto!important;left:auto!important;
 width:30px!important;height:30px!important;min-width:30px!important;min-height:30px!important;
 display:flex!important;align-items:center!important;justify-content:center!important;margin:0!important;
 padding:0!important;z-index:5!important
}
@media(max-width:700px){
 #brandCards .accessory-grid>.accessory-card{min-height:215px!important;padding:8px!important}
 #brandCards .accessory-grid>.accessory-card>img{height:145px!important;min-height:145px!important;max-height:145px!important}
 #brandCards .accessory-grid>.accessory-card>.accessory-info>b{font-size:13px!important;line-height:18px!important;height:36px!important;max-height:36px!important}
 #brandCards .accessory-grid>.accessory-card>.accessory-info{height:38px!important;max-height:38px!important}
}`;
  document.head.appendChild(s);
}

function init(){
  visual();
  if(!setAcessorios()){
    var n=0,t=setInterval(function(){
      n++;
      if(setAcessorios()||n>=50) clearInterval(t);
    },100);
  }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
else init();
})();