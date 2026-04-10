// LocalStorage service - ready to swap for Firebase later

const KEYS = {
  EVENTS: 'gss_events',
  CHECKLISTS: 'gss_checklists',
  CHAT_HISTORY: 'gss_chat',
  PROFILE: 'gss_profile',
};

export function loadData<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

export function saveData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export { KEYS };
