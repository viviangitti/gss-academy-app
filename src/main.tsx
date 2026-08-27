import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Apply saved theme before render (avoids flash)
const savedTheme = localStorage.getItem('gss_theme');
if (savedTheme === 'dark' || savedTheme === 'light') {
  document.documentElement.setAttribute('data-theme', savedTheme);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Service worker: guarda o app pra abrir sem rede — e precisa saber sair da
// frente quando sobe versão nova.
//
// O problema real: no celular ninguém fecha aba. A pessoa volta pro app dias
// depois, o navegador reaproveita a página que já estava carregada e continua
// rodando o código antigo — a correção sobe e o time não vê. Já aconteceu mais
// de uma vez ("não atualizou").
//
// Duas linhas resolvem: procurar versão nova toda vez que o app volta pra
// frente, e recarregar sozinho quando ela assume. O recarregamento só vale pra
// quem JÁ tinha uma versão rodando — na primeira visita o worker também assume,
// e recarregar ali seria um pisca-pisca sem motivo.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      const procuraVersaoNova = () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {});
      };
      document.addEventListener('visibilitychange', procuraVersaoNova);
      window.addEventListener('focus', procuraVersaoNova);
    }).catch(() => {
      // SW registration failed silently
    });

    const tinhaVersaoRodando = !!navigator.serviceWorker.controller;
    let recarregando = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!tinhaVersaoRodando || recarregando) return;
      recarregando = true; // sem isso, dois eventos viram dois reloads
      window.location.reload();
    });
  });
}


// Atalho de DESENVOLVIMENTO para conferir o desenho do one-page sem passar pelo
// compartilhamento do celular. Só em dev: não vai para o pacote publicado.
if (import.meta.env.DEV) {
  import('./pilulas/data/onePage').then((m) => {
    (window as unknown as Record<string, unknown>).onePageDebug = m.desenharOnePage;
  });
}
