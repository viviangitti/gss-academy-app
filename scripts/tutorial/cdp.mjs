// Chrome headless por CDP — grava as telas reais do app pro tutorial.
//
// Por que não uso o navegador da sessão: cada print voltaria pro meu contexto,
// e são trinta e poucos. Aqui o PNG vai direto pro disco.
import { spawn } from 'child_process';
import fs from 'fs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORTA = 9333;
const PERFIL = '/tmp/eleva-tutorial-chrome';

export async function abrirChrome() {
  fs.rmSync(PERFIL, { recursive: true, force: true });
  const p = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${PORTA}`, `--user-data-dir=${PERFIL}`,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
    '--force-device-scale-factor=3', '--window-size=390,844',
    'about:blank',
  ], { stdio: 'ignore' });
  for (let i = 0; i < 60; i++) {
    try {
      const alvos = await fetch(`http://127.0.0.1:${PORTA}/json/list`).then((r) => r.json());
      const alvo = alvos.find((a) => a.type === 'page');
      if (alvo) return { proc: p, ws: alvo.webSocketDebuggerUrl };
    } catch { /* subindo */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('Chrome não subiu');
}

export function conectar(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pendentes = new Map();
  const pronto = new Promise((res) => { ws.onopen = res; });
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pendentes.has(m.id)) {
      const { ok, erro } = pendentes.get(m.id);
      pendentes.delete(m.id);
      m.error ? erro(new Error(m.error.message)) : ok(m.result);
    }
  };
  return {
    pronto,
    send(method, params = {}) {
      return new Promise((ok, erro) => {
        const n = ++id;
        pendentes.set(n, { ok, erro });
        ws.send(JSON.stringify({ id: n, method, params }));
      });
    },
    fechar: () => ws.close(),
  };
}
