// A FOLHA GERADA NA TELA — e a que vai pro cliente.
//
// Mesma linguagem visual das folhas da marca: preto, bolinha para quem tem,
// traço para quem não tem, número ao lado de número. O vendedor já conhece
// esse desenho das dez folhas do Jaecoo 5, e reconhecer o formato vale mais
// que qualquer estilo novo que eu inventasse.
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Loader2 } from 'lucide-react';
import type { Product } from './data/products';
import type { Concorrente } from './data/concorrentes';
import { linhasDaFolha } from './data/folhaGerada';
import { getProductImageUrl } from './data/store';
import { useAuth } from './AuthContext';
import { lojaLabel } from './data/lojas';
import { getElevaProfile } from './data/profile';
import { auth } from '../services/firebase';
import { registraUso } from './data/tracking';
import { nomeParaCliente } from './data/nomeArquivo';

export default function FolhaGerada({ p, c, onFechar }: { p: Product; c: Concorrente; onFechar: () => void }) {
  const { user } = useAuth();
  const [zap, setZap] = useState('');
  const [enviando, setEnviando] = useState(false);
  const peca = useRef<HTMLDivElement>(null);
  const linhas = useMemo(() => linhasDaFolha(p, c), [p, c]);

  useEffect(() => { registraUso('comparativo', `${p.id}|${c.id}`); }, [p.id, c.id]);
  useEffect(() => {
    const uid = auth?.currentUser?.uid;
    if (!uid) return;
    getElevaProfile(uid).then((pf) => setZap(pf?.whatsapp || '')).catch(() => {});
  }, [user?.email]);

  const foto = getProductImageUrl(p.id) || p.imageUrl || p.fotos?.[0] || '';
  const curto = p.name.replace(/\s+(SHS-[PH]|100% elétrico)$/i, '').trim();

  const telefone = (b: string) => {
    const d = (b || '').replace(/\D/g, '').replace(/^55/, '');
    if (d.length < 10) return '';
    return d.length === 11 ? `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}` : `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  };

  // O ENVIO desenha a peça num canvas do tamanho certo. Não dá para
  // "fotografar" o DOM: o que o cliente recebe tem que ser imagem.
  const mandar = async () => {
    setEnviando(true);
    try {
      const blob = await desenhar();
      if (blob) {
        const arq = new File([blob], `${nomeParaCliente(`${curto} x ${c.nome}`, 'comparativo')}.jpg`, { type: 'image/jpeg' });
        const nav = navigator as Navigator & { canShare?: (d: { files?: File[] }) => boolean };
        if (nav.share && nav.canShare?.({ files: [arq] })) await nav.share({ files: [arq] });
        else {
          const u = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = u; a.download = arq.name; a.click();
          setTimeout(() => URL.revokeObjectURL(u), 4000);
        }
      }
    } catch { /* cancelar não é erro */ }
    setEnviando(false);
  };

  const desenhar = async (): Promise<Blob | null> => {
    const L = 1080, pad = 64;
    const alturaLinha = 92;
    const alt = 300 + linhas.length * alturaLinha + 300;
    const cv = document.createElement('canvas');
    cv.width = L; cv.height = alt;
    const x = cv.getContext('2d');
    if (!x) return null;
    x.fillStyle = '#000'; x.fillRect(0, 0, L, alt);

    x.textAlign = 'center'; x.fillStyle = '#fff';
    x.font = '700 72px "Barlow Condensed", Helvetica, sans-serif';
    x.fillText(curto.toUpperCase(), L / 2, 96);
    x.font = '600 24px Helvetica, sans-serif'; x.fillStyle = '#8c8c8c';
    x.fillText(`VERSUS ${c.nome.toUpperCase()} ${c.versao.toUpperCase()}`, L / 2, 140);

    let y = 215;
    x.font = '600 26px Helvetica, sans-serif'; x.fillStyle = '#fff';
    x.textAlign = 'left'; x.fillText('Especificação', pad, y);
    x.textAlign = 'center';
    x.fillText(curto, L * 0.62, y); x.fillText(c.nome, L * 0.86, y);
    y += 28;
    x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(pad, y); x.lineTo(L - pad, y); x.stroke();

    for (const l of linhas) {
      y += alturaLinha;
      x.textAlign = 'left'; x.fillStyle = '#e6e6e6';
      x.font = '400 27px Helvetica, sans-serif';
      x.fillText(l.rotulo, pad, y - 30);
      x.textAlign = 'center';
      if (l.tipo === 'item') {
        x.fillStyle = '#fff'; x.beginPath(); x.arc(L * 0.62, y - 38, 13, 0, Math.PI * 2); x.fill();
        x.fillStyle = '#8c8c8c'; x.font = '500 30px Helvetica, sans-serif';
        x.fillText('–', L * 0.86, y - 28);
      } else {
        x.fillStyle = '#fff'; x.font = '600 32px Helvetica, sans-serif';
        x.fillText(l.nosso, L * 0.62, y - 28);
        x.fillStyle = '#c9c9c9'; x.font = '500 32px Helvetica, sans-serif';
        x.fillText(l.deles, L * 0.86, y - 28);
      }
      x.strokeStyle = 'rgba(255,255,255,.3)'; x.lineWidth = 1;
      x.beginPath(); x.moveTo(pad, y); x.lineTo(L - pad, y); x.stroke();
    }

    if (foto) {
      const img = await new Promise<HTMLImageElement | null>((ok) => {
        const i = new Image(); i.crossOrigin = 'anonymous';
        i.onload = () => ok(i); i.onerror = () => ok(null); i.src = foto;
      });
      if (img) {
        const h = 230;
        x.save(); x.globalAlpha = .82;
        x.drawImage(img, 0, y + 10, L, h);
        x.restore();
        const g = x.createLinearGradient(0, y + 10, 0, y + 10 + h);
        g.addColorStop(0, '#000'); g.addColorStop(.3, 'rgba(0,0,0,.5)');
        g.addColorStop(.6, 'rgba(0,0,0,.25)'); g.addColorStop(1, '#000');
        x.fillStyle = g; x.fillRect(0, y + 10, L, h);
        y += h + 10;
      }
    }

    y += 54;
    x.strokeStyle = 'rgba(255,255,255,.22)';
    x.beginPath(); x.moveTo(pad, y - 34); x.lineTo(L - pad, y - 34); x.stroke();
    x.textAlign = 'left'; x.fillStyle = '#fff';
    x.font = '700 34px Helvetica, sans-serif';
    x.fillText((user?.name || '').toUpperCase(), pad, y);
    x.fillStyle = '#8c8c8c'; x.font = '400 24px Helvetica, sans-serif';
    if (user?.loja) x.fillText(lojaLabel(user.loja), pad, y + 36);
    const t = telefone(zap);
    if (t) {
      x.textAlign = 'right'; x.fillStyle = '#fff'; x.font = '700 30px Helvetica, sans-serif';
      x.fillText(t, L - pad, y);
      x.fillStyle = '#8c8c8c'; x.font = '400 22px Helvetica, sans-serif';
      x.fillText('WhatsApp', L - pad, y + 34);
    }
    if (c.fonte) {
      x.textAlign = 'left'; x.fillStyle = '#6e6e6e'; x.font = '400 19px Helvetica, sans-serif';
      x.fillText(`Origem: ${c.fonte}`.slice(0, 96), pad, y + 84);
    }
    return new Promise((ok) => cv.toBlob((b) => ok(b), 'image/jpeg', 0.86));
  };

  return createPortal(
    <div className="wp-folha" role="dialog" aria-modal="true" aria-label={`${curto} versus ${c.nome}`}>
      <p className="wp-folha-qual">{curto} × {c.nome} {c.versao}</p>
      <button type="button" className="wp-folha-x" onClick={onFechar} aria-label="Fechar"><X size={20} className="wp-ico" /></button>
      <div className="wp-folha-rolo">
        <div className="wp-fg" ref={peca}>
          <p className="wp-fg-modelo">{curto}</p>
          <p className="wp-fg-versus">versus {c.nome} {c.versao}</p>
          {linhas.length === 0 ? (
            <p className="wp-fg-vazio">
              Este não se ganha na ficha. Leve a garantia de 7 anos, as revisões com preço
              publicado e o test drive — e marque uma conversa, não uma tabela.
            </p>
          ) : (
            <table className="wp-fg-tb">
              <thead>
                <tr><th>Especificação</th><th>{curto}</th><th>{c.nome}</th></tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.rotulo}>
                    <td className="wp-fg-esp">{l.rotulo}</td>
                    <td className="wp-fg-nos">{l.tipo === 'item' ? <span className="wp-fg-ponto" /> : l.nosso}</td>
                    <td className="wp-fg-deles">{l.deles}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {foto && <div className="wp-fg-foto"><img src={foto} alt={p.name} /></div>}
          <div className="wp-fg-pe">
            <span className="wp-fg-quem"><b>{(user?.name || '').toUpperCase()}</b>{user?.loja && <i>{lojaLabel(user.loja)}</i>}</span>
            {telefone(zap) && <span className="wp-fg-zap"><b>{telefone(zap)}</b><i>WhatsApp</i></span>}
          </div>
          {c.fonte && <p className="wp-fg-origem">Origem: {c.fonte}</p>}
        </div>
      </div>
      <div className="wp-folha-pe">
        <button type="button" className="wp-folha-mandar" onClick={mandar} disabled={enviando || linhas.length === 0}>
          {enviando ? <Loader2 size={16} className="wp-ico" /> : <Send size={16} className="wp-ico" />}
          {enviando ? 'Preparando…' : linhas.length === 0 ? 'Sem folha para este' : 'Mandar pro cliente'}
        </button>
      </div>
    </div>,
    document.body,
  );
}
