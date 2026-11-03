// Textos originais baseados em fontes públicas, consultadas em 03/11/2026.
// IDs estáveis: a inicialização não duplica nem sobrescreve edições da redação.
const stories = [
  {
    title: 'Fórmula 1 chega a Interlagos neste fim de semana, de 6 a 8 de novembro',
    summary: 'GP de São Paulo tem corrida marcada para domingo, dia 8; programação reúne três dias de atividades no Autódromo José Carlos Pace.',
    paragraphs: [
      'São Paulo recebe a Fórmula 1 entre 6 e 8 de novembro de 2026. A etapa brasileira acontece no Autódromo José Carlos Pace, em Interlagos, com a corrida principal prevista para domingo, dia 8, conforme o calendário oficial da categoria.',
      'O circuito paulistano é um dos endereços históricos do campeonato. Para quem acompanha o automobilismo, o fim de semana oferece a oportunidade de ver a disputa em uma pista marcada por curvas e mudanças de elevação.',
      'Antes de sair de casa, consulte a programação oficial e as instruções de acesso correspondentes ao seu ingresso. Horários, portões e regras de entrada devem ser conferidos nos canais do evento; esta matéria não informa disponibilidade de ingressos.',
    ],
    source: ['Calendário oficial da Fórmula 1', 'https://www.formula1.com/en/racing/2026/brazil'],
  },
  {
    title: 'MASP é ponto de partida para um passeio de arte na Avenida Paulista',
    summary: 'Museu reúne exposições e arquitetura em um dos endereços mais conhecidos da capital; confira a programação antes da visita.',
    paragraphs: [
      'Quem procura um roteiro cultural na Avenida Paulista pode começar pelo Museu de Arte de São Paulo Assis Chateaubriand, o MASP. O museu combina a visita às exposições com o encontro com uma arquitetura que faz parte da paisagem da cidade.',
      'A página oficial de visitação reúne informações sobre ingressos, acessibilidade e acesso ao museu. O ingresso permite conhecer as exposições em cartaz no dia da visita, conforme as condições divulgadas pela instituição.',
      'A sugestão é reservar tempo para percorrer as salas sem pressa e consultar a agenda antes de escolher a data. As exposições e as condições de entrada podem mudar; use os canais do MASP para planejar o passeio.',
    ],
    source: ['MASP — informações de visitação', 'https://masp.org.br/visite'],
  },
  {
    title: 'Ibirapuera combina caminhada, áreas verdes e cultura em um só roteiro',
    summary: 'Parque é uma opção para quem deseja passar parte do dia ao ar livre e explorar a paisagem de São Paulo.',
    paragraphs: [
      'O Parque Ibirapuera reúne áreas verdes, espaços de circulação e equipamentos de lazer na zona sul de São Paulo. Para quem quer uma pausa na rotina, o passeio pode começar com uma caminhada e seguir pelo ritmo de cada visitante.',
      'A ficha do parque publicada pela Prefeitura apresenta informações sobre infraestrutura e acessibilidade, incluindo entradas, áreas de circulação e banheiros. Consultar essas orientações ajuda a escolher o acesso mais conveniente para o percurso.',
      'Monte um roteiro compatível com o tempo disponível e confira separadamente a programação dos equipamentos culturais que pretende visitar. Esta sugestão não pressupõe a realização de um evento específico no parque neste fim de semana.',
    ],
    source: ['Prefeitura de São Paulo — Parque Ibirapuera', 'https://prefeitura.sp.gov.br/web/meio_ambiente/w/parques/regiao_sul/14062'],
  },
  {
    title: 'Mercadão entra no roteiro de quem quer descobrir sabores no centro',
    summary: 'Mercado Municipal reúne restaurantes e pontos de alimentação para combinar gastronomia e passeio pela cidade.',
    paragraphs: [
      'Uma visita ao Mercado Municipal de São Paulo pode virar um passeio gastronômico. Além das compras, o endereço reúne restaurantes e estabelecimentos de alimentação que fazem parte da experiência de quem percorre o Mercadão.',
      'O diretório de restaurantes do mercado permite conhecer as opções antes da visita. A proposta é escolher onde comer de acordo com o tipo de refeição desejado e reservar tempo para explorar o espaço.',
      'Confira cardápios, preços e funcionamento diretamente com o estabelecimento escolhido. Esta matéria apresenta uma sugestão de roteiro e não uma avaliação dos restaurantes, nem uma oferta de menu ou promoção.',
    ],
    source: ['Mercado Municipal de São Paulo — restaurantes', 'https://www.mercadomunicipalsp.com/restaurantes-mercadao-sp/'],
  },
  {
    title: 'Liberdade convida a um passeio entre gastronomia, lojas e cultura',
    summary: 'Roteiro pelo bairro permite combinar uma refeição com a descoberta de mercados e referências da presença asiática na cidade.',
    paragraphs: [
      'A Liberdade é um dos destinos paulistanos para quem quer reunir gastronomia e caminhada em um mesmo passeio. O roteiro turístico da cidade destaca a praça e pontos do bairro associados à história e à presença japonesa em São Paulo.',
      'Entre uma parada e outra, lojas e mercados ajudam a compor a experiência. Para comer, vale consultar os cardápios dos estabelecimentos e escolher uma opção que combine com o tempo e o orçamento disponíveis.',
      'O roteiro autoguiado publicado pelo portal de turismo da cidade serve como referência para organizar o percurso. Confirme o funcionamento de cada local antes de ir e reserve tempo para conhecer o bairro além da primeira parada.',
    ],
    source: ['São Paulo Turismo — roteiro autoguiado da Liberdade', 'https://cidadedesaopaulo.com/wp-content/uploads/2025/01/ROTEIRO-6-LIBERDADE.pdf'],
  },
  {
    title: 'Theatro Municipal oferece outro olhar sobre a cultura no centro de São Paulo',
    summary: 'Visitas educativas aproximam o público da história e dos espaços do complexo; consulte a agenda para planejar a experiência.',
    paragraphs: [
      'O Theatro Municipal de São Paulo também pode entrar no roteiro de quem deseja conhecer a cidade por meio de seus espaços culturais. As visitas educativas são uma oportunidade de explorar histórias e aspectos do complexo para além da experiência de assistir a um espetáculo.',
      'A instituição apresenta diferentes propostas de visita, que podem abordar o edifício, o entorno e os bastidores da produção artística. A disponibilidade depende da programação e das condições de cada atividade.',
      'Consulte a página oficial de visitas educativas e as orientações de reserva antes de sair. Para concertos, dança ou ópera, confira a agenda de espetáculos separadamente: esta matéria não anuncia uma apresentação específica nem garante vagas.',
    ],
    source: ['Theatro Municipal — visitas educativas', 'https://www.theatromunicipal.org.br/visitas-educativas/'],
  },
];

export const saoPauloNews = stories.map((story, index) => ({
  id: `sao-paulo-guide-2026-${String(index + 1).padStart(2, '0')}`,
  title: story.title,
  summary: story.summary,
  category: 'São Paulo',
  content: story.paragraphs.join('\n\n'),
  sources: [{ title: story.source[0], url: story.source[1] }],
  authorId: '1',
  author: 'Redação New Paulista Times',
  createdAt: `2026-11-03T${String(12 - index).padStart(2, '0')}:00:00.000Z`,
  imageUrl: `/images/mock/mock-${String(index + 1).padStart(2, '0')}.svg`,
  imageAlt: 'Ilustração urbana de demonstração; não é uma fotografia do local ou evento',
  imageCredit: 'Ilustração de demonstração; não retrata o local ou evento',
}));
