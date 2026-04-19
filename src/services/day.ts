// "Meu Dia" — organizador simples do dia
// Dados persistidos por data. Limpa dias antigos automaticamente.

export interface DayMeeting {
  id: string;
  time: string; // HH:mm
  title: string;
  notes?: string;
}

export interface DayTask {
  id: string;
  text: string;
  done: boolean;
}

export interface DayData {
  date: string; // YYYY-MM-DD
  focuses: string[]; // 3 focos
  meetings: DayMeeting[];
  tasks: DayTask[];
}

const KEY = 'gss_day';

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function getDay(): DayData {
  try {
    const data = localStorage.getItem(KEY);
    if (!data) return emptyDay();
    const parsed = JSON.parse(data) as DayData;
    // Se a data salva não é hoje, retorna um novo dia (mantém dados antigos na memória até salvar novo)
    if (parsed.date !== todayStr()) return emptyDay();
    return parsed;
  } catch {
    return emptyDay();
  }
}

function emptyDay(): DayData {
  return { date: todayStr(), focuses: ['', '', ''], meetings: [], tasks: [] };
}

export function saveDay(data: DayData): void {
  localStorage.setItem(KEY, JSON.stringify({ ...data, date: todayStr() }));
}

export function setFocus(index: number, value: string): DayData {
  const day = getDay();
  day.focuses[index] = value;
  saveDay(day);
  return day;
}

export function addMeeting(meeting: Omit<DayMeeting, 'id'>): DayData {
  const day = getDay();
  day.meetings.push({ ...meeting, id: generateId() });
  day.meetings.sort((a, b) => a.time.localeCompare(b.time));
  saveDay(day);
  return day;
}

export function removeMeeting(id: string): DayData {
  const day = getDay();
  day.meetings = day.meetings.filter(m => m.id !== id);
  saveDay(day);
  return day;
}

export function addTask(text: string): DayData {
  const day = getDay();
  day.tasks.push({ id: generateId(), text, done: false });
  saveDay(day);
  return day;
}

export function toggleTask(id: string): DayData {
  const day = getDay();
  const t = day.tasks.find(x => x.id === id);
  if (t) t.done = !t.done;
  saveDay(day);
  return day;
}

export function removeTask(id: string): DayData {
  const day = getDay();
  day.tasks = day.tasks.filter(t => t.id !== id);
  saveDay(day);
  return day;
}
