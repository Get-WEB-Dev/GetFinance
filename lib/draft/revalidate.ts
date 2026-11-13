import type { z } from "zod";
import type { StepSlug } from "@/config/steps";
import { createAddressSchema } from "@/lib/validation/address";
import { createApplicantSchema } from "@/lib/validation/applicant";
import { createEmploymentSchema } from "@/lib/validation/employment";
import { createFinancesSchema } from "@/lib/validation/finances";
import { createLoanDetailsSchema } from "@/lib/validation/loan-details";
import type { ApplicationDraft } from "@/types/application";
import { verificationSchema } from "@/lib/validation/identity";
import { documentCatalog } from "@/config/documents";
import { getMissingDocuments } from "@/lib/documents/requirements";
import { getDeclarationIssues } from "@/lib/declarations/check";

export interface StepIssue {
  field: string;
  message: string;
}

export interface StepValidation {
  slug: StepSlug;
  valid: boolean;
  issues: StepIssue[];
}

function check(slug: StepSlug, schema: z.ZodType, value: unknown): StepValidation {
  if (value === undefined) return { slug, valid: false, issues: [] };

  const result = schema.safeParse(value);
  if (result.success) return { slug, valid: true, issues: [] };

  return {
    slug,
    valid: false,
    issues: result.error.issues.map((issue) => ({
      field: String(issue.path[0] ?? ""),
      message: issue.message,
    })),
  };
}
function checkDeclarations(draft: ApplicationDraft): StepValidation {
  const issues = getDeclarationIssues(draft);
  return { slug: "signature", valid: issues.length === 0, issues };
}

export function revalidateDraft(draft: ApplicationDraft): StepValidation[] {
  return [
    check("applicant", createApplicantSchema(draft.country), draft.applicant),
    check("address", createAddressSchema(draft.country), draft.address),
    check("employment", createEmploymentSchema(draft.loanType), draft.employment),
    check("loan-details", createLoanDetailsSchema(draft.loanType, draft.country), draft.loanDetails),
    check("finances", createFinancesSchema(draft.loanType), draft.finances),
    check("verification", verificationSchema, draft.verification),
    checkDocuments(draft),
    checkDeclarations(draft),
  ];
}

function checkDocuments(draft: ApplicationDraft): StepValidation {
  const missing = getMissingDocuments(draft);
  return {
    slug: "documents",
    valid: missing.length === 0,
    issues: missing.map((id) => ({ field: id, message: `${documentCatalog[id].label} is missing.` })),
  };
}

