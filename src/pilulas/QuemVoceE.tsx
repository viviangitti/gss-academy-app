// A TRAVA DO CARGO — ninguém usa o app sem dizer quem é.
//
// O cadastro já perguntava cargo e unidade, e já travava o botão de criar conta
// até a pessoa responder. Mesmo assim quinze contas da Ramasa ficaram sem loja
// e o relatório vivia dizendo que gente sem cargo tinha entrado. Eram três
// buracos diferentes, e nenhum deles era a tela de cadastro:
//
//   · o gravador do perfil jogava a `loja` fora (profile.ts);
//   · a sincronização dos números gravava vazio por cima (statsSync.ts);
//   · e a aba "Entrar" nunca passa pela validação do cadastro — quem já tinha
//     conta no Firebase entrava sem nunca ter dito cargo nenhum.
//
// Os três estão consertados. Esta tela existe pelo que vem DEPOIS deles: uma
// obrigatoriedade que mora só no formulário de cadastro protege exatamente uma
// porta, e é por outra que a pessoa sempre acaba entrando. Aqui a pergunta é do
// app, não do cadastro — e vale para toda conta antiga, para todo furo futuro e
// para quem chegar por um caminho que ainda nem existe.
//
// NÃO DÁ PRA FECHAR. É a única tela do app sem saída, e de propósito: sem cargo,
// a gerência olha as respostas do time e não sabe quem falou, o Painel não
// consegue separar por loja, e a pessoa não entra em recorte nenhum do
// relatório. É menos grave fazer alguém escolher numa lista do que deixar o
// trabalho dela virar um número sem dono.
import { useState } from 'react';
import { BadgeCheck, Store } from 'lucide-react';
import { auth } from '../services/firebase';
import { useAuth } from './AuthContext';
import { CARGOS_AUTO } from './data/cargos';
import { lojasDaMarca } from './data/lojas';
import { updateElevaCargo, updateElevaLoja } from './data/profile';
import { setStoredCargo } from './data/roles';
import type { BrandId } from './data/brands';

export default function QuemVoceE({ brand }: { brand: BrandId }) {
  const { user } = useAuth();
  const lojas = lojasDaMarca(brand);
  // Só pergunta o que falta. Quem já tem cargo e está aqui só pela loja não
  // precisa reconfirmar o cargo — e vice-versa.
  const faltaCargo = !user?.cargo;
  const faltaLoja = lojas.length > 0 && !user?.loja;
  const [cargo, setCargo] = useState('');
  const [loja, setLoja] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const pronto = (!faltaCargo || !!cargo) && (!faltaLoja || !!loja);

  const salvar = async () => {
    if (!pronto || salvando) return;
    const uid = auth?.currentUser?.uid;
    if (!uid) return;
    setSalvando(true);
    setErro('');
    try {
      if (faltaCargo && cargo) await updateElevaCargo(uid, cargo);
      if (faltaLoja && loja) await updateElevaLoja(uid, loja);
      // A mesma ponte do cadastro: o AuthContext só relê o perfil no próximo
      // login, e sem isto a pessoa recarregaria direto nesta tela de novo.
      setStoredCargo(user?.email || '', cargo || user?.cargo, loja || user?.loja);
      window.location.reload();
    } catch {
      setErro('Não consegui salvar. Confira a internet e tente de novo.');
      setSalvando(false);
    }
  };

  return (
    <div className="wp-quemsou-fundo">
      <div className="wp-quemsou">
        <span className="wp-quemsou-ico"><BadgeCheck size={26} className="wp-ico" /></span>
        <h2>Antes de continuar</h2>
        <p className="wp-quemsou-sub">
          Falta {faltaCargo && faltaLoja ? 'o seu cargo e a sua unidade' : faltaCargo ? 'o seu cargo' : 'a sua unidade'} no
          cadastro. É rápido, e é o que faz o seu trabalho aparecer com o seu nome
          no painel da gerência.
        </p>

        {faltaCargo && (
          <>
            <label className="wp-quemsou-label">Seu cargo na loja</label>
            <select value={cargo} onChange={(e) => setCargo(e.target.value)}>
              <option value="">Escolha seu cargo…</option>
              {CARGOS_AUTO.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </>
        )}

        {faltaLoja && (
          <>
            <label className="wp-quemsou-label"><Store size={14} className="wp-ico" /> Sua unidade</label>
            <select value={loja} onChange={(e) => setLoja(e.target.value)}>
              <option value="">Escolha a sua unidade…</option>
              {lojas.map((l) => (
                <option key={l.id} value={l.id}>{l.nome}</option>
              ))}
            </select>
          </>
        )}

        {erro && <p className="wp-quemsou-erro">{erro}</p>}

        <button className="wp-quemsou-ok" disabled={!pronto || salvando} onClick={salvar}>
          {salvando ? 'Salvando…' : 'Continuar'}
        </button>
        <p className="wp-quemsou-rodape">
          Escolheu errado? A gerência corrige a qualquer momento — e o cargo
          identifica você, não muda o que você vê no app.
        </p>
      </div>
    </div>
  );
}
