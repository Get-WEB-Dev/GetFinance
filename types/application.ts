import type { LoanType } from "@/config/loans";
import type { StepSlug } from "@/config/steps";
import type { ApplicantFormValues } from "@/lib/validation/applicant";

export interface ApplicationDraft {
  schemaVersion: 1;
  id: string;
  reference: string;
  loanType: LoanType;
  currentStep: StepSlug;
  completedSteps: StepSlug[];
  applicant?: ApplicantFormValues;
  createdAt: string;
  updatedAt: string;
}

export type SaveState = "saved" | "saving" | "error";