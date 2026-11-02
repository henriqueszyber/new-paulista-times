# New Paulista Times

Portal de notícias fictícias do curso Jynx, com editor de texto formatado, rascunhos e notícias salvas em banco de dados. O frontend usa React e Vite; a API usa Fastify. O mapa de referências do projeto original está em [docs/recursos-do-curso.md](docs/recursos-do-curso.md) e o histórico anterior em [resumo.txt](resumo.txt).

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

Sem configuração adicional, as notícias ficam em `backend/data/news.sqlite`. É um banco SQLite local, ignorado pelo Git. Reiniciar a API não apaga as notícias. O projeto também pode usar Neon; veja abaixo.

## Editor

Entre pela área editorial. E-mails de demonstração: `super@jynx.local` (SUPER_ADMIN), `admin@jynx.local` (ADMIN) e `writer@jynx.local` (WRITER). A senha de todos é `demo123`. Essas credenciais são públicas e exclusivamente demonstrativas.

Em **Nova notícia**, o editor oferece negrito, itálico, títulos de seção, subtítulos, links, listas, desfazer e refazer. Selecione um trecho antes de criar um link. O conteúdo colado entra como texto simples. Salve o primeiro rascunho pelo botão; depois, alterações nesse rascunho são salvas automaticamente após uma breve pausa. Publique para mostrar a notícia na página inicial. No painel, clique em **Editar** para continuar um texto.

Todos podem publicar. O autor pode editar seus textos; ADMIN e SUPER_ADMIN também podem editar os textos dos demais. Somente administradores consultam a equipe. A API verifica as permissões e define o autor pela sessão. A sessão fica em memória no navegador: atualizar a página exige novo login. A sessão da API expira em 8 horas e é invalidada ao sair.

## Estrutura

```text
frontend/
  public/logo-new-paulista-times.png
  src/components/TextEditor.jsx       editor visual
  src/components/TextView.jsx         leitura do texto formatado
backend/
  data/news.sqlite                    banco local criado automaticamente
  src/content.js                      validação do formato do texto
  src/repositories/newsRepository.js  persistência em SQLite ou Neon
  test/api.test.js
```

## API

| Método | Rota | Acesso |
| --- | --- | --- |
| GET | `/api/health` | Público |
| GET | `/api/news` | Público; somente publicadas |
| GET | `/api/news/:id` | Público; somente publicadas |
| GET | `/api/news/manage` | Logado; inclui rascunhos permitidos |
| GET | `/api/news/manage/:id` | Autor ou administrador |
| POST | `/api/auth/login` | E-mail e senha demonstrativos |
| GET | `/api/auth/me` | Logado |
| POST | `/api/auth/logout` | Logado |
| POST | `/api/news` | Logado: `title`, `summary`, `category`, `content`, `status` |
| PUT | `/api/news/:id` | Autor ou administrador; mesmos campos do POST |
| POST | `/api/images` | Logado; multipart/form-data, campo de arquivo `image` |
| GET | `/api/users` | ADMIN ou SUPER_ADMIN |

Rotas protegidas recebem `Authorization: Bearer TOKEN`, retornado pelo login. Ao enviar JSON, use `Content-Type: application/json`. `status` aceita `draft` ou `published`. O conteúdo é um objeto JSON com blocos de parágrafo, título, subtítulo ou item de lista e trechos de texto com negrito, itálico e link. A API valida esse formato e aceita apenas links HTTP/HTTPS. Rascunhos não aparecem nas rotas públicas. Para publicar, resumo e corpo precisam conter texto.

## Verificações

```sh
npm test
npm run build
```

Os testes usam um banco SQLite temporário e não alteram as notícias locais. O build fica em `frontend/dist`.

## Neon opcional

O site usa SQLite local por padrão. Para usar Neon:

1. Se ainda não existir, copie `backend/.env.example` para `backend/.env`. Preserve um arquivo que já esteja preenchido.
2. Preencha `DATABASE_URL` com sua conexão.
3. Reinicie o backend. Ele cria a tabela `news` no Neon e passa a salvar notícias nesse banco.

Para testar apenas a conexão, execute `npm run db:check --workspace backend`. Esse comando faz somente `SELECT 1`. O SQLite e o Neon são bancos independentes: configurar Neon não transfere notícias já salvas localmente. O arquivo `.env` é ignorado pelo Git; nunca publique uma conexão real no código ou na documentação.

## Limites atuais

O portal aceita uma capa por notícia. Ainda não há imagens dentro do corpo do editor nem anexos. Remover ou trocar a capa não apaga o arquivo remoto; a limpeza no Cloudinary é manual. O Git guarda checkpoints do código, mas não versões do conteúdo salvo no banco. Este é um projeto educacional com notícias fictícias e identidade própria, sem vínculo com outros jornais.

## Imagem de capa com Cloudinary

No `backend/.env`, preencha `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` e `CLOUDINARY_API_SECRET` a partir da sua conta e reinicie o backend. Não coloque o segredo no frontend. Para usar somente SQLite, deixe `DATABASE_URL` vazia; o upload funciona com qualquer um dos dois bancos. Sem Cloudinary configurado, notícias sem capa continuam funcionando.

Na criação ou edição, escolha JPEG, PNG ou WebP de até 5 MB e clique em **Enviar imagem**. Depois preencha descrição/crédito e salve o rascunho ou publique. Enquanto a seleção estiver pendente, envie ou cancele para liberar o salvamento.

O upload retorna `imageUrl` e `imagePublicId`. POST/PUT de notícias também recebem `imageAlt` e `imageCredit`. O arquivo fica no Cloudinary; esses quatro campos ficam no banco. Omitir os campos na edição preserva a capa; enviar `imageUrl` vazio remove sua associação. As colunas são criadas de forma aditiva, sem apagar notícias anteriores. URLs de imagens são públicas, inclusive para capas de rascunhos.

A integração usa `@fastify/multipart` para receber arquivos e `cloudinary` para enviá-los ao serviço. O editor de texto foi preservado.

## Apresentação do projeto

Veja [o roteiro completo](docs/apresentacao.md), com arquitetura, arquivos, explicação do editor, passo a passo da demonstração, perguntas frequentes e resultados de testes. O histórico de implementação continua em [resumo.txt](resumo.txt).

## Esportes: Brasileirão Série A

A página inicial mostra os cinco primeiros colocados e o próximo jogo agendado; `/esportes` e `/embed/brasileirao` exibem a classificação completa com escudos. A integração usa dados reais da **football-data.org**. O [plano gratuito](https://www.football-data.org/pricing) inclui tabelas e 10 chamadas por minuto; a [cobertura](https://www.football-data.org/coverage) inclui a Série A brasileira. Os dados podem apresentar atraso.

1. Crie uma conta em https://www.football-data.org/client/register e obtenha o token.
2. Adicione `FOOTBALL_DATA_API_TOKEN=seu_token` ao `backend/.env`, preservando as configurações existentes.
3. Reinicie o backend e abra `/esportes`.

O endpoint público `GET /api/sports/brasileirao` consulta `https://api.football-data.org/v4/competitions/BSA/standings` com `X-Auth-Token` somente no servidor. Usa a temporada atual retornada pelo provedor, cache em memória de 15 minutos por processo e uma única consulta para requisições simultâneas. Falhas têm intervalo de um minuto antes de nova consulta. Sem token ou quando a API falha, retorna 503 com uma mensagem amigável. Não há dados fictícios como substituição. A interface consulta ao abrir a página ou tentar novamente; recarregue para buscar atualizações.

Para incorporar a tabela em outra página, use a rota sem cabeçalho e rodapé (substitua o domínio pelo endereço publicado do frontend):

```html
<iframe
  src="https://SEU-DOMINIO/embed/brasileirao"
  title="Classificação do Brasileirão Série A"
  width="100%"
  height="1500"
  style="border: 0"
  loading="lazy"
></iframe>
```

A altura pode ser ajustada; tabelas maiores continuam acessíveis pela rolagem. Em produção, configure fallback das rotas do frontend para `index.html` e encaminhe `/api` para o backend, como já ocorre no proxy do Vite. O host deve permitir iframe nos domínios desejados. A chave nunca deve ser colocada no HTML, na URL do iframe ou em variáveis `VITE_*`.

### Jogos da semana

Após as notícias e a classificação, o calendário de `/esportes` mostra partidas do Brasileirão de segunda a domingo da semana atual, no fuso `America/Sao_Paulo`. Inclui jogos agendados, encerrados e outros estados informados pelo provedor, agrupados por dia, com escudos e placares quando disponíveis. Horários ainda não definidos aparecem como “Horário a confirmar”.

`GET /api/sports/brasileirao/jogos` usa o mesmo token, consulta `/v4/competitions/BSA/matches` por intervalo de datas e filtra a semana no horário de Brasília. O cache dura 15 minutos e é invalidado na mudança de semana. Não há atualização em tempo real; recarregue a página para consultar novamente. Sem partidas, há uma mensagem própria; falhas permitem tentar novamente.


### Notícias, navegação e página inicial

A página de esportes apresenta notícias publicadas na categoria `Esportes`, com uma principal e até duas secundárias em destaque, seguida da classificação e dos jogos em colunas horizontais por dia. Os atalhos Notícias, Classificação e Jogos aguardam o carregamento dos blocos para posicionar a página corretamente. O botão “Exibir mais” do resumo na página inicial leva a `/esportes#brasileirao`.

`GET /api/sports/brasileirao/proximo-jogo` seleciona o próximo confronto futuro com status `SCHEDULED` ou `TIMED` da temporada atual, sem limitar a consulta à semana. Usa o mesmo cache de 15 minutos e retorna `match: null` quando não há próximo confronto disponível.

A navbar centralizada contém Início, Esportes, Economia e São Paulo (com coração da Lucide). O acesso editorial fica acima do logo. `/economia` lista a categoria Economia; `/sao-paulo` reúne São Paulo e Cidade. As novas categorias estão disponíveis no editor. O favicon SVG fica em `frontend/public/favicon.svg`.

O seed inclui oito notícias fictícias de esportes, identificadas como demonstração e com IDs fixos para evitar duplicação. Os antigos exemplos da categoria singular `Esporte` foram removidos do seed; a exclusão já realizada no SQLite local não é uma migração automática para bancos existentes em outros ambientes.
