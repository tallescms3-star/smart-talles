from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
admin_path = ROOT / "www" / "admin.js"
if not admin_path.exists():
    raise SystemExit("ERRO: não encontrei www\\admin.js. Extraia este pacote na pasta smart-talles.")

admin = admin_path.read_text(encoding="utf-8")

for name in ["normalizeClientWhatsApp", "formatClientPhone", "contactClientByNumber"]:
    admin = re.sub(
        rf"function {name}\(.*?(?=function [A-Za-z_$][A-Za-z0-9_$]*\(|\Z)",
        "",
        admin,
        flags=re.S
    )

helpers = r'''
function normalizeClientWhatsApp(value){
  let s=String(value||'').trim();
  let digits=s.replace(/\D/g,'');
  if(!digits)return '';
  if(digits.startsWith('00'))digits=digits.slice(2);
  if(digits.startsWith('55') && digits.length>=12)return digits;
  digits=digits.replace(/^0+/,'');
  return '55'+digits;
}
function formatClientPhone(value){
  const digits=String(value||'').replace(/\D/g,'');
  if(digits.startsWith('55') && digits.length>=12){
    const local=digits.slice(2);
    if(local.length===11)return `(${local.slice(0,2)}) ${local.slice(2,7)}-${local.slice(7)}`;
    if(local.length===10)return `(${local.slice(0,2)}) ${local.slice(2,6)}-${local.slice(6)}`;
  }
  return value||'';
}
function contactClientByNumber(quoteNumber){
  const q=quotes.find(x=>String(x.quote_number)===String(quoteNumber));
  if(!q)return alert('Orçamento não encontrado.');
  const phone=normalizeClientWhatsApp(q.client_phone);
  if(!phone)return alert('Este orçamento não possui WhatsApp do cliente.');
  const clientName=q.client_name||'Não informado';
  const customerPhone=formatClientPhone(q.client_phone);
  const items=(q.items||[]).map(x=>{
    const category=String(x.category||'').toLowerCase().includes('acess')?'🔧 Acessório':'📱 Tela';
    const label=[x.brand,x.model].filter(Boolean).join(' ').trim()||'Produto';
    return `• ${category} — ${label} — ${money(x.price)}`;
  }).join('\n');
  const msg=[
    '📋 NOVO ORÇAMENTO — SMART TALLES',
    '',
    `🔢 Orçamento nº ${String(q.quote_number).padStart(4,'0')}`,
    '',
    `👤 Cliente: ${clientName}`,
    '',
    `📱 WhatsApp: ${customerPhone||q.client_phone||'Não informado'}`,
    '',
    '🛒 Itens do orçamento:',
    items||'• Nenhum item informado',
    '',
    `💰 Total do orçamento: ${money(q.total)}`,
    '',
    '━━━━━━━━━━━━━━━━━━',
    '',
    '📌 Cliente realizou um novo orçamento pelo site.'
  ].join('\n');
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,'_blank');
}
'''

m = re.search(r"function renderQuotes\(", admin)
if not m:
    raise SystemExit("ERRO: não encontrei a função renderQuotes em www\\admin.js.")
admin = admin[:m.start()] + helpers + "\n" + admin[m.start():]

if "contactClientByNumber(" not in admin:
    needle = '<div class="quote-report-items"><small>PRODUTOS</small><ul>${items}</ul></div>'
    replacement = needle + '<div class="quote-report-actions"><button class="secondary" type="button" onclick="contactClientByNumber(${Number(q.quote_number)})">💬 Contatar cliente</button></div>'
    if needle not in admin:
        raise SystemExit("ERRO: não encontrei o bloco de produtos do relatório para inserir o botão.")
    admin = admin.replace(needle, replacement, 1)

admin_path.write_text(admin, encoding="utf-8")
print("OK: www\\admin.js corrigido com sucesso.")
print("Agora o GitHub Desktop deve mostrar www\\admin.js como arquivo alterado.")
