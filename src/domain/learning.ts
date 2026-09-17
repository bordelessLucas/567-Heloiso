/**
 * Conteúdo educacional voluntário. O objetivo é apoiar a compreensão — nunca
 * substituir a decisão do investidor por uma recomendação de compra ou venda.
 */

export type LearningTrackId =
  | 'start'
  | 'what-is-fii'
  | 'define-objective'
  | 'choose-broker'
  | 'analyse-fund'
  | 'diversify'
  | 'buy-and-reinvest'
  | 'monitor-portfolio'
  | 'next-steps';

export interface LearningLesson {
  id: string;
  title: string;
  description: string;
  /** Exemplos, sinais ou perguntas que tornam a explicação prática. */
  items?: string[];
}

export interface LearningTrack {
  id: LearningTrackId;
  order: number;
  eyebrow: string;
  title: string;
  description: string;
  cover: number;
  coverAlt: string;
  /** Razão original da arte: garante que nenhuma informação da capa seja cortada. */
  coverAspectRatio: number;
  mentorNote: string;
  lessons: LearningLesson[];
}
