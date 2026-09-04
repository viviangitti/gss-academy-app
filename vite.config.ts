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
  define: {
    __VERSAO_APP__: JSON.stringify(versaoDoApp()),
  },
})
