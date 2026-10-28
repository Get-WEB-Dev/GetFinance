import type { LoanType } from "@/config/loans";
import type { StepSlug } from "@/config/steps";

export interface ApplicationDraft {
  schemaVersion: 1;
  id: string;
  reference: string;
  loanType: LoanType;
  currentStep: StepSlug;
  createdAt: string;
  updatedAt: string;
}