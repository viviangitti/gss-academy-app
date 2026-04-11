import type { Segment } from '../types';

export interface Objection {
  id: string;
  objection: string;
  responses: string[];
  segment?: Segment | 'geral';
}

export interface Script {
  id: string;
  title: string;
  context: string;
  script: string;
  segment?: Segment | 'geral';
}

export interface Technique {
  id: string;
  name: string;
  icon: string;
  summary: string;
  steps: string[];
  whenToUse: string;
}

// ==================== OBJEÇÕES ====================

const GENERAL_OBJECTIONS: Objection[] = [
  {
    id: 'g1', objection: '"Está muito caro"', segment: 'geral',
    responses: [
      'Entendo sua preocupação com o investimento. Vamos olhar pelo lado do retorno: quanto você perde hoje sem essa solução? O custo de não agir geralmente é maior que o investimento.',
      'Caro comparado a quê? Vamos comparar não o preço, mas o valor entregue. Nosso cliente X tinha a mesma percepção e hoje tem retorno de 3x o investimento.',
      'Posso ajustar as condições de pagamento para caber melhor no seu orçamento. O importante é não perder o timing da oportunidade.',
    ],
  },
  {
    id: 'g2', objection: '"Vou pensar"', segment: 'geral',
    responses: [
      'Perfeito, pensar é importante. Para eu te ajudar a pensar melhor: qual é o ponto principal que te gera dúvida? Assim posso enviar informações focadas.',
      'Entendo! Normalmente quando alguém diz "vou pensar" é porque algum ponto não ficou 100% claro. O que posso esclarecer agora?',
      'Claro! Vamos agendar uma conversa rápida de 15 min na quinta para eu tirar qualquer dúvida que surgir? Assim você decide com mais segurança.',
    ],
  },
  {
    id: 'g3', objection: '"Já tenho fornecedor"', segment: 'geral',
    responses: [
      'Ótimo, isso mostra que você valoriza esse tipo de solução. Muitos dos nossos melhores clientes já tinham fornecedor. A pergunta é: você está 100% satisfeito ou há pontos que gostaria de melhorar?',
      'Não estou pedindo para trocar, mas sim para comparar. Se em 15 minutos eu mostrar algo que complemente o que você já tem, valeu a pena. Se não, você confirma que fez a melhor escolha.',
      'Ter referência é ótimo! Nosso diferencial está em [X]. Que tal uma demonstração sem compromisso para você ter uma segunda opinião?',
    ],
  },
  {
    id: 'g4', objection: '"Não é o momento"', segment: 'geral',
    responses: [
      'Entendo que o timing é importante. Qual seria o momento ideal? Pergunto porque muitos clientes que esperaram acabaram perdendo [vantagem específica].',
      'Quando seria o melhor momento para você? Enquanto isso, posso te enviar um material que vai te ajudar a se preparar para quando chegar a hora.',
      'O mercado não espera o momento perfeito. Seus concorrentes estão se movendo agora. Que tal começarmos com um piloto pequeno para não perder a janela?',
    ],
  },
  {
    id: 'g5', objection: '"Preciso falar com meu sócio/diretor"', segment: 'geral',
    responses: [
      'Claro! Para facilitar a conversa dele, posso preparar um resumo executivo de 1 página com os pontos principais e o retorno esperado. O que acha?',
      'Perfeito. Que tal agendarmos uma ligação de 15 minutos com ele? Assim tiro as dúvidas dele diretamente e agilizamos o processo.',
      'Entendo. Quais são os critérios que ele costuma avaliar? Assim posso preparar os argumentos certos para vocês dois.',
    ],
  },
  {
    id: 'g6', objection: '"Me envia uma proposta por email"', segment: 'geral',
    responses: [
      'Envio sim! Mas antes, quero garantir que a proposta esteja 100% personalizada. Posso fazer mais 2 perguntas rápidas sobre suas necessidades?',
      'Claro! Vou enviar hoje. Posso te ligar quinta às 10h para passar pelos pontos principais juntos? Email sozinho não transmite todo o valor.',
      'Envio agora. Mas por experiência, propostas por email têm 80% de chance de se perder na caixa de entrada. Que tal 10 minutos amanhã para revisarmos juntos?',
    ],
  },
  {
    id: 'g7', objection: '"O concorrente é mais barato"', segment: 'geral',
    responses: [
      'É uma comparação justa. Mas você está comparando exatamente as mesmas entregas? Geralmente o mais barato não inclui [diferencial]. No final, o barato pode sair caro.',
      'Preço menor muitas vezes significa escopo menor. Vamos colocar lado a lado o que cada um entrega? Tenho certeza que o custo-benefício vai te surpreender.',
      'Nosso preço reflete o resultado que entregamos. O cliente X estava com o concorrente mais barato e migrou para nós porque o resultado não vinha. Posso conectar vocês para conversar.',
    ],
  },
  {
    id: 'g8', objection: '"Não tenho orçamento"', segment: 'geral',
    responses: [
      'Entendo. Mas me diz: se o investimento se pagasse em 3 meses, faria sentido realocar orçamento? Vamos olhar o retorno antes de decidir.',
      'Orçamento é prioridade. A pergunta é: quanto esse problema te custa hoje? Muitas vezes o "não investir" sai mais caro que o investimento.',
      'Podemos começar com um plano menor e escalar conforme os resultados aparecem. Assim o próprio resultado paga a expansão.',
    ],
  },
];

const SEGMENT_OBJECTIONS: Record<string, Objection[]> = {
  farmaceutico: [
    { id: 'f1', objection: '"Não temos aprovação regulatória para trocar"', segment: 'farmaceutico', responses: [
      'Entendo a questão regulatória. Nosso time de assuntos regulatórios pode acompanhar todo o processo de adequação. Já fizemos isso com [laboratório X] em tempo recorde.',
      'A aprovação regulatória é um passo necessário. Podemos começar o processo agora para que quando a janela de compras abrir, vocês já estejam prontos.',
    ]},
    { id: 'f2', objection: '"O médico já está acostumado a prescrever outra marca"', segment: 'farmaceutico', responses: [
      'A familiaridade é importante, mas os estudos clínicos mostram [dados]. Podemos organizar um simpósio com líderes de opinião para apresentar as evidências?',
      'Entendo. Que tal um programa de amostras grátis para que o médico possa testar com alguns pacientes e comparar os resultados?',
    ]},
  ],
  automotivo: [
    { id: 'a1', objection: '"Vou esperar o novo modelo"', segment: 'automotivo', responses: [
      'O modelo atual tem condições que não se repetem: [bônus de fábrica/taxa zero/estoque limitado]. Quando o novo chegar, essas condições acabam e o preço sobe.',
      'O novo modelo vai demorar X meses e o preço de entrada será Y% maior. Comprando agora, você aproveita as condições e ainda pega um bom valor de revenda.',
    ]},
    { id: 'a2', objection: '"O seguro está muito caro"', segment: 'automotivo', responses: [
      'Temos parceria com corretoras que conseguem até 30% de desconto. Posso incluir isso na proposta e mostrar o custo total real mensal.',
      'Vamos olhar o custo total de propriedade: consumo, manutenção, seguro. Comparando com o concorrente, nosso custo mensal é mais competitivo.',
    ]},
  ],
  tecnologia: [
    { id: 't1', objection: '"Já temos uma solução interna"', segment: 'tecnologia', responses: [
      'Soluções internas têm custo oculto alto: manutenção, atualizações, equipe dedicada. Nossa plataforma elimina tudo isso e tem garantia de disponibilidade.',
      'Quanto custa manter essa solução por ano? Geralmente o custo total interno é 3x maior que uma plataforma especializada. Posso fazer essa análise com vocês.',
    ]},
    { id: 't2', objection: '"Preciso de integração com nossos sistemas"', segment: 'tecnologia', responses: [
      'Temos integração aberta e conexões nativas com [principais ferramentas]. Nosso time de implementação configura tudo em até X dias.',
      'Entendo que integração é crítica. Que tal um teste piloto de 2 semanas onde validamos todas as integrações antes de fechar?',
    ]},
  ],
  varejo: [
    { id: 'v1', objection: '"As vendas estão fracas, não posso investir agora"', segment: 'varejo', responses: [
      'Exatamente por isso precisa agir. Quando as vendas estão fracas é hora de investir em [solução] para se diferenciar e conquistar participação de mercado.',
      'Entendo o momento. Que tal começarmos com uma loja piloto? Assim você valida o resultado com risco mínimo antes de escalar.',
    ]},
    { id: 'v2', objection: '"Meu público não vai aceitar/usar"', segment: 'varejo', responses: [
      'Fizemos testes com perfil de público similar e a adesão foi de X%. Posso compartilhar o caso de sucesso? O público se adapta rápido quando percebe valor.',
      'Podemos fazer um teste A/B em uma loja antes de implementar na rede toda. Dados reais são melhores que suposições.',
    ]},
  ],
  imobiliario: [
    { id: 'i1', objection: '"O mercado está parado"', segment: 'imobiliario', responses: [
      'Mercado parado é oportunidade de compra. Taxa de juros, FGTS, condições especiais - tudo favorece quem compra agora. Quando aquecer, o preço sobe.',
      'Para quem está pronto, mercado parado = menos concorrência e mais poder de negociação. Você pode escolher as melhores unidades.',
    ]},
    { id: 'i2', objection: '"Preciso vender meu imóvel antes"', segment: 'imobiliario', responses: [
      'Temos parceria com imobiliárias que podem ajudar na venda do seu atual. E podemos congelar as condições por X dias enquanto isso acontece.',
      'Trabalhamos com permuta e entrada parcelada. Assim você pode garantir este imóvel sem precisar vender o atual primeiro.',
    ]},
  ],
  financeiro: [
    { id: 'fi1', objection: '"Já tenho meu banco/corretora"', segment: 'financeiro', responses: [
      'Não precisa trocar, pode diversificar. Muitos clientes mantêm 2-3 instituições para comparar taxas e ter mais opções. Vamos fazer uma simulação sem compromisso?',
      'Ótimo que você já investe. A pergunta é: você está no melhor produto para seu perfil? Uma análise gratuita da sua carteira pode revelar oportunidades.',
    ]},
  ],
  saude: [
    { id: 's1', objection: '"Meus pacientes não vão pagar isso"', segment: 'saude', responses: [
      'Quando o paciente entende o valor do resultado, o preço deixa de ser barreira. Posso ajudar a criar uma comunicação de valor que mude essa percepção.',
      'Temos planos de parcelamento que tornam o tratamento acessível. O valor por sessão fica menor que [comparação do dia a dia].',
    ]},
  ],
  educacao: [
    { id: 'e1', objection: '"O aluno pode aprender isso de graça online"', segment: 'educacao', responses: [
      'Conteúdo gratuito existe, mas sem metodologia, acompanhamento e certificação. Nossa taxa de conclusão é X% vs 3% dos cursos gratuitos. Resultado custa investimento.',
      'Gratuito não tem suporte, rede de contatos nem empregabilidade. Nossos alunos têm X% de colocação no mercado em Y meses.',
    ]},
  ],
  servicos: [
    { id: 'sv1', objection: '"Posso fazer internamente"', segment: 'servicos', responses: [
      'Pode, mas quanto custa em tempo e oportunidade? Enquanto sua equipe faz isso, deixa de focar no negócio principal. Nosso time especializado entrega em metade do tempo.',
      'Internalizar parece econômico, mas some: contratação, treinamento, ferramentas, gestão. Terceirizar é custo variável sem dor de cabeça.',
    ]},
  ],
  agro: [
    { id: 'ag1', objection: '"Vou esperar a safra para decidir"', segment: 'agro', responses: [
      'Entendo o ciclo. Mas preparar agora garante as melhores condições e disponibilidade. Na safra, a demanda sobe e as condições pioram.',
      'Os insumos têm prazo de entrega. Quem compra antecipado garante preço e disponibilidade. Podemos travar o preço agora e ajustar o pagamento para pós-safra.',
    ]},
  ],
  energia: [
    { id: 'en1', objection: '"O prazo de retorno é muito longo"', segment: 'energia', responses: [
      'Com as novas tarifas e o aumento constante da energia, o prazo de retorno real é menor que o projetado. Clientes que instalaram há 2 anos já recuperaram o investimento.',
      'Além do retorno financeiro, considere: valorização do imóvel, sustentabilidade como diferencial e proteção contra aumentos futuros. O retorno total é muito maior.',
    ]},
  ],
};

export function getObjections(segment: Segment): Objection[] {
  const segmentSpecific = segment ? (SEGMENT_OBJECTIONS[segment] || []) : [];
  return [...segmentSpecific, ...GENERAL_OBJECTIONS];
}

// ==================== SCRIPTS ====================

const GENERAL_SCRIPTS: Script[] = [
  {
    id: 'sc1', title: 'Ligação Fria - Primeira Abordagem', context: 'Ligação para cliente potencial que nunca ouviu falar de você', segment: 'geral',
    script: `"Olá [Nome], aqui é [Seu Nome] da [Empresa]. Eu sei que você está ocupado, então vou ser breve - 30 segundos.\n\nEstamos ajudando [perfil de empresa similar] a [resultado principal] e acredito que pode fazer sentido para vocês também.\n\nNão estou ligando para vender nada agora, mas gostaria de agendar 15 minutos para entender se podemos ajudar. Teria disponibilidade [dia] às [hora]?"`,
  },
  {
    id: 'sc2', title: 'WhatsApp - Acompanhamento Pós-reunião', context: 'Mensagem após primeira reunião de apresentação', segment: 'geral',
    script: `"Oi [Nome], tudo bem?\n\n[Seu Nome] da [Empresa] aqui. Foi um prazer conversar com você hoje!\n\nComo combinamos, segue o material que mencionei: [link]\n\nOs pontos principais que conversamos:\n✅ [Ponto 1]\n✅ [Ponto 2]\n✅ [Ponto 3]\n\nPróximo passo: [ação combinada] até [data].\n\nQualquer dúvida, estou à disposição! 🤝"`,
  },
  {
    id: 'sc3', title: 'Email - Proposta Comercial', context: 'Email enviando proposta formal', segment: 'geral',
    script: `"Assunto: Proposta [Empresa] - [Solução] para [Empresa do Cliente]\n\nOlá [Nome],\n\nConforme alinhado em nossa reunião, segue a proposta para [objetivo do cliente].\n\nResumo da solução:\n• [Entrega 1]\n• [Entrega 2]\n• [Entrega 3]\n\nInvestimento: R$ [valor]\nCondições: [condições]\nValidade: [data]\n\nEstou à disposição para alinharmos os próximos passos.\n\nAbraço,\n[Seu Nome]"`,
  },
  {
    id: 'sc4', title: 'Mensagem - Reativação de Cliente', context: 'Cliente que sumiu há mais de 30 dias', segment: 'geral',
    script: `"Oi [Nome], tudo bem?\n\nFaz um tempo que conversamos e queria saber como estão as coisas por aí.\n\nDesde nossa última conversa, [novidade relevante: novo produto/resultado de outro cliente/condição especial].\n\nAchei que poderia fazer sentido para você. Vale uma conversa rápida de 10 minutos essa semana?\n\nAbraço!"`,
  },
  {
    id: 'sc5', title: 'Abordagem - Indicação', context: 'Quando alguém indicou o cliente potencial', segment: 'geral',
    script: `"Olá [Nome], tudo bem?\n\nO [Nome de quem indicou] me falou muito bem de você e sugeriu que conversássemos.\n\nAjudamos a [empresa do indicador] com [resultado] e ele achou que poderia fazer sentido para vocês também.\n\nTem 15 minutos essa semana para uma conversa rápida?"`,
  },
];

export function getScripts(segment: Segment): Script[] {
  return GENERAL_SCRIPTS;
}

// ==================== TÉCNICAS ====================

export const TECHNIQUES: Technique[] = [
  {
    id: 'tec1', name: 'Perguntas Estratégicas', icon: '🔄',
    summary: 'Método de perguntas que conduz o cliente a reconhecer sua própria necessidade. (Situação → Problema → Implicação → Necessidade)',
    steps: [
      'Situação: Perguntas sobre o contexto atual ("Como funciona hoje seu processo de X?")',
      'Problema: Identificar dores ("Quais dificuldades você enfrenta com isso?")',
      'Implicação: Aprofundar a dor ("O que acontece quando esse problema se repete?")',
      'Necessidade de Solução: Fazer o cliente verbalizar o valor ("Se resolvesse isso, qual seria o impacto?")',
    ],
    whenToUse: 'Vendas consultivas complexas, valores altos, múltiplos decisores.',
  },
  {
    id: 'tec2', name: 'Qualificação em 4 Passos', icon: '🎯',
    summary: 'Método para qualificar clientes potenciais rapidamente em 4 critérios.',
    steps: [
      'Orçamento: "Vocês já têm orçamento previsto para essa iniciativa?"',
      'Autoridade: "Quem mais participa da decisão?"',
      'Necessidade: "Qual o principal problema que querem resolver?"',
      'Prazo: "Para quando vocês precisam disso implementado?"',
    ],
    whenToUse: 'Qualificação de clientes potenciais, primeiras ligações, para decidir se vale investir tempo.',
  },
  {
    id: 'tec3', name: 'Venda Desafiadora', icon: '💡',
    summary: 'Ensine algo novo ao cliente, personalize a abordagem e assuma o controle.',
    steps: [
      'Ensinar: Traga informações que o cliente não sabia ("Você sabia que 70% das empresas do seu setor estão...")',
      'Personalizar: Conecte à realidade dele ("No seu caso específico, isso significa...")',
      'Controlar: Conduza a conversa com firmeza ("Com base nisso, o caminho mais inteligente seria...")',
    ],
    whenToUse: 'Quando o cliente acha que já sabe tudo, vendas entre empresas, diferenciação competitiva.',
  },
  {
    id: 'tec4', name: 'Conexão e Confiança', icon: '🤝',
    summary: 'Técnica de conexão emocional para criar confiança rapidamente.',
    steps: [
      'Espelhamento: Adapte tom de voz, velocidade e linguagem corporal ao cliente',
      'Interesses: Encontre pontos em comum ("Vi que você também...")',
      'Escuta Ativa: Repita o que ele disse com suas palavras ("Se entendi bem...")',
      'Validação: Reconheça sentimentos ("Faz total sentido você pensar assim")',
    ],
    whenToUse: 'Início de qualquer interação, reuniões presenciais, quando há resistência.',
  },
  {
    id: 'tec5', name: 'Fechamento Alternativo', icon: '🔐',
    summary: 'Ofereça duas opções em vez de sim/não para facilitar a decisão.',
    steps: [
      'Nunca pergunte "Vamos fechar?", dê opções: "Prefere o plano A ou o B?"',
      'Exemplos: "Começamos na segunda ou na quarta?", "Prefere pagar à vista com desconto ou parcelado?"',
      'Use após sinais de compra: cliente perguntando sobre prazo, implementação ou condições',
      'Se disser "nenhum dos dois", investigue: "O que precisaria mudar para fazer sentido?"',
    ],
    whenToUse: 'Momento de fechamento, quando o cliente está indeciso mas interessado.',
  },
  {
    id: 'tec6', name: 'Histórias que Vendem', icon: '📖',
    summary: 'Use histórias de clientes reais para criar identificação e provar resultados.',
    steps: [
      'Situação: "O cliente X, do mesmo segmento que vocês, enfrentava [problema]"',
      'Problema: "Isso causava [consequência negativa, com números se possível]"',
      'Solução: "Implementamos [solução] em [prazo]"',
      'Resultado: "Em X meses, eles alcançaram [resultado com números]"',
    ],
    whenToUse: 'Objeções de preço, ceticismo, quando dados sozinhos não convencem.',
  },
  {
    id: 'tec7', name: 'Método Sanduíche', icon: '🥪',
    summary: 'Apresente o preço entre dois benefícios fortes.',
    steps: [
      'Benefício forte: "Com nossa solução, vocês vão [resultado principal]"',
      'Preço: "O investimento para isso é de R$ X por mês"',
      'Benefício forte: "E além disso, vocês também terão [benefício adicional]"',
      'Nunca diga o preço sozinho - sempre com contexto de valor',
    ],
    whenToUse: 'Apresentação de preço, proposta comercial, quando o valor é alto.',
  },
  {
    id: 'tec8', name: 'Venda Consultiva', icon: '🔍',
    summary: 'Posicione-se como consultor, não vendedor. Diagnostique antes de prescrever.',
    steps: [
      'Diagnóstico: Faça mais perguntas do que apresentações nos primeiros 70% da reunião',
      'Prescrição: Só apresente a solução depois de entender 100% a dor',
      'Personalização: Adapte a apresentação para o contexto específico do cliente',
      'Acompanhamento: Monitore resultados e sugira melhorias proativamente',
    ],
    whenToUse: 'Vendas complexas, serviços, quando o cliente precisa de solução sob medida.',
  },
];
