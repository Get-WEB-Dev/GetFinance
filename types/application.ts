import type { LoanType } from "@/config/loans";
import type { StepSlug } from "@/config/steps";
import type { ApplicantFormValues } from "@/lib/validation/applicant";
import type { AddressFormValues } from "@/lib/validation/address";
import type { EmploymentFormValues } from "@/lib/validation/employment";
import type { LoanDetailsFormValues } from "@/lib/validation/loan-details";
import type { FinancesFormValues } from "@/lib/validation/finances";
import type { VerificationData } from "@/lib/validation/identity";
import type  { DocumentsData   }  from "@/lib/validation/documents"
import type { DeclarationsData } from "@/lib/validation/declarations";
import type { SubmissionRecord } from "@/lib/validation/submission";
import type { CountryCode } from "@/config/countries";

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
  declarations?: DeclarationsData;
  submission?: SubmissionRecord;
  country: CountryCode;
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
    | "declarations"
    | "submission"
  >
>;

export type SaveState = "saved" | "saving" | "error";
export type DraftUpdate = DraftPatch | ((current: ApplicationDraft) => DraftPatch);