/* SMART-TALLES - CORREÇÃO VISUAL DOS CARDS DE ACESSÓRIOS V2 */
(function () {
  'use strict';
  function aplicar() {
    if (document.getElementById('st-cards-acessorios-v2-style')) return;
    var style = document.createElement('style');
    style.id = 'st-cards-acessorios-v2-style';
    style.textContent = `
      #brandCards .accessory-grid { align-items: stretch !important; }
      #brandCards .accessory-grid .accessory-card {
        position: relative !important; display: flex !important;
        flex-direction: column !important; align-items: stretch !important;
        justify-content: flex-start !important; min-height: 300px !important;
        padding: 10px !important; overflow: hidden !important; box-sizing: border-box !important;
      }
      #brandCards .accessory-grid .accessory-card > img {
        display: block !important; width: 100% !important; height: 190px !important;
        object-fit: contain !important; object-position: center !important;
        flex: 0 0 190px !important; margin: 0 0 10px 0 !important; border-radius: 10px !important;
      }
      #brandCards .accessory-grid .accessory-card .accessory-info {
        position: relative !important; display: flex !important;
        flex-direction: column !important; align-items: flex-start !important;
        width: calc(100% - 42px) !important; min-width: 0 !important;
        margin: 0 !important; padding: 0 4px 4px 4px !important;
        box-sizing: border-box !important; overflow: hidden !important;
      }
      #brandCards .accessory-grid .accessory-card .accessory-info b,
      #brandCards .accessory-grid .accessory-card .accessory-info small {
        position: static !important; display: block !important; width: 100% !important;
        white-space: normal !important; overflow-wrap: anywhere !important;
        text-align: left !important; line-height: 1.25 !important;
      }
      #brandCards .accessory-grid .accessory-card .accessory-info b { margin-bottom: 6px !important; }
      #brandCards .accessory-grid .accessory-card .brand-arrow {
        position: absolute !important; right: 10px !important; bottom: 12px !important; z-index: 3 !important;
      }
      @media (max-width: 700px) {
        #brandCards .accessory-grid .accessory-card { min-height: 280px !important; }
        #brandCards .accessory-grid .accessory-card > img {
          height: 165px !important; flex-basis: 165px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', aplicar);
  else aplicar();
})();
