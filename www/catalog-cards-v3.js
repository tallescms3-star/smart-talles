(function(){
'use strict';

var STYLE_ID='stCatalogCardsV4Style';

function style(){
  if(document.getElementById(STYLE_ID)) return;

  var s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
    /* CORREÇÃO V4 — elimina o posicionamento antigo que estava sobrepondo
       texto e imagem dos cartões de acessórios. */

    #brandCards .accessory-grid > .accessory-card{
      position:relative !important;
      display:flex !important;
      flex-direction:column !important;
      align-items:stretch !important;
      justify-content:flex-start !important;
      box-sizing:border-box !important;
      width:auto !important;
      min-width:0 !important;
      height:auto !important;
      min-height:190px !important;
      padding:10px !important;
      gap:6px !important;
      overflow:hidden !important;
      text-align:left !important;
      float:none !important;
      transform:none !important;
      inset:auto !important;
    }

    #brandCards .accessory-grid > .accessory-card > img{
      position:static !important;
      display:block !important;
      width:100% !important;
      height:120px !important;
      min-height:120px !important;
      max-height:120px !important;
      object-fit:contain !important;
      object-position:center !important;
      margin:0 !important;
      padding:0 !important;
      box-sizing:border-box !important;
      transform:none !important;
      float:none !important;
      flex:none !important;
      order:1 !important;
    }

    #brandCards .accessory-grid > .accessory-card > .accessory-info{
      position:static !important;
      display:flex !important;
      flex-direction:column !important;
      align-items:flex-start !important;
      justify-content:flex-start !important;
      width:calc(100% - 34px) !important;
      min-width:0 !important;
      height:auto !important;
      min-height:0 !important;
      max-height:43px !important;
      margin:0 !important;
      padding:0 2px !important;
      box-sizing:border-box !important;
      overflow:hidden !important;
      transform:none !important;
      float:none !important;
      inset:auto !important;
      order:2 !important;
      gap:1px !important;
    }

    #brandCards .accessory-grid > .accessory-card > .accessory-info > b{
      display:block !important;
      position:static !important;
      width:100% !important;
      height:19px !important;
      max-height:19px !important;
      overflow:hidden !important;
      white-space:nowrap !important;
      text-overflow:ellipsis !important;
      margin:0 !important;
      padding:0 !important;
      line-height:19px !important;
      font-size:14px !important;
      font-weight:700 !important;
      transform:none !important;
    }

    #brandCards .accessory-grid > .accessory-card > .accessory-info > small{
      display:block !important;
      position:static !important;
      width:100% !important;
      height:18px !important;
      max-height:18px !important;
      overflow:hidden !important;
      white-space:nowrap !important;
      text-overflow:ellipsis !important;
      margin:0 !important;
      padding:0 !important;
      line-height:18px !important;
      font-size:12px !important;
      font-weight:600 !important;
      transform:none !important;
    }

    #brandCards .accessory-grid > .accessory-card > .brand-arrow{
      position:absolute !important;
      right:8px !important;
      bottom:8px !important;
      top:auto !important;
      left:auto !important;
      width:30px !important;
      height:30px !important;
      min-width:30px !important;
      min-height:30px !important;
      display:flex !important;
      align-items:center !important;
      justify-content:center !important;
      margin:0 !important;
      padding:0 !important;
      z-index:5 !important;
      transform:none !important;
    }

    @media (max-width:700px){
      #brandCards .accessory-grid > .accessory-card{
        min-height:180px !important;
        padding:8px !important;
      }

      #brandCards .accessory-grid > .accessory-card > img{
        height:112px !important;
        min-height:112px !important;
        max-height:112px !important;
      }

      #brandCards .accessory-grid > .accessory-card > .accessory-info > b{
        font-size:13px !important;
      }

      #brandCards .accessory-grid > .accessory-card > .accessory-info > small{
        font-size:11px !important;
      }
    }
  `;
  document.head.appendChild(s);
}

function apply(){
  var grid=document.querySelector('#brandCards .accessory-grid');
  if(!grid) return;

  Array.from(grid.children).forEach(function(card){
    if(!card || card.nodeType!==1) return;
    card.classList.add('st-accessory-card-v4');
  });
}

function init(){
  style();
  apply();

  var root=document.getElementById('brandCards');
  if(!root || root.__stCatalogCardsV4Observer) return;
  root.__stCatalogCardsV4Observer=true;

  new MutationObserver(function(){
    apply();
  }).observe(root,{childList:true,subtree:true});
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init);
}else{
  init();
}
})();