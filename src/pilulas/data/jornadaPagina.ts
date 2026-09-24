// A FOLHA DA ETAPA — o one page que não é de carro.
//
// A jornada tem etapas cujo material não existe no catálogo: "como vai
// funcionar o seu atendimento", "o que acontece na sua visita", "o que ficou
// combinado". O gerador do carro (onePage.ts) precisa de um Product e monta
// capa, versões e destaques — não serve para texto puro.
//
// Esta folha usa os MESMOS ajudantes de canvas, o MESMO A4 e o MESMO rodapé
// com o rosto e o WhatsApp de quem atende. O cliente recebe as duas peças com
// a mesma cara: quem manda é a pessoa, não a loja.
//
// Regra que vale para tudo o que sai daqui: nenhum preço, taxa ou prazo de
// pagamento. Número vai só na tabela oficial que a gerência publica.
import { montaPdf, compartilharMaterial, salvarMaterial, carregaImagem, cobre, escreve, retanguloArredondado, SANS } from './onePage';
import { nomeParaCliente } from './nomeArquivo';

// A4 a 150 dpi, igual ao material do carro.
const L = 1240;
const A = 1754;
const M = 96;

export interface BlocoPagina {
  titulo: string;
  itens: string[];
}

export interface DadosPagina {
  titulo: string;
  linha: string;
  blocos: BlocoPagina[];
  rodape?: string;
  marca: string;
  /** A loja de quem atende ("Tiger Omoda"). É o nome grande no topo. */
  loja?: string;
  accent: string;
  accentDeep: string;
  vendedor?: string;
  whatsapp?: string;
  fotoVendedor?: string;
}

function cartaoDoVendedor(
  ctx: CanvasRenderingContext2D,
  d: DadosPagina,
  yRodape: number,
  hRodape: number,
  retrato: HTMLImageElement | null,
) {
  ctx.fillStyle = '#0e1420';
  ctx.fillRect(0, yRodape, L, hRodape);
  ctx.fillStyle = d.accent;
  ctx.fillRect(0, yRodape, L, 6);

  const x = retrato ? M + 168 : M;
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

  // O mesmo azul claro do rodapé do material do carro: as duas folhas chegam
  // no mesmo WhatsApp, no mesmo dia, e precisam parecer a mesma coisa.
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

  ctx.fillStyle = '#6d7a8c';
  ctx.font = `400 21px ${SANS}`;
  escreve(ctx, 'Imagens ilustrativas. Versões, itens e disponibilidade sujeitos à campanha vigente.', M, yRodape + 210, L - M * 2, 26, 1);

  ctx.fillStyle = '#b9b9c8';
  ctx.font = `700 20px ${SANS}`;
  ctx.textAlign = 'right';
  ctx.fillText('eleva', L - M, yRodape + 62);
  ctx.textAlign = 'left';
}

export async function desenharPagina(d: DadosPagina): Promise<HTMLCanvasElement> {
  const c = document.createElement('canvas');
  c.width = L;
  c.height = A;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('canvas indisponível');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, L, A);

  // Capa sem foto: a etapa fala de atendimento, não de carro. O peso vem da
  // cor da marca, para a folha não parecer um documento de escritório.
  const hCapa = 430;
  const grad = ctx.createLinearGradient(0, 0, L, hCapa);
  grad.addColorStop(0, d.accentDeep);
  grad.addColorStop(1, d.accent);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, L, hCapa);

  // A loja em cima e grande: é o nome que o cliente reconhece. A marca do
  // grupo vem embaixo, menor. Antes os dois dividiam uma linha de 24px e a
  // folha chegava sem dono — parecia material genérico de montadora.
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 52px ${SANS}`;
  ctx.fillText((d.loja || d.marca.split('·')[0].trim()).toUpperCase(), M, 132);

  ctx.fillStyle = 'rgba(255,255,255,.75)';
  ctx.font = `600 26px ${SANS}`;
  ctx.fillText(d.marca, M, 178);

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 60px ${SANS}`;
  escreve(ctx, d.titulo, M, 280, L - M * 2, 70, 2);

  const hRodape = 236;
  const yRodape = A - hRodape;

  // A linha de apoio saiu de dentro da capa: com o nome da loja grande, ela
  // não cabia mais lá sem encostar no título.
  ctx.fillStyle = '#5a6478';
  ctx.font = `400 29px ${SANS}`;
  let y = escreve(ctx, d.linha, M, hCapa + 68, L - M * 2, 40, 2) + 54;

  for (const b of d.blocos.slice(0, 4)) {
    // Não invade o rodapé: melhor uma folha com três blocos do que texto
    // passando por cima do contato do vendedor.
    if (y > yRodape - 190) break;

    ctx.fillStyle = d.accentDeep;
    ctx.font = `800 29px ${SANS}`;
    ctx.fillText(b.titulo.toUpperCase(), M, y);
    y += 18;
    ctx.fillStyle = '#e8ecf5';
    ctx.fillRect(M, y, L - M * 2, 2);
    y += 46;

    for (const it of b.itens.slice(0, 5)) {
      if (y > yRodape - 70) break;
      ctx.fillStyle = d.accent;
      ctx.beginPath();
      ctx.arc(M + 9, y - 10, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#20242e';
      ctx.font = `400 29px ${SANS}`;
      y = escreve(ctx, it, M + 42, y, L - M * 2 - 42, 40, 3) + 18;
    }
    y += 26;
  }

  if (d.rodape && y < yRodape - 70) {
    ctx.fillStyle = '#5a6478';
    ctx.font = `600 26px ${SANS}`;
    escreve(ctx, d.rodape, M, y + 8, L - M * 2, 34, 2);
  }

  const retrato = d.fotoVendedor ? await carregaImagem(d.fotoVendedor) : null;
  cartaoDoVendedor(ctx, d, yRodape, hRodape, retrato);

  // Moldura: separa a folha do fundo branco da conversa.
  ctx.strokeStyle = '#e6e6ee';
  ctx.lineWidth = 2;
  retanguloArredondado(ctx, 1, 1, L - 2, A - 2, 4);
  ctx.stroke();

  return c;
}

/** Monta e manda. Devolve 'compartilhou' no celular e 'baixou' no computador. */
export async function mandarPagina(
  d: DadosPagina,
  texto: string,
  /** 'salvar' baixa direto, sem abrir o compartilhar do sistema. */
  modo: 'mandar' | 'salvar' = 'mandar',
): Promise<'compartilhou' | 'baixou'> {
  const c = await desenharPagina(d);
  const pdf = await montaPdf(c);
  const material = { pdf, nome: nomeParaCliente(d.titulo) };
  return modo === 'salvar' ? salvarMaterial(material) : compartilharMaterial(material, texto);
}
