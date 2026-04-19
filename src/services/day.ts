// "Meu Dia" — organizador simples do dia
// Dados persistidos por data. Migra focos pendentes automaticamente.

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

export interface DayFocus {
  text: string;
  done: boolean;
  fromYesterday?: boolean;
}

export interface DayData {
  date: string; // YYYY-MM-DD
  focuses: DayFocus[]; // tamanho variável (3 base + migrados)
  meetings: DayMeeting[];
  tasks: DayTask[];
}

const KEY = 'gss_day';
const ARCHIVE_KEY = 'gss_day_archive'; // últimos dias para histórico

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function emptyFocuses(): DayFocus[] {
  return [
    { text: '', done: false },
    { text: '', done: false },
    { text: '', done: false },
  ];
}

function emptyDay(date: string): DayData {
  return { date, focuses: emptyFocuses(), meetings: [], tasks: [] };
}

// Retorna o dia — se a data mudou, migra focos pendentes do dia anterior
export function getDay(): DayData {
  const today = todayStr();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyDay(today);

    const parsed = JSON.parse(raw) as DayData;

    // Compat com formato antigo (focuses: string[])
    if (Array.isArray(parsed.focuses) && parsed.focuses.length > 0 && typeof parsed.focuses[0] === 'string') {
      parsed.focuses = (parsed.focuses as unknown as string[]).map(t => ({ text: t, done: false }));
    }

    if (parsed.date === today) return parsed;

    // Dia mudou: arquiva o antigo e migra pendentes
    archiveDay(parsed);

    const pending = parsed.focuses.filter(f => f.text.trim() && !f.done);
    const migratedFocuses: DayFocus[] = [
      ...emptyFocuses(),
      ...pending.map(f => ({ text: f.text, done: false, fromYesterday: true })),
    ];

    const newDay: DayData = {
      date: today,
      focuses: migratedFocuses,
      meetings: [],
      tasks: [],
    };
    saveDay(newDay);
    return newDay;
  } catch {
    return emptyDay(today);
  }
}

function archiveDay(day: DayData): void {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    const archive: DayData[] = raw ? JSON.parse(raw) : [];
    // Mantém apenas os últimos 30 dias
    archive.push(day);
    const trimmed = archive.slice(-30);
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

export function saveDay(data: DayData): void {
  localStorage.setItem(KEY, JSON.stringify({ ...data, date: todayStr() }));
}

export function setFocusText(index: number, value: string): DayData {
  const day = getDay();
  if (!day.focuses[index]) day.focuses[index] = { text: '', done: false };
  day.focuses[index].text = value;
  saveDay(day);
  return day;
}

export function toggleFocus(index: number): DayData {
  const day = getDay();
  if (day.focuses[index]) {
    day.focuses[index].done = !day.focuses[index].done;
    saveDay(day);
  }
  return day;
}

export function removeFocus(index: number): DayData {
  const day = getDay();
  // Não remove os 3 primeiros (base), só os migrados
  if (index >= 3) {
    day.focuses.splice(index, 1);
    saveDay(day);
  } else {
    day.focuses[index] = { text: '', done: false };
    saveDay(day);
  }
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
