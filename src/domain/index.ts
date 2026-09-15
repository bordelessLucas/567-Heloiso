export type { UserProfile, UserRole, InvestorProfileType, CreateUserProfileInput } from '@/src/domain/user';
export type {
  FundSegment,
  FundSummary,
  FundIndicator,
  FundProfile,
  FundDocument,
  FundAssetAllocation,
  GuidedReadingPoint,
  GuidedReadingTone,
} from '@/src/domain/fund';
export { FUND_SEGMENT_LABELS } from '@/src/domain/fund';
export type { PortfolioHolding, PortfolioSummary } from '@/src/domain/portfolio';
export type {
  PlannerChallenge,
  PlannerCheckIn,
  PlannerChallengeDays,
  PlannerWeekDay,
} from '@/src/domain/planner';
export type {
  LearningTrack,
  LearningLesson,
  LearningTrackId,
} from '@/src/domain/learning';
export type { RankingEntry, RankingMetric, RankingBoard } from '@/src/domain/ranking';
export type { NewsItem } from '@/src/domain/news';
export type { InvestorProfileAnswers } from '@/src/domain/investorProfile';
