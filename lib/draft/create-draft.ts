import type { LoanType } from "@/config/loans";
import type { ApplicationDraft } from "@/types/application";

export function createDraft(loanType: LoanType): ApplicationDraft {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  return {
    schemaVersion: 1,
    id,
    reference: `GF-${id.replaceAll("-", "").slice(0, 8).toUpperCase()}`,
    loanType,
    currentStep: "applicant",
    createdAt: now,
    updatedAt: now,
    completedSteps: ["loan-selection"],
  };
}