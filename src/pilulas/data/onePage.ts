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
import { nomeParaCliente } from './nomeArquivo';

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
  fotoVendedor?: string;  // retrato: material com rosto é do vendedor, não da loja
  capa?: string;          // foto de capa (blob: do upload, ou http)
  fotos?: string[];       // galeria do modelo — a 1ª manda na capa
  /** Destaques montados pela gerência a partir do que o time respondeu.
   *  Quando vem, substitui os do código — a frase da rua ganha da de fábrica. */
  destaques?: { titulo: string; prova?: string }[];
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
  const { variante } = d;
  const c = document.createElement('canvas');
  c.width = L;
  c.height = A;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('canvas indisponível');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, L, A);

  // Carrega a galeria de uma vez. A capa do gestor, se existir, entra na frente:
  // foto do pátio da loja vale mais que foto de estúdio da montadora.
  const urls = [d.capa, ...(d.fotos || [])].filter(Boolean) as string[];
  const fotos = (await Promise.all(urls.slice(0, 4).map(carregaImagem))).filter(Boolean) as HTMLImageElement[];

  const hRodape = 236;
  const yRodape = A - hRodape;

  if (variante === 'cliente') {
    desenhaCliente(ctx, d, fotos, yRodape);
  } else {
    desenhaEstudo(ctx, d, fotos[0] || null, yRodape);
  }

  const retrato = d.fotoVendedor ? await carregaImagem(d.fotoVendedor) : null;
  rodape(ctx, d, yRodape, hRodape, retrato);

  // moldura para separar do fundo branco do WhatsApp
  ctx.strokeStyle = '#e6e6ee';
  ctx.lineWidth = 2;
  retanguloArredondado(ctx, 1, 1, L - 2, A - 2, 4);
  ctx.stroke();

  return c;
}

// Preenche a área cortando o excesso — nada de carro esticado.
function cobre(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const escala = Math.max(w / img.width, h / img.height);
  const iw = img.width * escala;
  const ih = img.height * escala;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
  ctx.restore();
}

/**
 * A folha que vai PRO CLIENTE.
 *
 * Aqui vale o oposto do material de estudo: pouca palavra e muita imagem. Quem
 * recebe isso no WhatsApp está decidindo com o olho, não estudando ficha — e
 * parágrafo grande faz ele fechar antes de ler. Por isso o carro ocupa metade
 * da folha, vêm três fotos do que ele vai ver por dentro, e as razões de compra
 * são frases de quatro ou cinco palavras.
 */
function desenhaCliente(ctx: CanvasRenderingContext2D, d: DadosOnePage, fotos: HTMLImageElement[], yRodape: number) {
  const { product: p } = d;

  // O FORMATO "GUIA DO MODELO".
  //
  // Inspirado no guia de produto da Land Rover que a Ramasa usa como
  // referência — mas com uma diferença que decide tudo: aquele é material
  // INTERNO de treinamento, com parágrafo de cinquenta palavras por item.
  // Este vai pro cliente no WhatsApp. Mesma organização (capa, faixa,
  // motivos numerados), um terço do texto.
  //
  // Três faixas: capa grande que faz o cliente parar de rolar, faixa colorida
  // que anuncia o que vem, e a lista numerada com foto por motivo.

  // ---------------------------------------------------------------- capa ---
  const hCapa = 560;
  if (fotos[0]) cobre(ctx, fotos[0], 0, 0, L, hCapa);
  else {
    const gg = ctx.createLinearGradient(0, 0, L, hCapa);
    gg.addColorStop(0, p.gradient[0]);
    gg.addColorStop(1, p.gradient[1]);
    ctx.fillStyle = gg;
    ctx.fillRect(0, 0, L, hCapa);
  }

  // Véu em cima E embaixo: em cima pro cabeçalho branco não sumir num céu
  // claro, embaixo pro nome do carro não sumir num asfalto claro.
  const cima = ctx.createLinearGradient(0, 0, 0, 200);
  cima.addColorStop(0, 'rgba(10,15,25,0.55)');
  cima.addColorStop(1, 'rgba(10,15,25,0)');
  ctx.fillStyle = cima;
  ctx.fillRect(0, 0, L, 200);

  const baixo = ctx.createLinearGradient(0, hCapa - 340, 0, hCapa);
  baixo.addColorStop(0, 'rgba(10,15,25,0)');
  baixo.addColorStop(0.55, 'rgba(10,15,25,0.55)');
  baixo.addColorStop(1, 'rgba(10,15,25,0.95)');
  ctx.fillStyle = baixo;
  ctx.fillRect(0, hCapa - 340, L, 340);

  const mg = 52;
  ctx.fillStyle = 'rgba(157,194,242,0.95)';
  ctx.font = `600 23px ${SANS}`;
  ctx.fillText('GUIA DO MODELO', mg, 64);

  // A marca vai no canto direito, como no guia de referência — e sai do NOME
  // DO CARRO, não da concessionária: "Ramasa · Jaecoo e Omoda" carimbaria
  // JAECOO em cima de um Omoda.
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 40px ${SANS}`;
  ctx.fillText(p.name.split(/\s+/)[0].toUpperCase(), L - mg, 70);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 118px ${SANS}`;
  ctx.fillText(p.name.toUpperCase(), mg, hCapa - 100);

  // A tagline completa é longa demais para uma linha e cortava no meio da
  // frase ("...versões SHS híbridas plug-in, com"). Fica só a primeira
  // afirmação — até os dois-pontos, que é onde o texto vira enumeração.
  ctx.fillStyle = '#d6e2f2';
  ctx.font = `500 31px ${SANS}`;
  const corte = p.tagline.indexOf(':');
  let chamada = corte >= 12 ? p.tagline.slice(0, corte) : p.tagline;
  // Rede de segurança: se ainda não couber numa linha, corta na última palavra
  // inteira e fecha com reticências — melhor curto que cortado no meio.
  const cabe = L - mg * 2;
  if (ctx.measureText(chamada).width > cabe) {
    const ps = chamada.split(' ');
    while (ps.length > 1 && ctx.measureText(ps.join(' ') + '…').width > cabe) ps.pop();
    chamada = ps.join(' ') + '…';
  }
  ctx.fillText(chamada, mg, hCapa - 50);

  // --------------------------------------------------------------- faixa ---
  const hFaixa = 78;
  ctx.fillStyle = d.accent;
  ctx.fillRect(0, hCapa, L, hFaixa);

  const itens = (d.destaques?.length
    ? d.destaques
    : p.destaques?.length
      ? p.destaques
      : p.benefits.map((b) => ({ titulo: b, prova: undefined }))
  ).slice(0, 5);

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 47px ${SANS}`;
  ctx.fillText(`${itens.length} MOTIVOS PARA COMPRAR`, mg, hCapa + 55);

  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.font = `600 21px ${SANS}`;
  ctx.fillText(d.marca.toUpperCase(), L - mg, hCapa + 51);
  ctx.textAlign = 'left';

  // --------------------------------------------------------- os motivos ---
  // Numerados de propósito: no guia de referência o número é o que dá ordem de
  // leitura. Aqui ele também diz qual argumento a gerência pôs em primeiro.
  const yIni = hCapa + hFaixa + 14;
  const alt = (yRodape - 20 - yIni) / Math.max(itens.length, 1);
  const galeria = fotos.slice(1);

  itens.forEach((item, i) => {
    const y0 = yIni + i * alt;
    const meio = y0 + alt / 2;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#d3e1f4';
    ctx.font = `800 86px ${SANS}`;
    ctx.fillText(String(i + 1), mg + 36, meio + 28);
    ctx.textAlign = 'left';

    // A foto do motivo vem da galeria do modelo; sem galeria, o bloco some e o
    // texto ocupa a linha inteira em vez de deixar um buraco.
    const xFoto = mg + 92;
    const lFoto = 212;
    const hFoto = Math.min(128, alt - 26);
    const temFoto = galeria.length > 0;
    if (temFoto) {
      const f = galeria[i % galeria.length];
      ctx.save();
      retanguloArredondado(ctx, xFoto, meio - hFoto / 2, lFoto, hFoto, 10);
      ctx.clip();
      cobre(ctx, f, xFoto, meio - hFoto / 2, lFoto, hFoto);
      ctx.restore();
    }

    const xTxt = temFoto ? xFoto + lFoto + 26 : mg + 84;
    const larg = L - xTxt - mg;

    ctx.fillStyle = '#15152a';
    ctx.font = `700 40px ${SANS}`;
    const fim = escreve(ctx, item.titulo, xTxt, meio - (item.prova ? 16 : 0), larg, 48, 2);

    if (item.prova) {
      ctx.fillStyle = '#5f6b7d';
      ctx.font = `400 27px ${SANS}`;
      escreve(ctx, item.prova, xTxt, fim + 16, larg, 34, 1);
    }

    if (i < itens.length - 1) {
      ctx.strokeStyle = '#e6ecf3';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mg, y0 + alt);
      ctx.lineTo(L - mg, y0 + alt);
      ctx.stroke();
    }
  });
}

/** A folha de ESTUDO — interna, com o que trava a venda e a resposta. */
function desenhaEstudo(ctx: CanvasRenderingContext2D, d: DadosOnePage, foto: HTMLImageElement | null, yRodape: number) {
  const { product: p } = d;
  const alturaTopo = 132;
  const g = ctx.createLinearGradient(0, 0, L, alturaTopo);
  g.addColorStop(0, d.accentDeep);
  g.addColorStop(1, d.accent);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, L, alturaTopo);

  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,.92)';
  ctx.font = `600 26px ${SANS}`;
  ctx.fillText(d.marca.toUpperCase(), M, alturaTopo / 2);
  ctx.font = `700 22px ${SANS}`;
  ctx.textAlign = 'right';
  ctx.fillText('USO INTERNO', L - M, alturaTopo / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Foto é tarja aqui: o espaço vale mais com objeção do que com paisagem.
  const hFoto = foto ? 260 : 150;
  if (foto) cobre(ctx, foto, 0, alturaTopo, L, hFoto);
  else {
    const gg = ctx.createLinearGradient(0, alturaTopo, L, alturaTopo + hFoto);
    gg.addColorStop(0, p.gradient[0]);
    gg.addColorStop(1, p.gradient[1]);
    ctx.fillStyle = gg;
    ctx.fillRect(0, alturaTopo, L, hFoto);
  }

  const limite = yRodape - 60;
  let y = alturaTopo + hFoto + 92;
  ctx.fillStyle = '#12121f';
  ctx.font = `800 68px ${SANS}`;
  y = escreve(ctx, p.name, M, y, L - M * 2, 76, 2);

  ctx.fillStyle = '#5b5b70';
  ctx.font = `400 30px ${SANS}`;
  y = escreve(ctx, p.hook, M, y + 34, L - M * 2, 42, 3);

  y += 56;
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

/** O rodapé — na versão do cliente é o cartão de visita do vendedor. */
function rodape(ctx: CanvasRenderingContext2D, d: DadosOnePage, yRodape: number, hRodape: number, retrato: HTMLImageElement | null) {
  const { product: p, variante } = d;
  // No material do CLIENTE o rodapé é escuro: fecha a folha com o mesmo peso
  // da capa e faz o nome do vendedor saltar. Na folha de ESTUDO continua
  // claro — ela é para ler e anotar, não para impressionar.
  const escuro = variante === 'cliente';
  ctx.fillStyle = escuro ? '#0e1420' : '#f4f4f8';
  ctx.fillRect(0, yRodape, L, hRodape);
  ctx.fillStyle = d.accent;
  ctx.fillRect(0, yRodape, L, 6);

  if (variante === 'cliente') {
    // O retrato é o que transforma isto no material DELE. Material com rosto o
    // cliente associa a uma pessoa; sem rosto, associa à loja — e aí ele liga
    // pra recepção, não pra quem atendeu.
    const temRosto = !!retrato;
    const x = temRosto ? M + 168 : M;
    if (retrato) {
      const dRosto = 132;
      const cx = M + dRosto / 2;
      const cy = yRodape + 118;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, dRosto / 2, 0, Math.PI * 2);
      ctx.clip();
      cobre(ctx, retrato, cx - dRosto / 2, cy - dRosto / 2, dRosto, dRosto);
      ctx.restore();
      ctx.strokeStyle = d.accent;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, dRosto / 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = '#8fb6ea';
    ctx.font = `600 25px ${SANS}`;
    ctx.fillText('FALE COMIGO', x, yRodape + 62);

    ctx.fillStyle = '#ffffff';
    ctx.font = `800 52px ${SANS}`;
    ctx.fillText(d.vendedor || 'Sua consultoria', x, yRodape + 122);

    if (d.whatsapp) {
      ctx.fillStyle = '#a9bdd6';
      ctx.font = `600 39px ${SANS}`;
      ctx.fillText(d.whatsapp, x, yRodape + 174);
    }

    // Sem preço, sem taxa, sem prazo: isso sai da tabela vigente, na loja.
    ctx.fillStyle = '#6d7a8c';
    ctx.font = `400 21px ${SANS}`;
    escreve(ctx, 'Imagens ilustrativas. Versões, itens e disponibilidade sujeitos à campanha vigente.', M, yRodape + 210, L - M * 2, 26, 1);
  } else {
    ctx.fillStyle = '#12121f';
    ctx.font = `700 30px ${SANS}`;
    escreve(ctx, p.salesLine, M, yRodape + 74, L - M * 2, 40, 2);
    ctx.fillStyle = '#8a8a9e';
    ctx.font = `400 21px ${SANS}`;
    escreve(ctx, p.compliance || 'Confirme ficha, condição e prazo antes de falar número com o cliente.', M, yRodape + 178, L - M * 2, 28, 2);
  }

  ctx.fillStyle = '#b9b9c8';
  ctx.font = `700 20px ${SANS}`;
  ctx.textAlign = 'right';
  ctx.fillText('eleva', L - M, yRodape + 62);
  ctx.textAlign = 'left';
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
  pdf: Blob;
  nome: string; // sem extensão
}

export async function gerarMaterial(d: DadosOnePage): Promise<Material> {
  const c = await desenharOnePage(d);
  const pdf = await montaPdf(c);
  // Sai em CAIXA ALTA: é o nome que aparece no WhatsApp do cliente. Antes era
  // um slug — "jaecoo-7-shs-p.pdf" — que entrega que o arquivo saiu de uma
  // ferramenta, não da concessionária.
  return { pdf, nome: nomeParaCliente(d.product.name, d.variante === 'estudo' && 'uso interno') };
}

/**
 * Manda o material. No celular usa o compartilhar do sistema (WhatsApp, e-mail,
 * AirDrop) com o ARQUIVO em anexo; no computador, baixa. O texto vai junto pra
 * pessoa não ter que escrever nada.
 */
export async function compartilharMaterial(m: Material, texto: string): Promise<'compartilhou' | 'baixou'> {
  // SÓ O PDF. Antes iam os dois — a imagem e o PDF — e o cliente recebia a
  // mesma folha duas vezes, uma como foto e outra como anexo. O PDF já mostra
  // a folha em miniatura na conversa, então a imagem não acrescentava nada:
  // dobrava o peso e fazia o vendedor parecer desorganizado.
  const arquivos = [
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
