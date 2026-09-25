// A FOLHA DE INVESTIMENTO EM WORD — o mesmo conteúdo do PDF, editável.
//
//   node scripts/investimento/gera-word.mjs
//
// Os números vêm do medir.mjs e são os MESMOS do doc.html. Mexeu num, mexa nos
// dois — o README da pasta explica a ordem.
import {
  Document, Packer, Paragraph, TableRow, PageBreak, WidthType, AlignmentType, HeadingLevel, BorderStyle,
  NAVY, OURO, OURO_ESCURO, TINTA, CINZA, CINZA_CLARO, FUNDO, FUNDO2, LARGURA, SEM_BORDAS, semBorda,
  txt, p, rico, celula, tabela, h2, nota, notaP, cabecalho, faixa, fs, path,
} from './word.mjs';

const hoje = new Date();
const dd = String(hoje.getDate()).padStart(2, '0');
const mm = String(hoje.getMonth() + 1).padStart(2, '0');
const SAIDA = path.join(process.env.HOME, 'Downloads',
  `Eleva x Ramasa - investimento e proposta ${dd}-${mm} (editavel).docx`);

const filhos = [];
const põe = (...x) => filhos.push(...x.flat());

// ── capa ──────────────────────────────────────────────────────────────────────
põe(tabela([
  new TableRow({
    children: [celula([
      p([txt('eleva', { size: 30, bold: true, color: 'FFFFFF' }),
         txt('     GRUPO RAMASA · USO INTERNO', { size: 16, bold: true, color: OURO, spacing: 30 })],
        { depois: 200 }),
      p('Quanto já foi investido no app', { size: 48, bold: true, color: 'FFFFFF', depois: 140, linha: 400 }),
      p(rico('O que existe hoje, **quanto trabalho está dentro disso** — medido no histórico, não de memória —, quanto custa manter e quanto vale cada peça. Atualização da versão de 11/09.',
        { size: 19, color: 'D5D8E6' }), { depois: 200, linha: 290 }),
      p(`${dd} DE SETEMBRO DE 2026 · NÃO ENVIAR AO CLIENTE`,
        { size: 15, bold: true, color: '9AA2BD', spacing: 24, depois: 0 }),
    ], { largura: LARGURA, fundo: NAVY, mt: 320, mb: 320, ml: 300, mr: 300 })],
  }),
], [LARGURA], { bordas: SEM_BORDAS }));

põe(p('', { depois: 180 }));

// ── as duas contas: o app inteiro, e a parte da Ramasa ──────────────────────
const LK = [2409, 2409, 2410, 2410];
const cartaoNumero = (n, oque, antes, dourado) => celula([
  p(n, { size: 34, bold: true, color: OURO, depois: 60 }),
  p(oque, { size: 15, color: 'C8CBDB', depois: 50, linha: 230 }),
  p(antes, { size: 13, color: '8E96B4', depois: 0 }),
], { largura: 2409, fundo: dourado ? '1B2338' : NAVY, mt: 180, mb: 180, ml: 160, mr: 120,
  bordas: dourado ? {
    top: { style: BorderStyle.SINGLE, size: 4, color: OURO },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: OURO },
    left: { style: BorderStyle.SINGLE, size: 4, color: OURO },
    right: { style: BorderStyle.SINGLE, size: 4, color: OURO },
  } : undefined });

const rotuloPlacar = (texto, dourado) => p(texto, {
  size: 15, bold: true, caps: true, spacing: 28, antes: 200, depois: 90,
  color: dourado ? OURO_ESCURO : CINZA_CLARO,
});

põe(rotuloPlacar('O que já foi feito para a Ramasa', true));
põe(tabela([
  new TableRow({ cantSplit: true, children: [
    cartaoNumero('33', 'dias de trabalho', 'eram 25 em 11/09', true),
    cartaoNumero('213', 'entregas registradas', 'eram 176', true),
    cartaoNumero('158 h', 'medidas, leitura conservadora', 'eram 107 h', true),
    cartaoNumero('R$ 31.600', 'custo dessas horas a R$ 200/h', 'eram R$ 21.420', true),
  ] }),
], LK, { bordas: SEM_BORDAS }));

// a capa é capa: o conteúdo abre na página seguinte
põe(new Paragraph({ children: [new PageBreak()] }));

// ── 1. o que existe hoje ──────────────────────────────────────────────────────
põe(h2('1. O que existe hoje', 'Tudo que está no ar, contado hoje no app e no banco.'));

const LC = [4819, 4819];
const cartao = (titulo, itens) => celula([
  p(titulo, { size: 15, bold: true, color: OURO_ESCURO, caps: true, spacing: 24, depois: 120 }),
  ...itens.map((i) => p(rico(i, { size: 17 }), { bullet: true, depois: 60, linha: 240 })),
], { largura: 4819, fundo: FUNDO, mt: 180, mb: 180, ml: 200, mr: 200 });

põe(tabela([
  new TableRow({ cantSplit: true, children: [
    cartao('App do vendedor', [
      'Catálogo de **5 carros** com trilha de 6 níveis cada (+1)',
      '**27 acessórios** com preço, código de peça e como oferecer',
      'Condições comerciais do mês, com validade automática',
      'Material pronto pro cliente, com o contato do vendedor — agora com **botão de salvar PDF** (novo)',
      '**Jornada do lead online** em 5 etapas (novo)',
      'Tira-dúvida com IA, preso ao conteúdo aprovado',
      'Notícias do setor em 6 frentes',
      '**Valores do grupo**: valor da semana, carimbo e a tela Cultura (novo)',
      '**Pop-up do ritual do mês**, por cargo, com dia marcado (novo)',
    ]),
    cartao('Conteúdo produzido', [
      '**5 carros**: ficha, versões, destaques e trilha de ~32 cenas cada',
      '**36 objeções** escritas com resposta, mais 4 que o time mandou',
      '27 acessórios escritos um a um',
      '**23 documentos** da montadora na prateleira (+2)',
      '**14 condições** de setembro publicadas, com lâmina pronta pro WhatsApp',
      'Fotos e PDFs organizados por carro',
    ]),
  ] }),
  new TableRow({ cantSplit: true, children: [
    cartao('Painel da gerência', [
      'Uso do time por pessoa, por cargo e **por loja** (novo)',
      '**37 contas** da Ramasa no app (eram 31)',
      'Publicação da carta do mês, partindo o PDF por modelo',
      'Preço e ficha de acessório editáveis na linha',
      'Documentos, vídeos e fotos publicados sem programador',
      '**O time pelos pilares**: quanto cada valor foi praticado no mês (novo)',
    ]),
    cartao('Infraestrutura', [
      'App instalável no celular (PWA), funciona offline',
      '**E adaptado ao computador** (novo)',
      '**Isolamento entre as empresas na regra do banco**, não só na tela (novo)',
      '**8 travas automáticas** que barram publicação errada (+1)',
      'Auditoria que confere a lâmina contra a carta da montadora',
      'Teto diário de IA: passou do limite, ninguém mais chama — e a conta não sobe',
    ]),
  ] }),
], LC, { bordas: { ...SEM_BORDAS, insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: 'FFFFFF' }, insideVertical: { style: BorderStyle.SINGLE, size: 6, color: 'FFFFFF' } } }));

// ── o que mudou ───────────────────────────────────────────────────────────────
põe(h2('O que mudou em 14 dias',
  'Entre a versão de 11/09 e hoje. Cada linha está no histórico do repositório, com data e hora.'));

const LM = [2600, 7038];
const linhaMudou = (titulo, texto) => new TableRow({
  cantSplit: true,
  children: [
    celula([p(titulo, { size: 18, bold: true, depois: 0, linha: 240 })], { largura: 2600 }),
    celula([p(texto, { size: 17, color: '38405A', depois: 0, linha: 250 })], { largura: 7038 }),
  ],
});
põe(tabela([
  faixa('CONTEÚDO NOVO', LM),
  linhaMudou('Jaecoo 5 no app', 'O 5º carro: ficha, versões COMFORT e PRESTIGE, 13 objeções com resposta, trilha de vídeo, etiqueta de lançamento no catálogo e o PDF do treinamento de lançamento na prateleira.'),
  linhaMudou('Valores da Ramasa', 'RA·zão, MA·gia e SA·tisfação dentro do app: o valor da semana no Hoje e no Painel, a linha "no app" escrita para cada um dos 11 cargos, o carimbo quando a pessoa pratica, e a tela Cultura com os 9 valores.'),
  faixa('FERRAMENTAS NOVAS', LM),
  linhaMudou('Jornada do lead online', 'A aba que guia o atendimento: 5 etapas, mensagem pronta em cada uma, atalho para acessórios e lembrete da entrega. Nasceu da objeção que chega pelo funil.'),
  linhaMudou('Rituais do mês', 'Pop-up por cargo com dia marcado — a tabela entre os dias 1 e 5, a campanha nos dias 14 e 30, a revisão de qualidade no 1º dia útil, o time da semana toda segunda. O "ok" fica gravado com nome, cargo e horário.'),
  linhaMudou('Cargos e lojas', 'Supervisor de vendas, F&I, líder e diretor de qualidade; a loja de cada pessoa; Omoda Goiânia como unidade; e o Painel separado por loja.'),
  linhaMudou('O app no computador', 'Quem abre pelo desktop deixou de ver a tela de celular esticada: menu na lateral, conteúdo em duas colunas, leitura em largura de página.'),
  linhaMudou('Salvar PDF em tudo', 'Todo material que vai para o cliente agora tem botão de salvar em PDF.'),
  faixa('MANUTENÇÃO E SEGURANÇA', LM),
  linhaMudou('Isolamento no banco', 'Cada empresa só alcança o que é dela — antes a separação estava na tela, agora está na regra do banco. Vale para a Ramasa, a Meraki e a Sorocaps.'),
  linhaMudou('Trava de publicação', 'Uma conferência automática que simula o que o app lê antes de qualquer mudança de regra subir. Ela existe porque uma regra nova derrubou a folha de condições por seis horas no dia 25 — e a mensagem na tela dizia "sem internet" em vez da verdade.'),
  linhaMudou('Notícias que se consertam', 'As buscas passaram para o servidor e uma rotina diária conserta a aba antes de alguém reclamar.'),
  linhaMudou('Relatórios', 'Relatório semanal de uso em PDF, relatório desde o início, e a apresentação de resultados e melhorias de 23/09.'),
], LM));

// ── 2. esforço medido ─────────────────────────────────────────────────────────
põe(h2('2. Esforço medido',
  'Só o que foi feito para a Ramasa, de 10/08 (a primeira linha de conteúdo) até hoje — 46 dias corridos, dos quais 33 tiveram entrega. Números tirados do histórico do repositório, data e hora de cada alteração. Não é estimativa de memória.'));

const LF = [4200, 1900, 900, 1300, 1338];
const linhaFase = (nome, desc, periodo, dias, entregas, horas, total) => new TableRow({
  cantSplit: true,
  children: [
    celula([p(nome, { size: 18, bold: true, depois: desc ? 50 : 0 }),
      ...(desc ? [p(desc, { size: 16, color: CINZA, depois: 0, linha: 240 })] : [])],
      { largura: 4200, fundo: total ? FUNDO2 : undefined }),
    ...[periodo, dias, entregas, horas].map((v, i) => celula(
      [p(String(v), { size: 17, bold: total, align: AlignmentType.RIGHT, depois: 0 })],
      { largura: LF[i + 1], fundo: total ? FUNDO2 : undefined },
    )),
  ],
});
põe(tabela([
  cabecalho([{ texto: 'Fase' }, { texto: 'Período', dir: true }, { texto: 'Dias', dir: true },
    { texto: 'Entregas', dir: true }, { texto: 'Horas', dir: true }], LF),
  linhaFase('Vertical automotivo — Ramasa', 'Carros, acessórios, condições comerciais, cargos da loja, conteúdo.',
    '10/ago a 11/set', 25, 176, '173 h'),
  linhaFase('Depois da proposta — Ramasa', 'Jaecoo 5, Jornada, rituais, valores do grupo, lojas, computador, isolamento no banco.',
    '12/set a 25/set', 8, 37, '58 h'),
  linhaFase('Total da Ramasa', '', '10/ago a 25/set', 33, 213, '231 h', true),
], LF));

põe(p('', { depois: 120 }));
põe(nota([
  notaP('**Como ler as horas.** São a janela entre a primeira e a última entrega de cada dia, mais 30 min. É período de trabalho, não foco cronometrado. A leitura conservadora — 60% da janela — dá **~139 h no código**. Some **~19 h fora dele** — vídeos, relatórios, apresentação de resultados, PDFs de apoio e a campanha: **~158 h**. Use o número conservador em qualquer conversa de preço: ele se defende sozinho.'),
  p('', { depois: 100 }),
  notaP('**O que mudou na medição.** A versão de 11/09 somava a plataforma base junto e chegava a 49 dias / 346 entregas. Aqui a base saiu da conta: ela nasceu com a Meraki e a Sorocaps, é ativo da GSS e se repete de graça no próximo cliente. Contando **só a Ramasa**, eram 25 dias / 176 entregas em 11/09 e são **33 dias / 213 entregas** hoje — o crescimento real são as **8 jornadas e 58 h** das duas últimas semanas. O trabalho de escrever esta proposta também não entra: seria o número crescer sozinho a cada vez que ela é refeita.'),
]));


// ── 3. custo de operação ──────────────────────────────────────────────────────
põe(h2('3. Custo de operação', 'O que sai do bolso todo mês para o app continuar no ar. Medido hoje, 25/09.'));

const LO = [5600, 2300, 1738];
const linhaCusto = (nome, desc, comoEsta, custo, total) => new TableRow({
  cantSplit: true,
  children: [
    celula([p(nome, { size: 18, bold: true, depois: desc ? 50 : 0 }),
      ...(desc ? [p(desc, { size: 16, color: CINZA, depois: 0, linha: 240 })] : [])],
      { largura: 5600, fundo: total ? FUNDO2 : undefined }),
    celula([p(comoEsta, { size: 17, align: AlignmentType.RIGHT, depois: 0, linha: 240 })],
      { largura: 2300, fundo: total ? FUNDO2 : undefined }),
    celula([p(custo, { size: 17, bold: true, align: AlignmentType.RIGHT, depois: 0 })],
      { largura: 1738, fundo: total ? FUNDO2 : undefined }),
  ],
});
põe(tabela([
  cabecalho([{ texto: 'Item' }, { texto: 'Como está hoje', dir: true }, { texto: 'Custo/mês', dir: true }], LO),
  linhaCusto('IA (Gemini 2.5 Flash)', 'Cada pergunta manda ~15 mil tokens de contexto: os 5 carros, 27 acessórios, as condições do mês e os documentos.', '2 perguntas hoje, a R$ 0,03', 'R$ 3 a R$ 9'),
  linhaCusto('IA no cenário cheio', 'Se as 37 pessoas perguntarem 5 vezes por dia útil.', '4.070 perguntas/mês', 'R$ 122'),
  linhaCusto('Hospedagem (Vercel)', 'App e funções de servidor.', 'plano atual', 'R$ 0'),
  linhaCusto('Banco e arquivos (Firebase)', 'Contas, uso do time, condições, vídeos e documentos.', 'faixa gratuita', 'R$ 0'),
  linhaCusto('Notícias', 'Busca pública, sem chave paga.', '—', 'R$ 0'),
  linhaCusto('Ferramenta de desenvolvimento', 'A assinatura que permite construir e manter o app. Custo FIXO da sua operação: não sobe com mais um cliente, e é dividida com todos os projetos.', 'US$ 100/mês', 'R$ 545'),
  linhaCusto('Custo mensal, com a ferramenta', '', 'no ritmo de hoje', 'R$ 548 a R$ 667', true),
], LO));

põe(p('', { depois: 120 }));
põe(nota([
  notaP('**O app custa quase nada para rodar. O que custa é manter alguém construindo.** Servidor, banco e IA somam R$ 3 a R$ 122 por mês. A ferramenta de desenvolvimento custa R$ 545 — sozinha, ela é **82% a 99% do custo mensal**.'),
  p('', { depois: 100 }),
  notaP('**E o pior caso agora tem teto.** A IA tem um limite de 300 perguntas por dia gravado no próprio app: passou do limite, ninguém mais chama o Gemini — nem usuário, nem robô, nem erro em laço. O pior mês possível é R$ 198, não uma surpresa na fatura. Essa trava foi escrita depois de um mês em que o "orçamento" do Google avisou mas não segurou o gasto.'),
  p('', { depois: 100 }),
  notaP('**Ela é fixa e compartilhada.** Não sobe se você colocar o quarto cliente, e no período da obra atendeu também Dilnara, Corpo Leve, Bússola e MAESTR.IA. Medindo pelos dias trabalhados em cada projeto, o Eleva usou ~34% dela: **R$ 460** nos dois meses e meio de construção. Isso não muda o preço, mas muda o argumento: a licença não paga servidor — ela paga a capacidade de continuar consertando, publicando a carta do mês e escrevendo conteúdo novo. **Um cliente que não paga recorrência vira um app que congela.**'),
]));

// ── 4. o que o mercado cobra ──────────────────────────────────────────────────
põe(h2('4. O que o mercado cobra',
  'Preços públicos, consultados em 08/09/2026 nos sites dos próprios fornecedores. Não foram reconsultados nesta atualização.'));

const LR = [2900, 3600, 3138];
const linhaRef = (nome, site, oque, preco, detalhe) => new TableRow({
  cantSplit: true,
  children: [
    celula([p(nome, { size: 18, bold: true, depois: 40 }), p(site, { size: 15, color: CINZA, depois: 0 })], { largura: 2900 }),
    celula([p(oque, { size: 17, color: '5A6377', depois: 0, linha: 240 })], { largura: 3600 }),
    celula([p(preco, { size: 17, bold: true, align: AlignmentType.RIGHT, depois: 40 }),
      p(detalhe, { size: 15, color: CINZA, align: AlignmentType.RIGHT, depois: 0, linha: 230 })], { largura: 3138 }),
  ],
});
põe(tabela([
  cabecalho([{ texto: 'Referência' }, { texto: 'O que é' }, { texto: 'Preço publicado', dir: true }], LR),
  linhaRef('Twygo — Business IA', 'twygo.com/planos-e-precos', 'LMS corporativo brasileiro, com recursos de IA', 'R$ 743,40/mês', 'plano anual, até 50 usuários'),
  linhaRef('EAD Plataforma — Standard', 'eadplataforma.com/planos', 'Plataforma EAD white-label, 12 anos de mercado', 'R$ 399,90/mês', '12×, usuários ilimitados, sem taxa de implantação'),
  linhaRef('AutoForce', 'site.autoforce.com', 'Plataforma para concessionária (site, CRM,\u00A0IA) — +2.000 concessionárias', 'não publica', 'venda consultiva, preço sob negociação'),
], LR));

põe(p('', { depois: 120 }));
põe(nota([
  notaP('**O que isso significa, sem maquiagem.** A Ramasa inteira — 37 contas hoje — ainda cabe no MENOR plano dos dois primeiros. O piso de mercado de uma plataforma para esse tamanho é **R$ 400 a R$ 750 por mês, para o grupo todo**. E a EAD Plataforma anuncia "sem taxa de implantação" — é a objeção que você vai ouvir sobre o setup.'),
  p('', { depois: 100 }),
  notaP('**Mas eles vendem outra coisa.** Twygo e EAD Plataforma entregam a casa vazia: você sobe seus cursos, escreve seu conteúdo, mantém tudo. O Eleva chegou na Ramasa com 5 carros escritos em 6 níveis, 27 acessórios, 23 documentos, 40 objeções respondidas e uma IA que responde a carta do mês com o número certo. **A comparação honesta é em duas partes:** a plataforma vale o preço de mercado de uma plataforma; o conteúdo vale o que custa escrever conteúdo. Vender os dois num número só é o que faz o cliente comparar com o LMS de R$ 400 e achar caro.'),
]));

// ── 5. preço peça por peça ────────────────────────────────────────────────────
põe(h2('5. Preço peça por peça',
  'Cada linha tem as horas medidas daquela peça, o custo delas a R$ 200/h e o preço de tabela, com o motivo. A divisão das horas segue o assunto de cada entrega no histórico — é aproximada entre peças vizinhas, mas o total bate com as 158 h.'));

const LP = [3000, 900, 1100, 1600, 3038];
const linhaPeca = (nome, desc, horas, custo, preco, sub, porque) => new TableRow({
  cantSplit: true,
  children: [
    celula([p(nome, { size: 17, bold: true, depois: 45 }), p(desc, { size: 15, color: CINZA, depois: 0, linha: 230 })], { largura: 3000 }),
    celula([p(horas, { size: 16, align: AlignmentType.RIGHT, depois: 0 })], { largura: 900 }),
    celula([p(custo, { size: 16, align: AlignmentType.RIGHT, depois: 0 })], { largura: 1100 }),
    celula([p(preco, { size: 17, bold: true, align: AlignmentType.RIGHT, depois: sub ? 40 : 0 }),
      ...(sub ? [p(sub, { size: 14, color: CINZA, align: AlignmentType.RIGHT, depois: 0, linha: 220 })] : [])], { largura: 1600 }),
    celula([p(porque, { size: 15, color: '5A6377', depois: 0, linha: 230 })], { largura: 3038 }),
  ],
});
const linhaSub = (nome, horas, custo, preco) => new TableRow({
  cantSplit: true,
  children: [
    celula([p(nome, { size: 17, bold: true, depois: 0 })], { largura: 3000, fundo: FUNDO2 }),
    celula([p(horas, { size: 16, bold: true, align: AlignmentType.RIGHT, depois: 0 })], { largura: 900, fundo: FUNDO2 }),
    celula([p(custo, { size: 16, bold: true, align: AlignmentType.RIGHT, depois: 0 })], { largura: 1100, fundo: FUNDO2 }),
    celula([p(preco, { size: 17, bold: true, align: AlignmentType.RIGHT, depois: 0 })], { largura: 1600, fundo: FUNDO2 }),
    celula([p('', { depois: 0 })], { largura: 3038, fundo: FUNDO2 }),
  ],
});

põe(tabela([
  cabecalho([{ texto: 'Peça' }, { texto: 'Horas', dir: true }, { texto: 'Custo', dir: true },
    { texto: 'Preço', dir: true }, { texto: 'Por que esse preço' }], LP),

  faixa('FERRAMENTAS DO APP · UMA VEZ', LP),
  linhaPeca('One-page e material de estudo', 'A folha de cada carro com foto, ficha e o contato do vendedor, e a versão de estudo pro time — agora com botão de salvar PDF',
    '14,6 h', 'R$ 2.920', 'R$ 4.200', '', 'São 10 modelos (5 carros × cliente e estudo). Um folder na TAGX sai R$ 450: 10 × 450 = R$ 4.500. E aqui sai um por vendedor, sem designer.'),
  linhaPeca('Tira-dúvida com IA', 'Responde preço, condição e ficha a partir do conteúdo aprovado, com teto de gasto',
    '15,2 h', 'R$ 3.040', 'R$ 6.000', '', 'Chatbot de IA sob medida custa de R$ 15 mil a R$ 150 mil (Halk). Fica em 40% do piso.'),
  linhaPeca('Painel da gerência', 'Uso por pessoa, cargo e loja, ranking, edição de acessório na linha, time pelos pilares',
    '11,0 h', 'R$ 2.200', 'R$ 3.300', '', 'Hora medida + 50%. Cresceu com a separação por loja e os 11 cargos.'),
  linhaPeca('Jornada do lead online (novo)', '5 etapas, mensagem pronta em cada uma, atalho de acessórios e lembrete da entrega',
    '11,4 h', 'R$ 2.280', 'R$ 4.000', '', 'É roteiro comercial, não tela: texto técnico de nicho custa R$ 180–400 por peça, e aqui são 5 etapas escritas e revisadas com a loja.'),
  linhaPeca('Condições comerciais', 'Carta partida por modelo, validade automática, arquivo e auditoria contra a montadora',
    '9,8 h', 'R$ 1.960', 'R$ 2.400', '', 'Hora medida + 22%.'),
  linhaPeca('Cultura e valores no app (novo)', '9 valores, 3 pilares, valor da semana, carimbo ao praticar e a linha "no app" escrita para cada um dos 11 cargos',
    '8,2 h', 'R$ 1.640', 'R$ 2.400', '', 'São 45 frases escritas (9 valores × 5 grupos de cargo) mais a tela. Redação de nicho, R$ 180–400 por peça.'),
  linhaPeca('Rituais do mês (novo)', 'Pop-up por cargo com dia marcado e o "ok" gravado com nome, cargo e horário',
    '7,8 h', 'R$ 1.560', 'R$ 2.200', '', 'Hora medida + 41%. É o que impede tabela vencida no ar — o erro que já custou caro em setembro.'),
  linhaPeca('Configuração do grupo', '11 cargos, 4 lojas, acessos e o isolamento entre as empresas',
    '6,0 h', 'R$ 1.200', 'R$ 1.600', '', 'Hora medida + 33%.'),
  linhaPeca('Documentos e notícias', '23 PDFs da montadora em prateleiras; notícias do setor que se consertam sozinhas',
    '4,4 h', 'R$ 880', 'R$ 1.400', '', 'Hora medida + 59%. As buscas passaram para o servidor e uma rotina diária conserta a aba.'),
  linhaPeca('Arte da condição para o cliente', 'Lâmina pronta pra WhatsApp, gerada sozinha para cada condição',
    '2,6 h', 'R$ 520', 'R$ 1.200', '', '14 condições em setembro × R$ 90 do criativo avulso = R$ 1.260 — todo mês, se fosse feito por designer.'),
  linhaSub('Subtotal ferramentas', '91,0 h', 'R$ 18.200', 'R$ 28.700'),

  faixa('CONTEÚDO · POR UNIDADE', LP),
  linhaPeca('Ficha comercial do carro', 'Versões, destaques e 5 a 13 objeções com resposta · 5 carros',
    '22,4 h', 'R$ 4.480', 'R$ 1.000', 'por carro · R$ 5.000', 'Hora medida (R$ 896 por carro) + 12%. Texto técnico de nicho custa R$ 180–400, mais 40–100%.'),
  linhaPeca('Trilha de vídeo do carro', '6 roteiros por carro, ~32 cenas, com locução · 5 carros',
    '10,6 h', 'R$ 2.120', 'R$ 1.500', 'por carro · R$ 7.500', '6 vídeos curtos × R$ 250, dentro da faixa de R$ 120–280 por vídeo curto (CrazyStack). Em agência, um módulo de 5 min sai por US$ 2–5 mil.'),
  linhaPeca('Ficha de acessório', 'Preço, código de peça e como oferecer · 27 acessórios',
    '11,0 h', 'R$ 2.200', 'R$ 90', 'por acessório · R$ 2.430', 'Hora medida. Acessório novo, a loja cadastra sozinha.'),
  linhaSub('Subtotal conteúdo', '44,0 h', 'R$ 8.800', 'R$ 14.930'),

  faixa('PEÇAS AVULSAS · JÁ ENTREGUES', LP),
  linhaPeca('Documento de apoio em PDF', 'Lâminas da carta, roteiros, trilha, argumentos do time, quem responde por quê, treinamento do Jaecoo 5 e outros · 9 entregues',
    '3,2 h', 'R$ 640', 'R$ 300', 'por documento · R$ 2.700', 'Um catálogo na TAGX sai R$ 600.'),
  linhaPeca('Vídeo tutorial', 'Com locução, legenda e destaque na tela · vendedor e gerente, mais a atualização com Jornada e rituais',
    '4,6 h', 'R$ 920', 'R$ 1.500', 'por vídeo · R$ 3.750', 'Na mediana nacional de R$ 1.400 por projeto audiovisual (Filmly). A atualização entra por meio.'),
  linhaPeca('Relatório e apresentação de uso', 'Gráficos, telas do app e diagnóstico · 4 entregues, incluindo a apresentação de resultados de 23/09',
    '2,6 h', 'R$ 520', 'R$ 350', 'por relatório · R$ 1.400', 'Hora medida + 35%.'),
  linhaPeca('Campanha de incentivo', 'Arte da premiação e publicação no app',
    '2,0 h', 'R$ 400', 'R$ 450', '', 'Um cartaz na TAGX sai R$ 350.'),
  linhaSub('Subtotal peças avulsas', '12,4 h', 'R$ 2.480', 'R$ 8.300'),

  faixa('NÃO COBRADO · É PLATAFORMA', LP),
  linhaPeca('App instalável, adaptação ao computador e ajustes de uso', 'Serve a todos os clientes, não só à Ramasa',
    '6,4 h', 'R$ 1.280', '—', '', 'Vira ativo seu, como a plataforma base.'),
  linhaPeca('Isolamento no banco e trava de publicação', 'Cada empresa só alcança a própria; e a conferência que simula o que o app lê antes de publicar regra nova',
    '4,2 h', 'R$ 840', '—', '', 'Segurança da plataforma. Não se cobra, mas é o que permite ter três clientes no mesmo app.'),

  new TableRow({ children: [
    celula([p('Tabela cheia', { size: 19, bold: true, depois: 0 })], { largura: 3000, fundo: FUNDO2, mt: 130, mb: 130 }),
    celula([p('158,0 h', { size: 18, bold: true, align: AlignmentType.RIGHT, depois: 0 })], { largura: 900, fundo: FUNDO2, mt: 130, mb: 130 }),
    celula([p('R$ 31.600', { size: 18, bold: true, align: AlignmentType.RIGHT, depois: 0 })], { largura: 1100, fundo: FUNDO2, mt: 130, mb: 130 }),
    celula([p('R$ 51.930', { size: 19, bold: true, align: AlignmentType.RIGHT, depois: 0 })], { largura: 1600, fundo: FUNDO2, mt: 130, mb: 130 }),
    celula([p('', { depois: 0 })], { largura: 3038, fundo: FUNDO2, mt: 130, mb: 130 }),
  ] }),
], LP));

põe(p('', { depois: 120 }));
põe(nota([
  notaP('**A tabela cheia não é o preço — é a âncora.** R$ 51.930 é quanto vale tudo que foi entregue, peça por peça. O pacote de implantação continua em **R$ 25.000** — agora **52% abaixo** da tabela, contra 29% em 11/09. A Ramasa enxerga o desconto em vez de enxergar um custo, e cada linha tem resposta pronta se alguém perguntar "por que isso custa tanto".', true),
], true));

põe(p('', { depois: 160 }));
põe(tabela([
  new TableRow({ cantSplit: true, children: [
    cartao('Já está na curadoria mensal — não se cobra de novo', [
      'Virada da carta do mês, com as artes das condições',
      'Preço de acessório atualizado',
      'Um relatório de uso por mês',
      'Revisão do que a IA lê',
      'Correção de erro e manutenção das travas',
    ]),
    cartao('Cobrado pela tabela, quando pedirem', [
      'Carro novo: R$ 2.500 (trilha R$ 1.500 + ficha R$ 1.000)',
      'Vídeo tutorial: R$ 1.500',
      'Campanha de incentivo: R$ 450',
      'Relatório extra ou documento em PDF: R$ 300–350',
      'Funcionalidade nova fora do combinado: R$ 350/h',
    ]),
  ] }),
], LC, { bordas: { ...SEM_BORDAS, insideVertical: { style: BorderStyle.SINGLE, size: 6, color: 'FFFFFF' } } }));

// ── 6. como eu cobraria ───────────────────────────────────────────────────────
põe(h2('6. Como eu cobraria',
  'A estrutura é a mesma de 11/09. O que mudou é a âncora: a tabela cheia subiu de R$ 35.380 para R$ 51.930, e o pacote continua no mesmo número.'));

function oferta(rotulo, valor, complemento, texto) {
  return tabela([
    new TableRow({
      cantSplit: true,
      children: [celula([
        p(rotulo, { size: 14, bold: true, color: OURO_ESCURO, caps: true, spacing: 26, depois: 90 }),
        p([txt(valor, { size: 30, bold: true }),
           ...(complemento ? [txt(`   ${complemento}`, { size: 17, color: CINZA_CLARO })] : [])], { depois: 110 }),
        p(texto, { size: 17, color: '38405A', depois: 0, linha: 260 }),
      ], { largura: LARGURA, mt: 180, mb: 180, ml: 220, mr: 220,
        bordas: {
          top: { style: BorderStyle.SINGLE, size: 4, color: 'DDE3EC' },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: 'DDE3EC' },
          left: { style: BorderStyle.SINGLE, size: 4, color: 'DDE3EC' },
          right: { style: BorderStyle.SINGLE, size: 4, color: 'DDE3EC' },
        } })],
    }),
  ], [LARGURA], { bordas: SEM_BORDAS });
}
const espaco = () => p('', { depois: 130 });

põe(oferta('PACOTE DE IMPLANTAÇÃO · UMA VEZ, NA ENTRADA', 'R$ 25.000', 'tabela cheia R$ 51.930 · 52% abaixo',
  'Carregar a linha completa, os acessórios, os documentos e as fotos; configurar a marca e as lojas; publicar a primeira carta; treinar a gerência. Inclui tudo da tabela da seção 5: ferramentas, conteúdo e as peças já entregues. Quando ouvir "a EAD Plataforma não cobra implantação": ela também não escreve o conteúdo. Lá, quem carrega os 5 carros e os 27 acessórios é o cliente.'), espaco());
põe(oferta('LICENÇA DA PLATAFORMA · TODO MÊS, PARA O GRUPO', 'R$ 900/mês', 'grupo inteiro, sem limite de usuários',
  'App, painel, IA, notícias, hospedagem e correções. Fica 20% acima do Twygo (R$ 743) — diferença que a IA presa à carta do mês justifica sozinha. Para o GRUPO e não por cabeça: em concessionária o time gira, e cobrar por usuário faz a gerência tirar acesso de quem entrou.'), espaco());
põe(oferta('CURADORIA DE CONTEÚDO · TODO MÊS', 'R$ 2.400/mês', '',
  'Publicar a carta do mês partindo o PDF por modelo, conferir cada lâmina contra o documento da montadora, manter preço de acessório, revisar o que a IA lê e acompanhar o uso do time. É serviço, não software — e é exatamente o que nenhum LMS entrega. Separado da licença de propósito: é esta linha que o cliente entende que não tem substituto.'), espaco());
põe(oferta('CONTEÚDO NOVO · POR MODELO', 'R$ 2.500 por carro', '',
  'Trilha de 6 roteiros (R$ 1.500) + ficha, versões, objeções e destaques (R$ 1.000). O Jaecoo 5 entrou dentro do pacote; do próximo em diante, esta linha. Acessório novo a loja cadastra sozinha, sem custo.'), espaco());
põe(oferta('EVOLUÇÃO SOB DEMANDA · QUANDO PEDIREM', 'R$ 350 por hora', '',
  'Funcionalidade nova fora do combinado. Correção de erro e a virada da carta já estão na curadoria.'), espaco());

põe(nota([
  notaP('**Atenção: há dois preços circulando.** Esta folha cobra **por grupo** — R$ 900 + R$ 2.400 = R$ 3.300/mês, qualquer número de lojas. A apresentação que preparei para a rede Omoda|Jaecoo (25/09) cobra **por loja**: R$ 1.100 por loja por mês. Nas 4 lojas da Ramasa isso daria R$ 4.400/mês. **Decida qual dos dois vale antes de mandar qualquer um deles** — se o cliente vir os dois, o mais baixo é o que fica valendo. Minha recomendação: por loja para uma rede nova (cresce com o cliente), por grupo para a Ramasa, que já está dentro e foi quem bancou a construção.'),
]));

// ── por que esses números ─────────────────────────────────────────────────────
põe(h2('Por que esses números'));
põe(nota([
  notaP('**O pacote se sustenta na hora medida.** 158 h a R$ 200/h dão R$ 31.600 de custo. Os R$ 25.000 pagam **R$ 158 por hora** — abaixo até da faixa de desenvolvedor pleno (R$ 110–240, Lancei). Em 11/09 esse número era R$ 233/h. Ou seja: o pacote ficou mais barato por hora do que era, porque duas semanas de trabalho entraram sem mexer no preço.'),
  p('', { depois: 100 }),
  notaP('**A licença se sustenta no mercado.** R$ 900 contra R$ 743 do Twygo e R$ 400 da EAD Plataforma. É uma diferença que se explica em uma frase — não é um salto que exige fé.'),
  p('', { depois: 100 }),
  notaP('**A curadoria se sustenta no que ela evita.** Sem ela, a carta de outubro não sobe, a lâmina não é conferida e a IA passa a responder o número do mês passado. Já aconteceu duas vezes: em setembro, duas condições chegavam à IA com a última linha cortada — a que dizia que taxa e trade-in não são cumulativos; e no dia 25 a folha de condições passou seis horas sem abrir por causa de uma regra nova. Nos dois casos quem percebeu e consertou foi a curadoria, não a loja.'),
  p('', { depois: 100 }),
  notaP('**A plataforma base não entra na conta.** As 155 h de base (93 h na leitura conservadora) são seu ativo e se repetem de graça na Meraki, na Sorocaps, na Royal Enfield e no próximo cliente. Cobrar isso do primeiro encarece a entrada e derruba a venda.'),
]));

// ── 7. a conta do primeiro ano ────────────────────────────────────────────────
põe(h2('7. A conta do primeiro ano'));

const LA = [4600, 1900, 1500, 1638];
const linhaAno = (nome, quando, valor, ano1, total) => new TableRow({
  cantSplit: true,
  children: [
    celula([p(nome, { size: 18, bold: true, depois: 0 })], { largura: 4600, fundo: total ? FUNDO2 : undefined }),
    celula([p(quando, { size: 17, align: AlignmentType.RIGHT, depois: 0 })], { largura: 1900, fundo: total ? FUNDO2 : undefined }),
    celula([p(valor, { size: 17, align: AlignmentType.RIGHT, depois: 0 })], { largura: 1500, fundo: total ? FUNDO2 : undefined }),
    celula([p(ano1, { size: 18, bold: true, align: AlignmentType.RIGHT, depois: 0 })], { largura: 1638, fundo: total ? FUNDO2 : undefined }),
  ],
});
põe(tabela([
  cabecalho([{ texto: 'Linha' }, { texto: 'Quando', dir: true }, { texto: 'Valor', dir: true }, { texto: 'Ano 1', dir: true }], LA),
  linhaAno('Pacote de implantação', 'na entrada', 'R$ 25.000', 'R$ 25.000'),
  linhaAno('Licença da plataforma', 'todo mês', 'R$ 900', 'R$ 10.800'),
  linhaAno('Curadoria de conteúdo', 'todo mês', 'R$ 2.400', 'R$ 28.800'),
  linhaAno('Conteúdo novo — 2 modelos no ano', 'quando entrar', 'R$ 2.500', 'R$ 5.000'),
  linhaAno('Total do primeiro ano', '', '', 'R$ 69.600', true),
], LA));

põe(p(rico('A partir do segundo ano, sem o setup: **R$ 39.600** recorrentes. Custo de operar no mesmo período — servidor, IA e a assinatura de desenvolvimento — fica em torno de **R$ 7.100** no ano.',
  { size: 17, color: CINZA }), { antes: 140, depois: 160, linha: 250 }));

põe(nota([
  notaP('**O investimento até hoje, em três números.** **33 dias de trabalho** em 46 dias corridos, só para a Ramasa. **158 h** na leitura conservadora, que a R$ 200/h custam **R$ 31.600**. E a tabela cheia do que foi entregue — peça por peça, comparada com preço de mercado — dá **R$ 51.930**. A plataforma base não está aqui dentro, de propósito. O primeiro ano proposto é R$ 69.600: cobre o que foi feito e paga para continuar.', true),
], true));

// ── o que falta decidir ───────────────────────────────────────────────────────
põe(h2('O que falta você decidir'));
const decisoes = [
  '**Por grupo ou por loja.** Os dois números já existem em documentos diferentes (R$ 3.300/mês por grupo aqui; R$ 1.100 por loja na apresentação da rede). Escolha um antes de mandar.',
  '**A divisão entre licença e curadoria.** Coloquei R$ 900 + R$ 2.400. Se preferir um número só, R$ 3.300 fecha igual — mas você perde a resposta pronta para "o LMS custa R$ 400". Recomendo manter separado.',
  '**Quem assina.** Hoje quem usa é a operação: Cristiano, Silmara, Lucas, Wesley. Contrato de licença normalmente sobe para quem responde pelo grupo. Vale saber quem é antes de mandar o número.',
  '**Se o Jaecoo 5 entra como cortesia ou como linha.** Ele foi feito dentro do pacote, sem cobrança extra — R$ 2.500 de tabela. Dizer isso na conversa vale mais do que cobrar.',
];
decisoes.forEach((d, i) => põe(p([txt(`${i + 1}. `, { size: 17, bold: true }), ...rico(d, { size: 17 })],
  { depois: 110, linha: 250 })));

// ── monta o arquivo ───────────────────────────────────────────────────────────
const { Footer, TextRun: Run, PageNumber } = await import('docx');
const rodape = new Footer({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      txt(`Eleva × Grupo Ramasa — investimento e proposta · ${dd}/${mm}/2026 · uso interno · `,
        { size: 14, color: '6B7385' }),
      new Run({ children: [PageNumber.CURRENT], font: 'Arial', size: 14, color: '6B7385' }),
      txt('/', { size: 14, color: '6B7385' }),
      new Run({ children: [PageNumber.TOTAL_PAGES], font: 'Arial', size: 14, color: '6B7385' }),
    ],
  })],
});
const doc = new Document({
  creator: 'GSS · Eleva',
  title: 'Eleva × Grupo Ramasa — investimento e proposta',
  description: 'Uso interno. O que foi investido no app, quanto custa manter e quanto vale cada peça.',
  styles: {
    default: { document: { run: { font: 'Arial', size: 19, color: TINTA } } },
    paragraphStyles: [{
      id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { font: 'Arial', size: 26, bold: true, color: TINTA },
    }],
  },
  sections: [{
    properties: { page: { margin: { top: 1134, bottom: 1300, left: 1134, right: 1134, footer: 850 } } },
    footers: { default: rodape },
    children: filhos,
  }],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(SAIDA, buffer);
console.log('word ok →', SAIDA);
