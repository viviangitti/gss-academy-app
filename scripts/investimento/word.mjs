// A MESMA FOLHA DE INVESTIMENTO, EM WORD — para a Vivian editar.
//
// O PDF (gera.mjs) é o que se manda. Este é o que se MEXE: ela abre, muda um
// número, apaga um parágrafo. Por isso o conteúdo vive nos dados abaixo, e não
// no HTML — os dois nasceram do mesmo texto, mas o Word precisa de tabela de
// verdade, não de CSS.
//
//   node scripts/investimento/word.mjs      → .docx em ~/Downloads
//
// Fonte Arial de propósito: o Mac da Vivian não tem Office, e Calibri/Cambria
// viram outra coisa no Pages (ver a memória "PPTX abre no Keynote").
import fs from 'fs';
import path from 'path';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, PageBreak,
  WidthType, ShadingType, BorderStyle, AlignmentType, HeadingLevel, VerticalAlign,
} from 'docx';

const NAVY = '0F0F1E';
const OURO = 'C9A84C';
const OURO_ESCURO = '97741F';
const TINTA = '1A1A2E';
const CINZA = '6B7385';
const CINZA_CLARO = '8A93A6';
const LINHA = 'EEF1F6';
const FUNDO = 'F7F9FC';
const FUNDO2 = 'F2F4F8';

const LARGURA = 9638; // A4 menos as margens, em DXA

// ── peças pequenas ────────────────────────────────────────────────────────────
const semBorda = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const SEM_BORDAS = { top: semBorda, bottom: semBorda, left: semBorda, right: semBorda,
  insideHorizontal: semBorda, insideVertical: semBorda };

/**
 * O espaco depois de "R$" e "US$" vira nao-separavel.
 *
 * Sem isso o Word quebra a linha entre o cifrao e o numero — "por acessorio ·
 * R$" numa linha e "2.430" na outra. Fica no txt() porque vale para TODO texto
 * do documento, inclusive o que ainda nao foi escrito.
 */
function colado(s) {
  return String(s).replace(/(R\$|US\$) /g, '$1\u00A0');
}

function txt(texto, o = {}) {
  return new TextRun({
    text: colado(texto), font: 'Arial', size: o.size ?? 19, bold: o.bold, italics: o.italics,
    color: o.color ?? TINTA, allCaps: o.caps, characterSpacing: o.spacing,
  });
}
function p(texto, o = {}) {
  return new Paragraph({
    children: Array.isArray(texto) ? texto : [txt(texto, o)],
    alignment: o.align, spacing: { before: o.antes ?? 0, after: o.depois ?? 80, line: o.linha ?? 250 },
    bullet: o.bullet ? { level: 0 } : undefined,
    numbering: o.numeracao,
    keepNext: o.junto,
  });
}
/** Texto com pedaços em negrito: "o app tem **dono**" → runs. */
function rico(s, o = {}) {
  return s.split('**').map((pedaco, i) => txt(pedaco, { ...o, bold: i % 2 === 1 }));
}
function celula(filhos, o = {}) {
  return new TableCell({
    children: filhos,
    width: { size: o.largura, type: WidthType.DXA },
    shading: o.fundo ? { type: ShadingType.CLEAR, fill: o.fundo, color: 'auto' } : undefined,
    columnSpan: o.span,
    verticalAlign: o.meio ? VerticalAlign.CENTER : undefined,
    margins: { top: o.mt ?? 90, bottom: o.mb ?? 90, left: o.ml ?? 100, right: o.mr ?? 100 },
    borders: o.bordas,
  });
}
function tabela(linhas, larguras, o = {}) {
  return new Table({
    rows: linhas,
    columnWidths: larguras,
    width: { size: larguras.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    borders: o.bordas ?? {
      ...SEM_BORDAS,
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: LINHA },
    },
  });
}

/** Título de seção. */
function h2(texto, sub) {
  const saida = [new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 380, after: sub ? 40 : 140 },
    children: [txt(texto, { size: 26, bold: true, color: TINTA })],
    keepNext: true,
  })];
  if (sub) saida.push(p(sub, { size: 17, color: CINZA, depois: 140, junto: true }));
  return saida;
}

/** Caixa de recado: fundo claro e um traço dourado na esquerda. */
function nota(paragrafos, escura = false) {
  const fundo = escura ? NAVY : FUNDO;
  return tabela([
    new TableRow({
      children: [celula(paragrafos, {
        largura: LARGURA, fundo, mt: 150, mb: 150, ml: 200, mr: 200,
        bordas: {
          top: semBorda, bottom: semBorda, right: semBorda,
          left: { style: BorderStyle.SINGLE, size: 18, color: OURO },
        },
      })],
    }),
  ], [LARGURA], { bordas: SEM_BORDAS });
}
function notaP(texto, escura = false) {
  return p(rico(texto, { size: 17, color: escura ? 'D5D8E6' : '38405A' }), { depois: 0, linha: 270 });
}

/** Cabeçalho de tabela que se repete quando ela passa de página. */
function cabecalho(titulos, larguras) {
  return new TableRow({
    tableHeader: true,
    children: titulos.map((t, i) => celula(
      [p(t.texto, { size: 13, bold: true, color: CINZA_CLARO, caps: true, spacing: 18,
        align: t.dir ? AlignmentType.RIGHT : undefined, depois: 0 })],
      { largura: larguras[i] },
    )),
  });
}
/** Faixa preta que separa os grupos de uma tabela. */
function faixa(texto, larguras) {
  return new TableRow({
    children: [celula([p(texto, { size: 13, bold: true, color: OURO, caps: true, spacing: 22, depois: 0 })],
      { largura: larguras.reduce((a, b) => a + b, 0), fundo: NAVY, span: larguras.length, mt: 70, mb: 70 })],
  });
}

export { colado, NAVY, OURO, OURO_ESCURO, TINTA, CINZA, CINZA_CLARO, LINHA, FUNDO, FUNDO2, LARGURA,
  SEM_BORDAS, semBorda, txt, p, rico, celula, tabela, h2, nota, notaP, cabecalho, faixa,
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, PageBreak, WidthType, ShadingType,
  BorderStyle, AlignmentType, HeadingLevel, VerticalAlign, fs, path };
