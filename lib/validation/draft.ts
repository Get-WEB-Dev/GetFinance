import { z } from "zod";
import { isLoanType, type LoanType } from "@/config/loans";
import { isStepSlug, type StepSlug } from "@/config/steps";

export const draftSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  reference: z.string().min(1),
  loanType: z.custom<LoanType>((v) => typeof v === "string" && isLoanType(v)),
  currentStep: z.custom<StepSlug>((v) => typeof v === "string" && isStepSlug(v)),
  createdAt: z.string(),
  updatedAt: z.string(),
});