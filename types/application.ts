import type { LoanType } from "@/config/loans";
import type { StepSlug } from "@/config/steps";
import type { ApplicantFormValues } from "@/lib/validation/applicant";
import type { AddressFormValues } from "@/lib/validation/address";
import type { EmploymentFormValues } from "@/lib/validation/employment";

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
  address?: AddressFormValues;
  employment?: EmploymentFormValues;
}

export type SaveState = "saved" | "saving" | "error";