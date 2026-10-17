// A FOLHA QUE VAI PRO CLIENTE — a arte da marca, assinada pelo vendedor.
//
// Mesma regra do one-page: o material sai com o NOME E O WHATSAPP DELE, não
// com um carimbo da loja. É o que faz o vendedor abrir o app em vez de mandar
// o link do site, e é o que transforma um PDF genérico num contato.
//
// O rodapé é desenhado na HORA DO ENVIO e não embutido nas dez imagens, por um
// motivo simples: o nome muda a cada vendedor. Dez folhas × nove vendedores
// seriam noventa arquivos para manter — e um vendedor novo não teria os dele.
//
// Fundo preto no rodapé porque a peça é preta de ponta a ponta: uma faixa
// clara cortaria a arte da marca ao meio.
import type { Concorrente } from './concorrentes';
import { nomeParaCliente } from './nomeArquivo';

export interface Assinatura {
  nome: string;
  loja?: string;
  whatsapp?: string;
}

const RODAPE = 150;

/** Só dígitos viram telefone legível; vazio devolve vazio. */
function telefone(bruto?: string): string {
  const d = (bruto || '').replace(/\D/g, '').replace(/^55/, '');
  if (d.length < 10) return '';
  const ddd = d.slice(0, 2);
  const resto = d.slice(2);
  return resto.length === 9
    ? `(${ddd}) ${resto.slice(0, 5)}-${resto.slice(5)}`
    : `(${ddd}) ${resto.slice(0, 4)}-${resto.slice(4)}`;
}

export async function montarFolha(c: Concorrente, quem: Assinatura): Promise<Blob | null> {
  const img = await new Promise<HTMLImageElement | null>((ok) => {
    const i = new Image();
    i.onload = () => ok(i);
    i.onerror = () => ok(null);
    i.src = c.arquivo;
  });
  if (!img) return null;

  const cv = document.createElement('canvas');
  cv.width = img.naturalWidth;
  cv.height = img.naturalHeight + RODAPE;
  const ctx = cv.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.drawImage(img, 0, 0);

  const y = img.naturalHeight;
  const m = 56;
  ctx.strokeStyle = '#3c3c3c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(m, y + 1);
  ctx.lineTo(cv.width - m, y + 1);
  ctx.stroke();

  // CAIXA ALTA no nome: a arte inteira é em caixa alta, e assim o rodapé lê
  // como assinatura e não como legenda solta.
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#fff';
  ctx.font = '700 34px Helvetica, Arial, sans-serif';
  ctx.fillText((quem.nome || '').toUpperCase(), m, y + 34);

  if (quem.loja) {
    ctx.fillStyle = '#969696';
    ctx.font = '400 26px Helvetica, Arial, sans-serif';
    ctx.fillText(quem.loja, m, y + 80);
  }

  // SEM WHATSAPP, SEM CAMPO VAZIO. O rodapé sai só com nome e loja — mandar
  // "WhatsApp" com nada embaixo é pior do que não mandar.
  const zap = telefone(quem.whatsapp);
  if (zap) {
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = '700 30px Helvetica, Arial, sans-serif';
    ctx.fillText(zap, cv.width - m, y + 34);
    ctx.fillStyle = '#969696';
    ctx.font = '400 24px Helvetica, Arial, sans-serif';
    ctx.fillText('WhatsApp', cv.width - m, y + 82);
    ctx.textAlign = 'left';
  }

  return new Promise((ok) => cv.toBlob((b) => ok(b), 'image/jpeg', 0.84));
}

export function nomeDoArquivo(c: Concorrente): string {
  return `${nomeParaCliente(`Jaecoo 5 x ${c.nome}`, 'comparativo')}.jpg`;
}
