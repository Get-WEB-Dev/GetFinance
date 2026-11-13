import { getLoanProduct } from "@/config/loans";
import { calculateAge, parseIsoDate } from "@/lib/dates";
import { getMonthlyIncome, getRequestedLoan } from "@/lib/draft/selectors";
import { isWholeNumber, parseAmount } from "@/lib/validation/helpers";
import type { ApplicationDraft } from "@/types/application";
import type { EligibilityInput } from "./types";

function wholeYears(value: string | undefined): number | null {
  return value !== undefined && isWholeNumber(value, 0, 100) ? Number(value) : null;
}

/** Turns the draft's raw strings into the plain numbers the engine needs. Null if essentials are missing. */
export function buildEligibilityInput(draft: ApplicationDraft, today: Date = new Date()): EligibilityInput | null {
  const loan = getRequestedLoan(draft);
  const income = getMonthlyIncome(draft);
  const birth = parseIsoDate(draft.applicant?.dateOfBirth ?? "");
  const finances = draft.finances;
  const employment = draft.employment;
  const loanDetails = draft.loanDetails;

  if (!loan || income === null || !birth || !finances || !employment) return null;

  const expenses = parseAmount(finances.monthlyExpenses);
  const existingEmi = finances.hasExistingLoans === "yes" ? parseAmount(finances.existingMonthlyEmi) : 0;
  if (expenses === null || existingEmi === null) return null;

  const status = employment.employmentStatus;
  const yearsInCurrentWork =
    status === "salaried"
      ? wholeYears(employment.yearsWithEmployer)
      : status === "self-employed"
        ? wholeYears(employment.yearsInBusiness)
        : null;

  return {
    country: draft.country,
    loanType: draft.loanType,
    age: calculateAge(birth, today),
    monthlyIncome: income,
    monthlyExpenses: expenses,
    existingEmi,
    requestedAmount: loan.amount,
    termMonths: loan.months,
    annualRatePercent: getLoanProduct(draft.loanType, draft.country).illustrativeRate,
    employmentStatus: status,
    yearsInCurrentWork,
    propertyValue: parseAmount(loanDetails?.propertyValue ?? ""),
    yearsOperating: wholeYears(loanDetails?.yearsOperating),
  };
}