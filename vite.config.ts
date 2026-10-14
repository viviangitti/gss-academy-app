import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'

// A VERSÃO DO APP, lida do próprio service worker no momento do build.
//
// Existe porque "tá igual" é a reclamação mais difícil de responder: o código
// está no ar e a pessoa está com o pacote de horas atrás, e nem ela nem eu
// temos como saber. Com a versão na tela, a conversa deixa de ser adivinhação —
// ela lê "v291" e eu sei na hora que falta atualizar.
//
// Sai daqui e não de uma constante à parte porque constante à parte a gente
// esquece de bumpar; o CACHE_NAME do sw.js é bumpado em todo deploy.
function versaoDoApp(): string {
  try {
    const sw = readFileSync('public/sw.js', 'utf8')
    return sw.match(/CACHE_NAME\s*=\s*'([^']+)'/)?.[1] || 'dev'
  } catch {
    return 'dev'
  }
}

export default defineConfig({
  plugins: [react()],
  // ESCUTAR EM IPv4, NÃO SÓ EM IPv6.
  //
  // Sem isto o Vite sobe em [::1] e mais nada. O navegador da pessoa não
  // percebe, mas o Chrome headless que grava os vídeos do tutorial não
  // alcança [::1] nesta máquina: ele falha em silêncio e grava a página de
  // erro. Em 14/10/2026 a gravação do vendedor saiu com os quadros todos de
  // 129.433 bytes — o mesmo tamanho, que é a assinatura do problema e está
  // anotada em scripts/tutorial/README.md.
  //
  // 127.0.0.1 em vez de 'localhost' de propósito: 'localhost' é justamente o
  // nome que resolve para ::1 e recria o problema.
  server: { host: '127.0.0.1' },
  define: {
    __VERSAO_APP__: JSON.stringify(versaoDoApp()),
  },
})
