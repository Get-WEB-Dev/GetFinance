import type { z } from "zod";
import type { StepSlug } from "@/config/steps";
import { addressSchema } from "@/lib/validation/address";
import { applicantSchema } from "@/lib/validation/applicant";
import { createEmploymentSchema } from "@/lib/validation/employment";
import { createFinancesSchema } from "@/lib/validation/finances";
import { createLoanDetailsSchema } from "@/lib/validation/loan-details";
import type { ApplicationDraft } from "@/types/application";
import { verificationSchema } from "@/lib/validation/identity";

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

export function revalidateDraft(draft: ApplicationDraft): StepValidation[] {
  return [
    check("applicant", applicantSchema, draft.applicant),
    check("address", addressSchema, draft.address),
    check("employment", createEmploymentSchema(draft.loanType), draft.employment),
    check("loan-details", createLoanDetailsSchema(draft.loanType), draft.loanDetails),
    check("finances", createFinancesSchema(draft.loanType), draft.finances),
    check("verification", verificationSchema, draft.verification),
  ];
}