/** Módulo educacional — acesso voluntário, não obrigatório. */

export type LearningTrackId =
  | 'intro'
  | 'first_steps'
  | 'emergency_reserve'
  | 'diversification'
  | 'fiis';

export interface LearningLesson {
  id: string;
  trackId: LearningTrackId;
  title: string;
  summary: string;
  order: number;
  completed?: boolean;
}

export interface LearningTrack {
  id: LearningTrackId;
  title: string;
  description: string;
  lessons: LearningLesson[];
}
