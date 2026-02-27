# Cloud X - Unlock com Auth Backend (Vercel)

Projeto frontend estatico com backend serverless para cadastro e login.

## Endpoints criados

- `POST /api/auth/register` cria usuario e abre sessao
- `POST /api/auth/login` autentica e abre sessao
- `POST /api/auth/logout` encerra sessao
- `GET /api/auth/me` retorna usuario autenticado
- `POST /api/auth/verify-master-key` valida a chave mestra do usuario logado

## Como funciona

- Sessao via cookie HTTP-only (`cloudx_session`)
- Senha/chave mestra com hash `scrypt` + salt
- Persistencia:
  - Em producao (Vercel): Vercel KV (obrigatorio)
  - Sem KV local: fallback em memoria (somente desenvolvimento)

## Configuracao na Vercel

1. Crie um banco **Vercel KV** no projeto.
2. Em `Settings > Environment Variables`, garanta:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
3. Redeploy do projeto.

Sem essas variaveis em producao, o backend retorna erro de configuracao.

## Estrutura

- `index.html` UI
- `style.css` estilos
- `script.js` fluxo frontend + chamadas da API
- `api/_lib/auth.js` utilitarios auth/cookies
- `api/_lib/store.js` persistencia (KV/memoria)
- `api/auth/*.js` rotas serverless
