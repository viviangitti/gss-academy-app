// Locução grátis pela voz do próprio navegador (Web Speech API).
// Sem servidor, sem custo, sem chave. A voz muda de aparelho pra aparelho
// (cada sistema tem a sua) — é o protótipo. Voz profissional (ElevenLabs/
// Gemini) fica pra uma segunda fase, com áudio pré-gravado por pílula.

export function speechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  );
}

// A lista de vozes carrega de forma assíncrona no Chrome — por isso guardamos
// a voz pt-BR quando ela fica disponível (evento 'voiceschanged').
let ptVoice: SpeechSynthesisVoice | null | undefined;

// Nem toda voz pt-BR é boa: o macOS tem vozes "de brincadeira" (Eddy, Flo…)
// que soam péssimas, e o Chrome/Android têm a voz do Google (de rede), bem mais
// natural. Damos nota pra cada voz e escolhemos a melhor.
const GOOD = /google|luciana|microsoft|maria|helo[íi]sa|francisca|ant[oô]nio|enhanced|premium|natural|neural|online|siri/i;
const NOVELTY = /eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley|bubbles|jester|superstar|bells|boing|bad news|good news|wobble|trinoids|albert|organ|cellos|zarvox/i;

function voiceScore(v: SpeechSynthesisVoice): number {
  if (!/^pt/i.test(v.lang)) return -1;
  let s = 0;
  if (/pt[-_]BR/i.test(v.lang)) s += 2; // prefere Brasil a Portugal
  if (GOOD.test(v.name)) s += 5;
  if (v.localService === false) s += 3; // vozes de rede costumam ser melhores
  if (NOVELTY.test(v.name)) s -= 8; // fora com as vozes de brincadeira
  return s;
}

function loadVoice(): SpeechSynthesisVoice | null {
  if (!speechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const pt = voices.filter((v) => /^pt/i.test(v.lang));
  if (!pt.length) return null;
  return pt.sort((a, b) => voiceScore(b) - voiceScore(a))[0];
}

if (speechSupported() && typeof window.speechSynthesis.addEventListener === 'function') {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    ptVoice = loadVoice();
  });
}

// iOS só deixa falar se um "speak" acontecer dentro do toque do usuário.
// Chamamos isto no clique do botão pra destravar a locução.
export function primeSpeech(): void {
  if (!speechSupported()) return;
  const u = new SpeechSynthesisUtterance(' ');
  u.volume = 0;
  window.speechSynthesis.speak(u);
}

export function speak(text: string, onEnd?: () => void): void {
  if (!speechSupported()) {
    onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel(); // interrompe a fala anterior antes de começar a nova
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'pt-BR';
  if (ptVoice === undefined) ptVoice = loadVoice();
  if (ptVoice) u.voice = ptVoice;
  u.rate = 0.95; // um tico mais devagar soa menos "robô"
  u.pitch = 1;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.(); // se falhar, não trava o slideshow
  synth.speak(u);
}

export function stopSpeaking(): void {
  if (speechSupported()) window.speechSynthesis.cancel();
}
