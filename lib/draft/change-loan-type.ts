import type { LoanType } from "@/config/loans";
import { isLoanPurpose } from "@/config/options";
import { steps, type StepSlug } from "@/config/steps";
import { reconcileDraft } from "@/lib/draft/reconcile";
import { sanitizeFinances } from "@/lib/validation/finances";
import { sanitizeLoanDetails } from "@/lib/validation/loan-details";
import type { ApplicationDraft, DraftPatch } from "@/types/application";

const CLEARABLE_LABELS: Record<string, string> = {
  purpose: "Loan purpose",
  purposeOther: "Purpose description",
  propertyValue: "Property value",
  downPayment: "Down payment",
  propertyCity: "Property city",
  propertyState: "Property state",
  businessType: "Business type",
  industry: "Industry",
  registrationNumber: "Business registration number",
  yearsOperating: "Years in operation",
  annualRevenue: "Annual revenue",
  annualBusinessExpenses: "Annual business expenses",
};

export interface LoanTypeChange {
  next: ApplicationDraft;
  patch: DraftPatch;
  reviewSteps: StepSlug[];
  clearedLabels: string[];
}

export function applyLoanTypeChange(draft: ApplicationDraft, newType: LoanType): ApplicationDraft {
  const keepPurpose = draft.loanDetails && isLoanPurpose(newType, draft.loanDetails.purpose);

  const loanDetails = draft.loanDetails
    ? sanitizeLoanDetails({ ...draft.loanDetails, purpose: keepPurpose ? draft.loanDetails.purpose : "" }, newType)
    : undefined;

  const finances = draft.finances ? sanitizeFinances(draft.finances, newType) : undefined;

  return reconcileDraft({ ...draft, loanType: newType, loanDetails, finances });
}

function clearedFrom(
  before: Record<string, string> | undefined,
  after: Record<string, string> | undefined,
): string[] {
  return Object.keys(CLEARABLE_LABELS)
    .filter((key) => before?.[key] && !after?.[key])
    .map((key) => CLEARABLE_LABELS[key]);
}

export function describeLoanTypeChange(draft: ApplicationDraft, newType: LoanType): LoanTypeChange {
  const next = applyLoanTypeChange(draft, newType);

  const clearedLabels = Array.from(
    new Set([
      ...clearedFrom(draft.loanDetails, next.loanDetails),
      ...clearedFrom(draft.finances, next.finances),
    ]),
  );

  const reviewSteps = steps
    .map((step) => step.slug)
    .filter((slug) => draft.completedSteps.includes(slug) && !next.completedSteps.includes(slug));

  return {
    next,
    reviewSteps,
    clearedLabels,
    patch: {
      loanType: next.loanType,
      loanDetails: next.loanDetails,
      finances: next.finances,
      completedSteps: next.completedSteps,
      stepsToReview: next.stepsToReview,
    },
  };
}