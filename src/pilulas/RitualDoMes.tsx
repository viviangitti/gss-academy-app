// O LEMBRETE DO MÊS — aparece onde a pessoa estiver, e só sai com o ok dela.
//
// Fica no esqueleto do app, não numa tela: o vendedor abre no "Hoje" e o
// gerente cai direto no Painel. Se morasse numa tela só, metade dos cargos
// nunca veria o lembrete que é deles.
//
// Os itens são marcáveis e o botão só libera com todos marcados. É de
// propósito: "dar o ok" tem que significar ter passado item por item — senão
// vira o botão que todo mundo aperta sem ler, e o registro não vale nada.
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Square, CheckSquare, Check, X } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useBrand } from './BrandContext';
import { auth } from '../services/firebase';
import { confirmacoesDaConta, confirmadoLocal, confirmar, ritualDeHoje } from './data/rituais';

const KEY_ADIADO = 'wp_ritual_adiado';
const hojeISO = () => new Date().toISOString().slice(0, 10);

export default function RitualDoMes() {
  const { user } = useAuth();
  const { brandId } = useBrand();
  const ritual = useMemo(() => ritualDeHoje(brandId, user?.cargo), [brandId, user?.cargo]);

  const [mostrar, setMostrar] = useState(false);
  const [feitos, setFeitos] = useState<number[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    if (!ritual) {
      setMostrar(false);
      return;
    }
    const ciclo = ritual.ciclo(new Date());
    // Já confirmou neste aparelho, ou pediu "agora não" hoje: não insiste.
    let adiado = '';
    try {
      adiado = localStorage.getItem(KEY_ADIADO) || '';
    } catch { /* ignore */ }
    if (confirmadoLocal(ritual.id, ciclo) || adiado === `${ritual.id}|${ciclo}|${hojeISO()}`) {
      setMostrar(false);
      return;
    }
    setMostrar(true);
    setFeitos([]);
    setPronto(false);
    // A conta manda sobre o aparelho: quem confirmou no celular não é cobrado
    // de novo no computador.
    const uid = auth?.currentUser?.uid;
    if (!uid) return;
    let vivo = true;
    confirmacoesDaConta(uid).then((oks) => {
      if (vivo && oks[`${ritual.id}|${ciclo}`]) setMostrar(false);
    });
    return () => { vivo = false; };
  }, [ritual]);

  if (!ritual || !mostrar) return null;

  const todosMarcados = feitos.length === ritual.itens.length;

  const adiar = () => {
    try {
      localStorage.setItem(KEY_ADIADO, `${ritual.id}|${ritual.ciclo(new Date())}|${hojeISO()}`);
    } catch { /* ignore */ }
    setMostrar(false);
  };

  const darOk = async () => {
    if (!todosMarcados || salvando) return;
    setSalvando(true);
    await confirmar(auth?.currentUser?.uid, ritual, { nome: user?.name, cargo: user?.cargo, brand: brandId });
    setSalvando(false);
    setPronto(true);
    setTimeout(() => setMostrar(false), 1800);
  };

  return (
    <div className="wp-rit-fundo" role="dialog" aria-modal="true" aria-label={ritual.titulo}>
      <div className="wp-rit">
        {pronto ? (
          <div className="wp-rit-pronto">
            <span className="wp-rit-ic wp-rit-ic--ok"><Check size={28} className="wp-ico" /></span>
            <h3>Registrado</h3>
            <p>Ficou gravado com o seu nome e a data. Obrigado!</p>
          </div>
        ) : (
          <>
            <button type="button" className="wp-rit-x" onClick={adiar} aria-label="Agora não">
              <X size={18} className="wp-ico" />
            </button>
            <span className="wp-rit-ic"><CalendarCheck size={26} className="wp-ico" /></span>
            <span className="wp-rit-quando">{ritual.quando}</span>
            <h3>{ritual.titulo}</h3>
            <p className="wp-rit-por">{ritual.porQue}</p>

            <ul className="wp-rit-lista">
              {ritual.itens.map((it, i) => {
                const marcado = feitos.includes(i);
                return (
                  <li key={it}>
                    <button
                      type="button"
                      className={`wp-rit-item ${marcado ? 'ok' : ''}`}
                      onClick={() => setFeitos((f) => (marcado ? f.filter((x) => x !== i) : [...f, i]))}
                    >
                      {marcado ? <CheckSquare size={17} className="wp-ico" /> : <Square size={17} className="wp-ico" />}
                      <span>{it}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {ritual.ondeIr && (
              <Link className="wp-rit-ir" to={ritual.ondeIr.rota} onClick={adiar}>
                {ritual.ondeIr.rotulo}
              </Link>
            )}
            <button type="button" className="wp-rit-ok" disabled={!todosMarcados || salvando} onClick={darOk}>
              {salvando
                ? 'Registrando…'
                : todosMarcados
                  ? ritual.botao
                  : `Marque os ${ritual.itens.length} itens para liberar`}
            </button>
            <button type="button" className="wp-rit-nao" onClick={adiar}>Agora não</button>
          </>
        )}
      </div>
    </div>
  );
}
