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

A página de esportes apresenta notícias publicadas na categoria `Esportes`, com uma principal e até duas secundárias em destaque, seguida da classificação e dos jogos em colunas horizontais por dia. Os atalhos Notícias, Classificação e Jogos aguardam o carregamento dos blocos para posicionar a página corretamente. O botão “Exibir mais” do resumo na página inicial leva a `/esportes`.

`GET /api/sports/brasileirao/proximo-jogo` seleciona o próximo confronto futuro com status `SCHEDULED` ou `TIMED` da temporada atual, sem limitar a consulta à semana. Usa o mesmo cache de 15 minutos e retorna `match: null` quando não há próximo confronto disponível.

A navbar centralizada contém Início, Esportes, Economia e São Paulo (com coração da Lucide). O acesso editorial fica acima do logo. `/economia` lista a categoria Economia; `/sao-paulo` reúne São Paulo e Cidade. As novas categorias estão disponíveis no editor. O favicon SVG fica em `frontend/public/favicon.svg`.

O seed inclui oito notícias fictícias de esportes, identificadas como demonstração e com IDs fixos para evitar duplicação. Os antigos exemplos da categoria singular `Esporte` foram removidos do seed; a exclusão já realizada no SQLite local não é uma migração automática para bancos existentes em outros ambientes.

## Economia: notícias e cotações reais

`/economia` reúne, nesta ordem, notícias principais, cartões de mercado, as cinco últimas notícias da categoria Economia e o histórico do dólar. “Exibir mais” revela até mais cinco por clique. O seed inclui oito matérias fictícias com IDs estáveis; as cotações do painel vêm exclusivamente das APIs externas.

Adicione ao `backend/.env` e reinicie o backend:

```env
AWESOME_API_KEY=
COINGECKO_API_KEY=
```

A chave da AwesomeAPI é opcional; o endpoint público funciona com cache. A CoinGecko exige a chave do plano **Demo**, enviada no header `x-cg-demo-api-key`. Cadastros: https://awesomeapi.com.br/auth/signup e https://www.coingecko.com/en/api/pricing. Nunca use variáveis `VITE_*` para essas chaves. A listagem pública da brapi não exige token.

| Rota pública | Provedor | Cache por processo |
| --- | --- | --- |
| `/api/economy/altas` | brapi | 30 minutos |
| `/api/economy/dolar` | AwesomeAPI | 5 minutos |
| `/api/economy/dolar/historico?days=30` | AwesomeAPI | 6 horas |
| `/api/economy/criptos` | CoinGecko Demo | 10 minutos |

O ranking usa a variação percentual fornecida pela brapi, exclui tickers fracionários e ativos sem volume ou sem alta, e exibe até três resultados. A listagem não fornece o horário individual dos preços; a interface distingue horário da consulta e variação disponível, sem afirmar que os dados são de um pregão em andamento. Listagens incompletas são tratadas como indisponíveis.

O dólar usa a cotação comercial de compra (`bid`). O histórico consulta até 180 amostras, remove duplicações por data em Brasília, ordena e filtra períodos de 30, 90 ou 180 dias corridos. A amostra mais recente pode ser parcial; dias sem dados não são inventados. O gráfico inclui seletor de datas por teclado e tabela acessível.

Bitcoin, Ethereum e Solana são consultados juntos, em USD, com variação de 24 horas e horário da cotação. O cache de dez minutos equivale a cerca de 4.320 consultas em 30 dias para um processo continuamente acessado, sem contar reinícios, erros ou outros consumidores. O plano Demo exige atribuição à CoinGecko, presente na interface; confira os termos do provedor antes de uso comercial.

Os quatro blocos carregam independentemente. As chamadas têm timeout de dez segundos, compartilham requisições simultâneas e aguardam um minuto após falhas antes de tentar o provedor novamente. A API retorna 503 em indisponibilidades e 400 para períodos diferentes dos três permitidos. Não há polling automático, dados substitutos fictícios ou registro de chaves nas respostas. Recarregue a página para consultar novamente, respeitando o cache.


## Organização das páginas

Todos os componentes usados como páginas pelas rotas ficam em `frontend/src/pages`. `main.jsx` apenas registra essas rotas; a composição visual fica no arquivo da página.

- `Economia.jsx`: notícias principais, cartões de mercado, últimas notícias em grupos de cinco e histórico do dólar.
- `SaoPaulo.jsx`: apresentação e notícias das categorias São Paulo e Cidade.
- `Esportes.jsx`: notícias esportivas, classificação e jogos.
- `BrasileiraoEmbed.jsx`: página da tabela incorporável, sem cabeçalho e rodapé do portal.
- As páginas inicial, de notícia, login, painel, edição, usuários e não encontrada também permanecem em `pages`.

Blocos reutilizáveis, como `MaioresAltas`, `CotacaoDolar`, `Criptomoedas`, `HistoricoDolar`, `NoticiasPrincipais`, `CardNoticia`, `TabelaBrasileirao` e `Layout`, ficam em `frontend/src/components`. A antiga página genérica `Editoria.jsx` foi substituída por Economia e São Paulo.


### Componentes independentes de Economia

A página `frontend/src/pages/Economia.jsx` compõe diretamente os quatro blocos de mercado. Para mover, remover ou reutilizar um bloco, altere seu uso nessa página; cada componente faz sua própria consulta e controla carregamento, erro e nova tentativa.

Arquivos em `frontend/src/components/economia/`:

- `MaioresAltas.jsx`: ranking da B3.
- `CotacaoDolar.jsx`: cotação comercial USD/BRL.
- `Criptomoedas.jsx`: Bitcoin, Ethereum e Solana em USD.
- `HistoricoDolar.jsx`: consulta do histórico e seleção de período; usa `GraficoDolar.jsx` para desenhar o gráfico e a tabela.
- `useMercado.js`, `formatters.js`, `StatusMercado.jsx`, `VariacaoMercado.jsx` e `FonteMercado.jsx`: utilitários e elementos compartilhados.

Os quatro blocos aceitam `className` para ajustes isolados. `.market-cards` usa Flexbox para manter os três cartões lado a lado e empilhá-los em telas menores; o histórico permanece abaixo. O componente unificado `PainelMercado.jsx` foi removido. Endpoints e caches do backend permanecem iguais.


As notícias de Economia também são blocos independentes em `components/economia`: `NoticiasPrincipaisEconomia.jsx` reutiliza o componente de destaques existente; `UltimasNoticiasEconomia.jsx` controla a lista e a paginação de cinco em cinco. Ambos podem ser montados isoladamente e aceitam `className`. `useNoticiasEconomia.js` filtra a categoria e compartilha somente a requisição em andamento para evitar consultas duplicadas na montagem simultânea. Cada bloco mantém seu próprio carregamento, erro e nova tentativa, usando `StatusNoticias.jsx`. A página `Economia.jsx` apenas compõe os blocos e define sua ordem.

### Resumos na página inicial

As seções de Esportes e Economia exibem cinco notícias em dois terços da largura e indicadores no terço restante. Esportes empilha a classificação dos cinco primeiros times e o próximo jogo; Economia empilha as maiores altas e a cotação do dólar. Em telas menores, os blocos ficam em uma coluna. Cada seção termina com um único botão “Exibir mais”, centralizado, que abre o topo da respectiva página. Na página de Esportes, a lista começa com cinco notícias e permite carregar mais cinco por clique.

### Mapa de São Paulo

Em `frontend/.env`, preencha `VITE_GOOGLE_MAPS_API_KEY=` com sua Google Maps Demo Key e reinicie o frontend (`npm run dev:frontend`). O modelo está em `frontend/.env.example`. A chave do SDK é utilizada no navegador; configure as restrições de domínio aplicáveis na conta Google. A Demo Key é destinada a protótipos; para produção, configure uma chave de produção e seu map ID no componente `MapaLocais.jsx`.

A página `/sao-paulo` mostra destaques da categoria São Paulo e os locais persistidos no mesmo banco das notícias (SQLite local ou PostgreSQL/Neon). Notícias de “Cidade” não são automaticamente consideradas da capital. Para incluir uma matéria, selecione “São Paulo” no cadastro editorial.

Durante o beta, qualquer visitante pode usar “Adicionar novo local” diretamente na página, sem login. O cadastro público mantém a validação dos campos na API. Busque o estabelecimento nas sugestões do Google, selecione-o e preencha nome e descrição. O endereço, as coordenadas e o link do Google Maps são preenchidos automaticamente. A busca utiliza Places API (New), que precisa estar disponível para a chave configurada. A lista permanece disponível se o Google Maps estiver indisponível. Como no restante do protótipo, recarregar o navegador exige novo login.
