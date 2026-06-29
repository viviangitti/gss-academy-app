// Helper compartilhado: inicializa o Firebase Admin uma vez por container.
// Lê a service account de FIREBASE_SERVICE_ACCOUNT (JSON em string) na env do Vercel.

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Usuários internos que NÃO entram nos contadores/listagem
// (contas da Vivian e Silene usadas pra teste do app)
const EXCLUDED_NAMES = ['vivian', 'silene'];
const EXCLUDED_EMAILS = ['viviangitti23@gmail.com', 'gssacademyoficial@gmail.com'];

export function isInternalUser(userData = {}) {
  const name = String(userData.name || '').toLowerCase();
  const email = String(userData.email || '').toLowerCase();
  if (EXCLUDED_EMAILS.includes(email)) return true;
  for (const blocked of EXCLUDED_NAMES) {
    if (name.startsWith(blocked + ' ') || name === blocked) return true;
  }
  return false;
}

let _db = null;

export function getDb() {
  if (_db) return _db;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT env var não configurada');
  }

  let credentials;
  try {
    credentials = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT inválido (não é JSON): ' + e.message);
  }

  if (!getApps().length) {
    initializeApp({ credential: cert(credentials) });
  }

  _db = getFirestore();
  return _db;
}
