export function isWholeNumber(value: string, min: number, max: number): boolean {
  const trimmed = value.trim();
  if (!/^\d{1,9}$/.test(trimmed)) return false;
  const n = Number(trimmed);
  return n >= min && n <= max;
}

export function parseAmount(value: string): number | null {
  const trimmed = value.trim();
  return /^\d{1,9}$/.test(trimmed) ? Number(trimmed) : null;
}