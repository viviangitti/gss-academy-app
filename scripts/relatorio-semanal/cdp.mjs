// Chrome sem cabeça, falado direto por CDP. Sem puppeteer: só o WebSocket do Node.
import { spawn } from 'child_process';
import fs from 'fs';
const CHROME = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'].find((p) => fs.existsSync(p));
export async function abrirChrome({ porta = 9336, perfil = process.env.HOME + '/.claude/eleva-uso/chrome-relatorio' } = {}) {
  if (!CHROME) throw new Error('Chrome não encontrado');
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${porta}`, `--user-data-dir=${perfil}`, '--no-first-run', '--no-default-browser-check',
    '--disable-gpu', '--hide-scrollbars', '--force-color-profile=srgb', '--disable-features=Translate,MediaRouter', 'about:blank'], { stdio: 'ignore' });
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`http://127.0.0.1:${porta}/json/version`); if (r.ok) return { proc, ws: (await r.json()).webSocketDebuggerUrl }; } catch { /* subindo */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  proc.kill(); throw new Error('Chrome não abriu a porta');
}
export function conectar(wsUrl) {
  const sock = new WebSocket(wsUrl); let id = 0; const esperando = new Map(); let sessionId = null;
  sock.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && esperando.has(m.id)) { const { ok, falha } = esperando.get(m.id); esperando.delete(m.id); m.error ? falha(new Error(m.error.message)) : ok(m.result); } });
  const cru = (method, params = {}, sess) => new Promise((ok, falha) => { const n = ++id; esperando.set(n, { ok, falha }); sock.send(JSON.stringify({ id: n, method, params, ...(sess ? { sessionId: sess } : {}) })); });
  const pronto = new Promise((ok, falha) => { sock.addEventListener('error', falha); sock.addEventListener('open', async () => {
    try { const { targetId } = await cru('Target.createTarget', { url: 'about:blank' }); ({ sessionId } = await cru('Target.attachToTarget', { targetId, flatten: true })); ok(); } catch (e) { falha(e); } }); });
  return { pronto, send: (m, p) => cru(m, p, sessionId), fechar: () => sock.close() };
}
