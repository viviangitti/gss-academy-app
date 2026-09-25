// O SELO DO VALOR, na hora em que a ação acontece.
//
// Um sinal simples: quem carimba avisa, a tela escuta e mostra o selo por
// alguns segundos. Fica separado de tracking.ts porque tracking é dado e isto
// é aviso de tela — e porque assim o React não entra no arquivo que roda
// também fora de componente.
import { useSyncExternalStore } from 'react';

let ultimo: { valorId: string; em: number } | null = null;
const ouvintes = new Set<() => void>();

function avisar() {
  ouvintes.forEach((f) => f());
}

/** Chamado pelo tracking quando uma ação carimba um valor. */
export function avisarCarimbo(valorId: string): void {
  ultimo = { valorId, em: Date.now() };
  avisar();
}

/** A tela usa para saber o que mostrar; null = nada a mostrar agora. */
export function useCarimbo(): { valorId: string; em: number } | null {
  return useSyncExternalStore(
    (f) => { ouvintes.add(f); return () => { ouvintes.delete(f); }; },
    () => ultimo,
    () => null,
  );
}

/** Some com o selo (o tempo acabou ou a pessoa tocou nele). */
export function limparCarimbo(): void {
  ultimo = null;
  avisar();
}
