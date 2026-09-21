const COMPANY={name:'SMART TALLES',city:'Floriano/PI',phone:'5589999447494',address:'R. Assad Kalume, Centro — Floriano/PI',since:'2011',paymentLink:'https://link.mercadopago.com.br/smarttalles'};
const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v)||0);
let products=[],cart=[],adminPin='',quoteNumber=1,currentCategory='Telas',quotes=[];
const $=id=>document.getElementById(id),brand=$('brand'),model=$('model'),price=$('price'),cartEl=$('cart'),totalEl=$('total'),productImage=$('productImage'),priceHint=$('priceHint'),accessoryPreview=$('accessoryPreview'),accessoryPreviewImg=$('accessoryPreviewImg'),accessoryPreviewName=$('accessoryPreviewName'),accessoryPreviewSku=$('accessoryPreviewSku');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(url,opt={}){const r=await fetch(url,{...opt,headers:{'Content-Type':'application/json',...(opt.headers||{})}});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'Erro no servidor');return d}
async function load(){products=(await api('/api/products')).map(x=>({...x,category:x.category||'Telas'}));const q=await api('/api/quote/current');quoteNumber=q.number||1;updateQuote();setCategory(currentCategory);renderStats()}
function updateQuote(){const n=String(quoteNumber).padStart(4,'0');$('quoteNumber').textContent=n;$('quoteNumberTop').textContent=n}
function categoryProducts(){return products.filter(x=>(x.category||'Telas')===currentCategory)}
function brands(){return [...new Set(categoryProducts().map(x=>x.brand))].sort((a,b)=>a.localeCompare(b,'pt-BR'));}
function fillBrands(){brand.innerHTML='<option value="">Selecione...</option>'+brands().map(b=>`<option>${esc(b)}</option>`).join('');brand.disabled=!brands().length;if(!brands().length)brand.innerHTML='<option value="">Nenhum produto nesta categoria</option>';}
function models(){return categoryProducts().filter(x=>x.brand===brand.value).sort((a,b)=>a.model.localeCompare(b.model,'pt-BR'))}
function fillModels(){const arr=models();model.disabled=!brand.value;model.innerHTML=brand.value?'<option value="">Selecione...</option>'+arr.map(x=>`<option value="${x.id}">${esc(x.model)} — ${x.price>0?money(x.price):'preço não cadastrado'}</option>`).join(''):'<option>Selecione a marca primeiro...</option>';price.textContent=money(0);priceHint.textContent='Preço cadastrado no sistema';productImage.classList.add('hidden');productImage.removeAttribute('src')}
function selected(){return products.find(x=>x.id===Number(model.value))||null}
function renderStats(){$('productCount').textContent=products.length.toLocaleString('pt-BR');$('brandCount').textContent=[...new Set(products.map(x=>x.brand))].length}
function renderBrandCards(){
 const arr=categoryProducts();
 if(currentCategory==='Acessórios'){
   $('brandCards').innerHTML='<div class="accessory-grid">'+arr.map(x=>`<button class="accessory-card" onclick="chooseProduct(${x.id})"><img src="${esc(x.image||'')}" alt=""><span class="accessory-info"><b>${esc(x.model)}</b><small>${x.price>0?money(x.price):'Preço não cadastrado'}</small></span><span class="brand-arrow">＋</span></button>`).join('')+'</div>';
   return;
 }
 $('brandCards').innerHTML=brands().map(b=>{const count=products.filter(x=>(x.category||'Telas')===currentCategory&&x.brand===b).length;return `<button class="brand-card" onclick="chooseBrand(${JSON.stringify(b)})"><span><b>${esc(b)}</b><small>${count} ${count===1?'item':'itens'} em ${esc(currentCategory.toLowerCase())}</small></span><span class="brand-arrow">→</span></button>`}).join('')
}
function setCategory(cat){currentCategory=cat;document.querySelectorAll('[data-category]').forEach(b=>b.classList.toggle('active',b.dataset.category===cat));$('saleCategoryLabel').textContent=cat;fillBrands();fillModels();renderBrandCards();updateAccessoryPreview();}
window.setCategory=setCategory
window.chooseBrand=b=>{brand.value=b;fillModels();document.getElementById('nova-venda').scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>model.focus(),250)};
window.chooseProduct=id=>{const x=products.find(p=>p.id===Number(id));if(!x)return;setCategory(x.category||'Acessórios');brand.value=x.brand;fillModels();model.value=String(x.id);showSelected();document.getElementById('nova-venda').scrollIntoView({behavior:'smooth',block:'start'});};
function updateAccessoryPreview(){
 const box=$('accessoryPreview');
 if(!box)return;
 const x=selected();
 if(currentCategory!=='Acessórios' || !x || !x.image){
   box.classList.add('hidden');
   return;
 }
 $('accessoryPreviewImg').src=x.image;
 $('accessoryPreviewImg').alt=x.model||'Imagem do acessório';
 $('accessoryPreviewName').textContent=x.model||'—';
 $('accessoryPreviewSku').textContent=x.sku ? `SKU: ${x.sku}` : 'Acessório';
 box.classList.remove('hidden');
}
function showSelected(){const x=selected();price.textContent=money(x?.price);priceHint.textContent=x?.price>0?'Preço cadastrado no sistema':'Preço ainda não cadastrado — informe no painel de administração';if(x?.image){productImage.src=x.image;productImage.alt=x.model;productImage.classList.remove('hidden')}else{productImage.classList.add('hidden');productImage.removeAttribute('src')}updateAccessoryPreview()}
brand.onchange=fillModels;model.onchange=showSelected;
$('add').onclick=()=>{const x=selected();if(!x)return alert('Selecione a marca e o modelo.');if(Number(x.price)<=0)return alert('Este produto ainda está sem preço cadastrado. Abra Administração e informe o preço antes de adicionar ao orçamento.');cart.push({...x});renderCart()};
function renderCart(){if(!cart.length){cartEl.innerHTML='<p class="empty-state"><span>🛒</span>Nenhum item adicionado ainda.</p>';totalEl.textContent=money(0);return}cartEl.innerHTML=cart.map((x,i)=>`<div class="item">${x.image?`<img class="cart-thumb" src="${esc(x.image)}" alt="">`:''}<div class="item-main"><b>${esc(x.model)}</b><small>${esc(x.brand)} • ${money(x.price)}</small></div><button class="remove" onclick="removeItem(${i})">Remover</button></div>`).join('');totalEl.textContent=money(cart.reduce((s,x)=>s+x.price,0))}
window.removeItem=i=>{cart.splice(i,1);renderCart()};$('clear').onclick=()=>{cart=[];renderCart()};
function normalizeWhatsAppNumber(){
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

function formatCustomerPhone(value){
  let n=String(value||'').replace(/\D/g,'');
  if(n.startsWith('55'))n=n.slice(2);
  if(n.length===11)return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
  if(n.length===10)return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;
  return String(value||'');
}
async function sendWhatsApp(){
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
}
$('send').onclick=sendWhatsApp;

// Botão lateral para voltar rapidamente ao início da página
const backToTop=$('backToTop');
function updateBackToTop(){if(!backToTop)return;backToTop.classList.toggle('visible',window.scrollY>420)}
window.addEventListener('scroll',updateBackToTop,{passive:true});
backToTop?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
updateBackToTop();
load().catch(e=>{alert('Não foi possível conectar ao servidor: '+e.message);brand.innerHTML='<option>Servidor indisponível</option>'});

// Painel lateral de clima e qualidade do ar — Floriano/PI
(function(){
 const tab=document.getElementById('weatherTab'),panel=document.getElementById('weatherPanel'),close=document.getElementById('weatherClose'),content=document.getElementById('weatherContent');
 if(!tab||!panel||!content)return;
 const LAT=-6.7669,LON=-43.0228;
 const escW=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function openPanel(){panel.classList.add('open');panel.setAttribute('aria-hidden','false');loadWeather();}
 function closePanel(){panel.classList.remove('open');panel.setAttribute('aria-hidden','true');}
 tab.addEventListener('click',()=>panel.classList.contains('open')?closePanel():openPanel()); close.addEventListener('click',closePanel);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closePanel()});
 function aqiInfo(aqi){const n=Number(aqi);if(!Number.isFinite(n))return ['—','Indisponível',''];if(n<=50)return [n,'Boa','good'];if(n<=100)return [n,'Moderada','moderate'];if(n<=150)return [n,'Ruim para grupos sensíveis','poor'];return [n,'Ruim','poor'];}
 function weatherText(code){const c=Number(code);const map={0:'Céu limpo',1:'Predominantemente limpo',2:'Parcialmente nublado',3:'Nublado',45:'Névoa',48:'Névoa com geada',51:'Chuvisco leve',53:'Chuvisco moderado',55:'Chuvisco intenso',61:'Chuva leve',63:'Chuva moderada',65:'Chuva forte',80:'Pancadas leves',81:'Pancadas moderadas',82:'Pancadas fortes',95:'Trovoada',96:'Trovoada com granizo',99:'Trovoada com granizo'};return map[c]||'Condição do tempo';}
 async function loadWeather(){
   content.innerHTML='<div class="weather-current"><div class="weather-temp">…°C</div><div class="weather-condition">Atualizando dados...</div></div>';
   try{
    const wurl=`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&timezone=America%2FSao_Paulo`;
    const aurl=`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LON}&current=us_aqi,pm2_5,pm10&timezone=America%2FSao_Paulo`;
    const [wr,ar]=await Promise.all([fetch(wurl),fetch(aurl)]); if(!wr.ok||!ar.ok)throw Error('Não foi possível obter os dados agora.');
    const w=await wr.json(),a=await ar.json(),c=w.current||{},ac=a.current||{};const [aqi,label,klass]=aqiInfo(ac.us_aqi);
    const time=c.time?new Date(c.time).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'agora';
    content.innerHTML=`<div class="weather-current"><div class="weather-temp">${Math.round(Number(c.temperature_2m)||0)}°C</div><div class="weather-condition">${escW(weatherText(c.weather_code))}</div><div class="weather-updated">Sensação de ${Math.round(Number(c.apparent_temperature)||0)}°C • Atualizado ${escW(time)}</div></div><div class="weather-metrics"><div class="weather-metric"><small>💧 Umidade</small><b>${Math.round(Number(c.relative_humidity_2m)||0)}%</b></div><div class="weather-metric"><small>💨 Vento</small><b>${Math.round(Number(c.wind_speed_10m)||0)} km/h</b></div></div><div class="air-quality ${klass}"><div class="air-title"><b>🌿 Qualidade do ar</b><span class="air-badge">${escW(label)}</span></div><div class="air-aqi">AQI ${aqi==='—'?'—':Math.round(aqi)}</div><div class="air-sub">Índice US AQI</div><div class="air-pollutants"><div><small>PM2,5</small><b>${Number.isFinite(Number(ac.pm2_5))?Number(ac.pm2_5).toFixed(1):'—'} µg/m³</b></div><div><small>PM10</small><b>${Number.isFinite(Number(ac.pm10))?Number(ac.pm10).toFixed(1):'—'} µg/m³</b></div></div></div>`;
   }catch(e){content.innerHTML='<div class="weather-error">Não foi possível atualizar o clima agora. Verifique a conexão com a internet e tente novamente.</div>';}
 }
 setInterval(()=>{if(panel.classList.contains('open'))loadWeather()},10*60*1000);
})();
