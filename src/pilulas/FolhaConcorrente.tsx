// A FOLHA DO CONCORRENTE, EM TELA CHEIA — e o botão que manda pro cliente.
//
// Abre por cima de tudo porque é peça para MOSTRAR: o vendedor vira o celular
// para o cliente, ou manda. Tela cheia tira a navegação da frente e deixa a
// arte da marca ocupar o que ela foi desenhada para ocupar.
import { useEffect, useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import type { Concorrente } from './data/concorrentes';
import { montarFolha, nomeDoArquivo } from './data/folhaConcorrente';
import { useAuth } from './AuthContext';
import { lojaLabel } from './data/lojas';
import { getElevaProfile } from './data/profile';
import { auth } from '../services/firebase';
import { registraUso } from './data/tracking';

export default function FolhaConcorrente({ c, onFechar }: { c: Concorrente; onFechar: () => void }) {
  const { user } = useAuth();
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState('');
  // O WhatsApp mora no PERFIL, não no login — mesma fonte que o one-page usa.
  const [zap, setZap] = useState('');
  useEffect(() => {
    const uid = auth?.currentUser?.uid;
    if (!uid) return;
    getElevaProfile(uid).then((pf) => setZap(pf?.whatsapp || '')).catch(() => {});
  }, [user?.email]);

  // Qual concorrente o vendedor abriu diz com quem a loja está perdendo a
  // conversa — é pauta de reunião, não curiosidade.
  useEffect(() => { registraUso('comparativo', `${c.id}`); }, [c.id]);

  const mandar = async () => {
    setEnviando(true);
    setAviso('');
    try {
      const blob = await montarFolha(c, {
        nome: user?.name || '',
        loja: user?.loja ? lojaLabel(user.loja) : '',
        whatsapp: zap,
      });
      if (!blob) { setAviso('Não consegui montar a folha. Tente de novo.'); setEnviando(false); return; }
      const arquivo = new File([blob], nomeDoArquivo(c), { type: 'image/jpeg' });
      const nav = navigator as Navigator & { canShare?: (d: { files?: File[] }) => boolean };
      if (nav.share && nav.canShare?.({ files: [arquivo] })) {
        await nav.share({ files: [arquivo] });
      } else {
        // Sem compartilhamento nativo (desktop), baixa: o vendedor anexa na mão.
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = nomeDoArquivo(c); a.click();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      }
    } catch {
      // Cancelar o compartilhamento não é erro — o vendedor desistiu, e avisar
      // isso com texto vermelho faz parecer que o app quebrou.
    }
    setEnviando(false);
  };

  return (
    <div className="wp-folha" role="dialog" aria-modal="true" aria-label={`Jaecoo 5 contra ${c.nome}`}>
      <button type="button" className="wp-folha-x" onClick={onFechar} aria-label="Fechar">
        <X size={20} className="wp-ico" />
      </button>
      {/* QUAL COMPARAÇÃO É ESTA, escrito, acima da arte. A folha tem "JAECOO 5"
          em letra grande no topo, mas o vendedor chega aqui rolando e o botão
          de mandar pro cliente está a um polegar de distância. Uma linha de
          texto custa nada e evita mandar a folha do carro errado. */}
      <p className="wp-folha-qual">Jaecoo 5 Prestige × {c.nome} {c.versao}</p>
      <div className="wp-folha-rolo">
        <img src={c.arquivo} alt={`Comparativo Jaecoo 5 contra ${c.nome} ${c.versao}`} />
      </div>
      <div className="wp-folha-pe">
        <button type="button" className="wp-folha-mandar" onClick={mandar} disabled={enviando}>
          {enviando ? <Loader2 size={16} className="wp-ico" /> : <Send size={16} className="wp-ico" />}
          {enviando ? 'Preparando…' : 'Mandar pro cliente'}
        </button>
        {aviso && <p className="wp-folha-aviso">{aviso}</p>}
      </div>
    </div>
  );
}
