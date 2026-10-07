/// <reference types="vite/client" />

/** Versão do pacote, injetada no build a partir do CACHE_NAME do sw.js. */
declare const __VERSAO_APP__: string;

/**
 * O BUILD LEGACY DO PDF.JS, que é o que o app usa de verdade (ver
 * data/cartaPdf.ts): ele traz os polyfills do core-js embutidos, na página e no
 * worker, e é isso que faz a carta abrir em celular de alguns anos atrás.
 *
 * O pacote só publica os tipos no caminho principal, então aponto os dois para
 * o mesmo lugar — é o mesmo código, compilado para um alvo mais antigo.
 */
declare module 'pdfjs-dist/legacy/build/pdf.min.mjs' {
  export * from 'pdfjs-dist';
}
declare module 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url' {
  const url: string;
  export default url;
}
