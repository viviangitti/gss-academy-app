// Lembrete diário (estilo Rallyware): mantém a ofensiva viva.
// Valor real hoje = o check-in dentro do app. Extra opcional = uma notificação local
// que dispara quando a pessoa abre o app num dia novo sem ter assistido nada.
// (Lembrete automático com o app fechado precisa de push/servidor — fica pro Firebase.)
import { getStats } from './tracking';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Já garantiu o dia? (assistiu qualquer pílula hoje)
export function watchedToday(): boolean {
  const stats = getStats();
  const suffix = '@' + todayISO();
  return Object.keys(stats.perProduct).some((k) => k.endsWith(suffix));
}

type NotifState = 'granted' | 'denied' | 'default' | 'unsupported';

export function notifState(): NotifState {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission as NotifState;
}

const PREF_KEY = 'wp_notif_on';
const LAST_KEY = 'wp_notif_last';

export function notifPref(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) === '1' && notifState() === 'granted';
  } catch {
    return false;
  }
}

export async function enableNotif(): Promise<NotifState> {
  if (typeof Notification === 'undefined') return 'unsupported';
  let perm = Notification.permission as NotifState;
  if (perm === 'default') {
    perm = (await Notification.requestPermission()) as NotifState;
  }
  try {
    localStorage.setItem(PREF_KEY, perm === 'granted' ? '1' : '0');
  } catch {
    /* ignore */
  }
  if (perm === 'granted') {
    try {
      new Notification('Eleva ✓', { body: 'Pronto! Vou te lembrar por aqui de manter a ofensiva.' });
    } catch {
      /* ignore */
    }
  }
  return perm;
}

export function disableNotif(): void {
  try {
    localStorage.setItem(PREF_KEY, '0');
  } catch {
    /* ignore */
  }
}

// Chamado ao abrir o "Hoje": se ligou o lembrete, é dia novo e ainda não assistiu,
// dispara UMA notificação local (não repete no mesmo dia).
export function maybeNotify(): void {
  if (!notifPref()) return;
  if (watchedToday()) return;
  const day = todayISO();
  try {
    if (localStorage.getItem(LAST_KEY) === day) return;
    localStorage.setItem(LAST_KEY, day);
    if (notifState() === 'granted' && typeof Notification !== 'undefined') {
      new Notification('Sua pílula de hoje 💊', {
        body: 'Assiste 30s e mantém sua ofensiva viva — a cliente já já pergunta.',
      });
    }
  } catch {
    /* ignore */
  }
}
