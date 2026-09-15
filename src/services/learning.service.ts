import type { LearningTrack } from '@/src/domain/learning';

export async function listLearningTracks(): Promise<LearningTrack[]> {
  return [
    {
      id: 'intro',
      title: 'Introdução',
      description: 'O que são investimentos, FIIs, Bolsa, risco e retorno.',
      lessons: [],
    },
    {
      id: 'first_steps',
      title: 'Primeiros passos',
      description: 'Conta, corretoras e primeira operação.',
      lessons: [],
    },
    {
      id: 'emergency_reserve',
      title: 'Reserva de emergência',
      description: 'Por que organizar a base antes de ativos mais arriscados.',
      lessons: [],
    },
    {
      id: 'diversification',
      title: 'Diversificação',
      description: 'Classes de ativos e risco de concentração.',
      lessons: [],
    },
    {
      id: 'fiis',
      title: 'Fundos Imobiliários',
      description: 'Tipos, segmentos, indicadores, dividendos e documentos.',
      lessons: [],
    },
  ];
}
