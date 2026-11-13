import { z } from "zod";
import { isIndianState } from "@/config/india-states";
import { getLoanProduct, type LoanType } from "@/config/loans";
import { businessTypeOptions, industryOptions, isLoanPurpose, isOptionValue } from "@/config/options";
import { formatCurrency as formatMoney } from "@/lib/format/currency";
import { formatTerm } from "@/lib/format/term";
import { DEFAULT_COUNTRY, type CountryCode } from "@/config/countries";
import { isWholeNumber, parseAmount } from "@/lib/validation/helpers";

const REGISTRATION_PATTERN = /^[A-Za-z0-9\-/]{6,25}$/;
const AMOUNT_MESSAGE = "Enter an amount using digits only.";

export const loanDetailsFieldsSchema = z.object({
  loanAmount: z.string(),
  termMonths: z.string(),
  purpose: z.string(),
  purposeOther: z.string(),
  propertyValue: z.string(),
  downPayment: z.string(),
  propertyCity: z.string(),
  propertyState: z.string(),
  businessType: z.string(),
  industry: z.string(),
  registrationNumber: z.string(),
  yearsOperating: z.string(),
  annualRevenue: z.string(),
});

export type LoanDetailsFormValues = z.infer<typeof loanDetailsFieldsSchema>;

export const emptyLoanDetails: LoanDetailsFormValues = {
  loanAmount: "",
  termMonths: "",
  purpose: "",
  purposeOther: "",
  propertyValue: "",
  downPayment: "",
  propertyCity: "",
  propertyState: "",
  businessType: "",
  industry: "",
  registrationNumber: "",
  yearsOperating: "",
  annualRevenue: "",
};

export function createLoanDetailsSchema(loanType: LoanType, country: CountryCode = DEFAULT_COUNTRY) {
  const product = getLoanProduct(loanType, country);
  const formatCurrency = (amount: number) => formatMoney(amount, country);

  return loanDetailsFieldsSchema.superRefine((v, ctx) => {
    const fail = (path: keyof LoanDetailsFormValues, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });

    const amount = parseAmount(v.loanAmount);
    if (amount === null || amount <= 0) {
      fail("loanAmount", AMOUNT_MESSAGE);
    } else if (amount < product.minAmount || amount > product.maxAmount) {
      fail(
        "loanAmount",
        `Amount must be between ${formatCurrency(product.minAmount)} and ${formatCurrency(product.maxAmount)}.`,
      );
    }

    if (!isWholeNumber(v.termMonths, product.minMonths, product.maxMonths)) {
      fail(
        "termMonths",
        `Enter a term between ${product.minMonths} and ${product.maxMonths} months (${formatTerm(product.minMonths)} to ${formatTerm(product.maxMonths)}).`,
      );
    }

    if (v.purpose === "") fail("purpose", "Select the purpose of the loan.");
    else if (!isLoanPurpose(loanType, v.purpose)) fail("purpose", "Select a purpose from the list.");
    else if (v.purpose === "other" && v.purposeOther.trim().length < 3) {
      fail("purposeOther", "Briefly describe the purpose.");
    }

    if (loanType === "home") {
      const propertyValue = parseAmount(v.propertyValue);
      if (propertyValue === null || propertyValue <= 0) fail("propertyValue", AMOUNT_MESSAGE);
      if (v.propertyCity.trim().length < 2) fail("propertyCity", "Enter the city where the property is located.");
      if (!isIndianState(v.propertyState)) fail("propertyState", "Select the property's state or union territory.");

      const down = v.purpose === "purchase" ? parseAmount(v.downPayment) : 0;
      if (v.purpose === "purchase" && down === null) {
        fail("downPayment", "Enter your down payment (0 if none), using digits only.");
      }

      if (amount !== null && propertyValue !== null && propertyValue > 0 && down !== null) {
        if (v.purpose === "purchase" && amount + down > propertyValue) {
          fail("loanAmount", `Loan amount plus down payment can't exceed the property value (${formatCurrency(propertyValue)}).`);
        }
        if (v.purpose === "refinance" && amount > propertyValue) {
          fail("loanAmount", `Loan amount can't exceed the property value (${formatCurrency(propertyValue)}).`);
        }
      }
    }

    if (loanType === "business") {
      if (!isOptionValue(businessTypeOptions, v.businessType)) fail("businessType", "Select your business type.");
      if (!isOptionValue(industryOptions, v.industry)) fail("industry", "Select your industry.");
      if (!REGISTRATION_PATTERN.test(v.registrationNumber.trim())) {
        fail("registrationNumber", "Enter 6 to 25 letters, numbers, hyphens or slashes.");
      }
      if (!isWholeNumber(v.yearsOperating, 0, 100)) fail("yearsOperating", "Enter whole years (0 if less than a year).");
      const revenue = parseAmount(v.annualRevenue);
      if (revenue === null || revenue <= 0) fail("annualRevenue", AMOUNT_MESSAGE);
    }
  });
}

export function sanitizeLoanDetails(values: LoanDetailsFormValues, loanType: LoanType): LoanDetailsFormValues {
  const base: LoanDetailsFormValues = {
    ...emptyLoanDetails,
    loanAmount: values.loanAmount.trim(),
    termMonths: values.termMonths.trim(),
    purpose: values.purpose,
    purposeOther: values.purpose === "other" ? values.purposeOther.trim() : "",
  };

  if (loanType === "home") {
    return {
      ...base,
      propertyValue: values.propertyValue.trim(),
      propertyCity: values.propertyCity.trim(),
      propertyState: values.propertyState,
      downPayment: values.purpose === "purchase" ? values.downPayment.trim() : "",
    };
  }

  if (loanType === "business") {
    return {
      ...base,
      businessType: values.businessType,
      industry: values.industry,
      registrationNumber: values.registrationNumber.trim(),
      yearsOperating: values.yearsOperating.trim(),
      annualRevenue: values.annualRevenue.trim(),
    };
  }

  return base;
}