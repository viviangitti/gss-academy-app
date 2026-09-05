import { useEffect, useRef, useState } from 'react';
import { Download, Share2, Check, X, Image as ImageIcon } from 'lucide-react';
import { findProduct, getProductImageUrl } from './data/store';
import { nomeParaCliente } from './data/nomeArquivo';
import type { Condicao } from './data/condicoes';
import { getBrand, type BrandId } from './data/brands';

// A ARTE QUE VAI PRO CLIENTE.
//
// Nasceu de um anúncio da Zeekr que a Vivian mandou: foto do carro, três
// destaques e uma chamada. Nada de entrada, de trade-in, de rebate.
//
// O QUE ESTA TELA NÃO LÊ, e é a razão de ela existir assim: `resumo` e
// `observacao` da condição. São o miolo da folha — taxa por versão, piso de
// FIPE, prazo de DMS, rebate da rede — e a folha inteira é carimbada USO
// INTERNO pela montadora. Não é uma decisão de layout: o gerador não recebe
// esses campos, então não há caminho por onde eles escapem.
//
// O que entra:
//   - a CHAMADA que a gerência aprovou (campo `chamada` da condição);
//   - o modelo, a foto e os destaques do catálogo — material de marketing;
//   - a validade, que é a data que já está na folha;
//   - a assinatura da loja e o aviso de que a condição se confirma na loja.
//
// PREÇO NÃO ENTRA. O anúncio que inspirou tem "a partir de R$ 378.000", mas a
// regra da casa é que preço não sai em nada que vá pro cliente. Se um dia
// mudar, é um campo — não é uma reescrita.

const W = 1080;
const H = 1350;

/** Quebra o texto em linhas que cabem na largura, e devolve quantas usou. */
function linhas(ctx: CanvasRenderingContext2D, texto: string, largura: number): string[] {
  const palavras = texto.split(/\s+/);
  const out: string[] = [];
  let atual = '';
  for (const p of palavras) {
    const teste = atual ? `${atual} ${p}` : p;
    if (ctx.measureText(teste).width > largura && atual) {
      out.push(atual);
      atual = p;
    } else {
      atual = teste;
    }
  }
  if (atual) out.push(atual);
  return out;
}

function retanguloRedondo(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Desenha a imagem preenchendo a área, cortando o excesso (como object-fit: cover). */
function cobrir(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const escala = Math.max(w / img.width, h / img.height);
  const lw = img.width * escala;
  const lh = img.height * escala;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, x + (w - lw) / 2, y + (h - lh) / 2, lw, lh);
  ctx.restore();
}

function carregar(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export interface DadosArte {
  modelo: string;
  chamada: string;
  destaques: string[];
  validade: string;
  loja: string;
  foto?: string;
}

async function desenhar(canvas: HTMLCanvasElement, d: DadosArte) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Fundo escuro. A foto entra por cima, e o degradê por cima dela — é o que
  // faz o texto ficar legível em qualquer foto, clara ou escura.
  ctx.fillStyle = '#0d0d18';
  ctx.fillRect(0, 0, W, H);

  const img = d.foto ? await carregar(d.foto) : null;
  if (img) {
    cobrir(ctx, img, 0, 0, W, Math.round(H * 0.62));
    const g = ctx.createLinearGradient(0, 0, 0, H * 0.62);
    g.addColorStop(0, 'rgba(13,13,24,0.55)');
    g.addColorStop(0.45, 'rgba(13,13,24,0.12)');
    g.addColorStop(1, 'rgba(13,13,24,1)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, Math.round(H * 0.62));
  } else {
    const g = ctx.createLinearGradient(0, 0, W, H * 0.62);
    g.addColorStop(0, '#232344');
    g.addColorStop(1, '#0d0d18');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, Math.round(H * 0.62));
  }

  // Assinatura da loja, no alto
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.font = '700 26px Arial, sans-serif';
  ctx.letterSpacing = '6px';
  ctx.fillText(d.loja.toLocaleUpperCase('pt-BR').slice(0, 34), 70, 92);
  ctx.letterSpacing = '0px';

  // Nome do modelo — o maior elemento da peça
  ctx.fillStyle = '#fff';
  ctx.font = '800 82px Arial, sans-serif';
  const nomeLinhas = linhas(ctx, d.modelo.toLocaleUpperCase('pt-BR'), W - 140);
  let y = Math.round(H * 0.62) - 40 - (nomeLinhas.length - 1) * 88;
  for (const l of nomeLinhas) {
    ctx.fillText(l, 70, y);
    y += 88;
  }

  // A CHAMADA aprovada — a única frase da condição que sai daqui
  y = Math.round(H * 0.62) + 66;
  ctx.fillStyle = '#4b8dff';
  ctx.font = '800 54px Arial, sans-serif';
  for (const l of linhas(ctx, d.chamada, W - 140)) {
    ctx.fillText(l, 70, y);
    y += 62;
  }

  // Três destaques, em cartões — como no anúncio que serviu de referência
  const usados = d.destaques.filter(Boolean).slice(0, 3);
  if (usados.length) {
    const larg = (W - 140 - (usados.length - 1) * 18) / usados.length;
    const topo = y + 26;
    const alt = 168;
    usados.forEach((texto, i) => {
      const x = 70 + i * (larg + 18);
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      retanguloRedondo(ctx, x, topo, larg, alt, 18);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.font = '700 25px Arial, sans-serif';
      ctx.textAlign = 'center';
      const ls = linhas(ctx, texto, larg - 32).slice(0, 4);
      let ty = topo + alt / 2 - ((ls.length - 1) * 30) / 2 + 9;
      for (const l of ls) {
        ctx.fillText(l, x + larg / 2, ty);
        ty += 30;
      }
      ctx.textAlign = 'left';
    });
    y = topo + alt;
  }

  // Rodapé: validade e o aviso que evita promessa. A condição se confirma na
  // loja — a arte convida, não fecha negócio.
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '400 23px Arial, sans-serif';
  const rodape = [
    d.validade,
    'Condição sujeita a análise de crédito e disponibilidade de estoque. Consulte condições na loja.',
  ].filter(Boolean);
  let fy = H - 62 - (rodape.length - 1) * 32;
  for (const linha of rodape) {
    for (const l of linhas(ctx, linha, W - 140).slice(0, 2)) {
      ctx.fillText(l, 70, fy);
      fy += 32;
    }
  }
}

export function dadosDaArte(c: Condicao, brandId: BrandId): DadosArte | null {
  if (!c.chamada?.trim()) return null;
  const p = c.produtoId ? findProduct(c.produtoId) : null;
  return {
    modelo: p?.name || c.titulo.replace(/^Carta de \w+ · /i, '').replace(/\s*\(.*\)\s*$/, ''),
    chamada: c.chamada.trim(),
    // Os destaques são material de marketing, revisado — é o que a montadora
    // já publica. `resumo` e `observacao` não passam nem perto daqui.
    destaques: (p?.destaques || []).map((d) => d.titulo).slice(0, 3),
    validade: c.venceEm ? `Oferta válida até ${c.venceEm.split('-').reverse().join('/')}.` : '',
    loja: getBrand(brandId).name,
    foto: (p && (getProductImageUrl(p.id) || p.imageUrl || p.fotos?.[0])) || undefined,
  };
}

export default function ArteCondicao({ dados, onFechar }: { dados: DadosArte; onFechar: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [feito, setFeito] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let vivo = true;
    if (ref.current) desenhar(ref.current, dados).then(() => { if (vivo) setPronto(true); });
    return () => { vivo = false; };
  }, [dados]);

  const arquivo = `${nomeParaCliente(dados.modelo, 'oferta')}.png`;

  const paraBlob = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      const c = ref.current;
      if (!c) return resolve(null);
      c.toBlob((b) => resolve(b), 'image/png');
    });

  const baixar = async () => {
    const b = await paraBlob();
    if (!b) return;
    const url = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = url;
    a.download = arquivo;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const enviar = async () => {
    const b = await paraBlob();
    if (!b) return baixar();
    const f = new File([b], arquivo, { type: 'image/png' });
    const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean };
    if (nav.canShare?.({ files: [f] })) {
      try {
        await navigator.share({ files: [f], title: dados.modelo, text: `${dados.modelo} — ${dados.chamada}` });
        setFeito(true);
        setTimeout(() => setFeito(false), 1600);
        return;
      } catch { /* cancelou */ }
    }
    baixar();
  };

  return (
    <div className="wp-arte-lb" role="dialog" aria-label={`Arte de ${dados.modelo}`}>
      <button type="button" className="wp-cond-lb-x" aria-label="Fechar" onClick={onFechar}>
        <X size={20} className="wp-ico" />
      </button>
      <div className="wp-arte-corpo" onClick={(e) => e.stopPropagation()}>
        <canvas ref={ref} className="wp-arte-canvas" />
        <p className="wp-arte-nota">
          Só o que pode ser anunciado. Entrada, bônus de troca e rebate ficam na folha interna.
        </p>
        <div className="wp-arte-acoes">
          <button type="button" className="wp-arte-btn wp-arte-btn-main" disabled={!pronto} onClick={enviar}>
            {feito ? <><Check size={16} className="wp-ico" /> Enviado</> : <><Share2 size={16} className="wp-ico" /> Enviar ao cliente</>}
          </button>
          <button type="button" className="wp-arte-btn" disabled={!pronto} onClick={baixar}>
            <Download size={16} className="wp-ico" /> Baixar
          </button>
        </div>
      </div>
    </div>
  );
}

export { ImageIcon as IconeArte };
