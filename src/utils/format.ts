const THOUSAND = 1000;

export function formatCount(value: number): string {
  if (value < THOUSAND) {
    return String(value);
  }

  return `${(value / THOUSAND).toFixed(1).replace(/\.0$/, '')}K`;
}
