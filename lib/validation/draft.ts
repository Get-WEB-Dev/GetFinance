import { z } from "zod";
import { isLoanType, type LoanType } from "@/config/loans";
import { isStepSlug, type StepSlug } from "@/config/steps";
import { applicantStoredSchema } from "@/lib/validation/applicant";
import { addressFieldsSchema } from "@/lib/validation/address";
import { employmentFieldsSchema } from "@/lib/validation/employment";

const stepSlugSchema = z.custom<StepSlug>((v) => typeof v === "string" && isStepSlug(v));

export const draftSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  reference: z.string().min(1),
  loanType: z.custom<LoanType>((v) => typeof v === "string" && isLoanType(v)),
  currentStep: stepSlugSchema,
  completedSteps: z.array(stepSlugSchema).default(["loan-selection"]),
  applicant: applicantStoredSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  address: addressFieldsSchema.optional(),
  employment: employmentFieldsSchema.optional(),
});