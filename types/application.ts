import type { LoanType } from "@/config/loans";
import type { StepSlug } from "@/config/steps";
import type { ApplicantFormValues } from "@/lib/validation/applicant";
import type { AddressFormValues } from "@/lib/validation/address";
import type { EmploymentFormValues } from "@/lib/validation/employment";
import type { LoanDetailsFormValues } from "@/lib/validation/loan-details";
import type { FinancesFormValues } from "@/lib/validation/finances";
import type { VerificationData } from "@/lib/validation/identity";
import type  { DocumentsData   }  from "@/lib/validation/documents"

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
  verification?: VerificationData;
  documents?: DocumentsData;
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
    | "verification"
    | "documents"
  >
>;

export type SaveState = "saved" | "saving" | "error";
export type DraftUpdate = DraftPatch | ((current: ApplicationDraft) => DraftPatch);