import { DEFAULT_COUNTRY, type CountryCode } from "@/config/countries";
import type { LoanType } from "@/config/loans";
import type { ApplicationDraft } from "@/types/application";

export function createDraft(loanType: LoanType, country: CountryCode = DEFAULT_COUNTRY): ApplicationDraft {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  return {
    schemaVersion: 1,
    id,
    reference: `GF-${id.replaceAll("-", "").slice(0, 8).toUpperCase()}`,
    country,
    loanType,
    currentStep: "applicant",
    createdAt: now,
    updatedAt: now,
    completedSteps: ["loan-selection"],
    stepsToReview: [],
  };
}