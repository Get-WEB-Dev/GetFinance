import { isWholeNumber, parseAmount } from "@/lib/validation/helpers";
import type { ApplicationDraft } from "@/types/application";

export function getRequestedLoan(draft: ApplicationDraft): { amount: number; months: number } | null {
  const details = draft.loanDetails;
  if (!details) return null;

  const amount = parseAmount(details.loanAmount);
  const months = isWholeNumber(details.termMonths, 1, 1200) ? Number(details.termMonths) : null;

  return amount !== null && amount > 0 && months !== null ? { amount, months } : null;
}

export function getMonthlyIncome(draft: ApplicationDraft): number | null {
  return parseAmount(draft.employment?.monthlyIncome ?? "");
}