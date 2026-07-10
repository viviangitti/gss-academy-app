const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
  FaBook, FaWhatsapp, FaMoneyBillWave, FaCarCrash, FaBoxOpen, FaFileInvoiceDollar,
  FaClipboardList, FaWarehouse, FaChartPie, FaUsers, FaBell, FaMobileAlt,
  FaBolt, FaCheckCircle, FaTimesCircle, FaCarSide, FaTools, FaWrench,
  FaCalendarCheck, FaHandshake, FaRocket, FaStore, FaCamera, FaLock
} = require("react-icons/fa");

// ---------- Paleta: grafite / laranja de oficina / aço ----------
const INK = "16191D";      // grafite profundo (fundo dark)
const INK_SOFT = "242A31"; // cartão sobre dark
const PAPER = "FFFFFF";
const MIST = "F1F3F5";     // cartão claro
const ORANGE = "F26522";   // laranja segurança
const ORANGE_SOFT = "FDEDE2";
const STEEL = "6B7785";    // texto secundário
const TEAL = "1F7A6B";     // positivo (usado com parcimônia)

const HEAD = "Bookman Old Style";
const BODY = "Calibri";

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Torque";
pres.title = "Torque — ERP para oficinas independentes";

const sh = () => ({ type: "outer", color: "000000", blur: 8, offset: 2, angle: 45, opacity: 0.10 });

async function icon(Comp, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Comp, { color, size: String(size) })
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

// círculo laranja + ícone branco (motivo visual repetido)
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
  slide.addText("Torque", { x: 0.6, y: 5.15, w: 2, h: 0.25, fontSize: 9, color: STEEL, fontFace: BODY, margin: 0 });
  slide.addText(String(n), { x: 8.6, y: 5.15, w: 0.8, h: 0.25, fontSize: 9, color: STEEL, fontFace: BODY, align: "right", margin: 0 });
}

(async () => {
  const I = {};
  const pairs = [
    ["book", FaBook], ["wpp", FaWhatsapp], ["money", FaMoneyBillWave], ["crash", FaCarCrash],
    ["box", FaBoxOpen], ["invoice", FaFileInvoiceDollar], ["clip", FaClipboardList],
    ["ware", FaWarehouse], ["pie", FaChartPie], ["users", FaUsers], ["bell", FaBell],
    ["mobile", FaMobileAlt], ["bolt", FaBolt], ["check", FaCheckCircle], ["times", FaTimesCircle],
    ["car", FaCarSide], ["tools", FaTools], ["wrench", FaWrench], ["cal", FaCalendarCheck],
    ["hand", FaHandshake], ["rocket", FaRocket], ["store", FaStore], ["cam", FaCamera], ["lock", FaLock],
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
    s.addText("TORQUE", {
      x: 1.42, y: 0.78, w: 4, h: 0.55, fontSize: 22, bold: true, color: PAPER,
      fontFace: HEAD, charSpacing: 5, margin: 0, valign: "middle",
    });

    s.addText("O ERP que roda\nna graxa.", {
      x: 0.6, y: 1.95, w: 6.6, h: 1.75, fontSize: 46, bold: true, color: PAPER,
      fontFace: HEAD, lineSpacing: 48, margin: 0,
    });
    s.addText("Gestão completa para a oficina independente: ordem de serviço, peças, caixa e cliente — em um só lugar, no celular do mecânico.", {
      x: 0.6, y: 3.85, w: 6.1, h: 0.9, fontSize: 14, color: "B9C1C9", fontFace: BODY, margin: 0, lineSpacing: 21,
    });
    s.addText("Apresentação comercial · 2026", {
      x: 0.6, y: 5.0, w: 5, h: 0.3, fontSize: 10, color: STEEL, fontFace: BODY, charSpacing: 2, margin: 0,
    });
    s.addNotes("Abrir com a frase: 'hoje, 8 em cada 10 oficinas pequenas rodam num caderno'. Torque é o ERP feito para quem tem graxa na mão, não para o contador.");
  }

  // ============ 2. O PROBLEMA ============
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    kicker(s, "o problema");
    title(s, "A oficina fatura bem. E não sabe quanto sobra.");

    s.addText("O dono é o melhor mecânico da casa — e também o orçamentista, o comprador de peças, o cobrador e o financeiro. A informação mora em quatro lugares e nenhum conversa com o outro.", {
      x: 0.6, y: 1.48, w: 5.15, h: 1.05, fontSize: 13.5, color: STEEL, fontFace: BODY, margin: 0, lineSpacing: 20,
    });

    const dores = [
      [I.book, "Caderno e planilha", "Placa anotada à mão, status na cabeça do mecânico, valor somado na calculadora."],
      [I.wpp, "Orçamento perdido no WhatsApp", "Aprovação verbal, sem registro. Depois vira discussão no balcão."],
      [I.box, "Peça que some", "Sem estoque real, compra-se duas vezes ou o carro fica parado na baia."],
      [I.money, "Não sabe a margem", "Fatura R$ 80 mil, tira R$ 4 mil. Ninguém sabe qual serviço dá prejuízo."],
    ];
    let y = 1.36;
    for (const [ic, t, d] of dores) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: 6.0, y, w: 3.4, h: 0.84, fill: { color: MIST }, rectRadius: 0.08, shadow: sh(),
      });
      iconBadge(s, ic, 6.18, y + 0.16, 0.42);
      s.addText(t, { x: 6.72, y: y + 0.12, w: 2.55, h: 0.26, fontSize: 11.5, bold: true, color: INK, fontFace: BODY, margin: 0 });
      s.addText(d, { x: 6.72, y: y + 0.37, w: 2.55, h: 0.42, fontSize: 8.5, color: STEEL, fontFace: BODY, margin: 0, lineSpacing: 11 });
      y += 0.9;
    }

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 2.82, w: 5.15, h: 1.62, fill: { color: INK }, rectRadius: 0.1 });
    s.addText("4h", { x: 0.95, y: 3.02, w: 1.5, h: 0.75, fontSize: 52, bold: true, color: ORANGE, fontFace: HEAD, margin: 0 });
    s.addText("por semana consolidando número em planilha — o limite a partir do qual um sistema dedicado se paga em até 90 dias.", {
      x: 2.5, y: 3.05, w: 2.95, h: 1.1, fontSize: 11, color: "C6CCD2", fontFace: BODY, margin: 0, lineSpacing: 16, valign: "middle",
    });
    footer(s, 2);
    s.addNotes("Não é falta de trabalho: é falta de visibilidade. A dor é margem, não faturamento.");
  }

  // ============ 3. MERCADO ============
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    kicker(s, "mercado");
    title(s, "160 mil oficinas. Uma frota que só envelhece.");

    const stats = [
      ["160 mil", "oficinas independentes", "vinculadas às regionais do Sindirepa"],
      ["48,1 mi", "autoveículos circulando", "39 mi só de carros leves (Sindipeças)"],
      ["10a 11m", "idade média da frota", "carro velho = manutenção recorrente"],
      ["R$ 43 bi", "reposição / ano", "pode dobrar até 2040 (McKinsey)"],
    ];
    let x = 0.6;
    for (const [big, mid, small] of stats) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.62, w: 2.08, h: 1.85, fill: { color: MIST }, rectRadius: 0.08, shadow: sh() });
      s.addText(big, { x: x + 0.18, y: 1.78, w: 1.75, h: 0.62, fontSize: 27, bold: true, color: ORANGE, fontFace: HEAD, margin: 0 });
      s.addText(mid, { x: x + 0.18, y: 2.42, w: 1.75, h: 0.46, fontSize: 11, bold: true, color: INK, fontFace: BODY, margin: 0, lineSpacing: 14 });
      s.addText(small, { x: x + 0.18, y: 2.9, w: 1.75, h: 0.44, fontSize: 8.5, color: STEEL, fontFace: BODY, margin: 0, lineSpacing: 11 });
      x += 2.26;
    }

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 3.72, w: 8.8, h: 1.18, fill: { color: ORANGE_SOFT }, rectRadius: 0.08 });
    iconBadge(s, I.bolt, 0.85, 4.1, 0.44);
    s.addText([
      { text: "Mercado endereçável.  ", options: { bold: true, color: INK } },
      { text: "Se 160 mil oficinas pagassem R$ 149/mês, o TAM brasileiro é de ", options: { color: "5A4438" } },
      { text: "R$ 286 milhões por ano", options: { bold: true, color: ORANGE } },
      { text: ". Capturar 1% em 3 anos = R$ 2,9 mi de ARR — com ticket que cabe no bolso do reparador.", options: { color: "5A4438" } },
    ], { x: 1.42, y: 3.9, w: 7.75, h: 0.82, fontSize: 11.5, fontFace: BODY, margin: 0, lineSpacing: 17, valign: "middle" });

    footer(s, 3);
    s.addNotes("Fontes: Sindirepa Brasil (Anuário 2025/26), Sindipeças Frota Circulante 2025, McKinsey via Peçamentor.");
  }

  // ============ 4. POR QUE AGORA ============
  {
    const s = pres.addSlide();
    s.background = { color: INK };
    kicker(s, "por que agora", ORANGE);
    title(s, "A janela abriu — e fecha rápido.", PAPER);

    const cards = [
      [I.car, "Frota envelhecendo", "Quase 11 anos de idade média. Cada ano a mais é uma revisão a mais na baia do independente — o volume vem, o controle não."],
      [I.invoice, "Fisco digital", "NFS-e nacional, NFC-e, split de pagamento. Quem emite nota no bloquinho vai ser empurrado para o software, queira ou não."],
      [I.mobile, "Mecânico já é digital", "Pix, WhatsApp Business e Google Maps já entraram na oficina. A resistência não é ao celular — é a sistemas feitos para escritório."],
    ];
    let x = 0.6;
    for (const [ic, t, d] of cards) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.68, w: 2.8, h: 2.72, fill: { color: INK_SOFT }, rectRadius: 0.1 });
      iconBadge(s, ic, x + 0.28, 1.95, 0.56);
      s.addText(t, { x: x + 0.28, y: 2.68, w: 2.3, h: 0.32, fontSize: 14.5, bold: true, color: PAPER, fontFace: HEAD, margin: 0 });
      s.addText(d, { x: x + 0.28, y: 3.06, w: 2.3, h: 1.15, fontSize: 10.5, color: "A8B1B9", fontFace: BODY, margin: 0, lineSpacing: 15 });
      x += 2.98;
    }
    s.addText("Os sistemas existentes foram desenhados para a oficina de 12 baias. Ninguém desenhou para a de duas.", {
      x: 0.6, y: 4.62, w: 8.8, h: 0.35, fontSize: 12, italic: true, color: ORANGE, fontFace: BODY, margin: 0,
    });
    footer(s, 4);
  }

  // ============ 5. A SOLUÇÃO ============
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    kicker(s, "a solução");
    title(s, "Torque: a oficina inteira em uma tela.");

    s.addText("Um ERP enxuto, mobile-first, que o mecânico usa com a mão suja e o dono acompanha do sofá. Cadastra a placa, fotografa o problema, manda o orçamento no WhatsApp, recebe o aceite com um clique — e o estoque, o caixa e a nota se resolvem sozinhos.", {
      x: 0.6, y: 1.5, w: 4.35, h: 1.5, fontSize: 13, color: STEEL, fontFace: BODY, margin: 0, lineSpacing: 20,
    });

    const bullets = [
      "Zero digitação: placa puxa marca, modelo e ano",
      "Aprovação de orçamento registrada, com hora e IP",
      "Funciona offline — sincroniza quando a internet volta",
      "Implantação em 1 dia, sem consultor",
    ];
    let by = 3.18;
    for (const b of bullets) {
      s.addImage({ data: IorangeCheck, x: 0.62, y: by + 0.03, w: 0.2, h: 0.2 });
      s.addText(b, { x: 0.95, y: by, w: 4.0, h: 0.28, fontSize: 11, color: INK, fontFace: BODY, margin: 0 });
      by += 0.42;
    }

    // Painel "produto" à direita
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
    s.addNotes("Demonstrar a OS real. O 'aha' é o aceite do orçamento com carimbo de hora — acaba a discussão no balcão.");
  }

  // ============ 6. COMO FUNCIONA (fluxo) ============
  {
    const s = pres.addSlide();
    s.background = { color: MIST };
    kicker(s, "como funciona");
    title(s, "Do portão ao Pix, em cinco toques.");

    const steps = [
      [I.car, "Entrada", "Bipa a placa. Ficha do veículo e histórico aparecem prontos."],
      [I.cam, "Diagnóstico", "Fotos e vídeo do defeito anexados à OS. Checklist de 12 itens."],
      [I.wpp, "Orçamento", "Enviado e aprovado pelo WhatsApp, com registro legal do aceite."],
      [I.tools, "Execução", "Peça baixa do estoque. Mecânico aponta hora trabalhada."],
      [I.money, "Entrega", "Nota emitida, Pix na hora, retorno agendado em 6 meses."],
    ];
    let x = 0.6;
    for (let i = 0; i < steps.length; i++) {
      const [ic, t, d] = steps[i];
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.72, w: 1.65, h: 2.5, fill: { color: PAPER }, rectRadius: 0.1, shadow: sh() });
      iconBadge(s, ic, x + 0.16, 1.9, 0.5);
      s.addText(`0${i + 1}`, { x: x + 0.95, y: 1.9, w: 0.55, h: 0.5, fontSize: 20, bold: true, color: "DCE1E5", fontFace: HEAD, align: "right", valign: "middle", margin: 0 });
      s.addText(t, { x: x + 0.16, y: 2.52, w: 1.35, h: 0.3, fontSize: 12.5, bold: true, color: INK, fontFace: HEAD, margin: 0 });
      s.addText(d, { x: x + 0.16, y: 2.85, w: 1.35, h: 1.2, fontSize: 9, color: STEEL, fontFace: BODY, margin: 0, lineSpacing: 12 });
      if (i < 4) {
        s.addShape(pres.shapes.LINE, { x: x + 1.71, y: 2.15, w: 0.14, h: 0, line: { color: ORANGE, width: 2.5 } });
      }
      x += 1.79;
    }
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 4.42, w: 8.8, h: 0.62, fill: { color: PAPER }, rectRadius: 0.08 });
    s.addText([
      { text: "Nenhum passo exige sair da tela da OS. ", options: { bold: true, color: INK } },
      { text: "Estoque, financeiro e CRM são consequência do trabalho, não trabalho a mais.", options: { color: STEEL } },
    ], { x: 0.9, y: 4.42, w: 8.2, h: 0.62, fontSize: 11.5, fontFace: BODY, valign: "middle", margin: 0 });
    footer(s, 6);
  }

  // ============ 7. MÓDULOS ============
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    kicker(s, "produto");
    title(s, "Seis módulos. Um preço.");

    const mods = [
      [I.clip, "Ordem de serviço", "OS digital com foto, checklist, garantia de peça e histórico por placa."],
      [I.ware, "Estoque de peças", "Baixa automática, estoque mínimo, cotação com três fornecedores."],
      [I.pie, "Financeiro", "Caixa, contas a pagar/receber, margem por serviço e por mecânico."],
      [I.invoice, "Fiscal", "NFS-e, NFC-e e conciliação de maquininha sem contador no meio."],
      [I.users, "CRM & retorno", "Lembrete de revisão, troca de óleo e aniversário do carro."],
      [I.bell, "Painel do dono", "Quantos carros na baia, quanto entrou hoje, o que está travado."],
    ];
    let i = 0;
    for (const [ic, t, d] of mods) {
      const col = i % 3, row = Math.floor(i / 3);
      const x = 0.6 + col * 3.0;
      const y = 1.5 + row * 1.66;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 2.8, h: 1.52, fill: { color: MIST }, rectRadius: 0.09, shadow: sh() });
      iconBadge(s, ic, x + 0.22, y + 0.22, 0.46);
      s.addText(t, { x: x + 0.8, y: y + 0.24, w: 1.85, h: 0.42, fontSize: 12.5, bold: true, color: INK, fontFace: HEAD, valign: "middle", margin: 0 });
      s.addText(d, { x: x + 0.22, y: y + 0.78, w: 2.36, h: 0.62, fontSize: 9.5, color: STEEL, fontFace: BODY, margin: 0, lineSpacing: 12.5 });
      i++;
    }
    s.addText("Sem venda casada de módulo. Sem taxa de implantação. Sem fidelidade.", {
      x: 0.6, y: 4.78, w: 7.5, h: 0.28, fontSize: 10.5, italic: true, color: ORANGE, fontFace: BODY, margin: 0,
    });
    footer(s, 7);
  }

  // ============ 8. DIFERENCIAIS / COMPARAÇÃO ============
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    kicker(s, "diferenciais");
    title(s, "Por que o sistema anterior foi abandonado.");
    s.addText("O maior concorrente não é outro ERP. É o caderno — porque o software que a oficina tentou usar era pesado demais para o dia a dia dela.", {
      x: 0.6, y: 1.42, w: 8.8, h: 0.42, fontSize: 12, color: STEEL, fontFace: BODY, margin: 0,
    });

    // coluna esquerda: ERP tradicional
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 2.0, w: 4.3, h: 2.85, fill: { color: MIST }, rectRadius: 0.1 });
    s.addText("ERP tradicional de oficina", { x: 0.88, y: 2.18, w: 3.7, h: 0.32, fontSize: 13.5, bold: true, color: "8B959E", fontFace: HEAD, margin: 0 });
    const ruins = [
      "Feito para desktop no escritório",
      "Implantação de semanas, com consultor",
      "Módulos vendidos separados, R$ 289–499/mês",
      "Treinamento longo — o mecânico desiste",
      "Trava sem internet",
    ];
    let ry = 2.66;
    for (const r of ruins) {
      s.addImage({ data: ItimesSteel, x: 0.9, y: ry + 0.03, w: 0.19, h: 0.19 });
      s.addText(r, { x: 1.22, y: ry, w: 3.4, h: 0.26, fontSize: 10.5, color: STEEL, fontFace: BODY, margin: 0 });
      ry += 0.4;
    }

    // coluna direita: Torque (destaque)
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.1, y: 2.0, w: 4.3, h: 2.85, fill: { color: INK }, rectRadius: 0.1, shadow: sh() });
    s.addText("Torque", { x: 5.38, y: 2.18, w: 3.7, h: 0.32, fontSize: 13.5, bold: true, color: ORANGE, fontFace: HEAD, margin: 0 });
    const bons = [
      "Mobile-first — nasce no celular da baia",
      "No ar no primeiro dia, sozinho",
      "Tudo incluso por R$ 149/mês",
      "Sem treinamento: 6 telas no total",
      "Offline-first, sincroniza depois",
    ];
    let gy = 2.66;
    for (const b of bons) {
      s.addImage({ data: IorangeCheck, x: 5.4, y: gy + 0.03, w: 0.19, h: 0.19 });
      s.addText(b, { x: 5.72, y: gy, w: 3.4, h: 0.26, fontSize: 10.5, color: "DDE2E6", fontFace: BODY, margin: 0 });
      gy += 0.4;
    }
    footer(s, 8);
    s.addNotes("Concorrentes citados: Oficina Integrada (R$99–299), Oficina Inteligente (R$289–499), Ultracar, WSoft (R$79,90). Nosso ângulo não é preço — é adoção.");
  }

  // ============ 9. ROI ============
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    kicker(s, "resultado");
    title(s, "O que muda numa oficina de duas baias.");

    s.addChart(pres.charts.BAR, [
      { name: "Antes do Torque", labels: ["Faturamento\nmensal", "Peça comprada\nem duplicidade", "Retorno do\ncliente (%)"], values: [62, 100, 100] },
      { name: "Depois (6 meses)", labels: ["Faturamento\nmensal", "Peça comprada\nem duplicidade", "Retorno do\ncliente (%)"], values: [100, 22, 174] },
    ], {
      x: 0.5, y: 1.6, w: 5.35, h: 3.25, barDir: "col",
      chartColors: ["C9D0D6", ORANGE],
      chartArea: { fill: { color: PAPER } },
      catAxisLabelColor: STEEL, valAxisLabelColor: STEEL,
      catAxisLabelFontSize: 9, valAxisLabelFontSize: 9,
      valGridLine: { color: "E7EBEE", size: 0.5 }, catGridLine: { style: "none" },
      showLegend: true, legendPos: "b", legendFontSize: 9, legendColor: STEEL,
      showValue: false, valAxisMaxVal: 190,
    });
    s.addText("Índice, base 100 = melhor cenário. Projeção com base em benchmarks do setor.", {
      x: 0.5, y: 4.8, w: 5.4, h: 0.24, fontSize: 8, color: "9AA4AE", fontFace: BODY, italic: true, margin: 0,
    });

    const gains = [
      ["+38%", "de faturamento", "sem um cliente novo: só cobrando a mão de obra que já era feita de graça."],
      ["-78%", "de peça duplicada", "estoque real acaba com a compra por desencargo de consciência."],
      ["90 dias", "para o payback", "o sistema custa menos que uma troca de embreagem por mês."],
    ];
    let y = 1.66;
    for (const [big, mid, small] of gains) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.15, y, w: 3.25, h: 1.02, fill: { color: ORANGE_SOFT }, rectRadius: 0.08 });
      s.addText(big, { x: 6.35, y: y + 0.1, w: 1.05, h: 0.45, fontSize: 20, bold: true, color: ORANGE, fontFace: HEAD, margin: 0, valign: "middle" });
      s.addText(mid, { x: 7.42, y: y + 0.12, w: 1.8, h: 0.4, fontSize: 10.5, bold: true, color: INK, fontFace: BODY, margin: 0, valign: "middle" });
      s.addText(small, { x: 6.35, y: y + 0.55, w: 2.85, h: 0.4, fontSize: 8.5, color: "6B5348", fontFace: BODY, margin: 0, lineSpacing: 11 });
      y += 1.14;
    }
    footer(s, 9);
  }

  // ============ 10. PLANOS ============
  {
    const s = pres.addSlide();
    s.background = { color: INK };
    kicker(s, "planos", ORANGE);
    title(s, "Preço de oficina, não de software.", PAPER);

    const planos = [
      ["Baia", "R$ 79", "MEI e oficina solo", ["1 usuário", "OS ilimitada", "Estoque e caixa", "Suporte no WhatsApp"], false],
      ["Oficina", "R$ 149", "2 a 6 mecânicos", ["Usuários ilimitados", "Tudo do Baia", "Fiscal (NFS-e/NFC-e)", "CRM e retorno automático", "Painel do dono"], true],
      ["Rede", "R$ 349", "múltiplas unidades", ["Tudo do Oficina", "Consolidado por unidade", "Metas por mecânico", "API e integrações"], false],
    ];
    let x = 0.6;
    for (const [nome, preco, publico, itens, destaque] of planos) {
      const bg = destaque ? ORANGE : INK_SOFT;
      const t1 = destaque ? PAPER : PAPER;
      const t2 = destaque ? "FFE3D2" : "9AA4AE";
      const h = destaque ? 3.28 : 3.04;
      const y0 = destaque ? 1.42 : 1.54;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: y0, w: 2.8, h, fill: { color: bg }, rectRadius: 0.12, shadow: sh() });
      if (destaque) {
        s.addText("MAIS VENDIDO", { x: x + 1.5, y: y0 + 0.2, w: 1.1, h: 0.24, fontSize: 7, bold: true, color: ORANGE, fontFace: BODY, align: "center", valign: "middle", charSpacing: 1, margin: 0, fill: { color: PAPER } });
      }
      s.addText(nome, { x: x + 0.25, y: y0 + 0.18, w: 1.4, h: 0.3, fontSize: 14, bold: true, color: t1, fontFace: HEAD, margin: 0 });
      s.addText([
        { text: preco, options: { fontSize: 27, bold: true, color: t1, fontFace: HEAD } },
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
    s.addText("14 dias grátis, sem cartão.  ·  Migração da planilha feita por nós.  ·  Cancelamento a qualquer momento.", {
      x: 0.6, y: 4.82, w: 8.8, h: 0.28, fontSize: 10, color: STEEL, fontFace: BODY, margin: 0,
    });
    footer(s, 10);
  }

  // ============ 11. UNIT ECONOMICS ============
  {
    const s = pres.addSlide();
    s.background = { color: PAPER };
    kicker(s, "o negócio");
    title(s, "SaaS de ticket baixo, retenção de ERP.");

    s.addChart(pres.charts.LINE, [
      { name: "Oficinas pagantes", labels: ["Ano 1", "Ano 2", "Ano 3", "Ano 4", "Ano 5"], values: [420, 1500, 4200, 8600, 15000] },
    ], {
      x: 0.5, y: 1.62, w: 5.4, h: 3.05,
      chartColors: [ORANGE], lineSize: 3.5, lineSmooth: true,
      chartArea: { fill: { color: PAPER } },
      catAxisLabelColor: STEEL, valAxisLabelColor: STEEL,
      catAxisLabelFontSize: 9, valAxisLabelFontSize: 9,
      valGridLine: { color: "E7EBEE", size: 0.5 }, catGridLine: { style: "none" },
      showLegend: false, showValue: true, dataLabelColor: INK, dataLabelFontSize: 8.5, dataLabelPosition: "t",
      showTitle: true, title: "Base de clientes (projeção)", titleColor: INK, titleFontSize: 11, titleFontFace: BODY,
    });

    const metrics = [
      ["R$ 149", "ARPU mensal", INK],
      ["R$ 380", "CAC estimado", INK],
      ["2,7 meses", "payback do CAC", TEAL],
      ["< 1,8%", "churn mensal alvo", TEAL],
    ];
    let y = 1.68;
    for (const [big, lab, c] of metrics) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.2, y, w: 3.2, h: 0.68, fill: { color: MIST }, rectRadius: 0.07 });
      s.addText(big, { x: 6.4, y, w: 1.55, h: 0.68, fontSize: 15, bold: true, color: c, fontFace: HEAD, valign: "middle", margin: 0 });
      s.addText(lab, { x: 7.95, y, w: 1.28, h: 0.68, fontSize: 9.5, color: STEEL, fontFace: BODY, align: "right", valign: "middle", margin: 0 });
      y += 0.8;
    }
    s.addText("ERP gruda: uma vez que a OS e o histórico do carro moram no Torque, sair custa mais que ficar.", {
      x: 0.6, y: 4.78, w: 8.8, h: 0.28, fontSize: 11, italic: true, color: ORANGE, fontFace: BODY, margin: 0,
    });
    footer(s, 11);
  }

  // ============ 12. GO-TO-MARKET ============
  {
    const s = pres.addSlide();
    s.background = { color: MIST };
    kicker(s, "go-to-market");
    title(s, "Onde a oficina já está, o Torque chega junto.");

    const canais = [
      [I.store, "Distribuidor de peças", "O vendedor de autopeça visita 40 oficinas por semana. Ele é nosso canal — comissão recorrente por indicação ativa."],
      [I.hand, "Sindirepa e regionais", "160 mil oficinas associadas. Acordo institucional dá selo, lista e palco em feira."],
      [I.rocket, "Conteúdo técnico", "YouTube e Instagram de reparação: o mecânico aprende diagnóstico e conhece a marca no mesmo vídeo."],
      [I.lock, "Contador da oficina", "Quem sofre com o bloquinho de nota é o contador. Ele empurra o sistema por conta própria."],
    ];
    let i = 0;
    for (const [ic, t, d] of canais) {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 0.6 + col * 4.5;
      const y = 1.54 + row * 1.56;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 4.3, h: 1.42, fill: { color: PAPER }, rectRadius: 0.09, shadow: sh() });
      iconBadge(s, ic, x + 0.24, y + 0.22, 0.5);
      s.addText(t, { x: x + 0.9, y: y + 0.24, w: 3.2, h: 0.3, fontSize: 12.5, bold: true, color: INK, fontFace: HEAD, margin: 0 });
      s.addText(d, { x: x + 0.9, y: y + 0.58, w: 3.2, h: 0.7, fontSize: 9.5, color: STEEL, fontFace: BODY, margin: 0, lineSpacing: 12.5 });
      i++;
    }
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 4.62, w: 8.8, h: 0.46, fill: { color: INK }, rectRadius: 0.07 });
    s.addText("Meta ano 1: 3 distribuidores parceiros, 1 acordo Sindirepa regional, 420 oficinas pagantes.", {
      x: 0.9, y: 4.62, w: 8.2, h: 0.46, fontSize: 10.5, bold: true, color: PAPER, fontFace: BODY, valign: "middle", margin: 0,
    });
    footer(s, 12);
  }

  // ============ 13. CTA ============
  {
    const s = pres.addSlide();
    s.background = { color: INK };
    s.addShape(pres.shapes.OVAL, { x: -1.6, y: 2.6, w: 5.4, h: 5.4, fill: { color: ORANGE, transparency: 90 } });
    s.addShape(pres.shapes.OVAL, { x: 7.9, y: -1.2, w: 4.2, h: 4.2, fill: { color: ORANGE, transparency: 92 } });

    iconBadge(s, I.wrench, 0.62, 0.62, 0.6);
    s.addText("TORQUE", { x: 1.4, y: 0.64, w: 4, h: 0.55, fontSize: 20, bold: true, color: PAPER, fontFace: HEAD, charSpacing: 5, margin: 0, valign: "middle" });

    s.addText("Coloque uma oficina\nno Torque esta semana.", {
      x: 0.6, y: 1.85, w: 7.4, h: 1.5, fontSize: 38, bold: true, color: PAPER, fontFace: HEAD, lineSpacing: 44, margin: 0,
    });
    s.addText("Escolhemos 20 oficinas para o piloto: implantação assistida, migração da planilha por nossa conta e três meses sem cobrar. Em troca, queremos o número real da sua margem antes e depois.", {
      x: 0.6, y: 3.5, w: 6.2, h: 0.95, fontSize: 13, color: "B9C1C9", fontFace: BODY, margin: 0, lineSpacing: 20,
    });

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 4.62, w: 2.55, h: 0.56, fill: { color: ORANGE }, rectRadius: 0.28 });
    s.addText("Quero o piloto", { x: 0.6, y: 4.62, w: 2.55, h: 0.56, fontSize: 12.5, bold: true, color: PAPER, fontFace: BODY, align: "center", valign: "middle", margin: 0 });
    s.addText("torque.com.br  ·  contato@torque.com.br", {
      x: 3.4, y: 4.62, w: 4.5, h: 0.56, fontSize: 11, color: STEEL, fontFace: BODY, valign: "middle", margin: 0,
    });
    s.addNotes("Fechar pedindo o compromisso menor possível: uma oficina, uma semana. Não peça contrato — peça o piloto.");
  }

  await pres.writeFile({ fileName: "/Users/viviangitti/gss/deck-torque/Torque-ERP-Oficinas.pptx" });
  console.log("ok");
})();
