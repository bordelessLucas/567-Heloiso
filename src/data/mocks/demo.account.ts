import type { PortfolioHolding } from '@/src/domain/portfolio';
import type { PlannerChallenge, PlannerCheckIn } from '@/src/domain/planner';
import { todayKey } from '@/src/utils/format';

/** Conta demo para validar o MVP com dados preenchidos. */
export const DEMO_EMAIL = 'lorenzo@gmail.com';

export function isDemoAccount(email: string | null | undefined): boolean {
  return (email ?? '').trim().toLowerCase() === DEMO_EMAIL;
}

export interface FundRecommendation {
  ticker: string;
  name: string;
  reason: string;
  highlight: string;
}

export const DEMO_RECOMMENDATIONS: FundRecommendation[] = [
  {
    ticker: 'HGLG11',
    name: 'CSHG Logística',
    reason: 'Vacância baixa e P/VP com desconto no snapshot — bom caso para estudar tijolo.',
    highlight: 'Para quem quer entender logística',
  },
  {
    ticker: 'KNCR11',
    name: 'Kinea Rendimentos',
    reason: 'Alta liquidez facilita acompanhar o dia a dia sem travar a posição.',
    highlight: 'Para quem prioriza liquidez',
  },
  {
    ticker: 'MXRF11',
    name: 'Maxi Renda',
    reason: 'DY elevado no mock; use para praticar leitura crítica de rendimento.',
    highlight: 'Para treinar interpretação de DY',
  },
];

export function buildDemoHoldings(userId: string): PortfolioHolding[] {
  return [
    {
      id: 'demo-hglg',
      userId,
      fundId: 'hglg11',
      ticker: 'HGLG11',
      quantity: 120,
      averagePrice: 152.4,
      investedAmount: 18_288,
      acquiredAt: '2026-03-12',
      sortIndex: 0,
    },
    {
      id: 'demo-kncr',
      userId,
      fundId: 'kncr11',
      ticker: 'KNCR11',
      quantity: 80,
      averagePrice: 103.1,
      investedAmount: 8_248,
      acquiredAt: '2026-05-02',
      sortIndex: 1,
    },
    {
      id: 'demo-mxrf',
      userId,
      fundId: 'mxrf11',
      ticker: 'MXRF11',
      quantity: 900,
      averagePrice: 9.75,
      investedAmount: 8_775,
      acquiredAt: '2026-06-18',
      sortIndex: 2,
    },
    {
      id: 'demo-xplg',
      userId,
      fundId: 'xplg11',
      ticker: 'XPLG11',
      quantity: 45,
      averagePrice: 94.8,
      investedAmount: 4_266,
      acquiredAt: '2026-04-08',
      sortIndex: 3,
    },
    {
      id: 'demo-visc',
      userId,
      fundId: 'visc11',
      ticker: 'VISC11',
      quantity: 60,
      averagePrice: 110.2,
      investedAmount: 6_612,
      acquiredAt: '2026-02-21',
      sortIndex: 4,
    },
    {
      id: 'demo-btlg',
      userId,
      fundId: 'btlg11',
      ticker: 'BTLG11',
      quantity: 35,
      averagePrice: 99.5,
      investedAmount: 3_482.5,
      acquiredAt: '2026-07-03',
      sortIndex: 5,
    },
    {
      id: 'demo-hsml',
      userId,
      fundId: 'hsml11',
      ticker: 'HSML11',
      quantity: 70,
      averagePrice: 88.4,
      investedAmount: 6_188,
      acquiredAt: '2026-01-19',
      sortIndex: 6,
    },
    {
      id: 'demo-rect',
      userId,
      fundId: 'rect11',
      ticker: 'RECT11',
      quantity: 55,
      averagePrice: 66.9,
      investedAmount: 3_679.5,
      acquiredAt: '2026-08-11',
      sortIndex: 7,
    },
  ];
}

/** Bump para re-seedar a carteira demo em memória após mudanças de mock. */
export const DEMO_PORTFOLIO_SEED = 3;

export function buildDemoPlanner(userId: string): {
  challenge: PlannerChallenge;
  checkIns: PlannerCheckIn[];
} {
  const challengeId = 'demo_challenge_100';
  const today = new Date();
  const checkIns: PlannerCheckIn[] = [];

  for (let i = 11; i >= 1; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateKey = todayKey(date);
    // Dia -3 fica sem aporte (missed) para demonstrar a reconciliação.
    const missed = i === 3;
    checkIns.push({
      id: `demo_checkin_${i}`,
      challengeId,
      dayNumber: 12 - i,
      amount: missed ? 0 : 25,
      dateKey,
      checkedAt: `${dateKey}T20:00:00.000Z`,
      note: null,
      status: missed ? 'missed' : 'done',
    });
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const done = checkIns.filter((item) => item.status === 'done');
  let streak = 0;
  for (let i = checkIns.length - 1; i >= 0; i -= 1) {
    if (checkIns[i]?.status === 'done') streak += 1;
    else break;
  }

  const challenge: PlannerChallenge = {
    id: challengeId,
    userId,
    title: 'Desafio 100 dias',
    objective: 'Montar reserva para investir com mais tranquilidade',
    totalDays: 100,
    dailyTargetAmount: 25,
    startedAt: checkIns[0]?.checkedAt ?? new Date().toISOString(),
    completedDays: checkIns.length,
    savedAmount: done.reduce((sum, item) => sum + item.amount, 0),
    streak,
    longestStreak: Math.max(streak, 3),
    status: 'active',
    lastCheckInDate: todayKey(yesterday),
  };

  return { challenge, checkIns };
}
