# Smart Talles — Sistema de Vendas

Sistema web de vendas/orçamentos da Smart Talles, com catálogo, administração, geração de orçamento, WhatsApp, clima/qualidade do ar e banco SQLite.

## Estrutura

- `server.py` — servidor HTTP + API + SQLite.
- `www/` — interface do sistema.
- `www/data.js` — catálogo inicial usado na primeira inicialização.
- `www/accessories/` — imagens dos acessórios.
- `config.example.json` — exemplo de configuração local.
- `Dockerfile` — execução em containers.
- `Procfile` — compatibilidade com hosts que usam Procfile.
- `railway.toml` — configuração básica para Railway.

## Rodar no computador

Requer Python 3.11+.

```bash
python server.py
```

Depois abra `http://localhost:8080`.

Para o PIN local, você pode criar `config.json` (ele não deve ser enviado ao GitHub):

```json
{
  "admin_pin": "SEU_PIN"
}
```

Ou definir a variável `ADMIN_PIN`.

## Publicar no GitHub

1. Crie um repositório **privado** no GitHub.
2. Envie todos os arquivos desta pasta.
3. Não envie `config.json`, `vendas.db` ou `.env`.
4. O GitHub será o repositório do código; o servidor Python precisa rodar em uma hospedagem de backend.

## Colocar o servidor online

O projeto está preparado para hospedagens que executem Python/Docker.

### Railway + volume persistente (recomendado para esta versão)

1. Crie um projeto no Railway e conecte o repositório GitHub.
2. Defina `ADMIN_PIN` nas variáveis do serviço.
3. Defina `DB_PATH=/data/vendas.db`.
4. Adicione um **Volume** montado em `/data`.
5. Faça o deploy.
6. Use a URL pública fornecida pelo Railway.

O volume é importante porque o sistema usa SQLite. Sem armazenamento persistente, o banco pode ser perdido quando o serviço for recriado.

### Render

O `Procfile` permite iniciar o servidor, mas o SQLite precisa de armazenamento persistente para que produtos, orçamentos e alterações administrativas sobrevivam a novos deploys/reinícios. Se usar Render, configure armazenamento persistente ou migre o banco para PostgreSQL antes de colocar o sistema em produção.

## Variáveis de ambiente

| Variável | Uso |
|---|---|
| `PORT` | Porta fornecida pela hospedagem. O servidor já lê essa variável. |
| `ADMIN_PIN` | PIN do painel administrativo. **Obrigatória em produção.** |
| `DB_PATH` | Caminho do SQLite. Use `/data/vendas.db` quando houver volume persistente. |

## Observação importante sobre o GitHub Pages

Este projeto **não é um site estático puro**. O `index.html` depende das APIs do `server.py`, como `/api/products` e `/api/quote/next`. Portanto, publicar somente a pasta `www` no GitHub Pages não fará o sistema completo funcionar.

## Checklist antes do primeiro deploy

- [ ] Repositório GitHub criado.
- [ ] `config.json` fora do Git.
- [ ] `vendas.db` fora do Git.
- [ ] `ADMIN_PIN` configurado na hospedagem.
- [ ] Volume persistente configurado em `/data`.
- [ ] `DB_PATH=/data/vendas.db` configurado.
- [ ] `/api/health` respondendo `ok: true`.
- [ ] Acesso à Administração testado.
- [ ] Criação de orçamento e abertura do WhatsApp testadas.
