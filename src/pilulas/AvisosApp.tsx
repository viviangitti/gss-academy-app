import { useState } from 'react';
import { RefreshCw, Download, Share, Plus, X } from 'lucide-react';
import {
  useVersaoNova, recarregarApp,
  useConviteInstalar, dispensarInstalar, instalarAgora, ehIOS,
} from './data/versaoApp';

// OS DOIS AVISOS QUE O APP DÁ SOBRE SI MESMO.
//
// Ficam fixos no rodapé, acima da barra de abas, porque é onde o polegar está.
// Nenhum dos dois some sozinho: versão nova só sai quando a pessoa atualiza, e
// o convite de instalar só sai no X — foi o pedido, e é o certo. Aviso que
// desaparece sozinho é aviso que ninguém leu.

/** Barra de "tem versão nova". Ganha do convite de instalar quando os dois aparecem. */
function VersaoNova() {
  return (
    <div className="wp-aviso wp-aviso-versao" role="status">
      <RefreshCw size={17} className="wp-ico" />
      <span>
        <b>Tem uma versão nova do app.</b>
        <i>Atualize para ver as últimas correções e condições.</i>
      </span>
      <button type="button" className="wp-aviso-btn" onClick={recarregarApp}>Atualizar</button>
    </div>
  );
}

function ConviteInstalar() {
  const [abrindo, setAbrindo] = useState(false);
  const ios = ehIOS();

  return (
    <div className="wp-aviso wp-aviso-instalar">
      <Download size={17} className="wp-ico" />
      {ios ? (
        <span>
          <b>Deixe o Eleva na tela do celular</b>
          <i>
            Toque em <Share size={12} className="wp-ico" /> <b>Compartilhar</b>, desça e escolha
            <b> <Plus size={12} className="wp-ico" /> Adicionar à Tela de Início</b>.
          </i>
        </span>
      ) : (
        <span>
          <b>Deixe o Eleva na tela do celular</b>
          <i>Abre como aplicativo, sem procurar a aba no meio das outras.</i>
        </span>
      )}
      {!ios && (
        <button
          type="button"
          className="wp-aviso-btn"
          disabled={abrindo}
          onClick={async () => { setAbrindo(true); await instalarAgora(); setAbrindo(false); }}
        >
          {abrindo ? 'Abrindo…' : 'Instalar'}
        </button>
      )}
      <button type="button" className="wp-aviso-x" onClick={dispensarInstalar} aria-label="Dispensar">
        <X size={16} className="wp-ico" />
      </button>
    </div>
  );
}

export default function AvisosApp() {
  const versaoNova = useVersaoNova();
  const podeInstalar = useConviteInstalar();

  // Um de cada vez. Versão nova é mais urgente: quem está com o app velho pode
  // estar lendo condição que já mudou.
  if (versaoNova) return <VersaoNova />;
  if (podeInstalar) return <ConviteInstalar />;
  return null;
}
