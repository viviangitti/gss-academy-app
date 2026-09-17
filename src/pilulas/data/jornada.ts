// A jornada do atendimento ao lead online, etapa por etapa.
//
// O vendedor recebe o lead e trava em duas coisas: o que escrever agora e o
// que mandar depois. Aqui cada etapa entrega as duas — um script para copiar e
// colar e um one page para compartilhar — na ordem em que o atendimento
// acontece de verdade.
//
// REGRA DE CONTEÚDO: nenhum texto daqui cita preço, taxa, desconto ou prazo de
// pagamento. Número vai só na tabela oficial que a gerência publica em
// Condições — é ela que chega no cliente, com a validade dela.

import { isAuto, type BrandId } from './brands';

export type OnePageTipo = 'proprio' | 'carro' | 'condicao' | 'objecao';

export interface OnePageBloco {
  titulo: string;
  itens: string[];
}

export interface OnePage {
  /** 'proprio' = a Jornada monta a imagem; os outros levam ao material que o app já gera. */
  tipo: OnePageTipo;
  titulo: string;
  linha: string;
  blocos?: OnePageBloco[];
  rodape?: string;
  /** Para tipo diferente de 'proprio': para onde mandar o vendedor, e o que ele faz lá. */
  leva?: { rota: string; botao: string; comoFazer: string };
}

export interface Etapa {
  id: string;
  numero: number;
  titulo: string;
  /** Quando esta etapa acontece — aparece na linha do tempo. */
  tempo: string;
  objetivo: string;
  /** Como o vendedor sabe que pode ir para a próxima etapa. */
  sinal: string;
  script: string;
  porQue: string;
  /** O que mandar quando o cliente não responde. Toda etapa tem a sua. */
  semResposta: string;
  onePage: OnePage;
}

/**
 * Os campos que o vendedor preenche uma vez e entram em todos os scripts.
 * Ficam no celular dele (localStorage), não no banco: é dado de trabalho, não
 * de cliente.
 */
export const CAMPOS = [
  { chave: 'cliente', rotulo: 'Nome do cliente', exemplo: 'Marcos' },
  { chave: 'carro', rotulo: 'Carro de interesse', exemplo: 'Jaecoo 7' },
  { chave: 'vendedor', rotulo: 'Seu nome', exemplo: 'Ana' },
  { chave: 'loja', rotulo: 'Sua loja', exemplo: 'Tiger Omoda' },
] as const;

export const ETAPAS: Etapa[] = [
  {
    id: 'pre-qualificacao',
    numero: 1,
    titulo: 'Primeiro contato',
    tempo: 'Nos primeiros 5 minutos',
    objetivo: 'Responder antes do concorrente e sair com o uso, quem dirige e o que ele procura — sem falar de dinheiro.',
    sinal: 'O cliente respondeu pelo menos duas das três perguntas.',
    script: `Oi, {cliente}! Aqui é {vendedor}, da {loja}. Acabei de receber seu contato sobre o {carro}.

Estou num atendimento presencial aqui na loja agora, mas não queria te deixar esperando. Para que eu possa ser mais assertivo no meu retorno, poderia me responder três perguntas rápidas?

1. O carro vai ser mais utilizado na cidade, na estrada ou os dois?
2. Será conduzido principalmente por você ou por outro membro da família?
3. Tem alguma coisa específica que você busca nesse modelo?

Pode responder por aqui mesmo. Assim que eu terminar este atendimento, volto com tudo organizado pra você.`,
    porQue:
      'Dizer que você está com um cliente na loja explica a demora antes que ela incomode, e mostra que você é procurado. As três perguntas cabem numa resposta só e dão uso, quem dirige e o que ele já decidiu que quer. Dinheiro fica de fora de propósito: pergunta de pagamento ou de carro na troca na PRIMEIRA mensagem assusta e derruba a conversa — isso vem depois, quando ele já está falando com você. E não prometa a melhor opção antes de ouvir: promessa antes de saber o uso é o que faz a mensagem soar a vendedor.',
    semResposta: `Oi, {cliente}! Terminei o atendimento aqui. Consegue me responder aquelas três perguntas rápidas? Com elas meu retorno já vem certo pro seu caso, sem você perder tempo com carro que não tem a ver com o que você procura.`,
    onePage: {
      tipo: 'proprio',
      titulo: 'Como vai funcionar o seu atendimento',
      linha: 'Quem vai te atender, e o que acontece a partir de agora.',
      blocos: [
        {
          titulo: 'Quem está com você',
          itens: ['{vendedor} — consultor de vendas na {loja}', 'Atendimento por WhatsApp, telefone ou presencial', 'Resposta no mesmo dia, sempre'],
        },
        {
          titulo: 'Os próximos passos',
          itens: [
            '1. Você me conta como usa o carro no dia a dia',
            '2. Eu te mando o modelo certo, com ficha, fotos e as respostas das dúvidas mais comuns',
            '3. A condição vigente da loja, oficial, com a validade dela',
            '4. Test drive marcado no horário que couber pra você',
          ],
        },
        {
          titulo: 'O que você não vai ter',
          itens: ['Ligação insistente fora de hora', 'Resposta com “depende, passa aqui na loja”', 'Compromisso nenhum antes de você dirigir o carro'],
        },
      ],
      rodape: 'Qualquer dúvida, é só responder esta mensagem.',
    },
  },
  {
    id: 'diagnostico',
    numero: 2,
    titulo: 'Entender o cliente',
    tempo: 'Ainda no mesmo dia',
    objetivo: 'Fechar o perfil de uso para recomendar um carro só — e o certo.',
    sinal: 'Você sabe uso, tamanho de família, garagem e prazo de decisão.',
    script: `{cliente}, obrigado! Com isso já dá pra eu preparar o que te mandar.

Só mais duas coisas pra eu não errar:

1. Quantas pessoas costumam andar no carro no dia a dia?
2. Você tem garagem com tomada em casa? (isso muda se o híbrido compensa mais que o elétrico pro seu bolso)

E, se você já tem carro hoje e pensa em usar na troca, me passa modelo, ano e quilometragem: assim eu adianto a avaliação antes mesmo de você vir à loja.`,
    porQue:
      'Tomada em casa e número de pessoas eliminam metade do catálogo em duas perguntas. O carro na troca entra só agora, e como vantagem: adiantar a avaliação é serviço, não sondagem de bolso. Na primeira mensagem, a mesma pergunta soa a cobrança.',
    semResposta: `{cliente}, tudo bem? Não quero te encher de mensagem. Me responde só isso: você está pesquisando agora ou já quer resolver este mês? Eu me adapto ao seu tempo.`,
    onePage: {
      tipo: 'proprio',
      titulo: 'Qual modelo combina com o seu dia a dia',
      linha: 'Quatro perfis de uso, quatro respostas diferentes.',
      blocos: [
        {
          titulo: 'Roda muito na cidade, trajeto curto',
          itens: ['Híbrido resolve: liga no elétrico, economiza no trânsito parado', 'Não depende de tomada em casa'],
        },
        {
          titulo: 'Tem garagem com tomada e roda pouco por dia',
          itens: ['O 100% elétrico é o de menor custo por quilômetro', 'Recarrega dormindo, sem passar em posto'],
        },
        {
          titulo: 'Pega estrada com frequência',
          itens: ['Híbrido com autonomia longa evita planejar parada', 'Porta-malas e conforto de rodovia pesam mais que consumo urbano'],
        },
        {
          titulo: 'Família grande ou carrinho de bebê todo dia',
          itens: ['O espaço interno e o porta-malas decidem antes do motor', 'Vale medir junto na visita, com o carrinho de verdade'],
        },
      ],
      rodape: 'Me diga o seu caso que eu já separo o carro e o horário do test drive.',
    },
  },
  {
    id: 'recomendacao',
    numero: 3,
    titulo: 'Mandar o carro certo',
    tempo: 'Logo depois das respostas',
    objetivo: 'Entregar uma recomendação só, justificada pelo que ele contou.',
    sinal: 'O cliente comenta alguma coisa do material — pergunta, elogio ou dúvida.',
    script: `{cliente}, pelo que você me contou, o que mais faz sentido pra você é o {carro}. Te explico em uma linha: ele atende exatamente o uso que você descreveu, sem você pagar por coisa que não vai usar.

Te mandei o resumo completo aqui: ficha, fotos e os pontos que mais importam no seu caso.

Dá uma olhada com calma e me diz o que te chamou mais atenção — e o que te deixou em dúvida. A dúvida é a parte mais importante, é onde eu te ajudo de verdade.`,
    porQue:
      'Mandar três opções empurra a decisão para o cliente e trava o atendimento. Uma recomendação justificada mostra que você ouviu. E pedir a dúvida abre a próxima etapa em vez de esperar o silêncio.',
    semResposta: `{cliente}, conseguiu ver o material do {carro}? Se preferir, te mando um áudio de 1 minuto com o resumo — às vezes é mais fácil que ler.`,
    onePage: {
      tipo: 'carro',
      titulo: 'O resumo do carro, pronto para enviar',
      linha: 'O app monta com foto, ficha e o seu contato.',
      leva: {
        rota: '/eleva/catalogo',
        botao: 'Abrir o catálogo',
        comoFazer: 'Abra o carro e toque em “Compartilhar resumo com o cliente”. O material sai com as suas informações de contato.',
      },
    },
  },
  {
    id: 'duvida',
    numero: 4,
    titulo: 'Responder a dúvida que trava',
    tempo: 'Na hora em que ela aparecer',
    objetivo: 'Tirar da frente a objeção que impede a visita — com dado, não com opinião.',
    sinal: 'O cliente responde alguma variação de “entendi” e volta a falar do carro.',
    script: `Ótima pergunta, {cliente} — quase todo cliente me pergunta isso, e é justo.

Te respondo com dado, não com conversa de vendedor: [cole aqui a resposta do app]

Se depois disso ainda ficar qualquer ponta solta, me fala. Prefiro resolver agora do que você descobrir depois.`,
    porQue:
      'Dizer que a pergunta é comum tira o cliente da posição de estar criando problema. Responder com número e fonte encerra o assunto; responder com adjetivo faz a dúvida voltar na semana seguinte.',
    semResposta: `{cliente}, ficou alguma dúvida do que te mandei? Pode perguntar o que for — inclusive o que costuma dar errado. Prefiro ser sincero e você decidir com tudo na mão.`,
    onePage: {
      tipo: 'objecao',
      titulo: 'A resposta pronta, com os números',
      linha: 'As objeções mais comuns, respondidas com dado.',
      leva: {
        rota: '/eleva/assistente',
        botao: 'Abrir o Tira-dúvida',
        comoFazer: 'Procure a objeção que o cliente fez e copie a resposta. Se não achar, escreva a dúvida dele e o app monta a resposta.',
      },
    },
  },
  {
    id: 'condicao',
    numero: 5,
    titulo: 'Mostrar a condição vigente',
    tempo: 'Depois que o carro já está definido',
    objetivo: 'Levar a condição oficial da loja, com validade, e oferecer a simulação.',
    sinal: 'O cliente pergunta sobre entrada, parcela ou avaliação do carro dele.',
    script: `{cliente}, a condição vigente pro {carro} é esta aqui — te mando a tabela oficial da loja, do jeito que ela saiu, com a validade.

Quer que eu faça a simulação com a sua entrada e com o seu carro na troca? Em 15 minutos eu te devolvo o número certo, não o número “mais ou menos”.

Se preferir, me passa só o modelo, ano e quilometragem do seu carro que eu já adianto a avaliação.`,
    porQue:
      'A tabela oficial protege você e o cliente: o número que ele recebe é o mesmo que a gerência publicou, com a validade à vista. E oferecer a simulação transforma “vou pensar” em uma tarefa sua, não dele.',
    semResposta: `{cliente}, chegou a ver a condição que te mandei? Ela tem validade — se você quiser, eu já deixo a sua simulação pronta pra quando você decidir.`,
    onePage: {
      tipo: 'condicao',
      titulo: 'A tabela oficial da loja',
      linha: 'Publicada pela gerência, com validade — é ela que vai para o cliente.',
      leva: {
        rota: '/eleva/ofertas',
        botao: 'Abrir Condições',
        comoFazer: 'Abra a condição do mês, confira a validade e compartilhe a imagem oficial. Não reescreva números na mensagem.',
      },
    },
  },
  {
    id: 'visita',
    numero: 6,
    titulo: 'Marcar o test drive',
    tempo: 'Assim que a dúvida principal cair',
    objetivo: 'Tirar o atendimento do WhatsApp e colocar o cliente dentro do carro.',
    sinal: 'Dia e hora combinados, com o carro separado.',
    script: `{cliente}, pra decidir mesmo só falta uma coisa: sentar no carro e dirigir.

Tenho dois horários separados: [dia] às [hora] ou [dia] às [hora]. Qual fica melhor pra você?

Eu deixo o {carro} preparado e, enquanto você dirige, a gente já faz a avaliação do seu carro na troca. Você sai daqui com o número exato — e sem compromisso nenhum de fechar na hora.`,
    porQue:
      'Duas opções de horário fecham mais agenda que “quando você puder”. Prometer a avaliação em paralelo dá ao cliente um segundo motivo para ir. E dizer “sem compromisso” derruba o medo de entrar na loja e não conseguir sair.',
    semResposta: `{cliente}, consegui segurar os dois horários até amanhã. Se nenhum servir, me diz o melhor dia que eu me viro pra encaixar.`,
    onePage: {
      tipo: 'proprio',
      titulo: 'O que acontece na sua visita',
      linha: 'Para você chegar sabendo, e sair com número na mão.',
      blocos: [
        {
          titulo: 'Leva com você',
          itens: ['CNH (para o test drive)', 'Documento do carro na troca, se tiver', 'As dúvidas que ainda não te respondi'],
        },
        {
          titulo: 'Quanto tempo leva',
          itens: ['Test drive: cerca de 20 minutos', 'Avaliação do seu carro: acontece ao mesmo tempo', 'No total, cerca de uma hora'],
        },
        {
          titulo: 'Você sai com',
          itens: ['A avaliação do seu carro, por escrito', 'A condição vigente aplicada ao seu caso', 'Nenhuma obrigação de fechar na hora'],
        },
      ],
      rodape: 'Vou te esperar. Se atrasar ou precisar remarcar, é só me avisar por aqui.',
    },
  },
  {
    id: 'proposta',
    numero: 7,
    titulo: 'Depois da visita',
    tempo: 'Nas primeiras 24 horas',
    objetivo: 'Registrar por escrito o que ficou combinado, enquanto a experiência está fresca.',
    sinal: 'O cliente confirma o combinado ou pede um ajuste específico.',
    script: `Foi ótimo te receber, {cliente}! Resumindo o que a gente combinou:

• Carro: {carro} — [versão e cor]
• Seu carro na troca: [modelo e ano], já avaliado
• Condição: a que está na tabela oficial que te mandei, válida até [data]
• Próximo passo: [o que falta]

Te mando este resumo por escrito pra você conferir com calma, e mostrar pra quem decide junto com você.

Se precisar de qualquer ajuste, me fala que eu levo pra gerência.`,
    porQue:
      'A decisão de carro quase nunca é de uma pessoa só. Um resumo por escrito é o que o cliente mostra em casa — e é ele que defende sua proposta quando você não está presente.',
    semResposta: `{cliente}, conseguiu conversar em casa sobre o {carro}? Se ficou alguma dúvida que eu não respondi na visita, pode mandar. E se mudou de ideia, também pode me dizer: eu prefiro saber.`,
    onePage: {
      tipo: 'proprio',
      titulo: 'O que ficou combinado',
      linha: 'O resumo da sua visita, por escrito.',
      blocos: [
        {
          titulo: 'O carro escolhido',
          itens: ['{carro} — versão e cor conforme conversamos', 'Itens de série conferidos no test drive', 'Prazo de entrega confirmado com a loja'],
        },
        {
          titulo: 'O seu carro na troca',
          itens: ['Avaliado presencialmente, com laudo', 'O valor está na proposta oficial que te enviei'],
        },
        {
          titulo: 'O que falta para fechar',
          itens: ['Sua confirmação do modelo e da cor', 'Documentos para a análise', 'Agendamento da entrega'],
        },
      ],
      rodape: 'Valores e condições: sempre os da tabela oficial da loja, dentro da validade dela.',
    },
  },
  {
    id: 'fechamento',
    numero: 8,
    titulo: 'Fechar e entregar',
    tempo: 'Do aceite até 30 dias depois',
    objetivo: 'Tirar atrito do fechamento e transformar a entrega em indicação.',
    sinal: 'Documentos entregues, data de entrega marcada — e, depois, o cliente indicando alguém.',
    script: `{cliente}, que notícia boa! Pra deixar tudo pronto sem você precisar voltar aqui, me manda por aqui mesmo:

• CNH
• Comprovante de residência
• Comprovante de renda
• Documento do carro na troca

Eu cuido do resto e te aviso a cada passo. Quando estiver tudo certo, marcamos a entrega no dia que for melhor pra você — e eu te explico tudo do carro na hora, com calma.`,
    porQue:
      'A lista fechada evita a ida e volta de documento que atrasa o faturamento por dias. Dizer que você avisa a cada passo é o que impede o cliente ansioso de ligar todo dia — e é o que ele lembra na hora de indicar você.',
    semResposta: `{cliente}, tudo certo por aí? Faltou só [documento] pra eu seguir com a sua análise. Assim que chegar, eu já toco.`,
    onePage: {
      tipo: 'proprio',
      titulo: 'Sua entrega, passo a passo',
      linha: 'O que falta, o que eu faço e o que você recebe no dia.',
      blocos: [
        {
          titulo: 'Documentos que eu preciso',
          itens: ['CNH', 'Comprovante de residência', 'Comprovante de renda', 'Documento do carro na troca'],
        },
        {
          titulo: 'O que acontece até a entrega',
          itens: ['Análise e aprovação — eu te aviso o resultado', 'Preparação e revisão de entrega do carro', 'Data marcada com você, não pela loja'],
        },
        {
          titulo: 'No dia da entrega',
          itens: ['Apresentação completa do carro, sem pressa', 'Configuração do aplicativo e dos itens de conectividade', 'Meu contato direto para qualquer dúvida depois'],
        },
      ],
      rodape: 'Depois da entrega eu volto a falar com você: 7 dias, 30 dias e na primeira revisão.',
    },
  },
];

/**
 * As etapas da marca.
 *
 * A jornada é escrita em linguagem de concessionária — test drive, carro na
 * troca, avaliação. Na farmácia e na revenda ela não faz sentido nenhum, e
 * conteúdo sem recorte aparece para todas as empresas: é o furo que o
 * `npm run confere` procura.
 */
export function etapasDaMarca(brand: BrandId): Etapa[] {
  return isAuto(brand) ? ETAPAS : [];
}
