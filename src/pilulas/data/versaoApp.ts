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

/**
 * PERGUNTA AO SERVIDOR SE ESTA CÓPIA ESTÁ VELHA.
 *
 * O aviso de versão dependia SÓ do evento `controllerchange` do service worker
 * — ou seja, de o navegador achar o worker novo, instalar, ativar e assumir a
 * página. Num app instalado na tela de início do iPhone isso às vezes não
 * acontece por dias: o app fica suspenso em segundo plano e ninguém vai buscar
 * nada. Foi assim que a Vivian ficou quinze versões atrás sem nenhum aviso na
 * tela.
 *
 * Esta conferência não depende de worker nenhum: lê o número que está no
 * servidor e compara com o que foi compilado NESTE pacote. Se for diferente,
 * está velho — ponto. É a mesma conta que a tela de Perfil já fazia, só que
 * agora ela roda pra todo mundo, na abertura e de tempos em tempos, em vez de
 * só pra quem entra no Perfil.
 */
export async function conferirVersao(): Promise<void> {
  const aqui = typeof __VERSAO_APP__ === 'string' ? __VERSAO_APP__ : '';
  if (!aqui || aqui === 'dev') return;
  try {
    // no-store porque é justamente o cache que está sendo investigado.
    const texto = await fetch('/sw.js', { cache: 'no-store' }).then((r) => r.text());
    const noServidor = texto.match(/CACHE_NAME\s*=\s*'([^']+)'/)?.[1];
    if (noServidor && noServidor !== aqui) versao.definir(true);
  } catch {
    /* sem rede: não é hora de avisar nada */
  }
}

export function useVersaoNova(): boolean {
  return useSyncExternalStore(versao.assinar, versao.ler, () => false);
}

/**
 * Recarrega pegando a versão nova de verdade.
 *
 * Só dar reload não bastava sempre: se o worker novo já tinha sido baixado mas
 * estava ESPERANDO (o padrão, quando a página velha ainda está aberta), o
 * reload voltava servido pelo worker velho e a pessoa via a mesma versão de
 * novo — clicava em "Atualizar" e nada mudava, que é o pior tipo de botão.
 * Aqui a gente manda o que está esperando assumir antes de recarregar.
 */
export function recarregarApp(): void {
  const seguir = () => window.location.reload();
  if (!('serviceWorker' in navigator)) return seguir();
  navigator.serviceWorker.getRegistration()
    .then((reg) => {
      reg?.waiting?.postMessage({ tipo: 'assumir' });
      // Não espera de graça: um segundo é o bastante pra troca acontecer, e
      // depois disso recarregar é melhor que ficar parado.
      setTimeout(seguir, reg?.waiting ? 900 : 0);
    })
    .catch(seguir);
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
