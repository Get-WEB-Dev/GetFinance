import { Briefcase, GraduationCap, User, type LucideIcon } from "lucide-react";

export type LoanType = "personal" | "business" | "education";

export interface LoanProduct {
  type: LoanType;
  name: string;
  summary: string;
  icon: LucideIcon;
  minAmount: number;
  maxAmount: number;
  minMonths: number;
  maxMonths: number;
}

export const loanProducts: LoanProduct[] = [
  {
    type: "personal",
    name: "Personal Loan",
    summary: "For planned expenses such as home repairs, travel or consolidating debts.",
    icon: User,
    minAmount: 500,
    maxAmount: 10000,
    minMonths: 6,
    maxMonths: 48,
  },
  {
    type: "business",
    name: "Business Loan",
    summary: "Working capital or equipment for a registered or sole-trader business.",
    icon: Briefcase,
    minAmount: 2000,
    maxAmount: 50000,
    minMonths: 12,
    maxMonths: 60,
  },
  {
    type: "education",
    name: "Education Loan",
    summary: "Tuition and study costs for approved courses and institutions.",
    icon: GraduationCap,
    minAmount: 1000,
    maxAmount: 25000,
    minMonths: 12,
    maxMonths: 72,
  },
];