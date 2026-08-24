import { useState } from 'react';
import { ArrowUpRight, Check, Send } from 'lucide-react';
import { PRODUCTS } from './data/products';
import { enviarArgumento } from './data/argumentos';
import { CARGOS_AUTO } from './data/cargos';

// O FORMULÁRIO ABERTO ("quais os 3 argumentos matadores?") — o endereço que a
// gerência manda no grupo do WhatsApp.
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

      <h1 className="wp-fa-titulo">Quais os 3 argumentos “matadores” na sua opinião?</h1>
      <p className="wp-fa-lead">
        Quem descobre o que fecha a venda é quem está no showroom — não quem escreve o material.
        Para cada carro que você vende, escreva os <b>3 argumentos ou benefícios</b> que fazem o cliente
        parar de comparar.
      </p>
      <p className="wp-fa-lead wp-fa-lead--pequeno">
        Responda só dos modelos que você atende. Leva dois minutos, e o que a gerência escolher
        vira conteúdo dentro do app pra todo o time.
      </p>

      <div className="wp-fa-bloco">
        <label className="wp-fa-label">Seu nome</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como o time te chama" />
        {/* Era campo aberto e vinha "vendedor", "Vendedor", "vend." e vazio —
            impossível de agrupar depois. Com os quatro cargos da loja, a
            gerência consegue ler a resposta sabendo de onde ela veio: o que o
            vendedor de acessórios acha matador raramente é o mesmo que o de
            veículos. Continua opcional: ninguém trava por não marcar. */}
        <label className="wp-fa-label">Seu cargo (opcional)</label>
        <div className="wp-fa-cargos">
          {CARGOS_AUTO.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`wp-fa-cargo ${papel === c.label ? 'on' : ''}`}
              onClick={() => setPapel(papel === c.label ? '' : c.label)}
            >
              {c.label}
            </button>
          ))}
        </div>
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
          {/* A pergunta se repete em cada carro de propósito: quem responde no
              celular rola a tela e perde o enunciado do topo — e aí escreve
              característica em vez de argumento. */}
          <p className="wp-fa-pergunta">
            Quais os 3 argumentos ou benefícios do <b>{c.name}</b> são “matadores” na sua opinião?
          </p>
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              className="wp-fa-ponto"
              value={respostas[c.id]?.pontos[i] || ''}
              onChange={(e) => set(c.id, i, e.target.value)}
              placeholder={
                i === 0 ? '1º argumento' : i === 1 ? '2º argumento' : '3º argumento'
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
