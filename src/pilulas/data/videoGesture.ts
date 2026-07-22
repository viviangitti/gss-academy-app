// Abrir a pílula COM SOM.
//
// Navegador nenhum deixa um vídeo tocar com áudio por conta própria. A única
// porta é o toque da pessoa — e ela só vale para um `play()` disparado DENTRO
// do toque, na mesma tarefa. Tentar depois, quando a tela do produto monta,
// chega tarde: o navegador já negou.
//
// Então a gente monta o player no toque do card (que é quando temos permissão),
// dá play com som ali mesmo, e a tela do produto ADOTA esse mesmo elemento em
// vez de criar outro. O áudio nunca é interrompido, então nunca é bloqueado.
import { findProduct, getVideoObjectUrl, hasVideo } from './store';
import { audienceVideoKey, getAudienceReel } from './audienceVideos';
import type { Audience } from '../AuthContext';

// Quanto tempo o player fica esperando ser adotado. Se a tela do produto não
// abrir nesse prazo (a pessoa desistiu, a navegação falhou), ele se cala — som
// tocando sem vídeo na tela seria assustador.
const ESPERA_MS = 4000;

let preparado: { url: string; el: HTMLVideoElement } | null = null;
let descarte: ReturnType<typeof setTimeout> | null = null;

function jogarFora() {
  if (descarte) { clearTimeout(descarte); descarte = null; }
  if (!preparado) return;
  preparado.el.pause();
  preparado.el.removeAttribute('src');
  preparado.el.load();
  preparado = null;
}

// Qual arquivo este público veria neste produto. Mesma ordem de prioridade do
// Reel — se mudar lá, mude aqui.
export function videoDoProduto(productId: string, audience: Audience | null): string | null {
  const p = findProduct(productId);
  if (!p) return null;
  if (audience) {
    const k = audienceVideoKey(productId, audience);
    if (hasVideo(k)) return getVideoObjectUrl(k) || null;
    const reel = getAudienceReel(productId, audience);
    // Reel do Instagram é um embed, não um arquivo que dá pra tocar aqui.
    if (reel) return null;
    const estatico = p.audienceVideos?.[audience];
    if (estatico) return estatico;
  }
  return getVideoObjectUrl(productId) || p.videoUrl || null;
}

// CHAMAR DENTRO DO TOQUE. Cria o player e já começa a tocar com som.
export function prepararVideo(url: string): void {
  if (preparado?.url === url) return; // já está a caminho
  jogarFora();
  const el = document.createElement('video');
  el.src = url;
  el.playsInline = true;
  el.preload = 'auto';
  el.controls = true;
  el.muted = false;
  preparado = { url, el };
  descarte = setTimeout(jogarFora, ESPERA_MS);
  el.play().catch(() => {
    // Aparelho recusou mesmo com o toque (iPhone em economia de bateria, por
    // exemplo). Deixa pra tela do produto resolver do jeito antigo.
    jogarFora();
  });
}

// A tela do produto pega o player que já está tocando, se for o mesmo vídeo.
// LEITURA SÓ: em desenvolvimento o React monta o componente duas vezes, e se
// esta função "consumisse" o player, a segunda montagem não acharia nada.
// Quem confirma a adoção é adotarVideo(), já dentro do efeito.
export function pegarVideoPreparado(url: string): HTMLVideoElement | null {
  if (!preparado || preparado.url !== url) return null;
  if (descarte) { clearTimeout(descarte); descarte = null; }
  return preparado.el;
}

// A tela assumiu o player: o módulo solta a referência.
export function adotarVideo(el: HTMLVideoElement): void {
  if (preparado?.el === el) preparado = null;
}
