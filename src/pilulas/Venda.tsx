import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, Check, Clock, X, ChevronLeft } from 'lucide-react';
import { allProducts, useStore } from './data/store';
import { visibleProducts } from './data/products';
import { registrarVenda, fetchMinhasVendas, type Venda as VendaT } from './data/vendas';
import { useAuth } from './AuthContext';
import { useBrand } from './BrandContext';

// A pessoa declara o que vendeu no balcão. Sem foto do cupom, de propósito
// (ver decisão de LGPD em data/vendas.ts) — só o número, que dá pra conferir.
export default function Venda() {
  useStore();
  const { user } = useAuth();
  const { brandId } = useBrand();
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState(1);
  const [cupom, setCupom] = useState('');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState('');
  const [minhas, setMinhas] = useState<VendaT[]>([]);

  const produtos = useMemo(
    () => visibleProducts(allProducts().filter((p) => p.brand === brandId), user?.role),
    [brandId, user?.role]
  );

  const carregar = () => { fetchMinhasVendas().then(setMinhas).catch(() => {}); };
  useEffect(carregar, []);

  const valid = productId && qty > 0 && cupom.trim().length >= 3;

  const enviar = async () => {
    if (!valid || busy) return;
    setBusy(true); setErro('');
    try {
      const p = produtos.find((x) => x.id === productId)!;
      await registrarVenda({
        brand: brandId,
        role: user?.role || '',
        name: user?.name || '',
        productId: p.id,
        productName: p.name,
        qty,
        cupom,
      });
      setOk(true);
      setProductId(''); setQty(1); setCupom('');
      setTimeout(() => setOk(false), 3500);
      carregar();
    } catch {
      setErro('Não consegui registrar. Verifique sua internet e tente de novo.');
    }
    setBusy(false);
  };

  const badge = (s: VendaT['status']) =>
    s === 'aprovada' ? <span className="wp-vd-st on"><Check size={11} /> aprovada</span>
    : s === 'recusada' ? <span className="wp-vd-st no"><X size={11} /> recusada</span>
    : <span className="wp-vd-st"><Clock size={11} /> aguardando</span>;

  return (
    <div className="wp-vd">
      <Link to="/eleva" className="wp-vd-back"><ChevronLeft size={16} className="wp-ico" /> Voltar</Link>

      <h1 className="wp-vd-title"><Receipt size={19} className="wp-ico" /> Registrar uma venda</h1>
      <p className="wp-vd-sub">
        Vendeu no balcão? Registra aqui. É assim que a Meraki enxerga a sua venda — ela não passa pelo site.
      </p>

      <div className="wp-vd-form">
        <label className="wp-vd-label">Qual produto você vendeu?</label>
        <select className="wp-vd-select" value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">Escolha o produto</option>
          {produtos.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <label className="wp-vd-label">Quantas unidades?</label>
        <div className="wp-vd-qty">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Menos">−</button>
          <b>{qty}</b>
          <button onClick={() => setQty((q) => q + 1)} aria-label="Mais">+</button>
        </div>

        <label className="wp-vd-label">Número do cupom fiscal</label>
        <input
          className="wp-vd-input"
          value={cupom}
          onChange={(e) => setCupom(e.target.value)}
          placeholder="Ex.: 000123456"
          inputMode="numeric"
        />
        <p className="wp-vd-hint">
          Só o número — <b>não mande foto do cupom</b>. Ele mostra o que a cliente comprou, e isso é
          informação dela, não nossa. O número já permite conferir a venda no sistema da farmácia.
        </p>

        {erro && <p className="wp-vd-erro">{erro}</p>}
        <button className="wp-vd-send" disabled={!valid || busy} onClick={enviar}>
          {busy ? 'Enviando…' : ok ? <><Check size={16} className="wp-ico" /> Registrada!</> : 'Registrar venda'}
        </button>
        {!valid && !busy && <p className="wp-vd-hint">Escolha o produto e digite o número do cupom.</p>}
      </div>

      {minhas.length > 0 && (
        <div className="wp-vd-list">
          <span className="wp-vd-list-h">Suas vendas registradas</span>
          {minhas.map((v) => (
            <div key={v.id} className="wp-vd-item">
              <span className="wp-vd-item-name">
                {v.productName} <i>{v.qty} un. · cupom {v.cupom}</i>
              </span>
              {badge(v.status)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
