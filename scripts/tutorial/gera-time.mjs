// O TIME, no formato que o Painel espera — só para a gravação do vídeo.
//
// A sessão de captura não tem login do Firebase: a leitura do time falha e a
// aba Resultados sai vazia. Este arquivo alimenta o remendo TEMPORÁRIO de
// teamStats.ts durante a gravação (ver README) e não vai para o app.
import fs from 'fs';
import { get, doc2obj } from '../_firestore.mjs';

const TESTE = /gitti|silene|mari\.briso|teste|diagnostico|sync|maria26|demo/i;
const st = await get('elevaStats?pageSize=300');
const gente = (st.documents || [])
  .map((d) => ({ uid: d.name.split('/').pop(), ...doc2obj(d) }))
  .filter((u) => u.brand === 'ramasa' && !TESTE.test(`${u.email || ''} ${u.name || ''}`));

const time = gente.map((u) => ({
  uid: u.uid,
  name: String(u.name || u.email?.split('@')[0] || 'Sem nome'),
  email: String(u.email || ''),
  role: String(u.role || ''),
  cargo: u.cargo || undefined,
  loja: u.loja || undefined,
  totals: {
    views: u.totals?.views || 0,
    missions: u.totals?.missions || 0,
    quizPassed: u.totals?.quizPassed || 0,
    streak: u.totals?.streak || 0,
  },
  cartaoPronto: u.cartaoPronto === true,
  month: {
    id: String(u.month?.id || ''),
    views: u.month?.views || 0,
    points: u.month?.points || 0,
    missions: u.month?.missions || 0,
  },
  pilares: {
    razao: u.pilares?.razao || 0,
    magia: u.pilares?.magia || 0,
    satisfacao: u.pilares?.satisfacao || 0,
  },
  events: Array.isArray(u.events) ? u.events.map((e) => ({ type: e.type, id: e.id, at: e.at, points: e.points || 0 })) : [],
  lastActiveAt: u.lastActiveAt || undefined,
}));

fs.writeFileSync('time-ramasa.json', JSON.stringify(time));
console.log('time-ramasa.json:', time.length, 'pessoas ·', time.reduce((n, p) => n + p.events.length, 0), 'eventos');
