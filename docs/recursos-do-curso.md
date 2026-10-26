# Recursos usados e origem nos trabalhos Jynx

Referências são caminhos relativos à pasta Jynx, que contém os exercícios e este Projeto Final. Os exercícios foram somente lidos; não foram modificados nem incluídos no novo repositório.

| Recurso do portal | Onde foi encontrado |
| --- | --- |
| React e Vite | REACT 1/package.json; REACT 3/package.json |
| Componentes separados em arquivos | REACT 3/src/Index.jsx, Produtos.jsx e main.jsx |
| useState e eventos de campos/botões | REACT 1/src/App.jsx, linhas 22–26 e 59–81 |
| useEffect | REACT 3/src/Produtos.jsx, linhas 7 e 13 (esboço) |
| createBrowserRouter, RouterProvider e Link | REACT 3/src/main.jsx, linhas 2–22; Index.jsx, linhas 2 e 10 |
| fetch, async/await, JSON e operações HTTP | frontend/app.js; API/script.js |
| Laços for, arrays, objetos e condicionais | Aula#8/loop.js; Aula#9/caixa_mercado.js |
| Cards e listagens | API/script.js, linhas 15–32 |
| Inputs e textarea | frontend/index.html, linhas 47–59 e 77–92 |
| Select e validações simples | Aula#11/index.html e script.js |
| Tabelas do painel | REACT 3/src/Produtos.jsx, linhas 59–87 |
| CSS puro, Flexbox, Grid e media queries | REACT 3/src/Produtos.css; frontend/styles.css |
| Imagens locais | Aula#4/style.css e pasta images |
| Fastify, register e prefix | backend/src/server.js; Back End/src/server.js |
| Separação routes/controller/repository | backend/src e Back End/src |
| Controllers/repositories como objetos e funções async | backend/src/controller/products.controller.js; backend/src/repository/products.repository.js |
| Neon com @neondatabase/serverless | backend/package.json e src/repository/products.repository.js |
| Base de login por e-mail e senha | backend/src/controller/users.controller.js (esboço com bcrypt) |

## Como essa base foi aplicada

- Express foi substituído pelo Fastify usado nas aulas.
- O driver pg foi substituído por @neondatabase/serverless para o teste isolado de conexão.
- As páginas React foram separadas em arquivos e usam React Router, como REACT 3.
- A interface usa fetch com async/await, listas com for e campos explícitos.
- Removidos o roteador manual por hash, o hook próprio de notícias e o sessionStorage.
- Dados de notícias e usuários continuam fictícios em memória, preservando o escopo do protótipo. Não há migração nem criação de tabelas.
- O logo é exatamente a imagem fornecida para o projeto, servida localmente.

## Limites da comparação

Os exercícios demonstram os fundamentos, mas não contêm um portal completo pronto para copiar. As telas de notícias são a aplicação desses fundamentos ao tema solicitado.

O useEffect e o GET com Axios de REACT 3 ainda estavam iniciados, sem um fluxo completo. A referência de comunicação HTTP funcional foi o JavaScript comum de frontend/app.js e API/script.js. Axios não foi adicionado, pois fetch já resolve essas chamadas.

As verificações de acesso, validações HTTP e geração segura do identificador de sessão foram mantidas como infraestrutura mínima do login solicitado anteriormente. Não são apresentadas como conteúdo que já estava completo nas aulas. Não foram copiados erros ou credenciais embutidas dos exercícios. Os testes automatizados são ferramentas de verificação do projeto, não funcionalidades adicionais do site.

## Evolução posterior — editor e Cloudinary (26/10/2026)

O mapa acima registra a adaptação original. Depois dele, o trabalho de Henrique acrescentou editor formatado, rascunhos e persistência real em SQLite/Neon; portanto, a descrição histórica de notícias apenas em memória já não representa a versão atual.

A pedido explícito do usuário, acrescentamos upload de capa com Cloudinary, @fastify/multipart e FormData. Estes são novos recursos estudados para esta etapa, e não recursos que afirmamos ter encontrado completos nos exercícios anteriores. A organização routes/controller/repository foi preservada. Consulte docs/apresentacao.md para a arquitetura atual.
