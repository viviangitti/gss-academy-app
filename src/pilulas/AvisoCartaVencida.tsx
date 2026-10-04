// O AVISO DE CARTA EM FALTA.
//
// Aparece para quem pode publicar (ver data/cartaEmFalta) enquanto a prateleira
// de veículo estiver vazia, e volta todo dia até alguém subir a carta nova.
//
// Diz a frase que importa logo no título — "o time está sem taxa de carro" —
// porque "condição vencida" é vocabulário de sistema e não dói em ninguém. O
// que dói é imaginar o vendedor em pé do lado do cliente, abrindo Condições e
// não achando nada.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, UploadCloud } from 'lucide-react';
import { cartaEmFalta, recebeAviso, adiadoHoje, adiarHoje } from './data/cartaEmFalta';
import { useCondicoes } from './data/condicoes';
import { useAuth } from './AuthContext';
import { useBrand } from './BrandContext';

export default function AvisoCartaVencida() {
  const { user } = useAuth();
  const { brandId } = useBrand();
  // Redesenha quando a lista de condições muda: quem acabou de publicar não
  // pode continuar vendo o aviso de que falta publicar.
  useCondicoes();
  const [fechado, setFechado] = useState(() => adiadoHoje());
  const navigate = useNavigate();

  if (!recebeAviso(user?.email) || fechado) return null;
  const falta = cartaEmFalta(brandId);
  if (!falta) return null;

  const br = (d?: string) => (d ? d.split('-').reverse().slice(0, 2).join('/') : '');
  // Começa a frase, então vai com maiúscula — "…saiu do ar sozinha. há 2 dias"
  // é o tipo de detalhe que faz um aviso sério parecer automático demais.
  const quanto = falta.dias <= 0
    ? 'Desde hoje'
    : falta.dias === 1 ? 'Desde ontem' : `Há ${falta.dias} dias`;

  return (
    <div className="wp-cv-fundo">
      <div className="wp-cv">
        <span className="wp-cv-ico"><AlertTriangle size={24} /></span>
        <span className="wp-cv-et">Condição comercial</span>
        <h2>O time está sem taxa de carro</h2>
        <p className="wp-cv-sub">
          A última carta de veículo venceu{falta.desde ? ` em ${br(falta.desde)}` : ''} e saiu do ar
          sozinha. <b>{quanto}</b> quem abre Condições para atender um cliente não encontra
          nenhuma condição de veículo.
        </p>

        {/* NADA SOBRE AS FOLHAS ANTIGAS AQUI.
            A primeira versão explicava que a carta velha fica arquivada no
            Painel. É verdade, mas era resposta para uma pergunta que a Silene
            fez e que estas duas pessoas não fizeram — e, pior, dava a entender
            que havia uma decisão a tomar sobre a carta antiga. Não há: ela sai
            sozinha na data de validade. Este aviso tem um trabalho só, que é
            publicar a nova. */}

        <button
          className="wp-cv-ok"
          onClick={() => { adiarHoje(); setFechado(true); navigate('/eleva/gestor'); }}
        >
          <UploadCloud size={17} className="wp-ico" /> Subir a carta agora
        </button>
        <button className="wp-cv-nao" onClick={() => { adiarHoje(); setFechado(true); }}>
          Agora não — me lembre amanhã
        </button>
      </div>
    </div>
  );
}
