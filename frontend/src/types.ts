export type Urgency = 'Critico' | 'urgent' | 'standard' | 'recovery';
export type Category = 'food' | 'shelter' | 'reconstruction' | 'cleanup' | 'tools' | 'volunteers';

export interface HelpRequest {
  id: string;
  slug: string;
  urgency: Urgency;
  category: Category;
  description: string | null;
  lat: number;
  lng: number;
  contactType: string;
  contact: string;
  name: string | null;
  views: number;
  helpClicks: number;
  status: string;
  createdAt: string;
  expiresAt: string;
}

export const URGENCY_LABELS: Record<Urgency, string> = {
  Critico: 'Critico',
  urgent: 'Urgente',
  standard: 'Normal',
  recovery: 'Recuperação',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  food: 'Alimentação',
  shelter: 'Abrigo Temporário',
  reconstruction: 'Reconstrução de casa',
  cleanup: 'Limpeza',
  tools: 'Ferramentas',
  volunteers: 'Voluntários'
};
