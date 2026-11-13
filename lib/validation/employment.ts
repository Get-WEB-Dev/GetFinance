import { z } from "zod";
import { getLoanProduct, type LoanType } from "@/config/loans";
import {
  employmentStatusLabel,
  incomeSourceOptions,
  isEmploymentStatus,
  isOptionValue,
} from "@/config/options";
import { allowedEmploymentStatuses } from "@/config/rules";
import { isWholeNumber, parseAmount } from "@/lib/validation/helpers";

export const employmentFieldsSchema = z.object({
  employmentStatus: z.string(),
  employerName: z.string(),
  designation: z.string(),
  yearsWithEmployer: z.string(),
  businessName: z.string(),
  profession: z.string(),
  yearsInBusiness: z.string(),
  incomeSource: z.string(),
  monthlyIncome: z.string(),
});

export type EmploymentFormValues = z.infer<typeof employmentFieldsSchema>;

export const emptyEmployment: EmploymentFormValues = {
  employmentStatus: "",
  employerName: "",
  designation: "",
  yearsWithEmployer: "",
  businessName: "",
  profession: "",
  yearsInBusiness: "",
  incomeSource: "",
  monthlyIncome: "",
};

const YEARS_MESSAGE = "Enter whole years (0 if less than a year).";

export function createEmploymentSchema(loanType: LoanType) {
  return employmentFieldsSchema.superRefine((v, ctx) => {
    const fail = (path: keyof EmploymentFormValues, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });

    const status = v.employmentStatus;
    if (!isEmploymentStatus(status)) {
      fail("employmentStatus", "Select your employment status.");
      return;
    }

    const allowed = allowedEmploymentStatuses[loanType];
    if (!allowed.includes(status)) {
      const names = allowed.map(employmentStatusLabel).join(" or ");
      fail("employmentStatus", `${getLoanProduct(loanType).name} applicants must be: ${names}.`);
      return;
    }

    if (status === "salaried") {
      if (v.employerName.trim().length < 2) fail("employerName", "Enter your employer's name.");
      if (v.designation.trim().length < 2) fail("designation", "Enter your job title.");
      if (!isWholeNumber(v.yearsWithEmployer, 0, 60)) fail("yearsWithEmployer", YEARS_MESSAGE);
    }

    if (status === "self-employed") {
      if (v.businessName.trim().length < 2) fail("businessName", "Enter your business or practice name.");
      if (v.profession.trim().length < 2) fail("profession", "Enter your profession or line of business.");
      if (!isWholeNumber(v.yearsInBusiness, 0, 60)) fail("yearsInBusiness", YEARS_MESSAGE);
    }

    if (status === "unemployed" && !isOptionValue(incomeSourceOptions, v.incomeSource)) {
      fail("incomeSource", "Select your main source of income.");
    }

    const income = v.monthlyIncome.trim();
    if (status === "unemployed" && income === "") return;

    const amount = parseAmount(income);
    if (amount === null || amount <= 0) {
      fail("monthlyIncome", "Enter your monthly income using digits only.");
    }
  });
}

export function sanitizeEmployment(values: EmploymentFormValues): EmploymentFormValues {
  const base: EmploymentFormValues = {
    ...emptyEmployment,
    employmentStatus: values.employmentStatus,
    monthlyIncome: values.monthlyIncome.trim(),
  };

  switch (values.employmentStatus) {
    case "salaried":
      return {
        ...base,
        employerName: values.employerName.trim(),
        designation: values.designation.trim(),
        yearsWithEmployer: values.yearsWithEmployer.trim(),
      };
    case "self-employed":
      return {
        ...base,
        businessName: values.businessName.trim(),
        profession: values.profession.trim(),
        yearsInBusiness: values.yearsInBusiness.trim(),
      };
    case "unemployed":
      return { ...base, incomeSource: values.incomeSource };
    default:
      return base;
  }
}