
from pathlib import Path

APP=Path("www/app.js"); INDEX=Path("www/index.html"); ADMIN=Path("www/admin.js")
for p in (APP,INDEX,ADMIN):
    if not p.exists(): raise SystemExit(f"ERRO: não encontrei {p}.")

app=APP.read_text(encoding="utf-8")
a=app.find("async function sendWhatsApp()")
b=app.find("\n$('send').onclick=sendWhatsApp;",a)
if a<0 or b<0: raise SystemExit("ERRO: função sendWhatsApp não encontrada.")

helper = r'''function formatCustomerPhone(value){
  let n=String(value||'').replace(/\D/g,'');
  if(n.startsWith('55'))n=n.slice(2);
  if(n.length===11)return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
  if(n.length===10)return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;
  return String(value||'');
}
'''
send = r'''async function sendWhatsApp(){
  if(!cart.length){const x=selected();if(x&&Number(x.price)>0)cart.push({...x});renderCart()}
  if(!cart.length)return alert('Adicione um item ao orçamento.');
  const phone=normalizeWhatsAppNumber();
  if(!phone)return alert('Informe o WhatsApp do cliente.');
  const name=$('client').value.trim();
  const total=cart.reduce((s,x)=>s+Number(x.price||0),0);
  try{
    const payload={client_name:name,client_phone:phone,total,items:cart.map(x=>({id:x.id,category:x.category||'Telas',brand:x.brand,model:x.model,price:Number(x.price||0)}))};
    const q=await api('/api/quote/next',{method:'POST',body:JSON.stringify(payload)});
    quoteNumber=q.number;updateQuote();
    $('send').disabled=true;$('send').textContent='✓ Orçamento salvo — abrindo WhatsApp...';
    const displayPhone=formatCustomerPhone(phone);
    const items=cart.map(x=>`• ${(x.category||'Telas')==='Acessórios'?'🔧 Acessório':'📱 Tela'} — ${x.model} — ${money(x.price)}`).join('\n');
    const msg=`📋 NOVO ORÇAMENTO — SMART TALLES

🔢 Orçamento nº ${String(quoteNumber).padStart(4,'0')}

👤 Cliente: ${name||'Não informado'}

📱 WhatsApp: ${displayPhone||phone}

🛒 Itens do orçamento:
${items}

💰 Total do orçamento: ${money(total)}

━━━━━━━━━━━━━━━━━━

📌 Cliente realizou um novo orçamento pelo site.`;
    const ownerWhatsApp='5589999447494';
    window.open(`https://wa.me/${ownerWhatsApp}?text=${encodeURIComponent(msg)}`,'_blank');
    $('send').disabled=false;$('send').textContent='💾 Salvar e Enviar pelo WhatsApp';
    if($('admin')&&!$('admin').classList.contains('hidden'))loadQuotes();
  }catch(e){
    $('send').disabled=false;$('send').textContent='💾 Salvar e Enviar pelo WhatsApp';
    alert(e.message);
  }
}'''
if "function formatCustomerPhone" not in app: app=app[:a]+helper+app[a:]
a=app.find("async function sendWhatsApp()"); b=app.find("\n$('send').onclick=sendWhatsApp;",a)
app=app[:a]+send+app[b:]
APP.write_text(app,encoding="utf-8")

html=INDEX.read_text(encoding="utf-8")
import re
m=re.search(r'\s*<section class="card cart-card">.*?</section>',html,re.S)
if not m: raise SystemExit("ERRO: seção de resumo não encontrada.")
cart=m.group(0).strip()
html=html[:m.start()]+"\n"+html[m.end():]
actions='    <div class="actions"><button id="add" class="secondary">＋ Adicionar ao orçamento</button><button id="send" class="primary">💾 Salvar e Enviar pelo WhatsApp</button></div>'
if actions not in html: raise SystemExit("ERRO: botões do orçamento não encontrados.")
html=html.replace(actions,"    "+cart+"\n"+actions,1)
INDEX.write_text(html,encoding="utf-8")

admin=ADMIN.read_text(encoding="utf-8")
if "function contactClientByNumber" not in admin:
    marker="function renderQuotes(){"
    if marker not in admin: raise SystemExit("ERRO: renderQuotes não encontrada.")
    contact=r'''function normalizeClientWhatsApp(phone){let n=String(phone??'').replace(/\D/g,'');if(!n)return '';if(n.startsWith('55')&&(n.length===12||n.length===13))return n;n=n.replace(/^0+/,'');return n.startsWith('55')?n:'55'+n}
function formatClientPhone(phone){let n=String(phone||'').replace(/\D/g,'');if(n.startsWith('55'))n=n.slice(2);if(n.length===11)return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;if(n.length===10)return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;return String(phone||'')}
function contactClientByNumber(number){const q=quotes.find(x=>Number(x.quote_number)===Number(number));if(!q)return;const phone=normalizeClientWhatsApp(q.client_phone);if(!phone)return alert('Este orçamento não possui um número de WhatsApp válido.');const name=String(q.client_name||'').trim();const num=String(q.quote_number??'').padStart(4,'0');const displayPhone=formatClientPhone(q.client_phone);const items=(q.items||[]).map(x=>`• ${(x.category||'Telas')==='Acessórios'?'🔧 Acessório':'📱 Tela'} — ${x.model} — ${money(x.price)}`).join('\n');const msg=`📋 NOVO ORÇAMENTO — SMART TALLES\n\n🔢 Orçamento nº ${num}\n\n👤 Cliente: ${name||'Não informado'}\n\n📱 WhatsApp: ${displayPhone||q.client_phone||'Não informado'}\n\n🛒 Itens do orçamento:\n${items||'• Nenhum item informado'}\n\n💰 Total do orçamento: ${money(q.total)}\n\n━━━━━━━━━━━━━━━━━━\n\n📌 Cliente realizou um novo orçamento pelo site.`;window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,'_blank')}
'''
    admin=admin.replace(marker,contact+marker,1)
if "contactClientByNumber(${q.quote_number})" not in admin:
    old='<div class="quote-report-items"><small>PRODUTOS</small><ul>${items}</ul></div></article>`}).join(\'\')'
    new='<div class="quote-report-items"><small>PRODUTOS</small><ul>${items}</ul></div><div class="quote-report-actions"><button class="secondary contact-client-btn" type="button" onclick="contactClientByNumber(${q.quote_number})">💬 Contatar cliente</button></div></article>`}).join(\'\')'
    if old not in admin: raise SystemExit("ERRO: linha do relatório não encontrada.")
    admin=admin.replace(old,new,1)
ADMIN.write_text(admin,encoding="utf-8")
print("OK: app.js, index.html e admin.js atualizados.")
