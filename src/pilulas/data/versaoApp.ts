// VERSÃO NOVA E INSTALAÇÃO — os dois avisos que o app precisa dar sobre si.
//
// VERSÃO NOVA: o app é um PWA. Quem abriu de manhã segue com o pacote da manhã
// o dia inteiro, mesmo depois de eu publicar uma correção — e a gerência
// pergunta por que o conserto "não chegou". Antes o app recarregava sozinho
// quando o worker novo assumia; parecia mágica boa até recarregar no meio de
// uma pergunta ao Tira-dúvida e apagar o que a pessoa tinha digitado. Agora
// avisa e deixa ela escolher a hora.
//
// INSTALAÇÃO: pela aba do navegador o vendedor perde o app na décima aba, não
// recebe atalho na tela inicial e reabre pelo histórico. Instalado, vira ícone.
import { useSyncExternalStore } from 'react';

const CHAVE_DISPENSA = 'wp_instalar_dispensado';

// ---- estado observável, um por assunto ----
function criarSinal(inicial: boolean) {
  let valor = inicial;
  const ouvintes = new Set<() => void>();
  return {
    ler: () => valor,
    definir(v: boolean) {
      if (valor === v) return;
      valor = v;
      ouvintes.forEach((f) => f());
    },
    assinar(f: () => void) {
      ouvintes.add(f);
      return () => { ouvintes.delete(f); };
    },
  };
}

const versao = criarSinal(false);
const instalavel = criarSinal(false);

/** Chamado pelo main.tsx quando o worker novo assume o controle da página. */
export function avisarVersaoNova(): void {
  versao.definir(true);
}

export function useVersaoNova(): boolean {
  return useSyncExternalStore(versao.assinar, versao.ler, () => false);
}

export function recarregarApp(): void {
  window.location.reload();
}

// ---- instalação ----

interface EventoInstalar extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let convite: EventoInstalar | null = null;

/** Já está instalado (aberto pela tela inicial)? */
export function jaInstalado(): boolean {
  try {
    if (window.matchMedia('(display-mode: standalone)').matches) return true;
    // iOS não implementa display-mode: standalone; usa esta propriedade antiga.
    return (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  } catch {
    return false;
  }
}

/**
 * Está dentro do navegador de OUTRO app (WhatsApp, Instagram, Facebook)?
 *
 * É o caminho normal: a gerência manda o link no grupo, a pessoa toca e o
 * WhatsApp abre a página DENTRO dele. Ali "adicionar à tela de início" não
 * existe, ou cria um atalho que reabre o WhatsApp. A pessoa tenta, não
 * consegue, e conclui que o app não instala.
 */
export function ehNavegadorDeApp(): boolean {
  const ua = navigator.userAgent;
  return /FBAN|FBAV|Instagram|Line\/|WhatsApp|GSA\//.test(ua)
    // Chrome/Edge/Firefox no iPhone também não instalam: só o Safari.
    || (ehIOS() && /CriOS|FxiOS|EdgiOS/.test(ua));
}

export function ehIOS(): boolean {
  const ua = navigator.userAgent;
  // iPad recente se apresenta como Mac; a pista é ter toque.
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

export function dispensouInstalar(): boolean {
  try { return localStorage.getItem(CHAVE_DISPENSA) === '1'; } catch { return false; }
}

export function dispensarInstalar(): void {
  try { localStorage.setItem(CHAVE_DISPENSA, '1'); } catch { /* cheio */ }
  instalavel.definir(false);
}

export function useConviteInstalar(): boolean {
  return useSyncExternalStore(instalavel.assinar, instalavel.ler, () => false);
}

/**
 * Liga a escuta de instalação. Chamado uma vez, no arranque.
 *
 * No Android o navegador oferece um convite nativo, que a gente guarda pra
 * disparar quando a pessoa tocar em "Instalar". No iPhone esse convite não
 * existe — lá o único caminho é o menu Compartilhar, e o card explica o passo
 * a passo em vez de ter botão.
 */
export function escutarInstalacao(): void {
  if (jaInstalado() || dispensouInstalar()) return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    convite = e as EventoInstalar;
    instalavel.definir(true);
  });
  window.addEventListener('appinstalled', () => {
    convite = null;
    instalavel.definir(false);
  });
  // iPhone: sem evento nenhum. Mostra o card do mesmo jeito, com instrução.
  if (ehIOS()) instalavel.definir(true);
}

/** Devolve true se a pessoa aceitou instalar. */
export async function instalarAgora(): Promise<boolean> {
  if (!convite) return false;
  try {
    await convite.prompt();
    const r = await convite.userChoice;
    if (r.outcome === 'accepted') instalavel.definir(false);
    return r.outcome === 'accepted';
  } catch {
    return false;
  } finally {
    convite = null;
  }
}
