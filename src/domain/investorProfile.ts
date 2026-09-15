import type { InvestorProfileType } from '@/src/domain/user';

/** Questionário de perfil — campos sensíveis ainda a confirmar com o cliente. */

export interface InvestorProfileAnswers {
  userId: string;
  experienceLevel: 'none' | 'beginner' | 'intermediate' | 'advanced' | null;
  alreadyInvests: boolean | null;
  goals: string[];
  classifiedAs: InvestorProfileType | null;
  updatedAt: string;
}
