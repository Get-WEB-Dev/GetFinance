import { z } from "zod";
import { isLoanType, type LoanType } from "@/config/loans";

export const loanSelectionSchema = z.object({
  loanType: z.custom<LoanType>(
    (value) => typeof value === "string" && isLoanType(value),
    "Select a loan type to continue.",
  ),
});

export type LoanSelectionValues = z.infer<typeof loanSelectionSchema>;