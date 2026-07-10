const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
  FaBook, FaWhatsapp, FaMoneyBillWave, FaBoxOpen, FaFileInvoiceDollar,
  FaClipboardList, FaWarehouse, FaChartPie, FaUsers, FaBell,
  FaBolt, FaCheckCircle, FaTimesCircle, FaCarSide, FaTools, FaWrench,
  FaShieldAlt, FaSearch, FaHistory, FaStar, FaCamera, FaCalendarCheck,
} = require("react-icons/fa");

// ---------- Paleta: grafite / laranja de oficina / aço ----------
const INK = "16191D";
const INK_SOFT = "242A31";
const PAPER = "FFFFFF";
const MIST = "F1F3F5";
const ORANGE = "F26522";
const ORANGE_SOFT = "FDEDE2";
const STEEL = "6B7785";
const TEAL = "1F7A6B";

const HEAD = "Bookman Old Style";
const BODY = "Calibri";

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Oficina Pro";
pres.title = "Oficina Pro — sua oficina em ordem, sua nota em dia";

const sh = () => ({ type: "outer", color: "000000", blur: 8, offset: 2, angle: 45, opacity: 0.10 });

async function icon(Comp, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Comp, { color, size: String(size) })
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

function iconBadge(slide, data, x, y, d = 0.55, fill = ORANGE) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill } });
  const p = d * 0.28;
  slide.addImage({ data, x: x + p / 2, y: y + p / 2, w: d - p, h: d - p });
}

function kicker(slide, txt, color = ORANGE) {
  slide.addText(txt.toUpperCase(), {
    x: 0.6, y: 0.32, w: 8.8, h: 0.28, fontSize: 10.5, bold: true, color,
    fontFace: BODY, charSpacing: 3, margin: 0,
  });
}

function title(slide, txt, color = INK, y = 0.62, size = 32) {
  slide.addText(txt, {
    x: 0.6, y, w: 8.8, h: 0.72, fontSize: size, bold: true, color, fontFace: HEAD, margin: 0,
  });
}

function footer(slide, n) {
  slide.addText("Oficina Pro", { x: 0.6, y: 5.15, w: 2, h: 0.25, fontSize: 9, color: STEEL, fontFace: BODY, margin: 0 });
  slide.addText(String(n), { x: 8.6, y: 5.15, w: 0.8, h: 0.25, fontSize: 9, color: STEEL, fontFace: BODY, align: "right", margin: 0 });
}

(async () => {
  const I = {};
  const pairs = [
    ["book", FaBook], ["wpp", FaWhatsapp], ["money", FaMoneyBillWave],
    ["box", FaBoxOpen], ["invoice", FaFileInvoiceDollar], ["clip", FaClipboardList],
    ["ware", FaWarehouse], ["pie", FaChartPie], ["users", FaUsers], ["bell", FaBell],
    ["bolt", FaBolt], ["car", FaCarSide], ["tools", FaTools], ["wrench", FaWrench],
    ["shield", FaShieldAlt], ["search", FaSearch], ["history", FaHistory],
    ["star", FaStar], ["cam", FaCamera], ["cal", FaCalendarCheck],
  ];
  for (const [k, C] of pairs) I[k] = await icon(C, "#FFFFFF");
  const IorangeCheck = await icon(FaCheckCircle, "#F26522");
  const ItimesSteel = await icon(FaTimesCircle, "#9AA4AE");

  // ============ 1. CAPA ============
  {
    const s = pres.addSlide();
    s.background = { color: INK };
    s.addShape(pres.shapes.OVAL, { x: 7.4, y: -1.5, w: 5.2, h: 5.2, fill: { color: ORANGE, transparency: 88 } });
    s.addShape(pres.shapes.OVAL, { x: 8.6, y: 3.4, w: 3.4, h: 3.4, fill: { color: ORANGE, transparency: 92 } });

    iconBadge(s, I.wrench, 0.62, 0.75, 0.62);
    s.addText("OFICINA PRO", {
      x: 1.42, y: 0.78, w: 4.5, h: 0.55, fontSize: 20, bold: true, color: PAPER,
      fontFace: HEAD, charSpacing: 4, margin: 0, valign: "middle",
    });

    s.addText("Sua oficina em ordem.\nSua nota em dia.", {
      x: 0.6, y: 1.95, w: 6.6, h: 1.75, fontSize: 44, bold: true, color: PAPER,
      fontFace: HEAD, lineSpacing: 47, margin: 0,
    });
    s.addText("O sistema que o mecânico usa com a mão suja — e que garante a sua nota fiscal. Em setembro, emitir NFS-e deixa de ser escolha.", {
      x: 0.6, y: 3.9, w: 6.1, h: 0.85, fontSize: 14, color: "B9C1C9", fontFace: BODY, margin: 0, lineSpacing: 21,
    });
    s.addText("Apresentação para donos de oficina · 2026", {
      x: 0.6, y: 5.02, w: 5, h: 0.3, fontSize: 10, color: STEEL, fontFace: BODY, charSpacing: 2, margin: 0,
    });
    s.addNotes("Abrir perguntando: 'quem aqui já perdeu um orçamento no WhatsApp?'. Não fale de software nos primeiros 3 minutos. Fale do caderno e da nota.");
  }

  // ============ 2. O PROBLEMA ============
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    kicker(s, "o problema");
    title(s, "Sua oficina fatura bem. E ninguém sabe quanto sobra.");

    s.addText("Você é o melhor mecânico da casa — e também o orçamentista, o comprador de peças, o cobrador e o financeiro. A informação mora em quatro lugares, e nenhum conversa com o outro.", {
      x: 0.6, y: 1.48, w: 5.15, h: 1.05, fontSize: 13.5, color: STEEL, fontFace: BODY, margin: 0, lineSpacing: 20,
    });

    const dores = [
      [I.book, "Caderno e planilha", "Placa anotada à mão, status na cabeça do mecânico, valor somado na calculadora."],
      [I.wpp, "Orçamento perdido no WhatsApp", "Aprovação verbal, sem registro. Depois vira discussão no balcão."],
      [I.box, "Peça que some", "Sem estoque real, você compra duas vezes ou o carro fica parado na baia."],
      [I.money, "Margem no escuro", "Fatura R$ 80 mil, tira R$ 4 mil. Ninguém sabe qual serviço dá prejuízo."],
    ];
    let y = 1.36;
    for (const [ic, t, d] of dores) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.0, y, w: 3.4, h: 0.84, fill: { color: MIST }, rectRadius: 0.08, shadow: sh() });
      iconBadge(s, ic, 6.18, y + 0.16, 0.42);
      s.addText(t, { x: 6.72, y: y + 0.12, w: 2.55, h: 0.26, fontSize: 11.5, bold: true, color: INK, fontFace: BODY, margin: 0 });
      s.addText(d, { x: 6.72, y: y + 0.37, w: 2.55, h: 0.42, fontSize: 8.5, color: STEEL, fontFace: BODY, margin: 0, lineSpacing: 11 });
      y += 0.9;
    }

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 2.82, w: 5.15, h: 1.62, fill: { color: INK }, rectRadius: 0.1 });
    s.addText("4h", { x: 0.95, y: 3.02, w: 1.5, h: 0.75, fontSize: 52, bold: true, color: ORANGE, fontFace: HEAD, margin: 0 });
    s.addText("por semana somando número em planilha. É trabalho que não entra na conta de nenhuma ordem de serviço.", {
      x: 2.5, y: 3.05, w: 2.95, h: 1.1, fontSize: 11, color: "C6CCD2", fontFace: BODY, margin: 0, lineSpacing: 16, valign: "middle",
    });
    footer(s, 2);
    s.addNotes("Não é falta de trabalho: é falta de visibilidade. A dor é margem, não faturamento.");
  }

  // ============ 3. O RELÓGIO (urgência fiscal) ============
  {
    const s = pres.addSlide();
    s.background = { color: INK };
    kicker(s, "o que muda agora", ORANGE);
    title(s, "O bloquinho de nota acabou.", PAPER);

    s.addText([
      { text: "1º de setembro", options: { fontSize: 40, bold: true, color: ORANGE, fontFace: HEAD } },
      { text: "  de 2026", options: { fontSize: 22, color: "8B959E", fontFace: HEAD } },
    ], { x: 0.6, y: 1.5, w: 5.2, h: 0.72, margin: 0 });

    s.addText("A NFS-e de padrão nacional passa a ser obrigatória para as ME e EPP do Simples que prestam serviço — e só pode ser emitida pelo Emissor Nacional. Oficina é exatamente isso: serviço com ISS e peça com ICMS, na mesma nota.", {
      x: 0.6, y: 2.3, w: 5.2, h: 1.35, fontSize: 13, color: "B9C1C9", fontFace: BODY, margin: 0, lineSpacing: 20,
    });

    const fatos = [
      [I.invoice, "MEI já está obrigado", "Desde setembro de 2023, todo MEI prestador de serviço emite NFS-e nacional."],
      [I.bolt, "Município acima de 50 mil", "Passa a operar exclusivamente no padrão nacional. Sistema municipal antigo sai do ar."],
      [I.shield, "Multa é do dono", "Não do contador, não do software. De quem assina o CNPJ da oficina."],
    ];
    let y = 1.5;
    for (const [ic, t, d] of fatos) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.1, y, w: 3.3, h: 1.06, fill: { color: INK_SOFT }, rectRadius: 0.08 });
      iconBadge(s, ic, 6.3, y + 0.15, 0.42);
      s.addText(t, { x: 6.84, y: y + 0.13, w: 2.4, h: 0.26, fontSize: 11, bold: true, color: PAPER, fontFace: BODY, margin: 0 });
      s.addText(d, { x: 6.84, y: y + 0.4, w: 2.4, h: 0.55, fontSize: 8.5, color: "9AA4AE", fontFace: BODY, margin: 0, lineSpacing: 11 });
      y += 1.18;
    }

    s.addText("Quem já emite nota direito não muda nada.\nQuem não emite, para.", {
      x: 0.6, y: 4.42, w: 5.2, h: 0.55, fontSize: 11.5, italic: true, color: ORANGE, fontFace: BODY, margin: 0, lineSpacing: 16,
    });
    footer(s, 3);
    s.addNotes("VERIFICAR a data de 01/09/2026 no portal gov.br/nfse antes de apresentar. A obrigatoriedade do MEI (set/2023) está confirmada na fonte oficial.");
  }

  // ============ 4. A GARANTIA ============
  {
    const s = pres.addSlide();
    s.background = { color: ORANGE };
    s.addShape(pres.shapes.OVAL, { x: 7.6, y: -1.3, w: 4.6, h: 4.6, fill: { color: PAPER, transparency: 92 } });
    s.addShape(pres.shapes.OVAL, { x: -1.2, y: 3.6, w: 3.6, h: 3.6, fill: { color: INK, transparency: 92 } });

    s.addText("NOSSA PROMESSA", {
      x: 0.6, y: 0.5, w: 5, h: 0.28, fontSize: 10.5, bold: true, color: "FFE3D2", fontFace: BODY, charSpacing: 3, margin: 0,
    });

    iconBadge(s, I.shield, 0.6, 1.05, 0.62, INK);

    s.addText("Se a nota não sair,\na multa é nossa.", {
      x: 0.6, y: 1.92, w: 7.0, h: 1.6, fontSize: 40, bold: true, color: PAPER, fontFace: HEAD, lineSpacing: 44, margin: 0,
    });
    s.addText("Não estamos vendendo um botão de emitir nota. Estamos assumindo o risco de ele funcionar. Se o Oficina Pro falhar e a sua oficina for multada por isso, nós pagamos a multa — está no contrato, não no marketing.", {
      x: 0.6, y: 3.66, w: 6.3, h: 1.05, fontSize: 13.5, color: "FFF0E7", fontFace: BODY, margin: 0, lineSpacing: 20,
    });
    s.addText("Pergunte isso ao seu sistema atual.", {
      x: 0.6, y: 4.86, w: 6.0, h: 0.32, fontSize: 12, bold: true, italic: true, color: INK, fontFace: BODY, margin: 0,
    });
    s.addNotes("Este é o slide da venda. Pausar depois de 'a multa é nossa'. Nenhum concorrente pode repetir essa frase: os baratos não emitem nota, e os caros não confiam no próprio fiscal.");
  }

  // ============ 5. A SOLUÇÃO / OS ============
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    kicker(s, "a solução");
    title(s, "A oficina inteira em uma tela.");

    s.addText("Cadastra a placa, fotografa o problema, manda o orçamento no WhatsApp e recebe o aceite com um clique. O estoque, o caixa e a nota se resolvem sozinhos — porque são consequência da ordem de serviço, não trabalho a mais.", {
      x: 0.6, y: 1.5, w: 4.35, h: 1.5, fontSize: 13, color: STEEL, fontFace: BODY, margin: 0, lineSpacing: 20,
    });

    const bullets = [
      "Zero digitação: a placa puxa marca, modelo e ano",
      "Aprovação do orçamento registrada, com data e hora",
      "Funciona sem internet e sincroniza depois",
      "No ar no primeiro dia, sem consultor e sem treinamento",
    ];
    let by = 3.18;
    for (const b of bullets) {
      s.addImage({ data: IorangeCheck, x: 0.62, y: by + 0.03, w: 0.2, h: 0.2 });
      s.addText(b, { x: 0.95, y: by, w: 4.0, h: 0.28, fontSize: 11, color: INK, fontFace: BODY, margin: 0 });
      by += 0.42;
    }

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.35, y: 1.42, w: 4.05, h: 3.5, fill: { color: INK }, rectRadius: 0.12, shadow: sh() });
    s.addText("OS #1042", { x: 5.6, y: 1.62, w: 1.8, h: 0.3, fontSize: 13, bold: true, color: PAPER, fontFace: BODY, margin: 0 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.72, y: 1.63, w: 1.42, h: 0.29, fill: { color: ORANGE }, rectRadius: 0.14 });
    s.addText("EM EXECUÇÃO", { x: 7.72, y: 1.63, w: 1.42, h: 0.29, fontSize: 7.5, bold: true, color: PAPER, fontFace: BODY, align: "center", valign: "middle", charSpacing: 1, margin: 0 });
    s.addText("RQP-4C18  ·  Gol 1.6  ·  2014  ·  128.400 km", { x: 5.6, y: 1.98, w: 3.55, h: 0.24, fontSize: 9.5, color: "8B959E", fontFace: BODY, margin: 0 });

    const linhas = [
      ["Pastilha de freio diant. (par)", "R$ 189,00"],
      ["Disco ventilado", "R$ 320,00"],
      ["Mão de obra — 1,5 h", "R$ 225,00"],
    ];
    let ly = 2.45;
    for (const [d, v] of linhas) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.6, y: ly, w: 3.55, h: 0.42, fill: { color: INK_SOFT }, rectRadius: 0.06 });
      s.addText(d, { x: 5.75, y: ly, w: 2.3, h: 0.42, fontSize: 9.5, color: "D3D8DC", fontFace: BODY, valign: "middle", margin: 0 });
      s.addText(v, { x: 8.0, y: ly, w: 1.0, h: 0.42, fontSize: 9.5, bold: true, color: PAPER, fontFace: BODY, align: "right", valign: "middle", margin: 0 });
      ly += 0.52;
    }
    s.addText("Total", { x: 5.6, y: 4.06, w: 1.5, h: 0.3, fontSize: 10.5, color: "8B959E", fontFace: BODY, margin: 0 });
    s.addText("R$ 734,00", { x: 7.3, y: 4.0, w: 1.7, h: 0.4, fontSize: 20, bold: true, color: ORANGE, fontFace: HEAD, align: "right", margin: 0 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.6, y: 4.48, w: 3.55, h: 0.32, fill: { color: TEAL }, rectRadius: 0.06 });
    s.addText("Aprovado pelo cliente no WhatsApp · 14:32", { x: 5.6, y: 4.48, w: 3.55, h: 0.32, fontSize: 8.5, bold: true, color: PAPER, fontFace: BODY, align: "center", valign: "middle", margin: 0 });

    footer(s, 5);
    s.addNotes("Demonstrar ao vivo. O 'aha' é o aceite do orçamento com carimbo de hora — acaba a discussão no balcão.");
  }

  // ============ 6. COMO FUNCIONA ============
  {
    const s = pres.addSlide();
    s.background = { color: MIST };
    kicker(s, "como funciona");
    title(s, "Do portão ao Pix, em cinco toques.");

    const steps = [
      [I.car, "Entrada", "Bipa a placa. Ficha do veículo e histórico aparecem prontos."],
      [I.cam, "Diagnóstico", "Fotos e vídeo do defeito anexados à OS. Checklist de 12 itens."],
      [I.wpp, "Orçamento", "Enviado e aprovado no WhatsApp, com registro do aceite."],
      [I.tools, "Execução", "Peça baixa do estoque. Mecânico aponta hora trabalhada."],
      [I.invoice, "Entrega", "Nota emitida, Pix na hora, revisão agendada em 6 meses."],
    ];
    let x = 0.6;
    for (let i = 0; i < steps.length; i++) {
      const [ic, t, d] = steps[i];
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.72, w: 1.65, h: 2.5, fill: { color: PAPER }, rectRadius: 0.1, shadow: sh() });
      iconBadge(s, ic, x + 0.16, 1.9, 0.5);
      s.addText(`0${i + 1}`, { x: x + 0.95, y: 1.9, w: 0.55, h: 0.5, fontSize: 20, bold: true, color: "DCE1E5", fontFace: HEAD, align: "right", valign: "middle", margin: 0 });
      s.addText(t, { x: x + 0.16, y: 2.52, w: 1.35, h: 0.3, fontSize: 12.5, bold: true, color: INK, fontFace: HEAD, margin: 0 });
      s.addText(d, { x: x + 0.16, y: 2.85, w: 1.35, h: 1.2, fontSize: 9, color: STEEL, fontFace: BODY, margin: 0, lineSpacing: 12 });
      if (i < 4) s.addShape(pres.shapes.LINE, { x: x + 1.71, y: 2.15, w: 0.14, h: 0, line: { color: ORANGE, width: 2.5 } });
      x += 1.79;
    }
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 4.42, w: 8.8, h: 0.62, fill: { color: PAPER }, rectRadius: 0.08 });
    s.addText([
      { text: "Nenhum passo exige sair da tela da OS. ", options: { bold: true, color: INK } },
      { text: "Se o mecânico precisa aprender um sistema, o sistema está errado.", options: { color: STEEL } },
    ], { x: 0.9, y: 4.42, w: 8.2, h: 0.62, fontSize: 11.5, fontFace: BODY, valign: "middle", margin: 0 });
    footer(s, 6);
  }

  // ============ 7. MÓDULOS ============
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    kicker(s, "o que vem junto");
    title(s, "Seis módulos. Um preço.");

    const mods = [
      [I.invoice, "Fiscal", "NFS-e nacional, NFC-e e conciliação da maquininha. Com garantia de multa."],
      [I.clip, "Ordem de serviço", "OS digital com foto, checklist, garantia de peça e histórico por placa."],
      [I.ware, "Estoque de peças", "Baixa automática, estoque mínimo e cotação com três fornecedores."],
      [I.pie, "Financeiro", "Caixa, contas a pagar e receber, margem por serviço e por mecânico."],
      [I.users, "Retorno do cliente", "Lembrete de revisão, troca de óleo e aniversário do carro."],
      [I.bell, "Painel do dono", "Quantos carros na baia, quanto entrou hoje, o que está travado."],
    ];
    let i = 0;
    for (const [ic, t, d] of mods) {
      const col = i % 3, row = Math.floor(i / 3);
      const x = 0.6 + col * 3.0;
      const y = 1.5 + row * 1.66;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 2.8, h: 1.52, fill: { color: i === 0 ? ORANGE_SOFT : MIST }, rectRadius: 0.09, shadow: sh() });
      iconBadge(s, ic, x + 0.22, y + 0.22, 0.46);
      s.addText(t, { x: x + 0.8, y: y + 0.24, w: 1.85, h: 0.42, fontSize: 12.5, bold: true, color: INK, fontFace: HEAD, valign: "middle", margin: 0 });
      s.addText(d, { x: x + 0.22, y: y + 0.78, w: 2.36, h: 0.62, fontSize: 9.5, color: i === 0 ? "6B5348" : STEEL, fontFace: BODY, margin: 0, lineSpacing: 12.5 });
      i++;
    }
    s.addText("Sem venda casada de módulo. Sem taxa de implantação. Sem fidelidade.", {
      x: 0.6, y: 4.78, w: 7.5, h: 0.28, fontSize: 10.5, italic: true, color: ORANGE, fontFace: BODY, margin: 0,
    });
    footer(s, 7);
  }

  // ============ 8. CATÁLOGO DE PEÇAS ============
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    kicker(s, "peças");
    title(s, "A peça certa, sem digitar uma letra.");

    s.addText("O orçamento morre na digitação. No Oficina Pro, você escolhe a peça pelo catálogo do próprio veículo — com código, aplicação e preço de três fornecedores lado a lado. Escolheu, o pedido sai. Chegou, o estoque entra.", {
      x: 0.6, y: 1.5, w: 4.3, h: 1.4, fontSize: 13, color: STEEL, fontFace: BODY, margin: 0, lineSpacing: 20,
    });

    const bullets = [
      "Catálogo eletrônico integrado à ficha do carro",
      "Compare preço e prazo antes de aprovar",
      "Acabou a peça comprada duas vezes",
      "Acabou a peça errada que volta pro fornecedor",
    ];
    let by = 3.05;
    for (const b of bullets) {
      s.addImage({ data: IorangeCheck, x: 0.62, y: by + 0.03, w: 0.2, h: 0.2 });
      s.addText(b, { x: 0.95, y: by, w: 3.95, h: 0.28, fontSize: 11, color: INK, fontFace: BODY, margin: 0 });
      by += 0.42;
    }

    // mock de busca de peça
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.3, y: 1.42, w: 4.1, h: 3.42, fill: { color: MIST }, rectRadius: 0.12, shadow: sh() });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.55, y: 1.65, w: 3.6, h: 0.4, fill: { color: PAPER }, rectRadius: 0.2 });
    iconBadge(s, I.search, 5.63, 1.71, 0.28);
    s.addText("pastilha de freio · Gol 1.6 2014", { x: 6.0, y: 1.65, w: 3.05, h: 0.4, fontSize: 9.5, color: STEEL, fontFace: BODY, valign: "middle", margin: 0 });

    const pecas = [
      ["Bosch  ·  original", "R$ 189,00", "hoje", true],
      ["Fras-le  ·  similar", "R$ 142,00", "amanhã", false],
      ["Cobreq  ·  similar", "R$ 118,00", "3 dias", false],
    ];
    let py = 2.28;
    for (const [nome, preco, prazo, best] of pecas) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.55, y: py, w: 3.6, h: 0.62, fill: { color: PAPER }, rectRadius: 0.07, shadow: sh() });
      s.addText(nome, { x: 5.72, y: py + 0.08, w: 1.95, h: 0.24, fontSize: 9.5, bold: true, color: INK, fontFace: BODY, margin: 0 });
      s.addText("entrega " + prazo, { x: 5.72, y: py + 0.32, w: 1.95, h: 0.22, fontSize: 8, color: STEEL, fontFace: BODY, margin: 0 });
      s.addText(preco, { x: 7.6, y: py + 0.05, w: 1.4, h: 0.3, fontSize: 12, bold: true, color: best ? INK : ORANGE, fontFace: HEAD, align: "right", margin: 0 });
      s.addText(best ? "recomendada" : "mais barata", { x: 7.6, y: py + 0.34, w: 1.4, h: 0.2, fontSize: 7.5, color: STEEL, fontFace: BODY, align: "right", margin: 0 });
      py += 0.72;
    }
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.55, y: 4.38, w: 3.6, h: 0.34, fill: { color: ORANGE }, rectRadius: 0.06 });
    s.addText("Adicionar à OS #1042 e pedir", { x: 5.55, y: 4.38, w: 3.6, h: 0.34, fontSize: 9, bold: true, color: PAPER, fontFace: BODY, align: "center", valign: "middle", margin: 0 });

    footer(s, 8);
    s.addNotes("O catálogo eletrônico é padrão do setor via Sindirepa. Sem ele, o orçamento vira digitação e o mecânico volta pro caderno.");
  }

  // ============ 9. HISTÓRICO POR PLACA ============
  {
    const s = pres.addSlide();
    s.background = { color: INK };
    kicker(s, "o diferencial", ORANGE);
    title(s, "O histórico não é seu. É do carro.", PAPER);

    s.addText("Todo sistema guarda o histórico por cliente. O Oficina Pro guarda por placa — e o carro carrega o que foi feito nele, com foto e nota, para sempre.", {
      x: 0.6, y: 1.48, w: 4.5, h: 0.95, fontSize: 13, color: "B9C1C9", fontFace: BODY, margin: 0, lineSpacing: 20,
    });

    // placa
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 2.6, w: 2.5, h: 0.85, fill: { color: PAPER }, rectRadius: 0.07 });
    s.addText("RQP-4C18", { x: 0.6, y: 2.6, w: 2.5, h: 0.85, fontSize: 24, bold: true, color: INK, fontFace: HEAD, align: "center", valign: "middle", charSpacing: 2, margin: 0 });
    s.addText("14 serviços  ·  desde 2019", { x: 0.6, y: 3.52, w: 2.5, h: 0.28, fontSize: 9, color: STEEL, fontFace: BODY, align: "center", margin: 0 });

    const ganhos = [
      [I.history, "O cliente volta", "Você sabe o que trocou e quando. A próxima revisão se agenda sozinha, sem você lembrar."],
      [I.star, "O carro vale mais", "Histórico documentado na revenda. O dono do carro tem motivo para preferir sua oficina."],
      [I.cal, "A garantia é sua aliada", "Peça com nota e data. Reclamação de garantia deixa de ser palavra contra palavra."],
    ];
    let y = 1.5;
    for (const [ic, t, d] of ganhos) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.4, y, w: 4.0, h: 1.06, fill: { color: INK_SOFT }, rectRadius: 0.08 });
      iconBadge(s, ic, 5.6, y + 0.15, 0.42);
      s.addText(t, { x: 6.14, y: y + 0.13, w: 3.0, h: 0.26, fontSize: 11.5, bold: true, color: PAPER, fontFace: BODY, margin: 0 });
      s.addText(d, { x: 6.14, y: y + 0.4, w: 3.05, h: 0.55, fontSize: 8.5, color: "9AA4AE", fontFace: BODY, margin: 0, lineSpacing: 11 });
      y += 1.18;
    }

    s.addText("Nenhum concorrente brasileiro faz isso. É o que a sua oficina acumula e que ninguém consegue copiar depois.", {
      x: 0.6, y: 4.12, w: 4.5, h: 0.7, fontSize: 10.5, italic: true, color: ORANGE, fontFace: BODY, margin: 0, lineSpacing: 15,
    });
    footer(s, 9);
    s.addNotes("Cuidado: o dado é do cliente, não nosso. Consentimento explícito por LGPD desde o dia um. Nunca prometer compartilhamento entre oficinas sem autorização.");
  }

  // ============ 10. CONTRA O CADERNO ============
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    kicker(s, "a comparação honesta");
    title(s, "Seu concorrente não é software. É o caderno.");
    s.addText("O caderno é grátis, funciona e nunca deu tela azul. É contra ele que a gente precisa ganhar — não contra software nenhum.", {
      x: 0.6, y: 1.42, w: 8.8, h: 0.42, fontSize: 12, color: STEEL, fontFace: BODY, margin: 0,
    });

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 2.0, w: 4.3, h: 2.85, fill: { color: MIST }, rectRadius: 0.1 });
    s.addText("Caderno e planilha", { x: 0.88, y: 2.18, w: 3.7, h: 0.32, fontSize: 13.5, bold: true, color: "8B959E", fontFace: HEAD, margin: 0 });
    const ruins = [
      "Não emite nota — e em setembro isso trava",
      "O orçamento aprovado vira palavra contra palavra",
      "O estoque só existe na cabeça de alguém",
      "Você descobre o prejuízo no fim do mês",
      "Se o caderno molhar, acabou",
    ];
    let ry = 2.66;
    for (const r of ruins) {
      s.addImage({ data: ItimesSteel, x: 0.9, y: ry + 0.03, w: 0.19, h: 0.19 });
      s.addText(r, { x: 1.22, y: ry, w: 3.4, h: 0.26, fontSize: 10.5, color: STEEL, fontFace: BODY, margin: 0 });
      ry += 0.4;
    }

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.1, y: 2.0, w: 4.3, h: 2.85, fill: { color: INK }, rectRadius: 0.1, shadow: sh() });
    s.addText("Oficina Pro", { x: 5.38, y: 2.18, w: 3.7, h: 0.32, fontSize: 13.5, bold: true, color: ORANGE, fontFace: HEAD, margin: 0 });
    const bons = [
      "Nota emitida na entrega, com garantia de multa",
      "Aceite do orçamento com data e hora",
      "Estoque baixa sozinho quando a peça sai",
      "Você vê a margem antes de aprovar o serviço",
      "Funciona offline; o dado é seu e fica na nuvem",
    ];
    let gy = 2.66;
    for (const b of bons) {
      s.addImage({ data: IorangeCheck, x: 5.4, y: gy + 0.03, w: 0.19, h: 0.19 });
      s.addText(b, { x: 5.72, y: gy, w: 3.4, h: 0.26, fontSize: 10.5, color: "DDE2E6", fontFace: BODY, margin: 0 });
      gy += 0.4;
    }
    footer(s, 10);
    s.addNotes("Se o cliente perguntar de Ultracar / oficina.app: os baratos não emitem nota fiscal; os caros custam 3x e levam semanas para implantar. Não ataque ninguém pelo nome.");
  }

  // ============ 11. PLANOS ============
  {
    const s = pres.addSlide();
    s.background = { color: INK };
    kicker(s, "planos", ORANGE);
    title(s, "Preço de oficina, não de software.", PAPER);

    const planos = [
      ["Baia", "R$ 99", "MEI e oficina solo", ["1 usuário", "OS ilimitada", "NFS-e nacional", "Estoque e caixa"], false],
      ["Oficina", "R$ 189", "2 a 6 mecânicos", ["Usuários ilimitados", "Tudo do Baia", "NFC-e e catálogo de peças", "Garantia de multa", "Retorno automático"], true],
      ["Rede", "R$ 389", "múltiplas unidades", ["Tudo do Oficina", "Consolidado por unidade", "Metas por mecânico", "Integrações"], false],
    ];
    let x = 0.6;
    for (const [nome, preco, publico, itens, destaque] of planos) {
      const bg = destaque ? ORANGE : INK_SOFT;
      const t2 = destaque ? "FFE3D2" : "9AA4AE";
      const h = destaque ? 3.28 : 3.04;
      const y0 = destaque ? 1.42 : 1.54;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: y0, w: 2.8, h, fill: { color: bg }, rectRadius: 0.12, shadow: sh() });
      if (destaque) {
        s.addText("MAIS VENDIDO", { x: x + 1.5, y: y0 + 0.2, w: 1.1, h: 0.24, fontSize: 7, bold: true, color: ORANGE, fontFace: BODY, align: "center", valign: "middle", charSpacing: 1, margin: 0, fill: { color: PAPER } });
      }
      s.addText(nome, { x: x + 0.25, y: y0 + 0.18, w: 1.4, h: 0.3, fontSize: 14, bold: true, color: PAPER, fontFace: HEAD, margin: 0 });
      s.addText([
        { text: preco, options: { fontSize: 27, bold: true, color: PAPER, fontFace: HEAD } },
        { text: " /mês", options: { fontSize: 10.5, color: t2, fontFace: BODY } },
      ], { x: x + 0.25, y: y0 + 0.55, w: 2.3, h: 0.5, margin: 0 });
      s.addText(publico, { x: x + 0.25, y: y0 + 1.05, w: 2.3, h: 0.24, fontSize: 9, color: t2, fontFace: BODY, margin: 0 });
      let iy = y0 + 1.42;
      for (const it of itens) {
        s.addText(it, { x: x + 0.25, y: iy, w: 2.3, h: 0.26, fontSize: 9.5, color: destaque ? PAPER : "C2C9CF", fontFace: BODY, bullet: true, margin: 0 });
        iy += 0.3;
      }
      x += 2.98;
    }
    s.addText("14 dias grátis, sem cartão.  ·  Migramos sua planilha por você.  ·  Cancela quando quiser.", {
      x: 0.6, y: 4.82, w: 8.8, h: 0.28, fontSize: 10, color: STEEL, fontFace: BODY, margin: 0,
    });
    footer(s, 11);
    s.addNotes("Se apertarem no preço: os sistemas de R$ 80 a R$ 100 não emitem nota fiscal. Os que emitem custam de R$ 324 a R$ 599. Nós somos o único que emite nesta faixa — e o único que garante a multa.");
  }

  // ============ 12. CTA ============
  {
    const s = pres.addSlide();
    s.background = { color: INK };
    s.addShape(pres.shapes.OVAL, { x: -1.6, y: 2.6, w: 5.4, h: 5.4, fill: { color: ORANGE, transparency: 90 } });
    s.addShape(pres.shapes.OVAL, { x: 7.9, y: -1.2, w: 4.2, h: 4.2, fill: { color: ORANGE, transparency: 92 } });

    iconBadge(s, I.wrench, 0.62, 0.62, 0.6);
    s.addText("OFICINA PRO", { x: 1.4, y: 0.64, w: 4.5, h: 0.55, fontSize: 18, bold: true, color: PAPER, fontFace: HEAD, charSpacing: 4, margin: 0, valign: "middle" });

    s.addText("Setembro chega\nde qualquer jeito.", {
      x: 0.6, y: 1.85, w: 7.4, h: 1.5, fontSize: 38, bold: true, color: PAPER, fontFace: HEAD, lineSpacing: 44, margin: 0,
    });
    s.addText("Estamos escolhendo 20 oficinas para o piloto: implantação assistida, migração da sua planilha por nossa conta e três meses sem cobrar. Em troca, queremos o número real da sua margem, antes e depois.", {
      x: 0.6, y: 3.5, w: 6.2, h: 0.95, fontSize: 13, color: "B9C1C9", fontFace: BODY, margin: 0, lineSpacing: 20,
    });

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 4.62, w: 2.55, h: 0.56, fill: { color: ORANGE }, rectRadius: 0.28 });
    s.addText("Quero o piloto", { x: 0.6, y: 4.62, w: 2.55, h: 0.56, fontSize: 12.5, bold: true, color: PAPER, fontFace: BODY, align: "center", valign: "middle", margin: 0 });
    s.addText("oficinapro.com.br  ·  contato@oficinapro.com.br", {
      x: 3.4, y: 4.62, w: 5.0, h: 0.56, fontSize: 11, color: STEEL, fontFace: BODY, valign: "middle", margin: 0,
    });
    s.addNotes("Fechar pedindo o compromisso menor possível: uma oficina, uma semana. Não peça contrato — peça o piloto.");
  }

  await pres.writeFile({ fileName: "/Users/viviangitti/gss/deck-oficina-pro/Oficina-Pro.pptx" });
  console.log("ok");
})();
