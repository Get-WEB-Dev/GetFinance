/**
 * The inverse of the EMI formula: the largest loan whose monthly payment is at most `emi`.
 */
export function maxPrincipalForEmi(emi: number, annualRatePercent: number, months: number): number | null {
  if (![emi, annualRatePercent, months].every(Number.isFinite)) return null;
  if (emi <= 0 || months <= 0 || annualRatePercent < 0) return null;

  const monthlyRate = annualRatePercent / 12 / 100;
  if (monthlyRate === 0) return emi * months;

  const growth = (1 + monthlyRate) ** months;
  return (emi * (growth - 1)) / (monthlyRate * growth);
}