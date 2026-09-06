// LEITURA DO FIRESTORE DE FORA DO APP, com a conta que já está logada.
//
// Usa o refresh token que o firebase-tools guarda quando você roda
// `npx firebase login`. Não há segredo novo aqui: o client_id/secret abaixo são
// os PÚBLICOS da CLI do Firebase, iguais em toda instalação — o que autentica
// de verdade é o refresh token da máquina, que não está no repositório.
//
// Serve aos scripts que precisam ler o que está publicado sem passar pelo app:
// o confere-carta, o relatório de uso e a gravação dos tutoriais.
import fs from 'fs';

const conf = JSON.parse(fs.readFileSync(`${process.env.HOME}/.config/configstore/firebase-tools.json`, 'utf8'));
const tk = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
    client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi',
    refresh_token: conf.tokens.refresh_token,
    grant_type: 'refresh_token',
  }),
}).then((r) => r.json());
if (!tk.access_token) {
  console.error('Sem acesso ao Firebase. Rode `npx firebase login` e tente de novo.');
  process.exit(1);
}

export const TOKEN = tk.access_token;
export const BASE = 'https://firestore.googleapis.com/v1/projects/eleva-gss/databases/(default)/documents';

export async function get(caminho) {
  return fetch(`${BASE}/${caminho}`, { headers: { Authorization: `Bearer ${TOKEN}` } }).then((r) => r.json());
}

export function val(v) {
  if (v == null) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(val);
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, val(x)]));
  return v;
}

export function doc2obj(d) {
  return Object.fromEntries(Object.entries(d.fields || {}).map(([k, v]) => [k, val(v)]));
}
