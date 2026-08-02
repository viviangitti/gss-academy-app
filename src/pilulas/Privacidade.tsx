import { Link } from 'react-router-dom';
import { ChevronLeft, ShieldCheck } from 'lucide-react';

// Política de privacidade do Eleva.
//
// Escrita a partir do que o app REALMENTE coleta (auditado em 27/07/2026):
// Firebase Auth (e-mail/senha), elevaUsers (perfil), elevaStats (uso),
// elevaObjections (objeções da ponta) e elevaLeads (contato da landing).
// Se um campo novo passar a ser gravado, ATUALIZE esta página junto — política
// que descreve o que o app não faz mais é pior que não ter política.

const CONTATO = 'viviangitti23@gmail.com';
const ATUALIZADA = '27 de julho de 2026';

export default function Privacidade() {
  return (
    <div className="wp-priv">
      <Link to="/eleva" className="wp-priv-back">
        <ChevronLeft size={16} className="wp-ico" /> Voltar
      </Link>

      <div className="wp-priv-hero">
        <div className="wp-priv-hero-icon"><ShieldCheck size={18} className="wp-ico" /></div>
        <div>
          <h1 className="wp-priv-title">Privacidade no Eleva</h1>
          <p className="wp-priv-sub">O que a gente guarda, por quê, e como você tira. Atualizada em {ATUALIZADA}.</p>
        </div>
      </div>

      <section className="wp-priv-sec">
        <h2>Em uma frase</h2>
        <p>
          O Eleva é um programa de educação de produto contratado pela sua marca. Guardamos o
          necessário para você aprender e para a marca saber que o time está aprendendo — nada além.
          <b> Não vendemos, não alugamos e não compartilhamos seus dados com anunciantes.</b>
        </p>
      </section>

      <section className="wp-priv-sec">
        <h2>Quem é responsável</h2>
        <p>
          A <b>GSS</b> opera o Eleva. A marca que te deu acesso (por exemplo, Meraki ou
          Sorocaps&nbsp;·&nbsp;Drogaria São Paulo) é quem decide quem entra e o que é ensinado.
          Dúvida ou pedido sobre os seus dados: <a href={`mailto:${CONTATO}`}>{CONTATO}</a>.
        </p>
      </section>

      <section className="wp-priv-sec">
        <h2>O que guardamos</h2>

        <h3>Quando você cria a conta</h3>
        <ul>
          <li><b>E-mail e senha</b> — a senha é guardada pelo Firebase (Google), criptografada. A GSS nunca vê a sua senha.</li>
          <li><b>Nome</b> que você escreve.</li>
          <li><b>Seu perfil</b>: se é balconista, promotor, afiliado ou gestor, e a(s) marca(s) que você representa.</li>
        </ul>

        <h3>Enquanto você usa</h3>
        <ul>
          <li><b>Quais pílulas você assistiu</b>, quais quizzes acertou e quais missões concluiu — com data.</li>
          <li><b>Seus pontos, dias seguidos e posição no ranking.</b></li>
          <li><b>O que você busca</b> no campo de pesquisa (só o termo, para a marca saber o que a ponta pergunta).</li>
        </ul>

        <h3>Quando você registra uma objeção</h3>
        <ul>
          <li>O texto que você escreveu, seu nome, e-mail e perfil.</li>
          <li>
            <b>Importante:</b> esse campo é livre. Escreva a objeção <b>sem</b> identificar a cliente e
            <b> sem</b> informação de saúde dela. Dado de saúde de outra pessoa não deve ser registrado aqui.
          </li>
        </ul>

        <h3>Se você pedir contato pelo site</h3>
        <ul>
          <li>Nome, empresa, e-mail, WhatsApp e a mensagem — usados só para responder você.</li>
        </ul>
      </section>

      <section className="wp-priv-sec">
        <h2>O que NÃO guardamos</h2>
        <ul>
          <li>Sua senha (fica com o Firebase, criptografada).</li>
          <li>Dados de pagamento — o Eleva não cobra de você.</li>
          <li>Sua localização, seus contatos, suas fotos ou seu histórico de navegação fora do app.</li>
          <li>Imagem de cupom fiscal. Cupom de farmácia revela o que a cliente comprou, e isso é dado sensível.</li>
        </ul>
      </section>

      <section className="wp-priv-sec">
        <h2>Quem vê o quê</h2>
        <ul>
          <li><b>Você</b> vê tudo que é seu.</li>
          <li>
            <b>O gestor da sua marca</b> vê o uso do time: quem assistiu, quantos pontos, quais objeções
            foram registradas. É para isso que a marca contrata o programa.
          </li>
          <li><b>Seus colegas não veem os seus dados.</b> No ranking aparece nome e pontuação, nada mais.</li>
          <li><b>Outras marcas não veem nada suas.</b> Cada marca enxerga apenas o próprio time.</li>
        </ul>
      </section>

      <section className="wp-priv-sec">
        <h2>Com quem compartilhamos</h2>
        <p>Apenas com quem faz o app funcionar:</p>
        <ul>
          <li><b>Google Firebase</b> — login e banco de dados.</li>
          <li><b>Vercel</b> — hospedagem.</li>
          <li>
            <b>Google Gemini</b> — só quando você usa o Tira-dúvida. A pergunta que você digita é enviada
            para gerar a resposta. Não envie dado pessoal seu nem de cliente nesse campo.
          </li>
        </ul>
        <p>Nenhum deles recebe seus dados para usar por conta própria.</p>
      </section>

      <section className="wp-priv-sec">
        <h2>Por quanto tempo</h2>
        <p>
          Enquanto você tiver conta. Se pedir exclusão, apagamos em até <b>30 dias</b> — exceto o que a
          lei obrigue a guardar.
        </p>
      </section>

      <section className="wp-priv-sec">
        <h2>Seus direitos</h2>
        <p>A LGPD te dá o direito de, a qualquer momento:</p>
        <ul>
          <li>Saber o que guardamos sobre você;</li>
          <li>Corrigir o que estiver errado;</li>
          <li><b>Pedir a exclusão</b> da sua conta e dos seus dados;</li>
          <li>Receber uma cópia dos seus dados;</li>
          <li>Retirar o consentimento.</li>
        </ul>
        <p>
          Para exercer qualquer um deles, escreva para <a href={`mailto:${CONTATO}`}>{CONTATO}</a>.
          Respondemos em até 15 dias.
        </p>
      </section>

      <section className="wp-priv-sec">
        <h2>Segurança</h2>
        <ul>
          <li>Acesso só com login. Cada pessoa lê apenas os próprios dados.</li>
          <li>Conexão criptografada (HTTPS) do começo ao fim.</li>
          <li>As chaves de acesso ficam no servidor, nunca no seu aparelho.</li>
        </ul>
        <p>
          Nenhum sistema é 100% imune. Se acontecer um incidente que ponha seus dados em risco,
          avisamos você e a autoridade competente.
        </p>
      </section>

      <section className="wp-priv-sec">
        <h2>Menores de idade</h2>
        <p>O Eleva é para uso profissional. Não é destinado a menores de 18 anos.</p>
      </section>

      <section className="wp-priv-sec">
        <h2>Mudanças</h2>
        <p>
          Se algo mudar de forma relevante, avisamos no app. A data no topo mostra a última atualização.
        </p>
      </section>

      <p className="wp-priv-foot">
        Eleva · GSS — educação de produto que vende na ponta.
      </p>
    </div>
  );
}
