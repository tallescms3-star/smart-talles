import json, os, sqlite3, urllib.parse, secrets, base64, csv, io, zipfile, xml.etree.ElementTree as ET
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

BASE = Path(__file__).resolve().parent
WWW = BASE / 'www'
# Em hospedagens com volume persistente, defina DB_PATH=/data/vendas.db.
# Localmente, o banco continua sendo criado na pasta do projeto.
DB = Path(os.environ.get('DB_PATH', str(BASE / 'vendas.db')))
CONFIG = BASE / 'config.json'
PORT = int(os.environ.get('PORT', '8080'))

if CONFIG.exists():
    config = json.loads(CONFIG.read_text(encoding='utf-8'))
else:
    config = {}
# Nunca dependa do config.json em produção: use a variável de ambiente ADMIN_PIN.
ADMIN_PIN = str(os.environ.get('ADMIN_PIN') or config.get('admin_pin') or '1234')


def db():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    return c


def init_db():
    c = db()
    c.execute('''CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL DEFAULT 'Telas',
        brand TEXT NOT NULL,
        model TEXT NOT NULL,
        price REAL NOT NULL DEFAULT 0,
        cost REAL,
        image TEXT,
        source_url TEXT
    )''')
    cols = [r[1] for r in c.execute('PRAGMA table_info(products)').fetchall()]
    if 'category' not in cols:
        c.execute("ALTER TABLE products ADD COLUMN category TEXT NOT NULL DEFAULT 'Telas'")
    if 'image' not in cols:
        c.execute("ALTER TABLE products ADD COLUMN image TEXT")
    if 'source_url' not in cols:
        c.execute("ALTER TABLE products ADD COLUMN source_url TEXT")
    c.execute('''CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )''')
    c.execute('''CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote_number INTEGER NOT NULL UNIQUE,
        client_name TEXT NOT NULL DEFAULT '',
        client_phone TEXT NOT NULL DEFAULT '',
        items_json TEXT NOT NULL,
        total REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
    )''')
    count = c.execute('SELECT COUNT(*) FROM products').fetchone()[0]
    if count == 0:
        data_file = WWW / 'data.js'
        text = data_file.read_text(encoding='utf-8')
        start = text.find('[')
        end = text.rfind(']')
        products = json.loads(text[start:end+1])
        c.executemany('INSERT INTO products(category,brand,model,price,cost,image,source_url) VALUES(?,?,?,?,?,?,?)',
                      [(p.get('category','Telas'), p.get('brand',''), p.get('model',''), float(p.get('price',0)), p.get('cost'), p.get('image'), p.get('source_url')) for p in products])
    # Sincroniza novos itens presentes no catálogo estático sem apagar alterações feitas pelo administrador.
    try:
        data_file = WWW / 'data.js'
        text = data_file.read_text(encoding='utf-8')
        start, end = text.find('['), text.rfind(']')
        catalog = json.loads(text[start:end+1])
        existing = {(str(r['category']).lower(), str(r['brand']).lower(), str(r['model']).lower()) for r in c.execute('SELECT category,brand,model FROM products').fetchall()}
        for p in catalog:
            key=(str(p.get('category','Telas')).lower(), str(p.get('brand','')).lower(), str(p.get('model','')).lower())
            if key not in existing and key[1] and key[2]:
                c.execute('INSERT INTO products(category,brand,model,price,cost,image,source_url) VALUES(?,?,?,?,?,?,?)', (p.get('category','Telas'),p.get('brand',''),p.get('model',''),parse_price(p.get('price',0)),p.get('cost'),p.get('image'),p.get('source_url')))
    except Exception as e:
        print('[CATALOG] sincronização ignorada:', e)
    # Atualização única de preços dos acessórios conforme o PDF "Acessorios atualizado.pdf".
    # O marcador evita sobrescrever futuras alterações manuais do administrador a cada inicialização.
    ACCESSORY_PRICE_UPDATE_KEY = 'accessory_prices_pdf_2026_09_16_v1'
    if c.execute('SELECT 1 FROM settings WHERE key=?', (ACCESSORY_PRICE_UPDATE_KEY,)).fetchone() is None:
        pdf_prices = {
            'Case Externa Para HD transparente Alta Velocidade e Conexão USB 3.0 Transmissão de 6gbps Sata 3 Suporta SSDs e HDs de até 3TB Transparente Premium': 80.0,
            'TECLADO BASICO HAYOM USB - TC3201': 59.0,
            'Cabo HDMI Cabo HDMI Inglobar': 79.0,
            'Cabo VGA Blindado 1,8 Metros - Ideal para Conectar TV, Monitor ou Notebook, Com Proteção Contra Interferências para Imagens nítidas e Estáveis': 45.0,
            'Mouse Gamer Exbom MS-G260 3200DPI 7 Botões': 60.0,
            'Mini Caixa De Som Portátil Speaker Ws-887 - Preto': 35.0,
            'Carregador Universal Notebook - Laptop': 80.0,
            'Pen Drive 32 Gigas Tomate Mpd-0032 Plug In,chaveiro,metal Cor Prateado Liso': 40.0,
            "Câmera Segurança IP Lâmpada WiFi Full HD 1080p com Visão Noturna Infravermelho 1080P, Yoosee, Bivolt, Detecção de Movimento, Áudio Bidirecional, Prova D'Água Giratória": 120.0,
            'Fone de ouvido over-ear gamer sem fio Bluetooth P9 verde e prata corrida caminhada academia esporte e lazer dia a dia confortavel (prata)': 90.0,
            'Kit Teclado Gamer Semi Mecânico RGB, com Mouse Gamer 3600DPI, Óptico Compatível PC/PS4/PS5/One': 135.0,
        }
        updated=0
        for model, price in pdf_prices.items():
            cur=c.execute('UPDATE products SET price=? WHERE category=? AND model=?', (price, 'Acessórios', model))
            updated += cur.rowcount
        c.execute('INSERT INTO settings(key,value) VALUES(?,?)', (ACCESSORY_PRICE_UPDATE_KEY, str(updated)))
        print(f'[CATALOG] preços de acessórios atualizados pelo PDF: {updated}')

    c.commit(); c.close()


def products_all():
    c=db(); rows=c.execute('SELECT id,category,brand,model,price,cost,image,source_url FROM products ORDER BY category, brand, model').fetchall(); c.close()
    return [dict(r) for r in rows]


def quotes_all():
    c=db()
    rows=c.execute('SELECT id,quote_number,client_name,client_phone,items_json,total,created_at FROM quotes ORDER BY id DESC').fetchall()
    c.close()
    out=[]
    for r in rows:
        d=dict(r)
        try: d['items']=json.loads(d.pop('items_json'))
        except Exception: d['items']=[]
        out.append(d)
    return out


def snapshot_products(c):
    rows=c.execute('SELECT category,brand,model,price,cost,image,source_url FROM products ORDER BY id').fetchall()
    return [dict(r) for r in rows]

def replace_products(c, products):
    normalized=[]
    for p in products:
        if not isinstance(p, dict):
            continue
        category=str(p.get('category','Telas')).strip() or 'Telas'
        brand=str(p.get('brand','')).strip()
        model=str(p.get('model','')).strip()
        price=parse_price(p.get('price',0))
        if not brand or not model:
            continue
        normalized.append((category,brand,model,price,p.get('cost'),p.get('image'),p.get('source_url')))
    if not normalized:
        raise ValueError('O backup não contém produtos válidos.')
    c.execute('DELETE FROM products')
    c.executemany('INSERT INTO products(category,brand,model,price,cost,image,source_url) VALUES(?,?,?,?,?,?,?)', normalized)
    return len(normalized)

def json_bytes(obj):
    return json.dumps(obj, ensure_ascii=False).encode('utf-8')

def parse_price(v):
    if v is None or v == '': return 0.0
    if isinstance(v, (int, float)): return float(v)
    t=str(v).strip().replace('R$','').replace(' ','')
    if ',' in t: t=t.replace('.','').replace(',','.')
    return float(t)


def parse_xlsx(raw):
    ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        shared=[]
        if 'xl/sharedStrings.xml' in z.namelist():
            root=ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in root.findall('m:si',ns): shared.append(''.join(t.text or '' for t in si.iter('{%s}t'%ns['m'])))
        wb=ET.fromstring(z.read('xl/workbook.xml'))
        rel=ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
        relmap={x.attrib['Id']:x.attrib['Target'] for x in rel}
        all_rows=[]
        for sheet in wb.findall('m:sheets/m:sheet',ns):
            target=relmap.get(sheet.attrib['{%s}id'%ns['r']],'worksheets/sheet1.xml').lstrip('/')
            target=target if target.startswith('xl/') else 'xl/'+target
            try: root=ET.fromstring(z.read(target))
            except KeyError: continue
            rows=[]
            for row in root.findall('.//m:sheetData/m:row',ns):
                vals={}
                for cell in row.findall('m:c',ns):
                    ref=cell.attrib.get('r','A1'); col=''.join(ch for ch in ref if ch.isalpha())
                    typ=cell.attrib.get('t'); v=cell.find('m:v',ns)
                    value=''
                    if typ=='inlineStr':
                        value=''.join(t.text or '' for t in cell.iter('{%s}t'%ns['m']))
                    elif v is not None:
                        value=v.text or ''
                        if typ=='s' and value.isdigit() and int(value)<len(shared): value=shared[int(value)]
                    vals[col]=value
                if vals: rows.append(vals)
            if not rows: continue
            # Detect a header row when possible.
            header_idx=0
            for i,r in enumerate(rows[:10]):
                joined=' '.join(str(v).lower() for v in r.values())
                if any(k in joined for k in ('produto','product','nome','name','preço','preco','price','valor','marca','brand')):
                    header_idx=i; break
            headers=rows[header_idx]
            header_map={k:str(v).lower().strip() for k,v in headers.items()}
            recognized=any(any(x in h for x in ('produto','product','nome','name','modelo','model','preço','preco','price','valor')) for h in header_map.values())
            if recognized:
                for r in rows[header_idx+1:]:
                    d={}
                    for col,val in r.items():
                        h=str(header_map.get(col,'')).strip()
                        if h: d[h]=val
                    if d: all_rows.append(d)
            else:
                for r in rows[header_idx:]:
                    all_rows.append(r)
        return all_rows


def parse_import_bytes(filename, raw):
    low=filename.lower()
    if low.endswith('.json'):
        data=json.loads(raw.decode('utf-8-sig')); return data if isinstance(data,list) else data.get('products',[])
    if low.endswith('.csv') or low.endswith('.txt'):
        text=raw.decode('utf-8-sig')
        return list(csv.DictReader(io.StringIO(text), delimiter=';')) if ';' in text.splitlines()[0] else list(csv.DictReader(io.StringIO(text)))
    if low.endswith('.xlsx'):
        return parse_xlsx(raw)
    raise ValueError('Formato não suportado. Use JSON, CSV ou Excel (.xlsx).')

def save_product_image(data_url, pid):
    if not isinstance(data_url, str) or not data_url.startswith('data:image/'):
        raise ValueError('Imagem inválida. Selecione uma foto JPG, PNG ou WebP.')
    try:
        head, encoded = data_url.split(',', 1)
        mime = head.split(';', 1)[0].split(':', 1)[1].lower()
        ext_map = {'image/jpeg':'jpg','image/jpg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'}
        ext = ext_map.get(mime)
        if not ext: raise ValueError('Formato de imagem não suportado. Use JPG, PNG, WebP ou GIF.')
        raw = base64.b64decode(encoded, validate=True)
    except ValueError:
        raise
    except Exception:
        raise ValueError('Não foi possível ler a foto selecionada.')
    if len(raw) > 5 * 1024 * 1024:
        raise ValueError('A foto é muito grande. O limite é de 5 MB.')
    signatures = {'jpg': (b'\xff\xd8\xff',), 'png': (b'\x89PNG\r\n\x1a\n',), 'gif': (b'GIF87a', b'GIF89a'), 'webp': (b'RIFF',)}
    if ext in signatures and not any(raw.startswith(sig) for sig in signatures[ext]):
        raise ValueError('O conteúdo da foto não corresponde ao formato informado.')
    folder = WWW / 'accessories'; folder.mkdir(parents=True, exist_ok=True)
    filename = f'acessorio_{int(pid)}.{ext}'
    (folder / filename).write_bytes(raw)
    return f'accessories/{filename}'

class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(WWW),**kwargs)

    def log_message(self, fmt, *args):
        print('[SERVER]', fmt % args)

    def send_json(self, code, obj):
        b=json_bytes(obj); self.send_response(code); self.send_header('Content-Type','application/json; charset=utf-8'); self.send_header('Content-Length',str(len(b))); self.end_headers(); self.wfile.write(b)

    def body_json(self):
        n=int(self.headers.get('Content-Length','0')); return json.loads(self.rfile.read(n) or b'{}')

    def admin_ok(self):
        return secrets.compare_digest(str(self.headers.get('X-Admin-Pin','')), ADMIN_PIN)

    def do_GET(self):
        path=urllib.parse.urlparse(self.path).path
        if path=='/api/health': return self.send_json(200, {'ok':True,'port':PORT})
        if path=='/api/products': return self.send_json(200, products_all())
        if path=='/api/config': return self.send_json(200, {'admin_required': True})
        if path=='/api/quote/current':
            c=db(); row=c.execute("SELECT value FROM settings WHERE key='next_quote'").fetchone(); c.close()
            n=int(row['value']) if row else 1
            return self.send_json(200, {'number': n})
        if path=='/api/quotes':
            if not self.admin_ok(): return self.send_json(401, {'error':'PIN de administrador inválido.'})
            return self.send_json(200, quotes_all())
        return super().do_GET()

    def do_POST(self):
        path=urllib.parse.urlparse(self.path).path
        if path=='/api/admin/verify':
            try:
                data=self.body_json(); ok=secrets.compare_digest(str(data.get('pin','')), ADMIN_PIN)
                return self.send_json(200, {'ok':ok})
            except Exception: return self.send_json(400, {'ok':False})
        if path=='/api/quote/next':
            try:
                data=self.body_json()
                c=db(); row=c.execute("SELECT value FROM settings WHERE key='next_quote'").fetchone(); n=int(row['value']) if row else 1
                items=data.get('items') or []
                total=float(data.get('total') or 0)
                client_name=str(data.get('client_name') or '').strip()
                client_phone=''.join(ch for ch in str(data.get('client_phone') or '') if ch.isdigit())
                now=__import__('datetime').datetime.now().astimezone().isoformat(timespec='seconds')
                c.execute("INSERT INTO quotes(quote_number,client_name,client_phone,items_json,total,created_at) VALUES(?,?,?,?,?,?)", (n,client_name,client_phone,json.dumps(items,ensure_ascii=False),total,now))
                c.execute("INSERT INTO settings(key,value) VALUES('next_quote',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", (str(n+1),))
                c.commit(); c.close()
                return self.send_json(200, {'number': n})
            except Exception as e: return self.send_json(400, {'error':str(e)})
        if not self.admin_ok(): return self.send_json(401, {'error':'PIN de administrador inválido.'})
        try:
            data=self.body_json(); c=db()
            if path=='/api/quote/next':
                row=c.execute("SELECT value FROM settings WHERE key='next_quote'").fetchone()
                n=int(row['value']) if row else 1
                c.execute("INSERT INTO settings(key,value) VALUES('next_quote',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", (str(n+1),))
                c.commit(); c.close(); return self.send_json(200, {'number': n})
            if path=='/api/products':
                category=str(data.get('category','Telas')).strip() or 'Telas'; brand=str(data.get('brand','')).strip(); model=str(data.get('model','')).strip(); price=parse_price(data.get('price',0)); cost=data.get('cost')
                if not brand or not model: raise ValueError('Marca e modelo são obrigatórios.')
                cur=c.execute('INSERT INTO products(category,brand,model,price,cost,image,source_url) VALUES(?,?,?,?,?,?,?)',(category,brand,model,price,cost,data.get('image'),data.get('source_url'))); pid=cur.lastrowid
                image=data.get('image')
                if isinstance(image,str) and image.startswith('data:image/'):
                    c.execute('UPDATE products SET image=? WHERE id=?',(save_product_image(image,pid),pid))
                c.commit(); c.close(); return self.send_json(201, {'id':pid})
            if path=='/api/restore':
                text=(WWW/'data.js').read_text(encoding='utf-8'); products=json.loads(text[text.find('['):text.rfind(']')+1]); count=replace_products(c, products); c.commit(); c.close(); return self.send_json(200, {'ok':True,'count':count,'quotes_preserved':True})
            if path=='/api/restore-file':
                filename=str(data.get('filename','backup.json')); raw=base64.b64decode(data.get('content',''))
                if not filename.lower().endswith('.json'):
                    raise ValueError('O backup do sistema deve ser um arquivo JSON.')
                payload=json.loads(raw.decode('utf-8-sig'))
                products=payload.get('products') if isinstance(payload,dict) else payload
                if not isinstance(products,list): raise ValueError('Backup inválido: lista de produtos não encontrada.')
                count=replace_products(c, products); c.commit(); c.close(); return self.send_json(200, {'ok':True,'count':count,'quotes_preserved':True})
            if path=='/api/import':
                products=data.get('products');
                if not isinstance(products,list): raise ValueError('Lista inválida.')
                c.execute('DELETE FROM products'); c.executemany('INSERT INTO products(category,brand,model,price,cost,image,source_url) VALUES(?,?,?,?,?,?,?)',[(p.get('category','Telas'),str(p.get('brand','')),str(p.get('model','')),parse_price(p.get('price',0)),p.get('cost'),p.get('image'),p.get('source_url')) for p in products]); c.commit(); c.close(); return self.send_json(200, {'ok':True,'count':len(products)})
            if path=='/api/import-file':
                filename=str(data.get('filename','arquivo')); raw=base64.b64decode(data.get('content','')); products=parse_import_bytes(filename,raw)
                normalized=[]
                for p in products:
                    def pick(keys):
                        for k,v in p.items():
                            lk=str(k).lower().strip()
                            if lk in keys or any(key in lk for key in keys):
                                if v not in (None,''): return v
                        return None
                    category=str(pick(('category','categoria','tipo')) or 'Acessórios').strip()
                    if category.lower() in ('tela','telas','display'): category='Telas'
                    elif category.lower() in ('acessório','acessórios','acessorio','acessorios'): category='Acessórios'
                    brand=str(pick(('brand','marca','fabricante')) or 'Diversos').strip()
                    model=str(pick(('model','modelo','produto','nome','name','descrição','descricao')) or '').strip()
                    raw_price=pick(('price','preço','preco','valor','venda'))
                    try: price=parse_price(raw_price)
                    except: continue
                    if model and price>0: normalized.append((category,brand,model,price,p.get('cost'),p.get('image'),p.get('source_url')))
                if not normalized: raise ValueError('Nenhum produto válido foi encontrado no arquivo.')
                mode=str(data.get('mode','append')).lower()
                if mode=='replace':
                    c.execute('DELETE FROM products')
                existing={(r['category'].lower(),r['brand'].lower(),r['model'].lower()) for r in c.execute('SELECT category,brand,model FROM products').fetchall()}
                added=[]
                for row in normalized:
                    key=(row[0].lower(),row[1].lower(),row[2].lower())
                    if key in existing: continue
                    added.append(row); existing.add(key)
                if added: c.executemany('INSERT INTO products(category,brand,model,price,cost,image,source_url) VALUES(?,?,?,?,?,?,?)',added)
                c.commit(); c.close(); return self.send_json(200, {'ok':True,'count':len(added),'found':len(normalized),'mode':mode})
            return self.send_json(404, {'error':'Rota não encontrada.'})
        except Exception as e:
            try: c.rollback(); c.close()
            except Exception: pass
            return self.send_json(400, {'error':str(e)})

    def do_PUT(self):
        if not self.admin_ok(): return self.send_json(401, {'error':'PIN de administrador inválido.'})
        path=urllib.parse.urlparse(self.path).path
        if not path.startswith('/api/products/'):
            return self.send_json(404, {'error':'Rota não encontrada.'})
        try:
            pid=int(path.rsplit('/',1)[1]); data=self.body_json(); fields=[]; vals=[]
            for k in ('category','brand','model','price','cost','image','source_url'):
                if k in data:
                    value=data[k]
                    if k=='image' and isinstance(value,str) and value.startswith('data:image/'):
                        value=save_product_image(value,pid)
                    fields.append(k+'=?'); vals.append(float(value) if k=='price' and value is not None else value)
            if not fields: return self.send_json(400, {'error':'Nada para alterar.'})
            vals.append(pid); c=db(); cur=c.execute('UPDATE products SET '+','.join(fields)+' WHERE id=?',vals); c.commit(); c.close(); return self.send_json(200, {'ok':cur.rowcount>0})
        except Exception as e: return self.send_json(400, {'error':str(e)})

    def do_DELETE(self):
        if not self.admin_ok(): return self.send_json(401, {'error':'PIN de administrador inválido.'})
        path=urllib.parse.urlparse(self.path).path
        if not path.startswith('/api/products/'):
            return self.send_json(404, {'error':'Rota não encontrada.'})
        try:
            pid=int(path.rsplit('/',1)[1]); c=db(); cur=c.execute('DELETE FROM products WHERE id=?',(pid,)); c.commit(); c.close(); return self.send_json(200, {'ok':cur.rowcount>0})
        except Exception as e: return self.send_json(400, {'error':str(e)})

if __name__=='__main__':
    DB.parent.mkdir(parents=True, exist_ok=True)
    init_db()
    print(f'\nSistema de Vendas rodando na porta {PORT}\nBanco: {DB}\nPIN admin: variável ADMIN_PIN/config.json\nPressione Ctrl+C para parar.\n')
    ThreadingHTTPServer(('0.0.0.0',PORT),Handler).serve_forever()
