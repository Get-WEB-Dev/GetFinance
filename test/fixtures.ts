import type { z } from "zod";
import type { ApplicationDraft } from "@/types/application";

export const validApplicant = {
  fullName: "Asha Rao",
  dateOfBirth: "1990-05-20",
  email: "asha@example.com",
  mobile: "911234567",
  alternateMobile: "",
};

export const validAddress = {
  addressLine1: "Bole Sub-city, Woreda 03, House 1204",
  addressLine2: "",
  city: "Addis Ababa",
  state: "Addis Ababa",
  pincode: "1000",
  country: "Ethiopia",
  residenceType: "rented",
  yearsAtAddress: "5",
  previousAddress: "",
};

export const validEmployment = {
  employmentStatus: "salaried",
  employerName: "Example Pvt Ltd",
  designation: "Analyst",
  yearsWithEmployer: "3",
  businessName: "",
  profession: "",
  yearsInBusiness: "",
  incomeSource: "",
  monthlyIncome: "80000",
};

export const validPersonalLoanDetails = {
  loanAmount: "200000",
  termMonths: "24",
  purpose: "medical",
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

export const validHomeLoanDetails = {
  ...validPersonalLoanDetails,
  loanAmount: "4500000",
  termMonths: "240",
  purpose: "purchase",
  propertyValue: "5000000",
  downPayment: "500000",
  propertyCity: "Addis Ababa",
  propertyState: "Addis Ababa",
};

export const validFinances = {
  monthlyExpenses: "30000",
  hasExistingLoans: "no",
  existingMonthlyEmi: "",
  dependents: "1",
  savings: "",
  annualBusinessExpenses: "",
};

export function makeDraft(overrides: Partial<ApplicationDraft> = {}): ApplicationDraft {
  return {
    schemaVersion: 1,
    id: "test-id",
    reference: "GF-TEST0001",
    country: "ET",
    loanType: "personal",
    currentStep: "finances",
    completedSteps: ["loan-selection", "applicant", "address", "employment", "loan-details", "finances"],
    stepsToReview: [],
    applicant: validApplicant,
    address: validAddress,
    employment: validEmployment,
    loanDetails: validPersonalLoanDetails,
    finances: validFinances,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

/** Returns a map of field name to first error message, or {} when the data is valid. */
export function errorsFor(schema: z.ZodType, value: unknown): Record<string, string> {
  const result = schema.safeParse(value);
  if (result.success) return {};

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? "");
    if (!(field in errors)) errors[field] = issue.message;
  }
  return errors;
}