import type { FundProfile } from '@/src/domain/fund';
import type { RankingMetric } from '@/src/domain/ranking';

export const TESOURO_IPCA_RATE = 6.8;

export const RANKING_METRIC_OPTIONS: {
  id: RankingMetric;
  label: string;
  short: string;
  tip: string;
}[] = [
  {
    id: 'dividend_yield',
    label: 'Dividend Yield',
    short: 'DY',
    tip: 'DY alto não significa “melhor” sozinho — veja risco, liquidez e consistência.',
  },
  {
    id: 'liquidity',
    label: 'Liquidez',
    short: 'Liquidez',
    tip: 'Liquidez facilita entrar/sair da posição; não mede qualidade do imóvel ou crédito.',
  },
  {
    id: 'net_worth',
    label: 'Patrimônio',
    short: 'PL',
    tip: 'Patrimônio maior indica escala; compare também concentração e vacância.',
  },
  {
    id: 'pvp',
    label: 'P/VP',
    short: 'P/VP',
    tip: 'P/VP abaixo de 1 pode ser desconto ou risco embutido — leia o relatório.',
  },
];

export interface TesouroComparisonView {
  ticker: string;
  name: string;
  tesouroRate: number;
  fundDy12m: number | null;
  premiumPercent: number | null;
  note: string;
  reading: string;
}

export function buildTesouroReading(comparison: {
  tesouroRate: number;
  fundDy12m: number | null;
  premiumPercent: number | null;
}): string {
  const dy = comparison.fundDy12m;
  const premium = comparison.premiumPercent;
  if (dy == null || premium == null) {
    return 'Sem DY suficiente no snapshot para montar a comparação.';
  }
  if (premium >= 4) {
    return 'O prêmio aparente vs. Tesouro IPCA+ está elevado neste snapshot. Use como ponto de estudo: verifique risco, vacância e sustentabilidade do rendimento.';
  }
  if (premium >= 1.5) {
    return 'Há um prêmio moderado em relação à taxa real do Tesouro IPCA+. Compare com a qualidade da carteira do fundo antes de qualquer decisão.';
  }
  if (premium >= 0) {
    return 'O DY está próximo da referência do Tesouro IPCA+. O valor está mais na interpretação do risco imobiliário do que no “extra” de rendimento.';
  }
  return 'O DY do snapshot está abaixo da taxa real do Tesouro IPCA+. Isso não é sinal automático negativo — avalie crescimento, P/VP e tese do fundo.';
}

export function toTesouroComparisonView(fund: FundProfile): TesouroComparisonView {
  const base = fund.tesouroIpcaComparison;
  return {
    ticker: fund.ticker,
    name: fund.name,
    tesouroRate: base.tesouroRate,
    fundDy12m: base.fundDy12m,
    premiumPercent: base.premiumPercent,
    note: base.note,
    reading: buildTesouroReading(base),
  };
}
