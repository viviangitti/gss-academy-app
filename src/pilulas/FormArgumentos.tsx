import { useState } from 'react';
import { ArrowUpRight, Check, Send } from 'lucide-react';
import { PRODUCTS } from './data/products';
import { enviarArgumento } from './data/argumentos';

// O FORMULÁRIO ABERTO — o endereço que a gerência manda no grupo do WhatsApp.
//
// Sem login de propósito: pedir cadastro pra responder três frases derruba a
// resposta pela metade, e o time da concessionária ainda nem entrou no app.
//
// A regra que guiou o desenho: quem responde está no celular, entre um
// atendimento e outro. Então é uma pergunta por vez, campo curto, e a pessoa
// responde só dos carros que ela vende — ninguém preenche doze campos.

const CARROS = PRODUCTS.filter((p) => p.brand === 'ramasa');

interface Resposta {
  pontos: [string, string, string];
}

export default function FormArgumentos() {
  const [nome, setNome] = useState('');
  const [papel, setPapel] = useState('');
  const [respostas, setRespostas] = useState<Record<string, Resposta>>({});
  const [enviando, setEnviando] = useState(false);
  const [pronto, setPronto] = useState(0);
  const [erro, setErro] = useState('');

  const set = (id: string, i: number, v: string) => {
    setRespostas((r) => {
      const atual = r[id]?.pontos || ['', '', ''];
      const novos = [...atual] as [string, string, string];
      novos[i] = v;
      return { ...r, [id]: { pontos: novos } };
    });
  };

  const preenchidos = CARROS.filter((c) => (respostas[c.id]?.pontos || []).some((p) => p.trim()));
  const valid = nome.trim().length >= 2 && preenchidos.length > 0;

  const enviar = async () => {
    if (!valid || enviando) return;
    setEnviando(true);
    setErro('');
    let ok = 0;
    for (const c of preenchidos) {
      const feito = await enviarArgumento({
        brand: 'ramasa',
        productId: c.id,
        productName: c.name,
        pontos: respostas[c.id].pontos,
        nome,
        papel,
      });
      if (feito) ok += 1;
    }
    setEnviando(false);
    if (ok) setPronto(ok);
    else setErro('Não consegui enviar. Confira a internet e tente de novo.');
  };

  if (pronto) {
    return (
      <div className="wp-fa">
        <div className="wp-fa-ok">
          <span className="wp-fa-ok-ic"><Check size={26} /></span>
          <h1>Recebido. Obrigada!</h1>
          <p>
            Você respondeu sobre {pronto === 1 ? '1 modelo' : `${pronto} modelos`}. O que o time
            responder aqui vira conteúdo dentro do Eleva — e volta pra vocês como argumento pronto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="wp-fa">
      <header className="wp-fa-topo">
        <span className="wp-fa-marca">eleva<ArrowUpRight size={14} strokeWidth={2.5} /></span>
        <span className="wp-fa-loja">Ramasa · Jaecoo e Omoda</span>
      </header>

      <h1 className="wp-fa-titulo">Qual o seu argumento matador?</h1>
      <p className="wp-fa-lead">
        Quem descobre o que fecha a venda é quem está no showroom — não quem escreve o material.
        Em cada carro que você vende, escreva os <b>3 pontos</b> que você usa e que fazem o cliente parar de comparar.
      </p>
      <p className="wp-fa-lead wp-fa-lead--pequeno">
        Responda só dos modelos que você atende. Leva dois minutos, e o que a gerência escolher
        vira conteúdo dentro do app pra todo o time.
      </p>

      <div className="wp-fa-bloco">
        <label className="wp-fa-label">Seu nome</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como o time te chama" />
        <label className="wp-fa-label">Sua função (opcional)</label>
        <input value={papel} onChange={(e) => setPapel(e.target.value)} placeholder="Vendedor, gerente, consultor…" />
      </div>

      {CARROS.map((c) => (
        <div key={c.id} className="wp-fa-carro">
          <div className="wp-fa-carro-topo">
            {c.fotos?.[0] && <img src={c.fotos[0]} alt={c.name} loading="lazy" />}
            <div>
              <b>{c.name}</b>
              <i>{c.tagline.slice(0, 90)}</i>
            </div>
          </div>
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              className="wp-fa-ponto"
              value={respostas[c.id]?.pontos[i] || ''}
              onChange={(e) => set(c.id, i, e.target.value)}
              placeholder={
                i === 0 ? '1º ponto matador' : i === 1 ? '2º ponto' : '3º ponto'
              }
            />
          ))}
        </div>
      ))}

      {erro && <p className="wp-fa-erro">{erro}</p>}

      <button className="wp-fa-enviar" disabled={!valid || enviando} onClick={enviar}>
        <Send size={17} className="wp-ico" />
        {enviando ? 'Enviando…' : 'Enviar minhas respostas'}
      </button>
      {!valid && (
        <p className="wp-fa-dica">Preencha seu nome e pelo menos um ponto de um dos carros.</p>
      )}

      <p className="wp-fa-rodape">
        Suas respostas vão para a gerência da Ramasa e para o Eleva. Não pedimos telefone nem e-mail.
      </p>
    </div>
  );
}
