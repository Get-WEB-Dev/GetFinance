import { requiredDocumentsByLoanType, type DocumentId } from "@/config/documents";
import type { LoanType } from "@/config/loans";
import type { ApplicationDraft } from "@/types/application";

export function getRequiredDocuments(loanType: LoanType, employmentStatus?: string): DocumentId[] {
  const required = requiredDocumentsByLoanType[loanType];
  return employmentStatus === "unemployed"
    ? required.filter((id) => id !== "income-proof")
    : required;
}

export function getMissingDocuments(draft: ApplicationDraft): DocumentId[] {
  return getRequiredDocuments(draft.loanType, draft.employment?.employmentStatus).filter(
    (id) => !draft.documents?.[id],
  );
}