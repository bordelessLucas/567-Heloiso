import AsyncStorage from '@react-native-async-storage/async-storage';

import type { LearningTrack, LearningTrackId } from '@/src/domain/learning';

const LEARNING_PROGRESS_KEY = '@mercado-fiis/learning-completed-modules';

// As artes originais do cliente também são as capas da trilha.
const covers = {
  start: require('../../docs-ia/ensina-fiis/WhatsApp Image 2026-09-17 at 09.38.01 (2).jpeg'),
  whatIsFii: require('../../docs-ia/ensina-fiis/WhatsApp Image 2026-09-17 at 09.38.01 (1).jpeg'),
  defineObjective: require('../../docs-ia/ensina-fiis/WhatsApp Image 2026-09-17 at 09.38.01.jpeg'),
  chooseBroker: require('../../docs-ia/ensina-fiis/WhatsApp Image 2026-09-17 at 09.38.00 (1).jpeg'),
  analyseFund: require('../../docs-ia/ensina-fiis/WhatsApp Image 2026-09-17 at 09.38.00.jpeg'),
  diversify: require('../../docs-ia/ensina-fiis/WhatsApp Image 2026-09-17 at 09.37.59 (2).jpeg'),
  buyAndReinvest: require('../../docs-ia/ensina-fiis/WhatsApp Image 2026-09-17 at 09.37.59 (1).jpeg'),
  monitorPortfolio: require('../../docs-ia/ensina-fiis/WhatsApp Image 2026-09-17 at 09.37.59.jpeg'),
  nextSteps: require('../../docs-ia/ensina-fiis/WhatsApp Image 2026-09-17 at 09.37.58.jpeg'),
} as const;

const tracks: LearningTrack[] = [
  {
    id: 'start',
    order: 1,
    eyebrow: 'Visão geral',
    title: 'Como investir em FIIs?',
    description: 'Uma visão clara do caminho, do primeiro estudo ao acompanhamento.',
    cover: covers.start,
    coverAlt: 'Capa da trilha Como investir em Fundos Imobiliários',
    coverAspectRatio: 1.434,
    mentorNote: 'Vamos por etapas. Você não precisa decorar tudo antes de começar a estudar.',
    lessons: [
      {
        id: 'journey',
        title: 'Uma jornada, não uma corrida',
        description:
          'Investir com consciência costuma seguir um ciclo: entender o produto, analisar as informações disponíveis, decidir dentro do próprio planejamento e revisar periodicamente.',
        items: [
          'Estudar para reconhecer riscos e termos.',
          'Analisar antes de tomar decisões.',
          'Acompanhar a tese, não apenas a cotação do dia.',
        ],
      },
      {
        id: 'decision',
        title: 'A decisão continua sendo sua',
        description:
          'Este conteúdo organiza o que observar. Ele não substitui a sua avaliação, seus objetivos ou orientações profissionais quando necessárias.',
      },
      {
        id: 'practice',
        title: 'Transforme estudo em um hábito simples',
        description:
          'Não é necessário estudar horas de uma vez. A consistência ajuda mais: escolha um conceito, leia uma fonte confiável, registre a dúvida e só então passe para a próxima etapa.',
        items: [
          'Separe fatos de opiniões e promessas de retorno.',
          'Anote termos que você ainda não domina para revisar depois.',
          'Evite decidir com pressa após uma única publicação ou vídeo.',
        ],
      },
    ],
  },
  {
    id: 'what-is-fii',
    order: 2,
    eyebrow: 'Fundamentos',
    title: 'Entenda o que é um FII',
    description: 'Veja como os fundos se conectam ao mercado imobiliário e aos seus ativos.',
    cover: covers.whatIsFii,
    coverAlt: 'Arte explicando o que é um fundo imobiliário',
    coverAspectRatio: 1.333,
    mentorNote: 'Antes de olhar indicadores, vale entender o que existe por trás de cada cota.',
    lessons: [
      {
        id: 'structure',
        title: 'O que você acessa ao ter uma cota',
        description:
          'Um FII reúne recursos para se expor a ativos ligados ao setor imobiliário. Ao negociar cotas, você passa a acompanhar uma fração dessa estratégia, administrada conforme o regulamento do fundo.',
      },
      {
        id: 'strategies',
        title: 'As estratégias podem ser diferentes',
        description:
          'Os exemplos da capa não são submódulos isolados: mostram formas distintas de atuação, cada uma com fontes de receita, riscos e ciclos próprios.',
        items: [
          'Lajes, galpões e shoppings: exposição a imóveis e contratos de locação.',
          'CRIs e recebíveis: exposição a créditos ligados ao mercado imobiliário.',
          'Estratégias híbridas: combinação de abordagens em um mesmo fundo.',
        ],
      },
      {
        id: 'income-and-risks',
        title: 'De onde podem vir os resultados',
        description:
          'Em fundos de imóveis, contratos de aluguel e ocupação são relevantes. Em fundos de recebíveis, juros, garantias e inadimplência ganham peso. A composição do fundo mostra quais perguntas devem vir primeiro.',
        items: [
          'Leia a política de investimento e o regulamento para entender os limites da estratégia.',
          'Observe se há concentração em poucos imóveis, devedores ou locatários.',
          'Compare períodos, porque resultados mensais podem variar.',
        ],
      },
    ],
  },
  {
    id: 'define-objective',
    order: 3,
    eyebrow: 'Planejamento',
    title: 'Defina seu objetivo',
    description: 'Conecte prazo, aportes e expectativas ao seu momento financeiro.',
    cover: covers.defineObjective,
    coverAlt: 'Arte com perguntas para definir objetivos de investimento',
    coverAspectRatio: 1.484,
    mentorNote: 'Um objetivo não precisa ser perfeito. Ele precisa ser claro o bastante para orientar suas escolhas.',
    lessons: [
      {
        id: 'goal',
        title: 'Dê um nome ao seu objetivo',
        description:
          'Renda recorrente e crescimento patrimonial são exemplos de objetivos, mas cada um pode pedir um horizonte e uma tolerância a oscilações diferentes. Escrever o seu torna as comparações mais úteis.',
      },
      {
        id: 'questions',
        title: 'Quatro perguntas que ajudam',
        description: 'Use as perguntas como ponto de partida para organizar a sua realidade.',
        items: [
          'Qual resultado eu quero buscar com esse patrimônio?',
          'Quanto consigo reservar sem comprometer despesas essenciais?',
          'Por quanto tempo esse dinheiro pode permanecer aplicado?',
          'Como eu reagiria a uma oscilação de preço no curto prazo?',
        ],
      },
      {
        id: 'plan',
        title: 'Converta intenção em um plano revisável',
        description:
          'Definir objetivo não exige acertar o futuro. O plano pode ser revisto quando renda, prazo ou prioridades mudarem. O importante é deixar claro o que seria uma decisão coerente para você hoje.',
        items: [
          'Registre o prazo e a finalidade em linguagem simples.',
          'Defina um valor de estudo ou aporte que não pressione seu orçamento.',
          'Revise o plano antes de mudar de estratégia por causa de uma oscilação.',
        ],
      },
    ],
  },
  {
    id: 'choose-broker',
    order: 4,
    eyebrow: 'Acesso ao mercado',
    title: 'Escolha uma corretora',
    description: 'Entenda o papel da instituição e do ambiente de negociação na B3.',
    cover: covers.chooseBroker,
    coverAlt: 'Arte ilustrando uma corretora e o Home Broker',
    coverAspectRatio: 1.701,
    mentorNote: 'A corretora é a ponte operacional. Antes de usar qualquer plataforma, conheça suas condições e recursos.',
    lessons: [
      {
        id: 'role',
        title: 'O papel da corretora',
        description:
          'É a instituição que disponibiliza acesso ao ambiente de negociação. Compare atendimento, tarifas, estabilidade, materiais educativos e informações antes de abrir uma conta.',
      },
      {
        id: 'environment',
        title: 'Como funciona o ambiente de negociação',
        description:
          'Depois de cumprir os processos da instituição e ter saldo disponível, o Home Broker permite consultar o ticker e enviar uma ordem. Conhecer tipos de ordem e seus limites evita surpresas.',
        items: [
          'Confira o ticker para não confundir fundos com nomes parecidos.',
          'Revise preço, quantidade e validade antes de confirmar uma ordem.',
          'Guarde comprovantes e entenda os custos envolvidos.',
        ],
      },
      {
        id: 'safety',
        title: 'Segurança e transparência também contam',
        description:
          'A experiência da plataforma é importante, mas não é o único critério. Confirme o vínculo da instituição com a B3, entenda os canais de suporte e mantenha seus dados de acesso protegidos.',
        items: [
          'Leia com atenção custos, notas de corretagem e regras do serviço.',
          'Use senhas exclusivas e não compartilhe códigos de autenticação.',
          'Procure suporte antes de agir se um termo ou uma ordem não estiver claro.',
        ],
      },
    ],
  },
  {
    id: 'analyse-fund',
    order: 5,
    eyebrow: 'Leitura de dados',
    title: 'Analise o fundo',
    description: 'Vá além de um dividendo alto e observe a qualidade da estratégia inteira.',
    cover: covers.analyseFund,
    coverAlt: 'Arte de uma lupa analisando edifícios',
    coverAspectRatio: 1.659,
    mentorNote: 'Um indicador isolado conta pouco. A história do fundo aparece quando as informações são lidas em conjunto.',
    lessons: [
      {
        id: 'thesis',
        title: 'Comece pela tese do fundo',
        description:
          'Pergunte como o fundo busca gerar resultado e que tipo de ativo ele carrega. Isso dá contexto aos números e evita conclusões com base em um único mês.',
      },
      {
        id: 'signals',
        title: 'O que cada grupo de informação revela',
        description: 'Os itens da capa são sinais complementares — não uma lista de “checkmarks” independentes.',
        items: [
          'Imóveis, localização e inquilinos mostram a qualidade e a concentração dos contratos.',
          'Vacância indica a parcela sem receita de aluguel em fundos de tijolo.',
          'Gestão, dívidas e resultados ajudam a entender execução, obrigações e sustentabilidade.',
          'Dividendos e preço da cota pedem histórico e contexto, não leitura isolada.',
        ],
      },
      {
        id: 'documents',
        title: 'Onde confirmar a sua leitura',
        description:
          'Indicadores resumem uma parte da realidade. Relatório gerencial, regulamento, fatos relevantes e demonstrações trazem o contexto necessário para interpretar mudanças e comparar períodos.',
        items: [
          'Leia a seção de comentários da gestão, não apenas a tabela de números.',
          'Diferencie resultado recorrente de eventos pontuais.',
          'Verifique a data do documento para não decidir com informação desatualizada.',
        ],
      },
    ],
  },
  {
    id: 'diversify',
    order: 6,
    eyebrow: 'Gestão de risco',
    title: 'Diversifique',
    description: 'Reduza a dependência de um único ativo, imóvel, locatário ou segmento.',
    cover: covers.diversify,
    coverAlt: 'Arte com exemplos de segmentos para diversificação',
    coverAspectRatio: 1.908,
    mentorNote: 'Diversificar não é só aumentar a quantidade de fundos: é entender quais riscos continuam concentrados.',
    lessons: [
      {
        id: 'why',
        title: 'Por que diversificar?',
        description:
          'Quando todo o patrimônio depende de uma mesma fonte de receita, um evento específico pode ter impacto maior. Combinar exposições pode reduzir essa dependência, embora não elimine riscos ou oscilações.',
      },
      {
        id: 'how',
        title: 'Diferentes segmentos são caminhos, não respostas prontas',
        description:
          'Shopping, logística, papel, lajes e híbridos são exemplos de exposições possíveis. Eles reagem a fatores diferentes, como contratos, juros, ocupação e crédito.',
        items: [
          'Observe se os fundos têm riscos realmente diferentes.',
          'Evite repetir a mesma concentração sob nomes distintos.',
          'Qualidade e aderência ao objetivo importam tanto quanto variedade.',
        ],
      },
      {
        id: 'concentration',
        title: 'Diversificação tem limites',
        description:
          'Ter vários tickers não garante uma carteira diversificada. Fundos diferentes podem depender do mesmo cenário econômico, do mesmo tipo de contrato ou até de ativos semelhantes. A revisão precisa olhar o conjunto.',
        items: [
          'Mapeie exposição por segmento, gestor, locatário e tipo de ativo.',
          'Considere como juros, inflação e atividade econômica afetam cada exposição.',
          'Evite tratar diversificação como proteção contra toda perda.',
        ],
      },
    ],
  },
  {
    id: 'buy-and-reinvest',
    order: 7,
    eyebrow: 'Ciclo de investimento',
    title: 'Compre e reinvista',
    description: 'Entenda o que acontece após uma ordem e o papel dos rendimentos no longo prazo.',
    cover: covers.buyAndReinvest,
    coverAlt: 'Arte explicando ordem, rendimentos e reinvestimento',
    coverAspectRatio: 1.742,
    mentorNote: 'Rendimentos podem ser usados de formas diferentes. O melhor uso depende do seu planejamento e das suas necessidades.',
    lessons: [
      {
        id: 'order',
        title: 'Depois da análise, vem a execução consciente',
        description:
          'Uma ordem é uma instrução enviada pelo ambiente de negociação. Antes dela, confirme ticker, preço, quantidade, custos e se a decisão continua compatível com o que você estudou.',
      },
      {
        id: 'compounding',
        title: 'O que significa reinvestir rendimentos',
        description:
          'Quando rendimentos recebidos retornam ao planejamento de longo prazo, eles podem ampliar a base que gera novos resultados. Isso é um efeito de composição, não uma promessa de retorno.',
      },
      {
        id: 'records',
        title: 'Mantenha registro do que fez sentido',
        description:
          'Anotar a razão de uma decisão facilita a revisão futura. Assim, você compara a tese original com os fatos novos, em vez de depender apenas da memória ou da emoção do momento.',
        items: [
          'Registre objetivo, preço observado, fontes consultadas e principais riscos.',
          'Acompanhe custos, rendimentos e documentos recebidos.',
          'Revisar uma decisão não significa que ela foi um erro; significa que novas informações surgiram.',
        ],
      },
    ],
  },
  {
    id: 'monitor-portfolio',
    order: 8,
    eyebrow: 'Acompanhamento',
    title: 'Acompanhe sua carteira',
    description: 'Crie uma rotina de revisão baseada em fatos, não no ruído diário.',
    cover: covers.monitorPortfolio,
    coverAlt: 'Arte com itens para acompanhar em uma carteira de FIIs',
    coverAspectRatio: 1.624,
    mentorNote: 'Acompanhar não significa olhar a cotação todos os dias. Uma rotina simples e consistente costuma ser mais útil.',
    lessons: [
      {
        id: 'cadence',
        title: 'Defina um ritmo de acompanhamento',
        description:
          'Escolha uma frequência que permita ler informações relevantes sem transformar oscilações diárias em decisões impulsivas. Revise também se a carteira continua alinhada ao objetivo inicial.',
      },
      {
        id: 'reports',
        title: 'O que procurar nos materiais do fundo',
        description: 'Relatórios e comunicados ajudam a entender o que mudou de fato na operação.',
        items: [
          'Vacância, resultados e dividendos mostram como a geração de receita evolui.',
          'Dívidas e gestão explicam obrigações, estratégia e decisões tomadas.',
          'Fatos relevantes e relatórios gerenciais dão contexto para mudanças importantes.',
        ],
      },
      {
        id: 'response',
        title: 'Como reagir a uma mudança relevante',
        description:
          'Uma notícia não exige uma ação imediata. Primeiro identifique o fato, leia a comunicação oficial, avalie o impacto na tese e compare com o objetivo que você registrou.',
        items: [
          'Priorize fatos relevantes e relatórios oficiais sobre manchetes isoladas.',
          'Pergunte se a mudança é pontual ou altera a estratégia do fundo.',
          'Se precisar, volte ao módulo de análise antes de tirar uma conclusão.',
        ],
      },
    ],
  },
  {
    id: 'next-steps',
    order: 9,
    eyebrow: 'Próximo passo',
    title: 'Você já sabe por onde começar',
    description: 'Feche a trilha com um processo simples para continuar aprendendo com autonomia.',
    cover: covers.nextSteps,
    coverAlt: 'Arte de encerramento da trilha de aprendizado',
    coverAspectRatio: 1.915,
    mentorNote: 'Confiança vem da repetição de um bom processo: estudar, analisar, acompanhar e ajustar quando fizer sentido para você.',
    lessons: [
      {
        id: 'checklist',
        title: 'Seu checklist de autonomia',
        description: 'Use o roteiro como apoio antes de avançar na sua própria jornada.',
        items: [
          'Estudar o produto e reconhecer seus riscos.',
          'Analisar documentos e indicadores com contexto.',
          'Decidir de acordo com objetivos, prazo e orçamento.',
          'Acompanhar fatos relevantes e a tese ao longo do tempo.',
        ],
      },
      {
        id: 'continue',
        title: 'Aprender continua depois da trilha',
        description:
          'Use a área de Fundos para praticar a leitura de informações e volte aos módulos sempre que um conceito precisar de revisão. Informação ajuda; a decisão de investimento permanece pessoal.',
      },
      {
        id: 'routine',
        title: 'Uma rotina para seguir aprendendo',
        description:
          'A confiança não vem de prever cada movimento do mercado. Ela aparece quando você constrói um processo que pode repetir: estudar, checar fontes, registrar critérios e revisar com calma.',
        items: [
          'Escolha um fundo para praticar a leitura, sem obrigação de tomar uma decisão.',
          'Use os indicadores do app como ponto de partida e confirme no material oficial.',
          'Volte ao objetivo sempre que sentir vontade de agir somente pela cotação.',
        ],
      },
    ],
  },
];

export async function listLearningTracks(): Promise<LearningTrack[]> {
  return tracks;
}

export async function getLearningTrack(
  id: LearningTrackId,
): Promise<LearningTrack | undefined> {
  return tracks.find((track) => track.id === id);
}

/** Retrato presente nas artes do cliente, mantido em todos os módulos como guia visual. */
export function getLearningMentorImage(): number {
  return covers.start;
}

export function getLearningTrackCount(): number {
  return tracks.length;
}

export async function getCompletedLearningTrackIds(): Promise<LearningTrackId[]> {
  const stored = await AsyncStorage.getItem(LEARNING_PROGRESS_KEY);

  if (!stored) {
    return [];
  }

  try {
    const ids: unknown = JSON.parse(stored);
    return Array.isArray(ids)
      ? ids.filter((id): id is LearningTrackId => tracks.some((track) => track.id === id))
      : [];
  } catch {
    return [];
  }
}

export async function completeLearningTrack(id: LearningTrackId): Promise<LearningTrackId[]> {
  const completedIds = await getCompletedLearningTrackIds();
  const nextIds = completedIds.includes(id) ? completedIds : [...completedIds, id];

  await AsyncStorage.setItem(LEARNING_PROGRESS_KEY, JSON.stringify(nextIds));
  return nextIds;
}
