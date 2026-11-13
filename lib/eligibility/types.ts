import type { LoanType } from "@/config/loans";

export type RuleOutcome = "pass" | "refer" | "fail";
export type Decision = "eligible" | "review" | "not-eligible";
import type { CountryCode } from "@/config/countries";

export interface EligibilityInput {
  country: CountryCode;
  loanType: LoanType;
  age: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  existingEmi: number;
  requestedAmount: number;
  termMonths: number;
  annualRatePercent: number;
  employmentStatus: string;
  yearsInCurrentWork: number | null;
  propertyValue: number | null;
  yearsOperating: number | null;
}

export interface RuleResult {
  id: string;
  label: string;
  outcome: RuleOutcome;
  yourValue: string;
  requirement: string;
  hint?: string;
}

export interface EligibilityResult {
  decision: Decision;
  rules: RuleResult[];
  annualRatePercent: number;
  monthlyPayment: number;
  totalPayable: number;
  totalInterest: number;
  foir: number;
  disposableIncome: number;
  /** The largest amount that would pass the amount-related rules, or null if none would. */
  maxAmount: number | null;
}