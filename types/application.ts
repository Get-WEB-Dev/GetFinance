import type { LoanType } from "@/config/loans";
import type { StepSlug } from "@/config/steps";
import type { ApplicantFormValues } from "@/lib/validation/applicant";
import type { AddressFormValues } from "@/lib/validation/address";
import type { EmploymentFormValues } from "@/lib/validation/employment";
import type { LoanDetailsFormValues } from "@/lib/validation/loan-details";
import type { FinancesFormValues } from "@/lib/validation/finances";

export interface ApplicationDraft {
  schemaVersion: 1;
  id: string;
  reference: string;
  loanType: LoanType;
  currentStep: StepSlug;
  completedSteps: StepSlug[];
  stepsToReview: StepSlug[];
  applicant?: ApplicantFormValues;
  address?: AddressFormValues;
  employment?: EmploymentFormValues;
  loanDetails?: LoanDetailsFormValues;
  finances?: FinancesFormValues;
  createdAt: string;
  updatedAt: string;
}

export type DraftPatch = Partial<
  Pick<
    ApplicationDraft,
    | "currentStep"
    | "loanType"
    | "completedSteps"
    | "stepsToReview"
    | "applicant"
    | "address"
    | "employment"
    | "loanDetails"
    | "finances"
  >
>;

export type SaveState = "saved" | "saving" | "error";