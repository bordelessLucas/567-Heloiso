export function formatBrl(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }

  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatPercent(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }

  return `${value.toFixed(digits).replace('.', ',')}%`;
}

export function formatCompactBrl(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }

  if (value >= 1_000_000_000) {
    return `R$ ${(value / 1_000_000_000).toFixed(2).replace('.', ',')} bi`;
  }

  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1).replace('.', ',')} mi`;
  }

  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(1).replace('.', ',')} mil`;
  }

  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export function formatRatio(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }

  return value.toFixed(2).replace('.', ',');
}

export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
