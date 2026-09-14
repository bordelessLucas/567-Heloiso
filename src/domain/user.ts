export type UserRole = 'investor' | 'admin' | 'admin_readonly';

export type InvestorProfileType = 'conservative' | 'moderate' | 'aggressive';

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
