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

export type Segment =
  | 'farmaceutico'
  | 'automotivo'
  | 'tecnologia'
  | 'varejo'
  | 'imobiliario'
  | 'financeiro'
  | 'industria'
  | 'saude'
  | 'educacao'
  | 'servicos'
  | 'agro'
  | 'energia'
  | '';

export const SEGMENTS: { value: Segment; label: string }[] = [
  { value: '', label: 'Selecione seu segmento' },
  { value: 'farmaceutico', label: 'Farmacêutico' },
  { value: 'automotivo', label: 'Automotivo' },
  { value: 'tecnologia', label: 'Tecnologia / Software' },
  { value: 'varejo', label: 'Varejo' },
  { value: 'imobiliario', label: 'Imobiliário' },
  { value: 'financeiro', label: 'Financeiro / Seguros' },
  { value: 'industria', label: 'Indústria / Manufatura' },
  { value: 'saude', label: 'Saúde / Estética' },
  { value: 'educacao', label: 'Educação' },
  { value: 'servicos', label: 'Serviços / Consultoria' },
  { value: 'agro', label: 'Agronegócio' },
  { value: 'energia', label: 'Energia / Sustentabilidade' },
];

export interface UserProfile {
  name: string;
  role: string;
  company: string;
  segment: Segment;
}

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}
