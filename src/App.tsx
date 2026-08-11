import { lazy, Suspense } from 'react';
import PilulasApp from './pilulas/PilulasApp';

// O coaching (MAESTR.IA) entra sob demanda: quem abre o gsseleva.com.br não
// baixa uma linha dele. Além de deixar o Eleva mais leve, isso tira do navegador
// o conteúdo de vendas da GSS, que é propriedade intelectual do produto.
const CoachApp = lazy(() => import('./CoachApp'));

function App() {
  // Eleva — app white-label de educação de produto p/ revenda. Árvore isolada,
  // sem login nem chrome do coaching. (/pilulas mantido p/ redirecionar links antigos.)
  const p = window.location.pathname;
  // No domínio do Eleva (gsseleva.com.br, eleva-*.vercel.app) TUDO é Eleva —
  // inclusive a raiz. A vitrine abre em gsseleva.com.br, sem /eleva na barra do
  // navegador: é um endereço só pra quem visita. Nada de mandar pro login
  // (Google) do app de coaching, que mora no outro domínio.
  const elevaHost = window.location.hostname.includes('eleva');
  if (elevaHost || p.startsWith('/eleva') || p.startsWith('/pilulas')) {
    return <PilulasApp />;
  }
  return (
    <Suspense fallback={null}>
      <CoachApp />
    </Suspense>
  );
}

export default App;
