export type UserRole = 'investor' | 'admin' | 'admin_readonly';

export type InvestorProfileType = 'conservative' | 'moderate' | 'aggressive';

export type InvestorGoal = 'income' | 'growth' | 'preservation' | 'learning';

export type InvestmentHorizon = 'short' | 'medium' | 'long';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  investorProfile?: InvestorProfileType | null;
}

export interface CreateUserProfileInput {
  id: string;
  email: string;
  displayName: string;
}

export interface InvestorSensitiveProfile {
  monthlyIncome: number | null;
  declaredNetWorth: number | null;
  investmentGoal: InvestorGoal | null;
  investmentHorizon: InvestmentHorizon | null;
  lgpdConsent: boolean;
  lgpdConsentAt: string | null;
  updatedAt: string;
}

export interface UpdateInvestorSensitiveProfileInput {
  monthlyIncome?: number | null;
  declaredNetWorth?: number | null;
  investmentGoal?: InvestorGoal | null;
  investmentHorizon?: InvestmentHorizon | null;
  lgpdConsent: boolean;
}
