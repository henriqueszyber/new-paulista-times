// Notícias fictícias de demonstração, com IDs estáveis para evitar duplicação.
const stories = [
  {
    title: 'Comércio da Vila Aurora aposta em compras conjuntas para reduzir custos',
    summary: 'Associação fictícia reúne pequenos lojistas para compartilhar pedidos de embalagens e organizar entregas no bairro.',
    paragraphs: [
      'Os comerciantes da Vila Aurora criaram uma central imaginária de compras para reunir pedidos de materiais usados no dia a dia. A iniciativa começou com embalagens e produtos de limpeza, escolhidos por fazerem parte da rotina de diferentes estabelecimentos.',
      'No projeto fictício, cada loja informa sua necessidade semanal e recebe uma proposta consolidada dos fornecedores. A associação mantém os pedidos registrados em uma planilha compartilhada e divide o transporte conforme o volume de cada participante.',
      'O grupo pretende avaliar os primeiros ciclos antes de incluir novos produtos. A experiência retrata os desafios de organização de pequenos negócios, sem apresentar resultados reais ou promessas de economia.',
    ],
  },
  {
    title: 'Feira de produtores transforma praça em vitrine para negócios locais',
    summary: 'Evento imaginário aproxima consumidores de pequenos produtores e testa um sistema de retirada de encomendas.',
    paragraphs: [
      'A Praça das Oliveiras recebeu uma feira fictícia com alimentos, artesanato e produtos de pequenos negócios. Cada expositor apresentou sua história e explicou como organiza a produção ao longo da semana.',
      'Uma das novidades do evento foi um balcão de retirada para pedidos feitos antecipadamente. Na narrativa, os produtores separaram horários de entrega para evitar filas e conhecer melhor a procura por seus produtos.',
      'A organização vai reunir as sugestões dos participantes antes de planejar uma próxima edição. O encontro imaginário destaca a relação entre comércio de proximidade, circulação de renda e ocupação dos espaços públicos.',
    ],
  },
  {
    title: 'Oficina de orçamento leva planejamento financeiro ao centro comunitário',
    summary: 'Atividade fictícia usa situações do cotidiano para discutir receitas, despesas e organização das contas da casa.',
    paragraphs: [
      'O Centro Comunitário Horizonte promoveu uma oficina imaginária sobre orçamento doméstico. Os participantes trabalharam com personagens e valores inventados para montar um calendário mensal de receitas e despesas.',
      'Os exercícios abordaram a diferença entre gastos recorrentes e despesas ocasionais. Em pequenos grupos, os participantes compararam cenários e discutiram como mudanças de renda alteram o planejamento de uma família fictícia.',
      'A proposta educacional termina com a apresentação dos aprendizados de cada grupo. O conteúdo desta matéria descreve uma atividade de demonstração, sem indicar produtos financeiros ou estratégias de investimento.',
    ],
  },
  {
    title: 'Cooperativa de costura cria catálogo digital para alcançar novos clientes',
    summary: 'Empreendimento fictício reúne produção, atendimento e entregas em uma ferramenta compartilhada pelas cooperadas.',
    paragraphs: [
      'A cooperativa imaginária Linha do Bairro lançou um catálogo digital com peças produzidas por suas integrantes. A apresentação reúne fotografias, tamanhos disponíveis e informações sobre o processo de fabricação.',
      'As cooperadas dividiram as tarefas de atendimento e atualização do estoque. Na experiência fictícia, a ferramenta ajuda a identificar quais produtos precisam de reposição e quais encomendas exigem mais tempo de produção.',
      'O próximo passo será revisar o fluxo de entregas e organizar uma exposição presencial. A história apresenta um exemplo inventado de transformação digital em um pequeno empreendimento coletivo.',
    ],
  },
  {
    title: 'Padarias do Jardim das Pontes testam produção guiada por encomendas',
    summary: 'Projeto imaginário acompanha a procura ao longo do dia para ajustar fornadas e reduzir sobras.',
    paragraphs: [
      'Três padarias fictícias do Jardim das Pontes iniciaram um projeto de acompanhamento de encomendas. Durante a experiência, os estabelecimentos registram os horários de maior movimento e os produtos mais pedidos.',
      'A proposta é comparar as informações com a programação das fornadas. Os responsáveis também organizam conversas com clientes para entender mudanças de hábito entre dias úteis e fins de semana.',
      'O projeto ainda está em fase de observação dentro desta narrativa. Não há percentuais reais de redução de desperdício ou de aumento de vendas; o objetivo da matéria é ilustrar decisões da gestão de pequenos negócios.',
    ],
  },
  {
    title: 'Espaço compartilhado reúne profissionais independentes na antiga estação',
    summary: 'Iniciativa fictícia oferece salas de reunião e áreas de trabalho para aproximar prestadores de serviços do bairro.',
    paragraphs: [
      'A antiga Estação das Palmeiras ganhou um espaço de trabalho compartilhado no universo fictício do portal. O local reúne profissionais de design, tradução, manutenção e produção de conteúdo.',
      'O funcionamento imaginário prevê reservas de mesas e salas, além de encontros para apresentação de projetos. Os participantes podem conhecer serviços complementares e discutir dificuldades comuns de organização do trabalho.',
      'A gestão do espaço pretende acompanhar a ocupação antes de ampliar os horários. A matéria explora uma possibilidade inventada de uso econômico de um imóvel, sem anunciar disponibilidade real de vagas ou serviços.',
    ],
  },
  {
    title: 'Mercado do Mirante organiza levantamento de preços com participação dos moradores',
    summary: 'Painel fictício compara uma cesta de produtos ao longo do tempo e explica diferenças de embalagem e quantidade.',
    paragraphs: [
      'Os comerciantes do Mercado do Mirante organizaram um levantamento imaginário de preços de itens do cotidiano. A proposta reúne informações em um painel que identifica a quantidade e a embalagem de cada produto.',
      'Na atividade fictícia, os moradores ajudam a escolher os itens acompanhados e discutem por que produtos semelhantes podem ter preços diferentes. O painel separa mudanças de preço de alterações no tamanho das embalagens.',
      'Os organizadores pretendem transformar o material em uma exposição educativa. Nenhum valor apresentado pelo projeto corresponde a uma pesquisa real de inflação ou a uma cotação de mercado.',
    ],
  },
  {
    title: 'Festival de economia criativa conecta artesãos, livrarias e pequenos cafés',
    summary: 'Programação imaginária combina exposição de produtos, conversas sobre gestão e atividades culturais em uma mesma rua.',
    paragraphs: [
      'O Festival Rua das Ideias reuniu negócios fictícios de diferentes áreas em uma programação de economia criativa. Artesãos, livrarias e cafés compartilharam espaços de exposição e organizaram atividades abertas ao público.',
      'As rodas de conversa abordaram formação de equipes, planejamento de produção e relacionamento com clientes. Cada participante apresentou uma situação inventada para discutir como pequenos empreendimentos lidam com demandas sazonais.',
      'A programação terminou com uma mostra dos trabalhos produzidos durante as oficinas. O evento é inteiramente fictício e foi criado para compor a editoria de Economia do New Paulista Times.',
    ],
  },
];

export const economyDemoNews = stories.map((story, index) => ({
  id: `economy-demo-${String(index + 1).padStart(2, '0')}`,
  title: story.title,
  summary: story.summary,
  category: 'Economia',
  content: ['Notícia fictícia criada para demonstração do New Paulista Times. Locais, empresas, eventos e personagens citados são inventados.', ...story.paragraphs].join('\n\n'),
  authorId: '1',
  author: 'Redação Demo',
  createdAt: `2026-11-02T${String(19 - index).padStart(2, '0')}:00:00.000Z`,
  imageUrl: `/images/mock/mock-${String(index + 1).padStart(2, '0')}.svg`,
  imageAlt: 'Ilustração de uma paisagem urbana fictícia',
  imageCredit: 'Ilustração de demonstração; não retrata o evento',
}));
