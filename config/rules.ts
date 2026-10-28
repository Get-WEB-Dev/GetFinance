import type { LoanType } from "@/config/loans";
import type { EmploymentStatus } from "@/config/options";

export const applicantRules = {
  minAge: 18,
  maxAge: 70,
} as const;

export const addressRules = {
  historyYears: 2,
} as const;

export const allowedEmploymentStatuses: Record<LoanType, EmploymentStatus[]> = {
  personal: ["salaried", "self-employed", "unemployed"],
  home: ["salaried", "self-employed"],
  business: ["self-employed"],
};