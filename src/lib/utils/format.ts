export function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function formatNumber(value: number, decimals = 1): string {
  return round(value, decimals).toString();
}

export function formatLb(value: number): string {
  return `${formatNumber(value)} lb`;
}

export function formatMiles(value: number): string {
  return `${formatNumber(value, 2)} mi`;
}
