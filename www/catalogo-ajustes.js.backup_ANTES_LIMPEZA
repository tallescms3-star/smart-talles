/* SMART-TALLES-CATALOGO-AJUSTES-V1 */
(function(){
  'use strict';

  function aplicarCategoriaPadrao(){
    if (typeof window.setCategory === 'function') {
      window.setCategory('Acessórios');
      return true;
    }
    return false;
  }

  // O app.js carrega os produtos de forma assíncrona. Tentamos logo no início
  // e novamente até a função setCategory estar disponível.
  if (!aplicarCategoriaPadrao()) {
    var tentativas = 0;
    var timer = setInterval(function(){
      tentativas++;
      if (aplicarCategoriaPadrao() || tentativas >= 40) clearInterval(timer);
    }, 100);
  }

  // Aumenta apenas as imagens dos cards de acessórios do catálogo.
  var css = document.createElement('style');
  css.id = 'st-catalogo-ajustes-v1-css';
  css.textContent = `
    #brandCards .accessory-card img {
      width: 150px !important;
      height: 150px !important;
      max-width: 150px !important;
      max-height: 150px !important;
      object-fit: contain !important;
    }

    @media (max-width: 700px) {
      #brandCards .accessory-card img {
        width: 135px !important;
        height: 135px !important;
        max-width: 135px !important;
        max-height: 135px !important;
      }
    }
  `;
  document.head.appendChild(css);
})();
