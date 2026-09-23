from pathlib import Path

path = Path("www/admin.js")
if not path.exists():
    raise SystemExit("ERRO: não encontrei www/admin.js. Execute dentro da pasta smart-talles.")

text = path.read_text(encoding="utf-8")

if "function normalizeClientWhatsApp" in text:
    print("A correção já parece estar aplicada.")
    raise SystemExit(0)

marker = "function renderQuotes(){"
if marker not in text:
    raise SystemExit("ERRO: não encontrei a função renderQuotes em www/admin.js.")

prefix = r"""function normalizeClientWhatsApp(phone){let n=String(phone??'').replace(/\D/g,'');if(!n)return '';if(n.startsWith('55')&&(n.length===12||n.length===13))return n;n=n.replace(/^0+/,'');return n.startsWith('55')?n:'55'+n}
function contactClientByNumber(number){const q=quotes.find(x=>Number(x.quote_number)===Number(number));if(!q)return;const phone=normalizeClientWhatsApp(q.client_phone);if(!phone)return alert('Este orçamento não possui um número de WhatsApp válido.');const name=String(q.client_name||'').trim();const num=String(q.quote_number??'').padStart(4,'0');const items=(q.items||[]).map(x=>`• ${x.category==='Acessórios'?'Acessório':'Tela'} — ${x.model} — ${money(x.price)}`).join('\\n');const msg=`📋 NOVO ORÇAMENTO — SMART TALLES\\n\\n🔢 Orçamento nº ${num}\\n\\n👤 Cliente: ${name||'Não informado'}\\n📱 WhatsApp: ${q.client_phone||'Não informado'}\\n\\n🛒 Itens do orçamento:\\n${items||'• Nenhum item informado'}\\n\\n💰 Total do orçamento: ${money(q.total)}\\n\\n━━━━━━━━━━━━━━━━━━\\n\\n📌 Olá${name?' '+name:''}! Estamos entrando em contato para dar prosseguimento ao seu orçamento realizado pelo site da Smart Talles. Podemos concluir sua venda? 😊`;window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,'_blank')}
"""

text = text.replace(marker, prefix + marker, 1)

old = r"""<div class="quote-report-items"><small>PRODUTOS</small><ul>${items}</ul></div></article>`}).join('')"""
new = r"""<div class="quote-report-items"><small>PRODUTOS</small><ul>${items}</ul></div><div class="quote-report-actions"><button class="secondary contact-client-btn" type="button" onclick="contactClientByNumber(${q.quote_number})">💬 Contatar cliente</button></div></article>`}).join('')"""

if old not in text:
    raise SystemExit("ERRO: a estrutura do relatório é diferente da versão esperada. Nenhuma alteração foi feita.")

path.write_text(text.replace(old, new, 1), encoding="utf-8")
print("OK: www/admin.js foi atualizado.")
