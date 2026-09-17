export type InvestmentExperience = 'beginner' | 'experienced';

export interface OnboardingProfile {
  completedAt: string;
  experience: InvestmentExperience;
}
