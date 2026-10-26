# New Paulista Times — roteiro para a apresentação

Preparado em 26/10/2026 para a apresentação de 27/10/2026.

## 1. O que o projeto faz

É um portal de notícias fictícias com duas partes: a pública, onde o visitante lê notícias, e a editorial, onde a equipe entra, escreve, salva rascunhos e publica. A capa fica no Cloudinary; o conteúdo e os dados da notícia ficam no banco.

A base foi adaptada aos exercícios Jynx. Henrique acrescentou o editor de texto formatado e o fluxo de rascunhos/persistência. Depois integramos a capa sem substituir o editor. As alterações e verificações estão registradas em resumo.txt. Explique o que você entende e reconheça o uso de bibliotecas e assistência no desenvolvimento; não precisa decorar cada linha.

## 2. Quem faz o quê

| Parte | Função no projeto |
| --- | --- |
| React | Mostra páginas, campos, listas e mensagens; mantém os valores do formulário em estado. |
| Vite | Executa o frontend durante o desenvolvimento e gera os arquivos finais no build. |
| React Router | Troca entre Home, notícia, login e telas administrativas. |
| Node.js | Executa o JavaScript do backend. |
| Fastify | Recebe as requisições HTTP e encaminha para as rotas. A versão atual usa Fastify, como nos exercícios, e não Express. |
| Neon/PostgreSQL | Guarda notícias, conteúdo formatado, status, autor e dados da capa. É o banco ativo nesta máquina. |
| SQLite | Alternativa local quando DATABASE_URL não está configurada; arquivo backend/data/news.sqlite. |
| Cloudinary | Recebe e hospeda a imagem; devolve seu endereço HTTPS e identificador. |
| Git/GitHub | Guardam o histórico do código e permitem colaborar. Não guardam as notícias do banco nem as chaves do .env. |

O Neon e o SQLite são bancos independentes. Mudar a configuração não copia notícias entre eles. NEWS_DB_PATH é uma configuração usada pelos testes para escolher um SQLite isolado.

## 3. Fluxo do upload — o ponto principal

    Pessoa escolhe uma foto e clica em Enviar imagem
        ↓
    React monta FormData com o arquivo no campo image
        ↓ POST /api/images + token de login
    Rota verifica a sessão
        ↓
    Controller verifica formato e tamanho
        ↓
    Repository envia os bytes ao Cloudinary
        ↓
    Cloudinary retorna URL HTTPS e public_id
        ↓
    React mostra a prévia e guarda esses dois valores no formulário
        ↓ Pessoa salva rascunho ou publica
    POST /api/news ou PUT /api/news/:id
        ↓
    Banco salva o texto e os dados da capa

São duas operações: enviar o arquivo e salvar a notícia. Upload sozinho não cria uma notícia. Um rascunho já existente também salva alterações automaticamente após uma pausa de 1,8 segundo. Enquanto há uma imagem selecionada aguardando envio, o salvamento fica suspenso; é preciso enviar ou cancelar essa seleção.

Ao ler uma notícia, o navegador busca os dados na nossa API e carrega a foto diretamente pelo endereço do Cloudinary. A API não precisa reenviar o arquivo a cada leitura.

## 4. Os arquivos que você pode mostrar

Todos os caminhos abaixo são relativos à raiz Projeto Final.

| Arquivo | Explicação curta |
| --- | --- |
| frontend/src/components/CoverUpload.jsx | Escolhe a imagem, envia FormData e mostra prévia ou erro. |
| frontend/src/pages/NovaNoticia.jsx | Junta título, resumo, categoria, texto e capa; controla salvar e publicar. |
| frontend/src/api.js | Centraliza fetch; envia JSON para notícias e FormData para arquivos. |
| backend/src/routes/imageRoutes.js | Declara a rota de upload e exige login antes de ler o arquivo. |
| backend/src/controllers/imageController.js | Recebe a requisição, valida e decide a resposta. |
| backend/src/images.js | Confere assinatura do arquivo e dados/endereço da capa. |
| backend/src/repositories/imageRepository.js | Usa a biblioteca oficial do Cloudinary para armazenar o arquivo. |
| backend/src/controllers/newsController.js | Valida notícia, verifica autoria/permissão e chama o repository. |
| backend/src/repositories/newsRepository.js | Executa SQL para criar, consultar e atualizar notícias. |
| frontend/src/components/CardNoticia.jsx | Exibe capa e resumo na Home. |
| frontend/src/pages/Noticia.jsx | Exibe a capa, o crédito e o texto completo. |

A divisão routes/controller/repository organiza responsabilidades: a rota diz onde chegar; o controller decide se o pedido é válido; o repository conversa com o banco ou serviço externo. Isso evita concentrar tudo no arquivo que inicia o servidor.

Trecho central do envio, em CoverUpload.jsx:

```js
const form = new FormData();
form.append('image', arquivo);
const dados = await api('/images', {
  method: 'POST', token: sessao.token, body: form
});
```

FormData é um pacote para enviar campos e arquivos. O navegador monta o Content-Type multipart/form-data com o separador necessário. Por isso api.js não força application/json quando o corpo é FormData. Nas outras chamadas, ele continua enviando JSON.

No repository, upload_stream recebe os bytes do arquivo. Usamos Promise para transformar a resposta da biblioteca em algo que pode ser aguardado com await. O identificador usa randomUUID para evitar colisão de nomes. Não é necessário um formulário de upload separado no painel do Cloudinary.

## 5. O que o banco guarda

Além dos campos que já existiam, foram acrescentados:

| Campo da API | Coluna no banco | Conteúdo |
| --- | --- | --- |
| imageUrl | image_url | Endereço público HTTPS da imagem. |
| imagePublicId | image_public_id | Identificador do arquivo no Cloudinary. |
| imageAlt | image_alt | Descrição para acessibilidade. |
| imageCredit | image_credit | Fotógrafo ou fonte; aparece na notícia. |

As colunas são acrescentadas apenas quando faltam. As notícias anteriores continuam existindo e podem não ter capa. Não armazenamos a imagem como base64 nem como arquivo binário no banco.

A imagem é opcional. Remover capa limpa os quatro campos da notícia depois do salvamento. Isso não apaga o arquivo da conta Cloudinary; a limpeza remota ficou manual para manter o protótipo simples. Trocar uma capa ou abandonar o formulário depois do upload também pode deixar um arquivo sem notícia associada.

## 6. Como funciona o editor do Henrique

TextEditor.jsx utiliza uma área contentEditable: o navegador permite escrever e formatar dentro dela. Os botões acionam comandos de negrito, itálico, títulos, listas e links. Os ícones vêm de lucide-react.

richText.js converte o conteúdo em um documento JSON composto por blocos e trechos. Um trecho pode ter texto, bold, italic e href. Não salvamos simplesmente qualquer HTML colado pelo usuário. A colagem entra como texto simples, o formato é validado no backend por content.js, e TextView.jsx monta a leitura formatada.

Exemplo simplificado do documento:

```json
{
  "type": "doc",
  "blocks": [
    { "type": "paragraph", "spans": [
      { "text": "Uma notícia", "bold": true }
    ] }
  ]
}
```

A capa é um campo separado desse documento. Assim, foi possível acrescentar imagens sem reescrever o editor. O editor atual não insere fotos no meio dos parágrafos. Ele usa comandos nativos do navegador, adequados para demonstrar esta implementação, mas precisaria de revisão de compatibilidade para evoluir o produto.

## 7. Login e permissões

Contas fictícias: super@jynx.local, admin@jynx.local e writer@jynx.local. Senha demonstrativa de todas: demo123.

O login devolve um token, usado no cabeçalho Authorization nas próximas chamadas. O backend verifica a sessão; esconder um botão no React não é suficiente para proteger uma rota.

Todos os papéis podem criar e publicar. WRITER edita seus próprios textos. ADMIN e SUPER_ADMIN também editam textos dos outros e consultam usuários. Nesta versão, ADMIN e SUPER_ADMIN têm as mesmas permissões nessas funcionalidades; não inventamos uma diferença que não existe no código.

Usuários e sessões são demonstrativos e ficam em memória; notícias persistem no banco. Recarregar o navegador exige novo login. Reiniciar o backend invalida suas sessões, mas não apaga as notícias persistidas. Não há cadastro real de usuários ou recuperação de senha.

## 8. Configuração e validação

O backend lê backend/.env. As variáveis CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET identificam e autenticam a conta. DATABASE_URL configura o Neon. O segredo fica apenas no servidor: não é colocado em variável VITE_, enviado ao frontend ou versionado. Na apresentação, mostre .env.example, nunca o .env real.

O upload aceita uma imagem JPEG, PNG ou WebP de até 5 MB. A interface faz uma primeira conferência; o backend verifica novamente tamanho, tipo e bytes iniciais. O Cloudinary precisa conseguir decodificar a imagem. Somente uma sessão válida pode enviar arquivos. Erros do serviço recebem uma mensagem genérica, sem detalhes internos da conta.

O endereço e o identificador recebidos no salvamento são conferidos para corresponderem ao Cloudinary configurado. As imagens usam URLs públicas: uma notícia em rascunho não aparece na API pública, mas sua imagem não é um arquivo privado protegido por login.

## 9. Demonstração sugerida — 6 a 8 minutos

1. Mostre a Home e abra uma notícia: visitante não precisa de login.
2. Entre na Área editorial com super@jynx.local e demo123. Abra o painel.
3. Abra o rascunho **Demonstração — editor e capa no Cloudinary**, criado na verificação real. Ele já contém o logo como capa, título, lista e texto em negrito. Está no Neon e não aparece na Home.
4. Mostre a organização das três pastas do backend e explique uma responsabilidade de cada.
5. Na tela da notícia, escolha uma foto JPEG/PNG/WebP pequena e clique em **Enviar imagem**. Aguarde a confirmação. Preencha descrição e crédito.
6. Edite um trecho no editor do Henrique. Mostre os botões de formatação. Salve o rascunho e aguarde a mensagem de sucesso.
7. Se quiser mostrar a publicação, clique em **Publicar notícia**. Isso realmente torna essa notícia visível no portal. Volte à Home para ver o card com capa.
8. Termine explicando: a foto está no Cloudinary; o texto e a URL estão no Neon; o React organiza a tela e a API aplica as regras.

Antes da aula: teste a internet, inicie os dois servidores, entre no painel e deixe uma foto pequena separada. Não dependa de instalar pacotes durante a apresentação. Mantenha um rascunho salvo como alternativa caso a rede falhe.

Na raiz, instale dependências com npm install. Em dois terminais, use npm run dev:backend e npm run dev:frontend. Acesse http://127.0.0.1:5173. Depois de mudar .env, reinicie o backend. O site precisa desses processos ativos; ainda não foi publicado em um serviço de hospedagem.

## 10. Perguntas prováveis

**Por que usar Cloudinary?** Para delegar armazenamento e entrega das imagens a um serviço especializado, sem manter uma pasta pública de uploads no servidor. Nesta etapa usamos apenas upload e a URL retornada.

**Por que não guardar a foto no Neon?** Poderíamos escolher outra arquitetura, mas separar arquivo e dados deixa este projeto mais fácil de entender. O banco guarda o vínculo da imagem com a notícia.

**O que acontece quando fechamos o site?** Notícias continuam no Neon ou SQLite, e imagens continuam no Cloudinary. Valores ainda não salvos no formulário podem ser perdidos.

**E se o upload falhar?** A tela mostra o erro. Podemos tentar novamente ou cancelar a seleção e salvar sem a nova imagem. O arquivo só entra na notícia quando seus dados forem salvos.

**Já está pronto para um portal real?** Está pronto como protótipo de curso. Antes de lançar, precisamos evoluir autenticação e usuários reais, limites de uso, limpeza de imagens, operação/hospedagem e testes adicionais. Não usamos recursos avançados de transformação, galeria ou anexos.

**Qual a diferença entre build e teste?** O build verifica se o frontend pode ser empacotado. Testes exercitam regras e respostas esperadas. Nenhum deles sozinho prova que todas as interações funcionam, por isso também verificamos o serviço real e o navegador.

## 11. Verificações feitas nesta entrega

- Autenticação real na conta Cloudinary: OK.
- Upload HTTP autenticado do logo do próprio projeto: 201; imagem acessível com HTTP 200.
- Rascunho salvo e relido; API pública não expõe o rascunho: OK.
- Leitura em outro processo confirmou banco Neon, texto e capa persistidos.
- Navegador: login, painel, abertura do rascunho com capa/editor e salvamento de crédito: OK.
- npm test: três testes aprovados, incluindo conteúdo formatado, fluxo editorial e upload com validações. O serviço Cloudinary é simulado nos testes automatizados para não consumir a conta a cada execução; o teste real foi feito separadamente.
- npm run build: aprovado. Avisos de diretivas use client das dependências não bloquearam o build.
- npm audit após atualizações compatíveis: zero vulnerabilidades reportadas naquele momento.

Não foi automatizado todo o percurso de escolher um arquivo pela interface. O envio real foi verificado pela API, e carregamento/edição/salvamento foram conferidos no navegador.

## 12. Uma fala curta para ensaiar

“Nosso projeto é o New Paulista Times, um portal de notícias desenvolvido a partir dos fundamentos que estudamos. Separamos a parte pública da área editorial. O frontend usa React, e o backend usa Node com Fastify, organizado em rotas, controllers e repositories. Henrique desenvolveu o editor que transforma o texto formatado em JSON. As notícias são salvas no Neon. Para a capa, o navegador envia um arquivo à API; a API valida e manda ao Cloudinary. O serviço devolve uma URL, e salvamos esse endereço junto da notícia. Isso mantém o arquivo fora do banco e permite mostrar a mesma imagem no card e na leitura. Também temos rascunhos, publicação e verificações de acesso. É um protótipo educacional, com usuários demonstrativos, que ainda precisa evoluir antes de um lançamento real.”
