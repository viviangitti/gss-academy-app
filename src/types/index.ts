export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  category: 'reuniao' | 'ritual' | 'followup' | 'treinamento';
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  icon: string;
  items: ChecklistItem[];
  isTemplate?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  role: string;
  company: string;
}
