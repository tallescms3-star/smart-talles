from pathlib import Path

root = Path(__file__).resolve().parent
# This script expects to be copied into the Smart Talles project root.
www = root / 'www'
app = www / 'app.js'
index = www / 'index.html'
style = www / 'style.css'

if not app.exists() or not index.exists() or not style.exists():
    raise SystemExit('Não encontrei www/app.js, www/index.html e www/style.css. Coloque este arquivo na pasta raiz do projeto Smart Talles.')

# index.html: replace the current single phone field with country code + local number.
s = index.read_text(encoding='utf-8')
old = '<div class="customer-grid"><label>Nome do cliente <small>(opcional)</small><input id="client" placeholder="Ex.: João Silva"></label><label>WhatsApp do cliente<input id="phone" inputmode="tel" placeholder="5599999999999"></label></div>'
new = '<div class="customer-grid"><label>Nome do cliente <small>(opcional)</small><input id="client" placeholder="Ex.: João Silva"></label><div class="phone-field"><span class="field-label">WhatsApp do cliente</span><div class="phone-inputs"><label class="country-code-label" title="Código do país"><span>DDI</span><input id="countryCode" inputmode="numeric" value="55" maxlength="4" aria-label="Código do país" autocomplete="tel-country-code"></label><label class="phone-number-label"><span>Número</span><input id="phone" inputmode="tel" placeholder="89 99944-7494" aria-label="Número do WhatsApp" autocomplete="tel"></label></div><small class="phone-help">Brasil (+55) vem selecionado. Para outro país, altere o DDI.</small></div></div>'
if old not in s:
    if 'id="countryCode"' not in s:
        raise SystemExit('Não encontrei o campo de WhatsApp esperado em www/index.html. Nenhuma alteração foi feita.')
else:
    s = s.replace(old, new, 1)
    index.write_text(s, encoding='utf-8')

# app.js: replace sendWhatsApp with international-number normalization.
s = app.read_text(encoding='utf-8')
old_start = 'async function sendWhatsApp(){'
start = s.find(old_start)
if start < 0:
    raise SystemExit('Não encontrei a função sendWhatsApp em www/app.js. Nenhuma alteração foi feita.')
end = s.find('\n$('"'"'send'"'"').onclick=sendWhatsApp;', start)
if end < 0:
    raise SystemExit('Não encontrei o final da função sendWhatsApp. Nenhuma alteração foi feita.')
new_func = r'''function normalizeWhatsAppNumber(){
  const codeEl=$('countryCode'), phoneEl=$('phone');
  let code=String(codeEl?.value||'55').replace(/\D/g,'');
  let phone=String(phoneEl?.value||'').replace(/\D/g,'');
  if(!code)code='55';
  code=code.replace(/^0+/,'');
  if(!phone)return '';
  // If the user pasted a complete international number, don't add the DDI twice.
  if(phone.startsWith(code) && phone.length>11)return phone;
  // Remove a Brazilian/international trunk 0 typed before the local number.
  phone=phone.replace(/^0+/,'');
  return code+phone;
}

function formatPhoneNumber(value){
  const digits=String(value||'').replace(/\D/g,'').slice(0,15);
  if(digits.length<=11){
    if(digits.length<=2)return digits;
    if(digits.length<=6)return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
    if(digits.length<=10)return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  }
  return digits;
}

$('phone')?.addEventListener('input',e=>{e.target.value=formatPhoneNumber(e.target.value)});
$('countryCode')?.addEventListener('input',e=>{e.target.value=e.target.value.replace(/\D/g,'').slice(0,4)});

async function sendWhatsApp(){if(!cart.length){const x=selected();if(x&&Number(x.price)>0)cart.push({...x});renderCart()}if(!cart.length)return alert('Adicione um item ao orçamento.');const phone=normalizeWhatsAppNumber();if(!phone)return alert('Informe o WhatsApp do cliente.');const name=$('client').value.trim();const total=cart.reduce((s,x)=>s+Number(x.price||0),0);try{const payload={client_name:name,client_phone:phone,total,items:cart.map(x=>({id:x.id,category:x.category||'Telas',brand:x.brand,model:x.model,price:Number(x.price||0)}))};const q=await api('/api/quote/next',{method:'POST',body:JSON.stringify(payload)});quoteNumber=q.number;updateQuote();$('send').disabled=true;$('send').textContent='✓ Orçamento salvo — abrindo WhatsApp...';const msg=`Olá${name?' '+name:''}!\n\n*Orçamento Nº ${String(quoteNumber).padStart(4,'0')}*\n\n${cart.map(x=>`• ${x.brand} ${x.model} — ${money(x.price)}`).join('\n')}\n\n*Total: ${money(total)}*\n\n💳 *Pagamento online:* ${COMPANY.paymentLink}\n\nObrigado por escolher a *Smart Talles*! 📱💙`;window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,'_blank');$('send').disabled=false;$('send').textContent='💾 Salvar e Enviar pelo WhatsApp';if($('admin')&&!$('admin').classList.contains('hidden'))loadQuotes()}catch(e){alert(e.message)}}'''
s = s[:start] + new_func + s[end:]
app.write_text(s, encoding='utf-8')

# style.css: append styles once.
s = style.read_text(encoding='utf-8')
marker = '/* Campo WhatsApp com DDI editável */'
if marker not in s:
    s += r'''

/* Campo WhatsApp com DDI editável */
.phone-field{margin:14px 0;min-width:0}
.phone-field>.field-label{display:block;font-weight:800;font-size:13px;margin-bottom:7px}
.phone-inputs{display:grid;grid-template-columns:105px 1fr;gap:8px}
.phone-inputs label{margin:0}
.phone-inputs label>span{display:block;font-size:10px;color:var(--muted);font-weight:800;margin:0 0 4px 2px}
.phone-inputs input{margin:0}
.country-code-label input{text-align:center;font-weight:850}
.phone-help{display:block;color:var(--muted);font-size:11px;font-weight:600;margin-top:6px}
@media(max-width:560px){.phone-inputs{grid-template-columns:88px 1fr}.phone-help{font-size:10px}}
'''
    style.write_text(s, encoding='utf-8')

print('Correção aplicada com sucesso.')
print('DDI padrão: 55 (Brasil), editável.')
print('O número pode ser digitado sem o código do país; o sistema acrescenta o DDI ao enviar.')
