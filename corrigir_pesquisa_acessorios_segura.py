import os, shutil, sys, datetime
MARK='SMART-TALLES-ACCESSORY-SEARCH-SAFE-V1'
HERE=os.path.abspath(os.path.dirname(__file__))
def find_root():
    cur=HERE
    for _ in range(8):
        if os.path.isfile(os.path.join(cur,'www','index.html')): return cur
        cur=os.path.dirname(cur)
    return None
root=find_root()
if not root:
    print('ERRO: não encontrei a pasta do projeto com www\\index.html.'); input('Enter...'); sys.exit(1)
www=os.path.join(root,'www'); index=os.path.join(www,'index.html'); js=os.path.join(www,'accessory-search.js')
backup=None
try:
    html=open(index,'r',encoding='utf-8-sig').read()
    if MARK in html:
        print('AVISO: esta correção já foi instalada. Nada foi alterado.'); input('Enter...'); sys.exit(0)
    ts=datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    backup=os.path.join(www,f'index.html.backup_pesquisa_segura_{ts}')
    shutil.copy2(index,backup)
    anchor='<script src="app.js"></script>'
    if anchor not in html: raise RuntimeError('Não encontrei o carregamento do app.js no index.html.')
    if 'src="accessory-search.js"' in html: raise RuntimeError('O accessory-search.js já está referenciado no index.html.')
    html=html.replace(anchor,anchor+'\n  <script src="accessory-search.js"></script> <!-- '+MARK+' -->',1)
    open(index,'w',encoding='utf-8',newline='').write(html)
    shutil.copy2(os.path.join(HERE,'accessory-search.js'),js)
    print('OK: Pesquisa de acessórios segura instalada.')
    print('Alterado somente: www/index.html')
    print('Criado: www/accessory-search.js')
    print('Backup:',os.path.basename(backup))
except Exception as e:
    if backup and os.path.exists(backup): shutil.copy2(backup,index)
    print('ERRO: nenhuma alteração foi mantida.'); print(e)
input('Pressione Enter para sair...')
