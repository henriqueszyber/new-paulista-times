// Conteúdo editorial fictício para demonstração. IDs fixos evitam duplicação no banco.
const stories = [
  {
    title: 'União da Vila vence clássico e assume a liderança da Copa dos Bairros',
    summary: 'Em campeonato fictício, equipe vira o placar no segundo tempo e leva a decisão da primeira fase para a última rodada.',
    paragraphs: [
      'O União da Vila venceu o Aurora por 2 a 1 no Campo das Amendoeiras, em uma rodada imaginária da Copa dos Bairros. Depois de sair atrás no placar, o time reorganizou o meio-campo e encontrou espaço pelas laterais para construir a virada.',
      'Na narrativa desta partida, o empate veio em uma jogada ensaiada de escanteio. O gol da vitória nasceu de uma troca de passes entre três jogadores formados nas categorias de base do clube.',
      'A liderança mantém a disputa aberta para a última rodada. Além do resultado, o encontro teve uma ação de arrecadação de materiais esportivos para as escolinhas da comunidade fictícia.',
    ],
  },
  {
    title: 'Basquete feminino do Aurora conquista torneio com cesta nos segundos finais',
    summary: 'Final imaginária termina em 62 a 60 e destaca o trabalho coletivo de uma equipe formada em um projeto comunitário.',
    paragraphs: [
      'O Aurora Basquete conquistou a Taça Horizonte após uma final equilibrada contra o Estrela do Parque. A partida fictícia terminou em 62 a 60, com a cesta decisiva marcada nos últimos segundos.',
      'O roteiro do jogo teve alternância na liderança e uma recuperação importante no terceiro quarto. A equipe campeã apostou na circulação da bola e na participação das reservas para chegar ao período final em igualdade.',
      'A história valoriza um projeto imaginário que oferece treinos de basquete para meninas do bairro. A próxima etapa da equipe será uma série de amistosos voltados à integração de novas atletas.',
    ],
  },
  {
    title: 'Festival de atletismo reúne gerações na pista do Parque Horizonte',
    summary: 'Corridas curtas, revezamentos e caminhada fazem parte de uma programação fictícia voltada à participação de toda a família.',
    paragraphs: [
      'A pista do Parque Horizonte recebeu um festival imaginário de atletismo com atividades para diferentes idades. A programação combinou corridas curtas, revezamentos e uma caminhada de encerramento.',
      'Em vez de concentrar todas as atenções nos tempos, a proposta do evento foi apresentar as modalidades a quem nunca havia participado de uma competição. Monitores explicaram as regras e organizaram pequenos grupos para cada atividade.',
      'O revezamento entre famílias encerrou a manhã com equipes formadas por participantes de gerações diferentes. O festival faz parte de um calendário fictício de ocupação dos espaços esportivos da cidade.',
    ],
  },
  {
    title: 'Vôlei de bairro ganha nova liga com oito equipes amadoras',
    summary: 'Competição imaginária combina jogos aos fins de semana e oficinas de arbitragem para moradores.',
    paragraphs: [
      'Oito equipes fazem parte da primeira edição fictícia da Liga das Quadras. Os jogos de vôlei foram organizados em dois grupos, com partidas realizadas em ginásios comunitários inventados para este projeto.',
      'Cada rodada inclui uma oficina de arbitragem e uma conversa sobre organização de equipes. A intenção da iniciativa imaginária é distribuir as tarefas entre atletas e voluntários, fortalecendo a participação dos bairros.',
      'As duas melhores equipes de cada grupo avançam às semifinais. A programação também prevê encontros amistosos para os times eliminados, mantendo todas as equipes em atividade até o encerramento.',
    ],
  },
  {
    title: 'Escolinha de futsal abre espaço para uma nova geração de goleiros',
    summary: 'Projeto fictício do Jardim das Pontes aposta em exercícios com bola e atividades coletivas para apresentar a posição às crianças.',
    paragraphs: [
      'A escolinha imaginária do Jardim das Pontes preparou um ciclo de aulas dedicado aos goleiros. As atividades apresentam fundamentos da posição por meio de brincadeiras e situações simples de jogo.',
      'Os participantes alternam entre o gol e a linha para conhecer diferentes funções dentro da equipe. O planejamento fictício também inclui conversas sobre cooperação e respeito às decisões da arbitragem.',
      'Ao final do ciclo, a turma participa de um festival interno sem classificação geral. O encontro foi pensado como uma oportunidade de compartilhar com as famílias o que foi aprendido nas aulas.',
    ],
  },
  {
    title: 'Circuito de ciclismo transforma antiga estação em ponto de encontro',
    summary: 'Passeio fictício liga três praças e valoriza a convivência entre grupos de ciclistas da cidade.',
    paragraphs: [
      'A antiga Estação das Palmeiras foi o ponto de partida de um passeio ciclístico imaginário que conectou três praças. O percurso contou com paradas para descanso e apresentações de projetos comunitários.',
      'Diferentes grupos participaram da organização, dividindo tarefas de orientação e recepção. A proposta do circuito fictício foi aproximar pessoas que costumam pedalar em regiões diferentes da cidade.',
      'Na chegada, os participantes encontraram uma pequena exposição sobre a história da estação. A iniciativa combina esporte e memória urbana em uma narrativa criada para demonstrar o portal.',
    ],
  },
  {
    title: 'Natação do Clube das Águas celebra estreia em torneio regional',
    summary: 'Equipe fictícia participa de provas individuais e revezamentos, com foco na experiência dos novos atletas.',
    paragraphs: [
      'O Clube das Águas levou uma equipe estreante ao Torneio Regional das Piscinas, competição inteiramente fictícia. Os nadadores participaram de provas curtas e de dois revezamentos.',
      'A preparação descrita nesta história incluiu simulações de largada e atividades de integração. Durante o encontro, atletas mais experientes acompanharam os estreantes na organização das baterias.',
      'O destaque da delegação foi o revezamento misto, que reuniu participantes de diferentes turmas. A equipe encerrou a viagem imaginária com um encontro para compartilhar aprendizados e planejar os próximos treinos.',
    ],
  },
  {
    title: 'Praça do Mirante recebe encontro de skate e oficinas para iniciantes',
    summary: 'Evento imaginário reúne demonstrações, atividades de iniciação e uma exposição sobre a cultura do skate.',
    paragraphs: [
      'A Praça do Mirante recebeu um encontro fictício dedicado ao skate. A programação reuniu demonstrações de atletas locais imaginários e atividades de iniciação em uma área separada da pista principal.',
      'Entre as apresentações, uma exposição mostrou desenhos de shapes e fotografias produzidas para o universo fictício do evento. A organização também abriu espaço para uma conversa sobre o uso compartilhado da praça.',
      'O encerramento teve uma apresentação coletiva, sem ranking de participantes. A proposta da história é mostrar como o esporte pode se conectar à produção artística e à convivência nos espaços públicos.',
    ],
  },
];

export const sportsDemoNews = stories.map((story, index) => ({
  id: `sports-demo-${String(index + 1).padStart(2, '0')}`,
  title: story.title,
  summary: story.summary,
  category: 'Esportes',
  content: ['Notícia fictícia criada para demonstração do New Paulista Times. Clubes, pessoas, locais, resultados e eventos citados são inventados.', ...story.paragraphs].join('\n\n'),
  authorId: '1',
  author: 'Redação Demo',
  createdAt: `2026-11-02T${String(12 - index).padStart(2, '0')}:00:00.000Z`,
  imageUrl: `/images/mock/mock-${String(index + 1).padStart(2, '0')}.svg`,
  imageAlt: 'Ilustração de uma paisagem urbana fictícia',
  imageCredit: 'Ilustração de demonstração; não retrata o evento',
}));
