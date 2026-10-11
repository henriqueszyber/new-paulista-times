# New Paulista Times

Portal de notícias fictícias do curso Jynx, com o logo fornecido pela equipe. A implementação usa a base encontrada nos exercícios: React, Vite, React Router, fetch, Fastify, arrays/objetos e CSS puro.

O mapa de referências está em [docs/recursos-do-curso.md](docs/recursos-do-curso.md). O histórico completo está em [resumo.txt](resumo.txt).

## Executar

Requer Node.js 22.12 ou superior. Na raiz do projeto:

```sh
npm install
```

Em um terminal:

```sh
npm run dev:backend
```

Em outro:

```sh
npm run dev:frontend
```

Abra http://127.0.0.1:5173. A API usa http://127.0.0.1:3001. O Vite encaminha chamadas `/api` para o backend. Ctrl+C encerra cada servidor.

## O que experimentar

- Home pública com notícias e filtro de categoria.
- Página com o texto completo da notícia.
- Login demonstrativo e dashboard com publicações.
- Criação de notícia com título, resumo, categoria e textarea.
- Consulta da equipe com os papéis SUPER_ADMIN, ADMIN e WRITER.

| E-mail de demonstração | Papel |
| --- | --- |
| super@jynx.local | SUPER_ADMIN |
| admin@jynx.local | ADMIN |
| writer@jynx.local | WRITER |

Senha de todas: `demo123`.

Todos podem publicar; somente SUPER_ADMIN e ADMIN consultam a equipe. A API verifica as permissões e define o autor pela sessão. As credenciais são públicas e exclusivamente demonstrativas.

A sessão fica em memória no navegador: atualizar a página exige novo login. A sessão da API expira em 8 horas e é invalidada ao sair. Notícias e sessões são reiniciadas quando o backend é desligado.

## Estrutura

```text
frontend/
  public/logo-new-paulista-times.png
  src/                 páginas, componentes e comunicação com a API
backend/
  src/
    routes/            endereços HTTP e proteção das rotas
    controllers/       validação das requisições e respostas
    repositories/      dados em memória e teste isolado do Neon
    app.js             registra as rotas Fastify
    server.js          inicia a API
    data.js            notícias e usuários fictícios
  test/api.test.js
  scripts/checkDatabase.js
docs/recursos-do-curso.md
resumo.txt
```

Exemplo: `GET /api/news` passa por newsRoutes, newsController e newsRepository. O código usa objetos e funções simples, seguindo os exercícios do backend.

## API

| Método | Rota | Acesso |
| --- | --- | --- |
| GET | /api/health | Público |
| GET | /api/news | Público |
| GET | /api/news/:id | Público |
| POST | /api/auth/login | E-mail e senha demonstrativos |
| GET | /api/auth/me | Logado |
| POST | /api/auth/logout | Logado |
| POST | /api/news | Logado: title, summary, category, content |
| GET | /api/users | ADMIN ou SUPER_ADMIN |

Rotas protegidas recebem `Authorization: Bearer TOKEN`, retornado pelo login. Ao enviar JSON, use `Content-Type: application/json`; omita esse header nas requisições sem corpo.

## Verificações

```sh
npm test
npm run build
```

Os testes usam uma API isolada em outro processo, sem alterar as notícias da sessão aberta. O build fica em `frontend/dist`. Para conferir esse build com o backend ativo:

```sh
npm run preview --workspace frontend
```

## Neon opcional

O site funciona sem banco. O driver `@neondatabase/serverless`, presente nos trabalhos do curso, é usado somente para testar a conexão:

1. Copie `backend/.env.example` para `backend/.env`.
2. Preencha `DATABASE_URL` com sua conexão.
3. Na raiz, execute:

```sh
npm run db:check --workspace backend
```

O comando faz apenas `SELECT 1` via HTTPS. Não cria tabelas, não altera dados e não muda o armazenamento das notícias. O arquivo `.env` é ignorado pelo Git; nunca publique uma conexão real no código ou na documentação.

## Escopo do curso

Sem ORM, editor rico, upload, biblioteca visual, Context ou hooks próprios. O logo é um arquivo local, sem geração ou alteração da imagem. Este é um projeto educacional com notícias fictícias e identidade própria, sem vínculo com outros jornais.
