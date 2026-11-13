import { z } from "zod";
import type { LoanType } from "@/config/loans";
import { isOptionValue, yesNoOptions } from "@/config/options";
import { isWholeNumber, parseAmount } from "@/lib/validation/helpers";

const AMOUNT_MESSAGE = "Enter an amount using digits only.";

export const financesFieldsSchema = z.object({
  monthlyExpenses: z.string(),
  hasExistingLoans: z.string(),
  existingMonthlyEmi: z.string(),
  dependents: z.string(),
  savings: z.string(),
  annualBusinessExpenses: z.string(),
});

export type FinancesFormValues = z.infer<typeof financesFieldsSchema>;

export const emptyFinances: FinancesFormValues = {
  monthlyExpenses: "",
  hasExistingLoans: "",
  existingMonthlyEmi: "",
  dependents: "",
  savings: "",
  annualBusinessExpenses: "",
};

export function createFinancesSchema(loanType: LoanType) {
  return financesFieldsSchema.superRefine((v, ctx) => {
    const fail = (path: keyof FinancesFormValues, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });

    const expenses = parseAmount(v.monthlyExpenses);
    if (expenses === null || expenses <= 0) fail("monthlyExpenses", AMOUNT_MESSAGE);

    if (!isOptionValue(yesNoOptions, v.hasExistingLoans)) {
      fail("hasExistingLoans", "Tell us whether you have existing loan repayments.");
    } else if (v.hasExistingLoans === "yes") {
      const emi = parseAmount(v.existingMonthlyEmi);
      if (emi === null || emi <= 0) fail("existingMonthlyEmi", AMOUNT_MESSAGE);
    }

    if (!isWholeNumber(v.dependents, 0, 10)) fail("dependents", "Enter a whole number from 0 to 10.");

    if (v.savings.trim() !== "" && parseAmount(v.savings) === null) {
      fail("savings", AMOUNT_MESSAGE);
    }

    if (loanType === "business") {
      const businessExpenses = parseAmount(v.annualBusinessExpenses);
      if (businessExpenses === null || businessExpenses <= 0) fail("annualBusinessExpenses", AMOUNT_MESSAGE);
    }
  });
}

export function sanitizeFinances(values: FinancesFormValues, loanType: LoanType): FinancesFormValues {
  return {
    monthlyExpenses: values.monthlyExpenses.trim(),
    hasExistingLoans: values.hasExistingLoans,
    existingMonthlyEmi: values.hasExistingLoans === "yes" ? values.existingMonthlyEmi.trim() : "",
    dependents: values.dependents.trim(),
    savings: values.savings.trim(),
    annualBusinessExpenses: loanType === "business" ? values.annualBusinessExpenses.trim() : "",
  };
}