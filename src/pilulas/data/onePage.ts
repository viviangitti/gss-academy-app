// O ONE-PAGE que o vendedor manda pro cliente.
//
// É o material que faz o vendedor querer abrir o app: sai com O NOME E O
// WHATSAPP DELE. Vira o cartão de visita dele, não um panfleto da loja — é a
// resposta pra "por que eu usaria isso em vez de mandar o link do site?".
//
// Duas saídas do MESMO desenho, porque o WhatsApp trata os dois diferente:
//   - IMAGEM: abre na conversa, sem tocar em nada. É o que chama atenção.
//   - PDF: o cliente salva, imprime, leva pra mesa da esposa/marido.
//
// Duas versões do MESMO dado (a ideia de um gerador só, duas roupas):
//   - 'cliente' → benefício, sem número que a loja não possa cumprir
//   - 'estudo'  → interno, com as objeções e a resposta pronta
//
// Desenhado em <canvas> de propósito: dá controle total de tipografia e não
// depende de biblioteca nova (o app não tem nenhuma de PDF, e não vale carregar
// meio mega no celular do vendedor por causa disso).
import type { Product } from './products';

export type Variante = 'cliente' | 'estudo';

// A4 a 150 dpi. Boa impressão e arquivo que sobe rápido no 4G do showroom.
const L = 1240;
const A = 1754;
const M = 96; // margem

export interface DadosOnePage {
  product: Product;
  variante: Variante;
  marca: string;          // "Ramasa · Jaecoo e Omoda"
  vendedor?: string;
  whatsapp?: string;
  capa?: string;          // URL da foto (blob: do upload, ou http)
  accent: string;
  accentDeep: string;
}

// ---------------------------------------------------------------- desenho ---

function carregaImagem(url: string): Promise<HTMLImageElement | null> {
  return new Promise((ok) => {
    const img = new Image();
    // Sem isso, foto de outro domínio "suja" o canvas e o export falha. Com
    // isso, se o servidor não liberar, a imagem não carrega — e a gente cai no
    // desenho sem foto, que também é bonito. Melhor sem foto do que sem arquivo.
    img.crossOrigin = 'anonymous';
    img.onload = () => ok(img);
    img.onerror = () => ok(null);
    img.src = url;
  });
}

/** Quebra o texto na largura dada e devolve as linhas. */
function linhas(ctx: CanvasRenderingContext2D, texto: string, largura: number): string[] {
  const palavras = texto.split(/\s+/);
  const out: string[] = [];
  let atual = '';
  for (const p of palavras) {
    const tenta = atual ? `${atual} ${p}` : p;
    if (ctx.measureText(tenta).width > largura && atual) {
      out.push(atual);
      atual = p;
    } else atual = tenta;
  }
  if (atual) out.push(atual);
  return out;
}

function escreve(
  ctx: CanvasRenderingContext2D,
  texto: string,
  x: number,
  y: number,
  largura: number,
  alturaLinha: number,
  maxLinhas = 99
): number {
  const ls = linhas(ctx, texto, largura).slice(0, maxLinhas);
  ls.forEach((l, i) => ctx.fillText(l, x, y + i * alturaLinha));
  return y + ls.length * alturaLinha;
}

function retanguloArredondado(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export async function desenharOnePage(d: DadosOnePage): Promise<HTMLCanvasElement> {
  const { product: p, variante } = d;
  const c = document.createElement('canvas');
  c.width = L;
  c.height = A;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('canvas indisponível');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, L, A);

  // ---- topo: faixa da marca ----
  const alturaTopo = 132;
  const g = ctx.createLinearGradient(0, 0, L, alturaTopo);
  g.addColorStop(0, d.accentDeep);
  g.addColorStop(1, d.accent);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, L, alturaTopo);

  ctx.fillStyle = 'rgba(255,255,255,.92)';
  ctx.font = `600 26px ${SANS}`;
  ctx.textBaseline = 'middle';
  ctx.fillText(d.marca.toUpperCase(), M, alturaTopo / 2);

  if (variante === 'estudo') {
    ctx.font = `700 22px ${SANS}`;
    ctx.textAlign = 'right';
    ctx.fillText('USO INTERNO', L - M, alturaTopo / 2);
    ctx.textAlign = 'left';
  }
  ctx.textBaseline = 'alphabetic';

  // ---- foto do carro ----
  // Sem foto a faixa fica MENOR: um bloco gigante de gradiente vazio só empurra
  // o conteúdo pro rodapé. O nome do modelo aparece uma vez só, embaixo — antes
  // saía dentro da faixa E no título, e ficava repetido.
  const yFoto = alturaTopo;
  const img = d.capa ? await carregaImagem(d.capa) : null;
  // A foto grande é da versão do CLIENTE — é ela que precisa ser bonita. Na de
  // estudo a foto vira uma tarja: o espaço vale mais com objeção do que com
  // paisagem, e com a foto grande só cabia UMA objeção na folha.
  const hFoto = !img ? 210 : variante === 'estudo' ? 260 : 620;
  if (img) {
    // cobre a área toda mantendo a proporção (nada de carro esticado)
    const escala = Math.max(L / img.width, hFoto / img.height);
    const w = img.width * escala;
    const h = img.height * escala;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, yFoto, L, hFoto);
    ctx.clip();
    ctx.drawImage(img, (L - w) / 2, yFoto + (hFoto - h) / 2, w, h);
    ctx.restore();
  } else {
    const gg = ctx.createLinearGradient(0, yFoto, L, yFoto + hFoto);
    gg.addColorStop(0, p.gradient[0]);
    gg.addColorStop(1, p.gradient[1]);
    ctx.fillStyle = gg;
    ctx.fillRect(0, yFoto, L, hFoto);
  }

  // ---- nome + posicionamento ----
  const hRodape = 236;
  const yRodape = A - hRodape;
  const limite = yRodape - 60; // nada é desenhado depois daqui: nunca invade o rodapé
  let y = yFoto + hFoto + 92;
  ctx.fillStyle = '#12121f';
  ctx.font = `800 68px ${SANS}`;
  y = escreve(ctx, p.name, M, y, L - M * 2, 76, 2);

  ctx.fillStyle = '#5b5b70';
  ctx.font = `400 30px ${SANS}`;
  y = escreve(ctx, variante === 'estudo' ? p.hook : p.tagline, M, y + 34, L - M * 2, 42, 3);

  // ---- miolo ----
  y += 56;
  if (variante === 'cliente') {
    ctx.fillStyle = d.accentDeep;
    ctx.font = `700 22px ${SANS}`;
    ctx.fillText('POR QUE ELE', M, y);
    y += 46;

    for (const b of p.benefits.slice(0, 4)) {
      // Cabe? Se não couber inteiro, para — melhor três benefícios completos do
      // que quatro com o último cortado pela metade.
      if (y + 84 > limite) break;
      ctx.fillStyle = d.accent;
      ctx.beginPath();
      ctx.arc(M + 9, y - 10, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#25253a';
      ctx.font = `500 30px ${SANS}`;
      y = escreve(ctx, b, M + 38, y, L - M * 2 - 38, 42, 3) + 26;
    }
  } else {
    // Versão de estudo: o que trava a venda e como responder.
    ctx.fillStyle = d.accentDeep;
    ctx.font = `700 22px ${SANS}`;
    ctx.fillText('O QUE TRAVA A VENDA — E A RESPOSTA', M, y);
    y += 46;

    for (const o of p.objections.slice(0, 3)) {
      if (y + 150 > limite) break;
      ctx.fillStyle = '#12121f';
      ctx.font = `700 28px ${SANS}`;
      y = escreve(ctx, o.trigger, M, y, L - M * 2, 38, 2) + 10;
      ctx.fillStyle = '#5b5b70';
      ctx.font = `400 26px ${SANS}`;
      y = escreve(ctx, o.answer, M, y, L - M * 2, 36, 4) + 34;
    }
  }

  // ---- rodapé: o vendedor ----
  ctx.fillStyle = '#f4f4f8';
  ctx.fillRect(0, yRodape, L, hRodape);
  ctx.fillStyle = d.accent;
  ctx.fillRect(0, yRodape, L, 6);

  if (variante === 'cliente') {
    ctx.fillStyle = '#8a8a9e';
    ctx.font = `600 22px ${SANS}`;
    ctx.fillText('FALE COMIGO', M, yRodape + 62);

    ctx.fillStyle = '#12121f';
    ctx.font = `800 44px ${SANS}`;
    ctx.fillText(d.vendedor || 'Sua consultoria', M, yRodape + 118);

    if (d.whatsapp) {
      ctx.fillStyle = d.accentDeep;
      ctx.font = `600 34px ${SANS}`;
      ctx.fillText(d.whatsapp, M, yRodape + 168);
    }

    // Sem preço, sem taxa, sem prazo: isso sai da tabela vigente, na loja.
    ctx.fillStyle = '#8a8a9e';
    ctx.font = `400 21px ${SANS}`;
    escreve(ctx, 'Condições, versões e disponibilidade sujeitas à campanha vigente. Consulte-me para a proposta atualizada.', M, yRodape + 210, L - M * 2, 26, 1);
  } else {
    ctx.fillStyle = '#12121f';
    ctx.font = `700 30px ${SANS}`;
    escreve(ctx, p.salesLine, M, yRodape + 74, L - M * 2, 40, 2);
    ctx.fillStyle = '#8a8a9e';
    ctx.font = `400 21px ${SANS}`;
    escreve(ctx, p.compliance || 'Confirme ficha, condição e prazo antes de falar número com o cliente.', M, yRodape + 178, L - M * 2, 28, 2);
  }

  // marca do app, discreta
  ctx.fillStyle = '#b9b9c8';
  ctx.font = `700 20px ${SANS}`;
  ctx.textAlign = 'right';
  ctx.fillText('eleva', L - M, yRodape + 62);
  ctx.textAlign = 'left';

  // moldura para separar do fundo branco do WhatsApp
  ctx.strokeStyle = '#e6e6ee';
  ctx.lineWidth = 2;
  retanguloArredondado(ctx, 1, 1, L - 2, A - 2, 4);
  ctx.stroke();

  return c;
}

// -------------------------------------------------------------------- PDF ---

function paraBlob(c: HTMLCanvasElement, tipo: string, q?: number): Promise<Blob> {
  return new Promise((ok, falhou) => {
    c.toBlob((b) => (b ? ok(b) : falhou(new Error('export falhou'))), tipo, q);
  });
}

/**
 * PDF de uma página com a imagem ocupando o A4 inteiro.
 *
 * Montado à mão de propósito: uma biblioteca de PDF custa centenas de KB no
 * celular do vendedor, e aqui o documento é sempre o mesmo — uma página, uma
 * imagem. O que exige cuidado é o `xref`: as posições são em BYTES, então tudo
 * é montado em Uint8Array (contar caractere quebraria com acento).
 */
async function montaPdf(c: HTMLCanvasElement): Promise<Blob> {
  const jpeg = new Uint8Array(await (await paraBlob(c, 'image/jpeg', 0.92)).arrayBuffer());
  const LARG = 595.28, ALT = 841.89; // A4 em pontos

  const enc = new TextEncoder();
  const partes: Uint8Array[] = [];
  const posicoes: number[] = [];
  let total = 0;
  const put = (x: Uint8Array | string) => {
    const b = typeof x === 'string' ? enc.encode(x) : x;
    partes.push(b);
    total += b.length;
  };
  const objeto = (n: number, corpo: string) => {
    posicoes[n] = total;
    put(`${n} 0 obj\n${corpo}\nendobj\n`);
  };

  put('%PDF-1.4\n');
  objeto(1, '<< /Type /Catalog /Pages 2 0 R >>');
  objeto(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  objeto(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${LARG} ${ALT}] `
    + '/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');

  posicoes[4] = total;
  put(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${c.width} /Height ${c.height} `
    + `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
  put(jpeg);
  put('\nendstream\nendobj\n');

  const conteudo = `q ${LARG} 0 0 ${ALT} 0 0 cm /Im0 Do Q`;
  objeto(5, `<< /Length ${conteudo.length} >>\nstream\n${conteudo}\nendstream`);

  const inicioXref = total;
  let xref = 'xref\n0 6\n0000000000 65535 f \n';
  for (let i = 1; i <= 5; i += 1) xref += `${String(posicoes[i]).padStart(10, '0')} 00000 n \n`;
  put(xref);
  put(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF\n`);

  return new Blob(partes as BlobPart[], { type: 'application/pdf' });
}

export interface Material {
  imagem: Blob;
  pdf: Blob;
  nome: string; // sem extensão
}

export async function gerarMaterial(d: DadosOnePage): Promise<Material> {
  const c = await desenharOnePage(d);
  const [imagem, pdf] = await Promise.all([paraBlob(c, 'image/jpeg', 0.9), montaPdf(c)]);
  const base = d.product.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
  return { imagem, pdf, nome: d.variante === 'estudo' ? `${base}-estudo` : base };
}

/**
 * Manda o material. No celular usa o compartilhar do sistema (WhatsApp, e-mail,
 * AirDrop) com o ARQUIVO em anexo; no computador, baixa. O texto vai junto pra
 * pessoa não ter que escrever nada.
 */
export async function compartilharMaterial(m: Material, texto: string): Promise<'compartilhou' | 'baixou'> {
  const arquivos = [
    new File([m.imagem], `${m.nome}.jpg`, { type: 'image/jpeg' }),
    new File([m.pdf], `${m.nome}.pdf`, { type: 'application/pdf' }),
  ];
  const nav = navigator as Navigator & { canShare?: (d: { files?: File[] }) => boolean };
  if (nav.share && nav.canShare?.({ files: arquivos })) {
    try {
      await nav.share({ files: arquivos, text: texto });
      return 'compartilhou';
    } catch {
      /* cancelou ou não deixou: cai no download */
    }
  }
  for (const f of arquivos) {
    const url = URL.createObjectURL(f);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  return 'baixou';
}
