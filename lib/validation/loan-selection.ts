import { z } from "zod";
import { isCountryCode, type CountryCode } from "@/config/countries";
import { isLoanType, type LoanType } from "@/config/loans";

export const loanSelectionSchema = z.object({
  country: z.custom<CountryCode>(
    (value) => typeof value === "string" && isCountryCode(value),
    "Choose a country to continue.",
  ),
  loanType: z.custom<LoanType>(
    (value) => typeof value === "string" && isLoanType(value),
    "Select a loan type to continue.",
  ),
});

export type LoanSelectionValues = z.infer<typeof loanSelectionSchema>;