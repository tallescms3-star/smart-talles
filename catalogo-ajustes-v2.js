/* SMART-TALLES-CATALOGO-AJUSTES-V2 */
(function(){
  'use strict';

  function aplicarCategoriaPadrao(){
    if (typeof window.setCategory === 'function') {
      window.setCategory('Acessórios');
      return true;
    }
    return false;
  }

  // Mantém Acessórios como categoria padrão.
  if (!aplicarCategoriaPadrao()) {
    var tentativas = 0;
    var timer = setInterval(function(){
      tentativas++;
      if (aplicarCategoriaPadrao() || tentativas >= 40) clearInterval(timer);
    }, 100);
  }

  // Ajuste visual dos cards: imagem maior, conteúdo abaixo da imagem,
  // sem sobreposição de nome/preço e botão + sempre dentro do card.
  var css = document.createElement('style');
  css.id = 'st-catalogo-ajustes-v2-css';
  css.textContent = `
    #brandCards .accessory-card {
      position: relative !important;
      box-sizing: border-box !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: flex-start !important;
      gap: 0 !important;
      min-height: 350px !important;
      height: auto !important;
      padding: 16px 14px 58px !important;
      overflow: hidden !important;
    }

    #brandCards .accessory-card img {
      display: block !important;
      flex: 0 0 auto !important;
      width: 170px !important;
      height: 170px !important;
      max-width: 170px !important;
      max-height: 170px !important;
      object-fit: contain !important;
      margin: 0 auto 12px !important;
      position: relative !important;
      z-index: 1 !important;
    }

    #brandCards .accessory-card .accessory-info {
      position: relative !important;
      z-index: 2 !important;
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      box-sizing: border-box !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: flex-start !important;
      gap: 5px !important;
      margin: 0 !important;
      padding: 0 4px !important;
      text-align: center !important;
      line-height: 1.25 !important;
    }

    #brandCards .accessory-card .accessory-info b,
    #brandCards .accessory-card .accessory-info small {
      display: block !important;
      position: static !important;
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow-wrap: anywhere !important;
      word-break: normal !important;
      white-space: normal !important;
      text-align: center !important;
    }

    #brandCards .accessory-card .accessory-info b {
      font-size: 15px !important;
      line-height: 1.25 !important;
    }

    #brandCards .accessory-card .accessory-info small {
      font-size: 14px !important;
      line-height: 1.25 !important;
    }

    #brandCards .accessory-card .brand-arrow {
      position: absolute !important;
      right: 12px !important;
      bottom: 12px !important;
      z-index: 4 !important;
      margin: 0 !important;
    }

    @media (max-width: 700px) {
      #brandCards .accessory-card {
        min-height: 325px !important;
        padding: 14px 10px 54px !important;
      }

      #brandCards .accessory-card img {
        width: 145px !important;
        height: 145px !important;
        max-width: 145px !important;
        max-height: 145px !important;
        margin-bottom: 10px !important;
      }

      #brandCards .accessory-card .accessory-info b {
        font-size: 14px !important;
      }

      #brandCards .accessory-card .accessory-info small {
        font-size: 13px !important;
      }
    }
  `;
  document.head.appendChild(css);
})();
