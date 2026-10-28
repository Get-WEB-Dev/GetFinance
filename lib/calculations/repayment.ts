export interface RepaymentEstimate {
  monthlyPayment: number;
  totalPayable: number;
  totalInterest: number;
}

export function calculateRepayment(
  principal: number,
  annualRatePercent: number,
  months: number,
): RepaymentEstimate | null {
  if (!Number.isFinite(principal) || !Number.isFinite(annualRatePercent)) return null;
  if (!Number.isInteger(months) || principal <= 0 || months <= 0 || annualRatePercent < 0) return null;

  const monthlyRate = annualRatePercent / 12 / 100;

  const monthlyPayment =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * (1 + monthlyRate) ** months) /
        ((1 + monthlyRate) ** months - 1);

  const totalPayable = monthlyPayment * months;

  return { monthlyPayment, totalPayable, totalInterest: totalPayable - principal };
}