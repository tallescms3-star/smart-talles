from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
WWW = REPO / 'www'
INDEX = WWW / 'index.html'
JS = WWW / 'catalogo-ajustes.js'

if not INDEX.exists():
    raise SystemExit('ERRO: www/index.html não foi encontrado. Extraia este pacote dentro da pasta smart-talles.')

source = (ROOT / 'catalogo-ajustes.js').read_text(encoding='utf-8')
JS.write_text(source, encoding='utf-8')

html = INDEX.read_text(encoding='utf-8')
marker = '<script src="catalogo-ajustes.js"></script>'
if marker in html:
    print('OK: o ajuste do catálogo já estava instalado.')
    raise SystemExit(0)

backup = INDEX.with_name(f'index.html.backup_catalogo_ajustes_{datetime.now():%Y%m%d_%H%M%S}')
backup.write_text(html, encoding='utf-8')

needle = '<script src="accessory-search.js"></script>'
if needle in html:
    new_html = html.replace(needle, needle + '\n    ' + marker, 1)
elif '<script src="app.js"></script>' in html:
    needle = '<script src="app.js"></script>'
    new_html = html.replace(needle, needle + '\n    ' + marker, 1)
else:
    raise SystemExit('ERRO: não encontrei o carregamento do app.js para instalar o ajuste.')

INDEX.write_text(new_html, encoding='utf-8')
print('OK: catálogo ajustado.')
print('Alterado: www/index.html')
print('Criado: www/catalogo-ajustes.js')
print(f'Backup: {backup.name}')
