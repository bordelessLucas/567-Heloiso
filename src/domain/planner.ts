/** Planner de poupança — acompanha metas/check-ins; não movimenta dinheiro. */

export type PlannerChallengeDays = 50 | 100 | 200;

export type PlannerDayStatus = 'done' | 'missed';

export interface PlannerChallenge {
  id: string;
  userId: string;
  title: string;
  /** Objetivo escrito pelo usuário (ex.: reserva, viagem, aporte). */
  objective: string;
  totalDays: PlannerChallengeDays;
  dailyTargetAmount: number;
  startedAt: string;
  /** Dias já contabilizados no desafio (check-in + dias sem aporte). */
  completedDays: number;
  savedAmount: number;
  streak: number;
  longestStreak: number;
  status: 'active' | 'completed' | 'paused';
  lastCheckInDate: string | null;
}

export interface PlannerCheckIn {
  id: string;
  challengeId: string;
  dayNumber: number;
  amount: number;
  dateKey: string;
  checkedAt: string;
  note: string | null;
  /** `done` = aporte marcado; `missed` = dia passado sem check-in (auto). */
  status: PlannerDayStatus;
}

export interface PlannerWeekDay {
  dateKey: string;
  label: string;
  checked: boolean;
  missed: boolean;
  isToday: boolean;
}
