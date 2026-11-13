import { Briefcase, House, User, type LucideIcon } from "lucide-react";
import { DEFAULT_COUNTRY, type CountryCode } from "@/config/countries";
import { loanTerms, type LoanTerms } from "@/config/country-loans";

export type LoanType = "personal" | "home" | "business";

interface LoanProductBase {
  type: LoanType;
  name: string;
  summary: string;
  icon: LucideIcon;
}

export interface LoanProduct extends LoanProductBase, LoanTerms {}

const baseProducts: LoanProductBase[] = [
  {
    type: "personal",
    name: "Personal Loan",
    summary: "For planned expenses such as home repairs, travel, medical costs or consolidating debts.",
    icon: User,
  },
  {
    type: "home",
    name: "Home Loan",
    summary: "To buy a property or refinance an existing home loan.",
    icon: House,
  },
  {
    type: "business",
    name: "Business Loan",
    summary: "Working capital, equipment or expansion for a registered business.",
    icon: Briefcase,
  },
];

export function getLoanProducts(country: CountryCode = DEFAULT_COUNTRY): LoanProduct[] {
  return baseProducts.map((base) => ({ ...base, ...loanTerms[country][base.type] }));
}

/** Products for the default country. In country-aware code use getLoanProducts(country). */
export const loanProducts: LoanProduct[] = getLoanProducts();

export function isLoanType(value: string): value is LoanType {
  return baseProducts.some((product) => product.type === value);
}

export function getLoanProduct(type: LoanType, country: CountryCode = DEFAULT_COUNTRY): LoanProduct {
  const product = getLoanProducts(country).find((p) => p.type === type);
  if (!product) throw new Error(`Unknown loan type: ${type}`);
  return product;
}