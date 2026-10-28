import { Briefcase, House, User, type LucideIcon } from "lucide-react";

export type LoanType = "personal" | "home" | "business";

export interface LoanProduct {
  type: LoanType;
  name: string;
  summary: string;
  icon: LucideIcon;
  minAmount: number;
  maxAmount: number;
  minMonths: number;
  maxMonths: number;
  illustrativeRate: number;
 
  
}

export const loanProducts: LoanProduct[] = [
  {
    type: "personal",
    name: "Personal Loan",
    summary: "For planned expenses such as home repairs, travel, medical costs or consolidating debts.",
    icon: User,
    minAmount: 50_000,
    maxAmount: 1_000_000,
    minMonths: 6,
    maxMonths: 60,
    illustrativeRate: 12.5, // personal
  },
  {
    type: "home",
    name: "Home Loan",
    summary: "To buy a property or refinance an existing home loan.",
    icon: House,
    minAmount: 500_000,
    maxAmount: 50_000_000,
    minMonths: 60,
    maxMonths: 360,
    illustrativeRate: 8.75, // home
  },
  {
    type: "business",
    name: "Business Loan",
    summary: "Working capital, equipment or expansion for a registered business.",
    icon: Briefcase,
    minAmount: 100_000,
    maxAmount: 5_000_000,
    minMonths: 12,
    maxMonths: 84,
    illustrativeRate: 14, // business
  },
];

export function isLoanType(value: string): value is LoanType {
  return loanProducts.some((product) => product.type === value);
}

export function getLoanProduct(type: LoanType): LoanProduct {
  const product = loanProducts.find((p) => p.type === type);
  if (!product) throw new Error(`Unknown loan type: ${type}`);
  return product;
}