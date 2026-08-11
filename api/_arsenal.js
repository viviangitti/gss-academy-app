// GERADO POR scripts/gera-arsenal.mjs — não edite à mão.
// Fonte da verdade: src/services/content.ts (MAESTR.IA). Mudou lá? rode:
//   npx tsx scripts/gera-arsenal.mjs
//
// Vive em /api porque é método GSS: não pode ir no pacote do navegador.
export default {
 "tecnicas": [
  {
   "nome": "Perguntas Estratégicas",
   "resumo": "Método de perguntas que conduz o cliente a reconhecer sua própria necessidade. (Situação → Problema → Implicação → Necessidade)",
   "quando": "Vendas consultivas complexas, valores altos, múltiplos decisores.",
   "passos": [
    "Situação: Perguntas sobre o contexto atual (\"Como funciona hoje seu processo de X?\")",
    "Problema: Identificar dores (\"Quais dificuldades você enfrenta com isso?\")",
    "Implicação: Aprofundar a dor (\"O que acontece quando esse problema se repete?\")",
    "Necessidade de Solução: Fazer o cliente verbalizar o valor (\"Se resolvesse isso, qual seria o impacto?\")"
   ]
  },
  {
   "nome": "Qualificação em 4 Passos",
   "resumo": "Método para qualificar clientes potenciais rapidamente em 4 critérios.",
   "quando": "Qualificação de clientes potenciais, primeiras ligações, para decidir se vale investir tempo.",
   "passos": [
    "Orçamento: \"Vocês já têm orçamento previsto para essa iniciativa?\"",
    "Autoridade: \"Quem mais participa da decisão?\"",
    "Necessidade: \"Qual o principal problema que querem resolver?\"",
    "Prazo: \"Para quando vocês precisam disso implementado?\""
   ]
  },
  {
   "nome": "Venda Desafiadora",
   "resumo": "Ensine algo novo ao cliente, personalize a abordagem e assuma o controle.",
   "quando": "Quando o cliente acha que já sabe tudo, vendas entre empresas, diferenciação competitiva.",
   "passos": [
    "Ensinar: Traga informações que o cliente não sabia (\"Você sabia que 70% das empresas do seu setor estão...\")",
    "Personalizar: Conecte à realidade dele (\"No seu caso específico, isso significa...\")",
    "Controlar: Conduza a conversa com firmeza (\"Com base nisso, o caminho mais inteligente seria...\")"
   ]
  },
  {
   "nome": "Conexão e Confiança",
   "resumo": "Técnica de conexão emocional para criar confiança rapidamente.",
   "quando": "Início de qualquer interação, reuniões presenciais, quando há resistência.",
   "passos": [
    "Espelhamento: Adapte tom de voz, velocidade e linguagem corporal ao cliente",
    "Interesses: Encontre pontos em comum (\"Vi que você também...\")",
    "Escuta Ativa: Repita o que ele disse com suas palavras (\"Se entendi bem...\")",
    "Validação: Reconheça sentimentos (\"Faz total sentido você pensar assim\")"
   ]
  },
  {
   "nome": "Fechamento Alternativo",
   "resumo": "Ofereça duas opções em vez de sim/não para facilitar a decisão.",
   "quando": "Momento de fechamento, quando o cliente está indeciso mas interessado.",
   "passos": [
    "Nunca pergunte \"Vamos fechar?\", dê opções: \"Prefere o plano A ou o B?\"",
    "Exemplos: \"Começamos na segunda ou na quarta?\", \"Prefere pagar à vista com desconto ou parcelado?\"",
    "Use após sinais de compra: cliente perguntando sobre prazo, implementação ou condições",
    "Se disser \"nenhum dos dois\", investigue: \"O que precisaria mudar para fazer sentido?\""
   ]
  },
  {
   "nome": "Histórias que Vendem",
   "resumo": "Use histórias de clientes reais para criar identificação e provar resultados.",
   "quando": "Objeções de preço, ceticismo, quando dados sozinhos não convencem.",
   "passos": [
    "Situação: \"O cliente X, do mesmo segmento que vocês, enfrentava [problema]\"",
    "Problema: \"Isso causava [consequência negativa, com números se possível]\"",
    "Solução: \"Implementamos [solução] em [prazo]\"",
    "Resultado: \"Em X meses, eles alcançaram [resultado com números]\""
   ]
  },
  {
   "nome": "Método Sanduíche",
   "resumo": "Apresente o preço entre dois benefícios fortes.",
   "quando": "Apresentação de preço, proposta comercial, quando o valor é alto.",
   "passos": [
    "Benefício forte: \"Com nossa solução, vocês vão [resultado principal]\"",
    "Preço: \"O investimento para isso é de R$ X por mês\"",
    "Benefício forte: \"E além disso, vocês também terão [benefício adicional]\"",
    "Nunca diga o preço sozinho - sempre com contexto de valor"
   ]
  },
  {
   "nome": "Venda Consultiva",
   "resumo": "Posicione-se como consultor, não vendedor. Diagnostique antes de prescrever.",
   "quando": "Vendas complexas, serviços, quando o cliente precisa de solução sob medida.",
   "passos": [
    "Diagnóstico: Faça mais perguntas do que apresentações nos primeiros 70% da reunião",
    "Prescrição: Só apresente a solução depois de entender 100% a dor",
    "Personalização: Adapte a apresentação para o contexto específico do cliente",
    "Acompanhamento: Monitore resultados e sugira melhorias proativamente"
   ]
  }
 ],
 "porSegmento": {
  "automotivo": {
   "objecoes": [
    {
     "objecao": "\"Vou esperar o novo modelo\"",
     "curtas": [
      "Condições atuais não se repetem no modelo novo.",
      "Preço de entrada sobe Y%. Compre agora."
     ],
     "completa": "O modelo atual tem condições que não se repetem: [bônus de fábrica/taxa zero/estoque limitado]. Quando o novo chegar, essas condições acabam e o preço sobe.",
     "erro": ""
    },
    {
     "objecao": "\"O seguro está muito caro\"",
     "curtas": [
      "Parceria com corretoras: até 30% de desconto.",
      "Olhe o custo total mensal, não só o seguro."
     ],
     "completa": "Temos parceria com corretoras que conseguem até 30% de desconto. Posso incluir isso na proposta e mostrar o custo total real mensal.",
     "erro": ""
    },
    {
     "objecao": "\"Está muito caro\"",
     "curtas": [
      "Caro é perder R$ X por mês sem essa solução.",
      "Quanto te custa NÃO resolver esse problema?",
      "Nosso cliente Y achava o mesmo. Hoje o retorno dele é 3x."
     ],
     "completa": "Entendo sua preocupação com o investimento. Vamos olhar pelo lado do retorno: quanto você perde hoje sem essa solução? O custo de não agir geralmente é maior que o investimento.",
     "erro": "Dar desconto imediato sem explorar o valor. Isso desvaloriza seu produto e treina o cliente a sempre pedir desconto."
    },
    {
     "objecao": "\"Vou pensar\"",
     "curtas": [
      "Pensar sobre qual ponto especificamente?",
      "O que falta para você decidir hoje?",
      "Posso te ajudar a pensar — qual é a maior dúvida?"
     ],
     "completa": "Perfeito, pensar é importante. Para eu te ajudar a pensar melhor: qual é o ponto principal que te gera dúvida? Assim posso enviar informações focadas.",
     "erro": "Aceitar passivamente e ir embora. \"Vou pensar\" geralmente significa que algum ponto não ficou claro ou existe uma objeção escondida."
    },
    {
     "objecao": "\"Já tenho fornecedor\"",
     "curtas": [
      "Ótimo! Está 100% satisfeito ou tem pontos a melhorar?",
      "Não é trocar, é comparar. 15 minutos resolvem.",
      "Ter referência é bom. Que tal uma segunda opinião?"
     ],
     "completa": "Ótimo, isso mostra que você valoriza esse tipo de solução. Muitos dos nossos melhores clientes já tinham fornecedor. A pergunta é: você está 100% satisfeito ou há pontos que gostaria de melhorar?",
     "erro": "Falar mal do concorrente. Isso gera desconfiança e faz o cliente defender o fornecedor atual."
    },
    {
     "objecao": "\"Não é o momento\"",
     "curtas": [
      "Quando seria? Seus concorrentes estão agindo agora.",
      "O custo de esperar é maior que o de agir.",
      "Que tal um piloto pequeno para não perder a janela?"
     ],
     "completa": "Entendo que o timing é importante. Qual seria o momento ideal? Pergunto porque muitos clientes que esperaram acabaram perdendo [vantagem específica].",
     "erro": "Insistir agressivamente ou desistir rápido demais. O ideal é plantar uma semente e agendar retorno."
    },
    {
     "objecao": "\"Preciso falar com meu sócio/diretor\"",
     "curtas": [
      "Posso preparar um resumo de 1 página para ele.",
      "Que tal uma ligação rápida com ele? 15 minutos.",
      "Quais critérios ele avalia? Preparo os argumentos."
     ],
     "completa": "Claro! Para facilitar a conversa dele, posso preparar um resumo executivo de 1 página com os pontos principais e o retorno esperado. O que acha?",
     "erro": "Não pedir para falar direto com o decisor. Você fica dependendo de alguém vender por você."
    },
    {
     "objecao": "\"Me envia uma proposta por email\"",
     "curtas": [
      "Envio! Mas 10 min juntos valem mais que um email.",
      "80% das propostas se perdem no email. Revisamos juntos?",
      "Posso fazer 2 perguntas antes para personalizar?"
     ],
     "completa": "Envio sim! Mas antes, quero garantir que a proposta esteja 100% personalizada. Posso fazer mais 2 perguntas rápidas sobre suas necessidades?",
     "erro": "Enviar a proposta e esperar o cliente responder. Proposta sem apresentação é documento perdido."
    },
    {
     "objecao": "\"O concorrente é mais barato\"",
     "curtas": [
      "Mais barato com as mesmas entregas? Vamos comparar.",
      "O barato pode sair caro. Pergunte sobre o resultado.",
      "Preço menor = escopo menor. Quer ver lado a lado?"
     ],
     "completa": "É uma comparação justa. Mas você está comparando exatamente as mesmas entregas? Geralmente o mais barato não inclui [diferencial]. No final, o barato pode sair caro.",
     "erro": "Entrar em guerra de preço. Você nunca vai ganhar competindo só por preço — compete por valor."
    },
    {
     "objecao": "\"Não tenho orçamento\"",
     "curtas": [
      "Se pagasse em 3 meses, realocaria orçamento?",
      "Quanto esse problema te custa hoje? Compare.",
      "Comece pequeno. O resultado paga a expansão."
     ],
     "completa": "Entendo. Mas me diz: se o investimento se pagasse em 3 meses, faria sentido realocar orçamento? Vamos olhar o retorno antes de decidir.",
     "erro": "Aceitar que não tem orçamento e ir embora. Muitas vezes \"não tenho orçamento\" significa \"não vi valor suficiente para priorizar\"."
    },
    {
     "objecao": "\"Preciso pensar melhor sobre isso\"",
     "curtas": [
      "O que especificamente te deixa em dúvida?",
      "Posso esclarecer alguma parte agora?",
      "Que tal marcarmos 10 minutos amanhã para finalizar?"
     ],
     "completa": "Claro! Para eu te ajudar a pensar melhor, qual é a parte que ainda não ficou 100% clara? Assim posso te enviar as informações focadas.",
     "erro": "Deixar o cliente ir sem agendar um próximo passo concreto com data e hora."
    },
    {
     "objecao": "\"Seu produto não tem [feature específica]\"",
     "curtas": [
      "O que você precisa resolver com essa feature?",
      "Temos uma forma diferente de resolver isso.",
      "Vamos olhar o todo, não uma função isolada."
     ],
     "completa": "Me conta mais: o que você precisa resolver com essa funcionalidade? Muitas vezes temos uma forma diferente (e melhor) de chegar no mesmo resultado.",
     "erro": "Prometer o que não tem só para fechar. Isso volta como problema pós-venda."
    },
    {
     "objecao": "\"Já tentei algo parecido e não funcionou\"",
     "curtas": [
      "O que exatamente não funcionou da última vez?",
      "Nosso diferencial é justamente [X].",
      "Te mostro um case de alguém que disse o mesmo e hoje tem resultado."
     ],
     "completa": "Entendo perfeitamente. Me conta: o que especificamente não funcionou? Assim consigo te mostrar em que somos diferentes e se faz sentido tentar de novo.",
     "erro": "Ignorar a experiência anterior. Você precisa entender o que falhou para não prometer a mesma coisa."
    },
    {
     "objecao": "\"Me liga daqui a 6 meses\"",
     "curtas": [
      "O que muda em 6 meses para viabilizar?",
      "Vou te mandar conteúdo útil até lá.",
      "Posso reservar sua condição atual por 30 dias?"
     ],
     "completa": "Combinado. Só para eu entender: o que você espera que mude em 6 meses? Assim consigo te ajudar a chegar lá mais rápido.",
     "erro": "Sumir 6 meses e aparecer de novo do zero. Mantenha contato útil (sem pressão) nesse período."
    },
    {
     "objecao": "\"Preciso de descontos maiores\"",
     "curtas": [
      "Qual valor faz esse negócio acontecer hoje?",
      "Posso trocar preço por condições melhores.",
      "Desconto maior implica escopo menor. Prefere?"
     ],
     "completa": "Entendo. Antes de falarmos de desconto: qual valor exato faz esse negócio acontecer hoje? Prefiro fechar com condições criativas do que só baixar preço.",
     "erro": "Ceder desconto sem contrapartida. Cada ponto de desconto precisa vir com algo em troca (volume, prazo, exclusividade)."
    },
    {
     "objecao": "\"Minha equipe não vai aceitar mudança\"",
     "curtas": [
      "Temos onboarding que reduz a resistência.",
      "A equipe sofre mais com o problema atual.",
      "Posso falar com os usuários-chave?"
     ],
     "completa": "Resistência à mudança é natural. Temos um programa de onboarding que reduz essa barreira: envolvemos os usuários-chave desde o início e a adoção fica acima de 80% em 30 dias.",
     "erro": "Tratar resistência à mudança como barreira técnica. É emocional — precisa de comunicação e envolvimento, não só treinamento."
    },
    {
     "objecao": "\"Estamos em um momento de corte de custos\"",
     "curtas": [
      "Exatamente por isso vale a conversa.",
      "Nossa solução reduz custos em [X].",
      "Podemos estruturar como investimento com retorno rápido."
     ],
     "completa": "Entendo o momento. Paradoxalmente, é o cenário ideal para nós: nossa solução reduz custos em [X%] e o retorno vem no [prazo]. Posso te mostrar a análise?",
     "erro": "Ir embora na primeira objeção. Momento de corte de custos é exatamente quando soluções que geram economia são mais atraentes."
    }
   ],
   "roteiros": [
    {
     "titulo": "Abordagem — Cliente no showroom",
     "contexto": "Cliente olhando o carro no showroom",
     "texto": "\"Olá! Sou [Seu Nome]. Vi que você está interessado no [modelo]. Posso te mostrar algumas configurações que talvez você não tenha visto no site? Me conta: é para uso urbano, viagens, ou os dois? E quantas pessoas normalmente andam com você? Com essas informações eu já consigo te indicar a versão ideal e te mostrar as condições que temos essa semana.\""
    },
    {
     "titulo": "WhatsApp — Pós test-drive",
     "contexto": "Cliente que fez test-drive mas não fechou",
     "texto": "\"Oi [Nome], tudo bem? [Seu Nome] da [Concessionária]. Obrigado pelo test-drive de ontem! Como foi a experiência? Consegui uma condição especial com a gerência hoje: [benefício concreto]. Válida até [data]. Posso te mandar a proposta personalizada para você avaliar?\""
    },
    {
     "titulo": "Ligação Fria - Primeira Abordagem",
     "contexto": "Ligação para cliente potencial que nunca ouviu falar de você",
     "texto": "\"Olá [Nome], aqui é [Seu Nome] da [Empresa]. Eu sei que você está ocupado, então vou ser breve - 30 segundos. Estamos ajudando [perfil de empresa similar] a [resultado principal] e acredito que pode fazer sentido para vocês também. Não estou ligando para vender nada agora, mas gostaria de agendar 15 minutos para entender se podemos ajudar. Teria disponibilidade [dia] às [hora]?\""
    },
    {
     "titulo": "WhatsApp - Acompanhamento Pós-reunião",
     "contexto": "Mensagem após primeira reunião de apresentação",
     "texto": "\"Oi [Nome], tudo bem? [Seu Nome] da [Empresa] aqui. Foi um prazer conversar com você hoje! Como combinamos, segue o material que mencionei: [link] Os pontos principais que conversamos: ✅ [Ponto 1] ✅ [Ponto 2] ✅ [Ponto 3] Próximo passo: [ação combinada] até [data]. Qualquer dúvida, estou à disposição! 🤝\""
    },
    {
     "titulo": "Email - Proposta Comercial",
     "contexto": "Email enviando proposta formal",
     "texto": "\"Assunto: Proposta [Empresa] - [Solução] para [Empresa do Cliente] Olá [Nome], Conforme alinhado em nossa reunião, segue a proposta para [objetivo do cliente]. Resumo da solução: • [Entrega 1] • [Entrega 2] • [Entrega 3] Investimento: R$ [valor] Condições: [condições] Validade: [data] Estou à disposição para alinharmos os próximos passos. Abraço, [Seu Nome]\""
    },
    {
     "titulo": "Mensagem - Reativação de Cliente",
     "contexto": "Cliente que sumiu há mais de 30 dias",
     "texto": "\"Oi [Nome], tudo bem? Faz um tempo que conversamos e queria saber como estão as coisas por aí. Desde nossa última conversa, [novidade relevante: novo produto/resultado de outro cliente/condição especial]. Achei que poderia fazer sentido para você. Vale uma conversa rápida de 10 minutos essa semana? Abraço!\""
    },
    {
     "titulo": "Abordagem - Indicação",
     "contexto": "Quando alguém indicou o cliente potencial",
     "texto": "\"Olá [Nome], tudo bem? O [Nome de quem indicou] me falou muito bem de você e sugeriu que conversássemos. Ajudamos a [empresa do indicador] com [resultado] e ele achou que poderia fazer sentido para vocês também. Tem 15 minutos essa semana para uma conversa rápida?\""
    }
   ]
  },
  "automotivo_luxo": {
   "objecoes": [
    {
     "objecao": "\"Por esse preço compro um importado\"",
     "curtas": [
      "Nosso pós-venda e exclusividade não se comparam.",
      "Importado tem custo de manutenção até 3x maior."
     ],
     "completa": "Entendo a comparação. Mas considere: nosso pós-venda é premium, peças originais com entrega rápida e a exclusividade da marca no Brasil. Importado paralelo não tem nada disso.",
     "erro": ""
    },
    {
     "objecao": "\"Vou comprar no exterior, sai mais barato\"",
     "curtas": [
      "Garantia, emplacamento e impostos tornam equivalente.",
      "A experiência de compra premium é só aqui."
     ],
     "completa": "Quando você soma frete, impostos de importação, emplacamento e perda de garantia de fábrica, o preço fica muito próximo. E sem a experiência de compra personalizada que oferecemos.",
     "erro": ""
    },
    {
     "objecao": "\"Preciso ver a cor/versão pessoalmente\"",
     "curtas": [
      "Agendamos uma experiência exclusiva no showroom.",
      "Podemos levar o carro até você para test-drive."
     ],
     "completa": "Com certeza! Posso agendar uma experiência exclusiva no nosso showroom, com champagne e atendimento personalizado. Qual o melhor horário para você?",
     "erro": ""
    },
    {
     "objecao": "\"Minha esposa/marido precisa aprovar\"",
     "curtas": [
      "Vamos fazer um test-drive em casal.",
      "Posso preparar uma apresentação especial para os dois."
     ],
     "completa": "Perfeito! Nada melhor que os dois vivenciarem a experiência juntos. Posso agendar um test-drive especial para o casal, com nosso consultor dedicado.",
     "erro": ""
    },
    {
     "objecao": "\"Está muito caro\"",
     "curtas": [
      "Caro é perder R$ X por mês sem essa solução.",
      "Quanto te custa NÃO resolver esse problema?",
      "Nosso cliente Y achava o mesmo. Hoje o retorno dele é 3x."
     ],
     "completa": "Entendo sua preocupação com o investimento. Vamos olhar pelo lado do retorno: quanto você perde hoje sem essa solução? O custo de não agir geralmente é maior que o investimento.",
     "erro": "Dar desconto imediato sem explorar o valor. Isso desvaloriza seu produto e treina o cliente a sempre pedir desconto."
    },
    {
     "objecao": "\"Vou pensar\"",
     "curtas": [
      "Pensar sobre qual ponto especificamente?",
      "O que falta para você decidir hoje?",
      "Posso te ajudar a pensar — qual é a maior dúvida?"
     ],
     "completa": "Perfeito, pensar é importante. Para eu te ajudar a pensar melhor: qual é o ponto principal que te gera dúvida? Assim posso enviar informações focadas.",
     "erro": "Aceitar passivamente e ir embora. \"Vou pensar\" geralmente significa que algum ponto não ficou claro ou existe uma objeção escondida."
    },
    {
     "objecao": "\"Já tenho fornecedor\"",
     "curtas": [
      "Ótimo! Está 100% satisfeito ou tem pontos a melhorar?",
      "Não é trocar, é comparar. 15 minutos resolvem.",
      "Ter referência é bom. Que tal uma segunda opinião?"
     ],
     "completa": "Ótimo, isso mostra que você valoriza esse tipo de solução. Muitos dos nossos melhores clientes já tinham fornecedor. A pergunta é: você está 100% satisfeito ou há pontos que gostaria de melhorar?",
     "erro": "Falar mal do concorrente. Isso gera desconfiança e faz o cliente defender o fornecedor atual."
    },
    {
     "objecao": "\"Não é o momento\"",
     "curtas": [
      "Quando seria? Seus concorrentes estão agindo agora.",
      "O custo de esperar é maior que o de agir.",
      "Que tal um piloto pequeno para não perder a janela?"
     ],
     "completa": "Entendo que o timing é importante. Qual seria o momento ideal? Pergunto porque muitos clientes que esperaram acabaram perdendo [vantagem específica].",
     "erro": "Insistir agressivamente ou desistir rápido demais. O ideal é plantar uma semente e agendar retorno."
    },
    {
     "objecao": "\"Preciso falar com meu sócio/diretor\"",
     "curtas": [
      "Posso preparar um resumo de 1 página para ele.",
      "Que tal uma ligação rápida com ele? 15 minutos.",
      "Quais critérios ele avalia? Preparo os argumentos."
     ],
     "completa": "Claro! Para facilitar a conversa dele, posso preparar um resumo executivo de 1 página com os pontos principais e o retorno esperado. O que acha?",
     "erro": "Não pedir para falar direto com o decisor. Você fica dependendo de alguém vender por você."
    },
    {
     "objecao": "\"Me envia uma proposta por email\"",
     "curtas": [
      "Envio! Mas 10 min juntos valem mais que um email.",
      "80% das propostas se perdem no email. Revisamos juntos?",
      "Posso fazer 2 perguntas antes para personalizar?"
     ],
     "completa": "Envio sim! Mas antes, quero garantir que a proposta esteja 100% personalizada. Posso fazer mais 2 perguntas rápidas sobre suas necessidades?",
     "erro": "Enviar a proposta e esperar o cliente responder. Proposta sem apresentação é documento perdido."
    },
    {
     "objecao": "\"O concorrente é mais barato\"",
     "curtas": [
      "Mais barato com as mesmas entregas? Vamos comparar.",
      "O barato pode sair caro. Pergunte sobre o resultado.",
      "Preço menor = escopo menor. Quer ver lado a lado?"
     ],
     "completa": "É uma comparação justa. Mas você está comparando exatamente as mesmas entregas? Geralmente o mais barato não inclui [diferencial]. No final, o barato pode sair caro.",
     "erro": "Entrar em guerra de preço. Você nunca vai ganhar competindo só por preço — compete por valor."
    },
    {
     "objecao": "\"Não tenho orçamento\"",
     "curtas": [
      "Se pagasse em 3 meses, realocaria orçamento?",
      "Quanto esse problema te custa hoje? Compare.",
      "Comece pequeno. O resultado paga a expansão."
     ],
     "completa": "Entendo. Mas me diz: se o investimento se pagasse em 3 meses, faria sentido realocar orçamento? Vamos olhar o retorno antes de decidir.",
     "erro": "Aceitar que não tem orçamento e ir embora. Muitas vezes \"não tenho orçamento\" significa \"não vi valor suficiente para priorizar\"."
    },
    {
     "objecao": "\"Preciso pensar melhor sobre isso\"",
     "curtas": [
      "O que especificamente te deixa em dúvida?",
      "Posso esclarecer alguma parte agora?",
      "Que tal marcarmos 10 minutos amanhã para finalizar?"
     ],
     "completa": "Claro! Para eu te ajudar a pensar melhor, qual é a parte que ainda não ficou 100% clara? Assim posso te enviar as informações focadas.",
     "erro": "Deixar o cliente ir sem agendar um próximo passo concreto com data e hora."
    },
    {
     "objecao": "\"Seu produto não tem [feature específica]\"",
     "curtas": [
      "O que você precisa resolver com essa feature?",
      "Temos uma forma diferente de resolver isso.",
      "Vamos olhar o todo, não uma função isolada."
     ],
     "completa": "Me conta mais: o que você precisa resolver com essa funcionalidade? Muitas vezes temos uma forma diferente (e melhor) de chegar no mesmo resultado.",
     "erro": "Prometer o que não tem só para fechar. Isso volta como problema pós-venda."
    },
    {
     "objecao": "\"Já tentei algo parecido e não funcionou\"",
     "curtas": [
      "O que exatamente não funcionou da última vez?",
      "Nosso diferencial é justamente [X].",
      "Te mostro um case de alguém que disse o mesmo e hoje tem resultado."
     ],
     "completa": "Entendo perfeitamente. Me conta: o que especificamente não funcionou? Assim consigo te mostrar em que somos diferentes e se faz sentido tentar de novo.",
     "erro": "Ignorar a experiência anterior. Você precisa entender o que falhou para não prometer a mesma coisa."
    },
    {
     "objecao": "\"Me liga daqui a 6 meses\"",
     "curtas": [
      "O que muda em 6 meses para viabilizar?",
      "Vou te mandar conteúdo útil até lá.",
      "Posso reservar sua condição atual por 30 dias?"
     ],
     "completa": "Combinado. Só para eu entender: o que você espera que mude em 6 meses? Assim consigo te ajudar a chegar lá mais rápido.",
     "erro": "Sumir 6 meses e aparecer de novo do zero. Mantenha contato útil (sem pressão) nesse período."
    },
    {
     "objecao": "\"Preciso de descontos maiores\"",
     "curtas": [
      "Qual valor faz esse negócio acontecer hoje?",
      "Posso trocar preço por condições melhores.",
      "Desconto maior implica escopo menor. Prefere?"
     ],
     "completa": "Entendo. Antes de falarmos de desconto: qual valor exato faz esse negócio acontecer hoje? Prefiro fechar com condições criativas do que só baixar preço.",
     "erro": "Ceder desconto sem contrapartida. Cada ponto de desconto precisa vir com algo em troca (volume, prazo, exclusividade)."
    },
    {
     "objecao": "\"Minha equipe não vai aceitar mudança\"",
     "curtas": [
      "Temos onboarding que reduz a resistência.",
      "A equipe sofre mais com o problema atual.",
      "Posso falar com os usuários-chave?"
     ],
     "completa": "Resistência à mudança é natural. Temos um programa de onboarding que reduz essa barreira: envolvemos os usuários-chave desde o início e a adoção fica acima de 80% em 30 dias.",
     "erro": "Tratar resistência à mudança como barreira técnica. É emocional — precisa de comunicação e envolvimento, não só treinamento."
    },
    {
     "objecao": "\"Estamos em um momento de corte de custos\"",
     "curtas": [
      "Exatamente por isso vale a conversa.",
      "Nossa solução reduz custos em [X].",
      "Podemos estruturar como investimento com retorno rápido."
     ],
     "completa": "Entendo o momento. Paradoxalmente, é o cenário ideal para nós: nossa solução reduz custos em [X%] e o retorno vem no [prazo]. Posso te mostrar a análise?",
     "erro": "Ir embora na primeira objeção. Momento de corte de custos é exatamente quando soluções que geram economia são mais atraentes."
    }
   ],
   "roteiros": [
    {
     "titulo": "Abordagem — Cliente exigente",
     "contexto": "Primeira conversa com cliente premium",
     "texto": "\"Olá [Nome]. Sou [Seu Nome], seu consultor exclusivo para o [modelo]. Antes de falarmos do carro, me conta: qual é o momento na sua vida que este carro representa? É uma conquista, presente, realização? Pergunto porque cada cliente vive essa compra de forma única. Quero preparar uma experiência à altura.\""
    },
    {
     "titulo": "Ligação Fria - Primeira Abordagem",
     "contexto": "Ligação para cliente potencial que nunca ouviu falar de você",
     "texto": "\"Olá [Nome], aqui é [Seu Nome] da [Empresa]. Eu sei que você está ocupado, então vou ser breve - 30 segundos. Estamos ajudando [perfil de empresa similar] a [resultado principal] e acredito que pode fazer sentido para vocês também. Não estou ligando para vender nada agora, mas gostaria de agendar 15 minutos para entender se podemos ajudar. Teria disponibilidade [dia] às [hora]?\""
    },
    {
     "titulo": "WhatsApp - Acompanhamento Pós-reunião",
     "contexto": "Mensagem após primeira reunião de apresentação",
     "texto": "\"Oi [Nome], tudo bem? [Seu Nome] da [Empresa] aqui. Foi um prazer conversar com você hoje! Como combinamos, segue o material que mencionei: [link] Os pontos principais que conversamos: ✅ [Ponto 1] ✅ [Ponto 2] ✅ [Ponto 3] Próximo passo: [ação combinada] até [data]. Qualquer dúvida, estou à disposição! 🤝\""
    },
    {
     "titulo": "Email - Proposta Comercial",
     "contexto": "Email enviando proposta formal",
     "texto": "\"Assunto: Proposta [Empresa] - [Solução] para [Empresa do Cliente] Olá [Nome], Conforme alinhado em nossa reunião, segue a proposta para [objetivo do cliente]. Resumo da solução: • [Entrega 1] • [Entrega 2] • [Entrega 3] Investimento: R$ [valor] Condições: [condições] Validade: [data] Estou à disposição para alinharmos os próximos passos. Abraço, [Seu Nome]\""
    },
    {
     "titulo": "Mensagem - Reativação de Cliente",
     "contexto": "Cliente que sumiu há mais de 30 dias",
     "texto": "\"Oi [Nome], tudo bem? Faz um tempo que conversamos e queria saber como estão as coisas por aí. Desde nossa última conversa, [novidade relevante: novo produto/resultado de outro cliente/condição especial]. Achei que poderia fazer sentido para você. Vale uma conversa rápida de 10 minutos essa semana? Abraço!\""
    },
    {
     "titulo": "Abordagem - Indicação",
     "contexto": "Quando alguém indicou o cliente potencial",
     "texto": "\"Olá [Nome], tudo bem? O [Nome de quem indicou] me falou muito bem de você e sugeriu que conversássemos. Ajudamos a [empresa do indicador] com [resultado] e ele achou que poderia fazer sentido para vocês também. Tem 15 minutos essa semana para uma conversa rápida?\""
    }
   ]
  },
  "farmaceutico": {
   "objecoes": [
    {
     "objecao": "\"Não temos aprovação regulatória para trocar\"",
     "curtas": [
      "Nosso time acompanha todo o processo regulatório.",
      "Comece agora para estar pronto quando a janela abrir."
     ],
     "completa": "Entendo a questão regulatória. Nosso time de assuntos regulatórios pode acompanhar todo o processo de adequação. Já fizemos isso com [laboratório X] em tempo recorde.",
     "erro": ""
    },
    {
     "objecao": "\"O médico já está acostumado a prescrever outra marca\"",
     "curtas": [
      "Os estudos clínicos mostram vantagens claras.",
      "Que tal amostras grátis para o médico testar?"
     ],
     "completa": "A familiaridade é importante, mas os estudos clínicos mostram [dados]. Podemos organizar um simpósio com líderes de opinião para apresentar as evidências?",
     "erro": ""
    },
    {
     "objecao": "\"Está muito caro\"",
     "curtas": [
      "Caro é perder R$ X por mês sem essa solução.",
      "Quanto te custa NÃO resolver esse problema?",
      "Nosso cliente Y achava o mesmo. Hoje o retorno dele é 3x."
     ],
     "completa": "Entendo sua preocupação com o investimento. Vamos olhar pelo lado do retorno: quanto você perde hoje sem essa solução? O custo de não agir geralmente é maior que o investimento.",
     "erro": "Dar desconto imediato sem explorar o valor. Isso desvaloriza seu produto e treina o cliente a sempre pedir desconto."
    },
    {
     "objecao": "\"Vou pensar\"",
     "curtas": [
      "Pensar sobre qual ponto especificamente?",
      "O que falta para você decidir hoje?",
      "Posso te ajudar a pensar — qual é a maior dúvida?"
     ],
     "completa": "Perfeito, pensar é importante. Para eu te ajudar a pensar melhor: qual é o ponto principal que te gera dúvida? Assim posso enviar informações focadas.",
     "erro": "Aceitar passivamente e ir embora. \"Vou pensar\" geralmente significa que algum ponto não ficou claro ou existe uma objeção escondida."
    },
    {
     "objecao": "\"Já tenho fornecedor\"",
     "curtas": [
      "Ótimo! Está 100% satisfeito ou tem pontos a melhorar?",
      "Não é trocar, é comparar. 15 minutos resolvem.",
      "Ter referência é bom. Que tal uma segunda opinião?"
     ],
     "completa": "Ótimo, isso mostra que você valoriza esse tipo de solução. Muitos dos nossos melhores clientes já tinham fornecedor. A pergunta é: você está 100% satisfeito ou há pontos que gostaria de melhorar?",
     "erro": "Falar mal do concorrente. Isso gera desconfiança e faz o cliente defender o fornecedor atual."
    },
    {
     "objecao": "\"Não é o momento\"",
     "curtas": [
      "Quando seria? Seus concorrentes estão agindo agora.",
      "O custo de esperar é maior que o de agir.",
      "Que tal um piloto pequeno para não perder a janela?"
     ],
     "completa": "Entendo que o timing é importante. Qual seria o momento ideal? Pergunto porque muitos clientes que esperaram acabaram perdendo [vantagem específica].",
     "erro": "Insistir agressivamente ou desistir rápido demais. O ideal é plantar uma semente e agendar retorno."
    },
    {
     "objecao": "\"Preciso falar com meu sócio/diretor\"",
     "curtas": [
      "Posso preparar um resumo de 1 página para ele.",
      "Que tal uma ligação rápida com ele? 15 minutos.",
      "Quais critérios ele avalia? Preparo os argumentos."
     ],
     "completa": "Claro! Para facilitar a conversa dele, posso preparar um resumo executivo de 1 página com os pontos principais e o retorno esperado. O que acha?",
     "erro": "Não pedir para falar direto com o decisor. Você fica dependendo de alguém vender por você."
    },
    {
     "objecao": "\"Me envia uma proposta por email\"",
     "curtas": [
      "Envio! Mas 10 min juntos valem mais que um email.",
      "80% das propostas se perdem no email. Revisamos juntos?",
      "Posso fazer 2 perguntas antes para personalizar?"
     ],
     "completa": "Envio sim! Mas antes, quero garantir que a proposta esteja 100% personalizada. Posso fazer mais 2 perguntas rápidas sobre suas necessidades?",
     "erro": "Enviar a proposta e esperar o cliente responder. Proposta sem apresentação é documento perdido."
    },
    {
     "objecao": "\"O concorrente é mais barato\"",
     "curtas": [
      "Mais barato com as mesmas entregas? Vamos comparar.",
      "O barato pode sair caro. Pergunte sobre o resultado.",
      "Preço menor = escopo menor. Quer ver lado a lado?"
     ],
     "completa": "É uma comparação justa. Mas você está comparando exatamente as mesmas entregas? Geralmente o mais barato não inclui [diferencial]. No final, o barato pode sair caro.",
     "erro": "Entrar em guerra de preço. Você nunca vai ganhar competindo só por preço — compete por valor."
    },
    {
     "objecao": "\"Não tenho orçamento\"",
     "curtas": [
      "Se pagasse em 3 meses, realocaria orçamento?",
      "Quanto esse problema te custa hoje? Compare.",
      "Comece pequeno. O resultado paga a expansão."
     ],
     "completa": "Entendo. Mas me diz: se o investimento se pagasse em 3 meses, faria sentido realocar orçamento? Vamos olhar o retorno antes de decidir.",
     "erro": "Aceitar que não tem orçamento e ir embora. Muitas vezes \"não tenho orçamento\" significa \"não vi valor suficiente para priorizar\"."
    },
    {
     "objecao": "\"Preciso pensar melhor sobre isso\"",
     "curtas": [
      "O que especificamente te deixa em dúvida?",
      "Posso esclarecer alguma parte agora?",
      "Que tal marcarmos 10 minutos amanhã para finalizar?"
     ],
     "completa": "Claro! Para eu te ajudar a pensar melhor, qual é a parte que ainda não ficou 100% clara? Assim posso te enviar as informações focadas.",
     "erro": "Deixar o cliente ir sem agendar um próximo passo concreto com data e hora."
    },
    {
     "objecao": "\"Seu produto não tem [feature específica]\"",
     "curtas": [
      "O que você precisa resolver com essa feature?",
      "Temos uma forma diferente de resolver isso.",
      "Vamos olhar o todo, não uma função isolada."
     ],
     "completa": "Me conta mais: o que você precisa resolver com essa funcionalidade? Muitas vezes temos uma forma diferente (e melhor) de chegar no mesmo resultado.",
     "erro": "Prometer o que não tem só para fechar. Isso volta como problema pós-venda."
    },
    {
     "objecao": "\"Já tentei algo parecido e não funcionou\"",
     "curtas": [
      "O que exatamente não funcionou da última vez?",
      "Nosso diferencial é justamente [X].",
      "Te mostro um case de alguém que disse o mesmo e hoje tem resultado."
     ],
     "completa": "Entendo perfeitamente. Me conta: o que especificamente não funcionou? Assim consigo te mostrar em que somos diferentes e se faz sentido tentar de novo.",
     "erro": "Ignorar a experiência anterior. Você precisa entender o que falhou para não prometer a mesma coisa."
    },
    {
     "objecao": "\"Me liga daqui a 6 meses\"",
     "curtas": [
      "O que muda em 6 meses para viabilizar?",
      "Vou te mandar conteúdo útil até lá.",
      "Posso reservar sua condição atual por 30 dias?"
     ],
     "completa": "Combinado. Só para eu entender: o que você espera que mude em 6 meses? Assim consigo te ajudar a chegar lá mais rápido.",
     "erro": "Sumir 6 meses e aparecer de novo do zero. Mantenha contato útil (sem pressão) nesse período."
    },
    {
     "objecao": "\"Preciso de descontos maiores\"",
     "curtas": [
      "Qual valor faz esse negócio acontecer hoje?",
      "Posso trocar preço por condições melhores.",
      "Desconto maior implica escopo menor. Prefere?"
     ],
     "completa": "Entendo. Antes de falarmos de desconto: qual valor exato faz esse negócio acontecer hoje? Prefiro fechar com condições criativas do que só baixar preço.",
     "erro": "Ceder desconto sem contrapartida. Cada ponto de desconto precisa vir com algo em troca (volume, prazo, exclusividade)."
    },
    {
     "objecao": "\"Minha equipe não vai aceitar mudança\"",
     "curtas": [
      "Temos onboarding que reduz a resistência.",
      "A equipe sofre mais com o problema atual.",
      "Posso falar com os usuários-chave?"
     ],
     "completa": "Resistência à mudança é natural. Temos um programa de onboarding que reduz essa barreira: envolvemos os usuários-chave desde o início e a adoção fica acima de 80% em 30 dias.",
     "erro": "Tratar resistência à mudança como barreira técnica. É emocional — precisa de comunicação e envolvimento, não só treinamento."
    },
    {
     "objecao": "\"Estamos em um momento de corte de custos\"",
     "curtas": [
      "Exatamente por isso vale a conversa.",
      "Nossa solução reduz custos em [X].",
      "Podemos estruturar como investimento com retorno rápido."
     ],
     "completa": "Entendo o momento. Paradoxalmente, é o cenário ideal para nós: nossa solução reduz custos em [X%] e o retorno vem no [prazo]. Posso te mostrar a análise?",
     "erro": "Ir embora na primeira objeção. Momento de corte de custos é exatamente quando soluções que geram economia são mais atraentes."
    }
   ],
   "roteiros": [
    {
     "titulo": "Abordagem — Visita médica",
     "contexto": "Primeira visita ao consultório médico",
     "texto": "\"Doutor(a) [Nome], bom dia. Sou [Seu Nome], representante da [Laboratório]. Prometo 3 minutos. Estou aqui para apresentar [produto] — é indicado para pacientes com [perfil clínico] que não respondem bem a [alternativa atual]. Tenho estudo clínico recente comparativo e amostras para você testar. Posso deixar o material e voltar na próxima semana para saber sua impressão?\""
    },
    {
     "titulo": "Ligação Fria - Primeira Abordagem",
     "contexto": "Ligação para cliente potencial que nunca ouviu falar de você",
     "texto": "\"Olá [Nome], aqui é [Seu Nome] da [Empresa]. Eu sei que você está ocupado, então vou ser breve - 30 segundos. Estamos ajudando [perfil de empresa similar] a [resultado principal] e acredito que pode fazer sentido para vocês também. Não estou ligando para vender nada agora, mas gostaria de agendar 15 minutos para entender se podemos ajudar. Teria disponibilidade [dia] às [hora]?\""
    },
    {
     "titulo": "WhatsApp - Acompanhamento Pós-reunião",
     "contexto": "Mensagem após primeira reunião de apresentação",
     "texto": "\"Oi [Nome], tudo bem? [Seu Nome] da [Empresa] aqui. Foi um prazer conversar com você hoje! Como combinamos, segue o material que mencionei: [link] Os pontos principais que conversamos: ✅ [Ponto 1] ✅ [Ponto 2] ✅ [Ponto 3] Próximo passo: [ação combinada] até [data]. Qualquer dúvida, estou à disposição! 🤝\""
    },
    {
     "titulo": "Email - Proposta Comercial",
     "contexto": "Email enviando proposta formal",
     "texto": "\"Assunto: Proposta [Empresa] - [Solução] para [Empresa do Cliente] Olá [Nome], Conforme alinhado em nossa reunião, segue a proposta para [objetivo do cliente]. Resumo da solução: • [Entrega 1] • [Entrega 2] • [Entrega 3] Investimento: R$ [valor] Condições: [condições] Validade: [data] Estou à disposição para alinharmos os próximos passos. Abraço, [Seu Nome]\""
    },
    {
     "titulo": "Mensagem - Reativação de Cliente",
     "contexto": "Cliente que sumiu há mais de 30 dias",
     "texto": "\"Oi [Nome], tudo bem? Faz um tempo que conversamos e queria saber como estão as coisas por aí. Desde nossa última conversa, [novidade relevante: novo produto/resultado de outro cliente/condição especial]. Achei que poderia fazer sentido para você. Vale uma conversa rápida de 10 minutos essa semana? Abraço!\""
    },
    {
     "titulo": "Abordagem - Indicação",
     "contexto": "Quando alguém indicou o cliente potencial",
     "texto": "\"Olá [Nome], tudo bem? O [Nome de quem indicou] me falou muito bem de você e sugeriu que conversássemos. Ajudamos a [empresa do indicador] com [resultado] e ele achou que poderia fazer sentido para vocês também. Tem 15 minutos essa semana para uma conversa rápida?\""
    }
   ]
  }
 }
};
