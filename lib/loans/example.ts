import type { LoanProduct } from "@/config/loans";
import { calculateRepayment, type RepaymentEstimate } from "@/lib/calculations/repayment";

export interface RepaymentExample {
  amount: number;
  months: number;
  annualRatePercent: number;
  estimate: RepaymentEstimate;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** A representative loan in the middle of the product's range. */
export function getRepaymentExample(product: LoanProduct): RepaymentExample | null {
  const midAmount = (product.minAmount + product.maxAmount) / 2;
  const step = midAmount >= 1_000_000 ? 100_000 : midAmount >= 100_000 ? 10_000 : 1_000;
  const amount = clamp(Math.round(midAmount / step) * step, product.minAmount, product.maxAmount);

  const midMonths = (product.minMonths + product.maxMonths) / 2;
  const months = clamp(Math.round(midMonths / 12) * 12, product.minMonths, product.maxMonths);

  const estimate = calculateRepayment(amount, product.illustrativeRate, months);
  return estimate ? { amount, months, annualRatePercent: product.illustrativeRate, estimate } : null;
}