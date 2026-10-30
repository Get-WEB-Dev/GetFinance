import type { EligibilitySnapshot } from "@/lib/validation/submission";
import type { EligibilityResult } from "./types";

export function toEligibilitySnapshot(result: EligibilityResult): EligibilitySnapshot {
  return {
    decision: result.decision,
    annualRatePercent: result.annualRatePercent,
    monthlyPayment: result.monthlyPayment,
    totalPayable: result.totalPayable,
    totalInterest: result.totalInterest,
    maxAmount: result.maxAmount,
    rules: result.rules.map(({ id, label, outcome, yourValue, requirement }) => ({
      id,
      label,
      outcome,
      yourValue,
      requirement,
    })),
  };
}