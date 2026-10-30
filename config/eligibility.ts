import type { LoanType } from "@/config/loans";

export interface EligibilityPolicy {
  minMonthlyIncome: number;
  /** Fixed obligations to income ratio (0.5 = 50%) including the new EMI. */
  maxFoir: number;
  /** Above maxFoir but within this extra margin, the case goes to manual review. */
  foirReferMargin: number;
  maxAgeAtMaturity: number;
  /** Loan amount as a multiple of annual income. */
  maxLoanToAnnualIncome: number;
  /** Money left each month after all obligations. Below this but not negative means review. */
  minDisposableIncome: number;
  maxLtv?: number;
  ltvReferMargin?: number;
  minYearsOperating?: number;
  referYearsOperating?: number;
  minYearsInCurrentWork?: number;
}

export const eligibilityPolicies: Record<LoanType, EligibilityPolicy> = {
  personal: {
    minMonthlyIncome: 20_000,
    maxFoir: 0.5,
    foirReferMargin: 0.1,
    maxAgeAtMaturity: 65,
    maxLoanToAnnualIncome: 2,
    minDisposableIncome: 5_000,
    minYearsInCurrentWork: 1,
  },
  home: {
    minMonthlyIncome: 40_000,
    maxFoir: 0.55,
    foirReferMargin: 0.1,
    maxAgeAtMaturity: 75,
    maxLoanToAnnualIncome: 6,
    minDisposableIncome: 10_000,
    maxLtv: 0.8,
    ltvReferMargin: 0.1,
    minYearsInCurrentWork: 1,
  },
  business: {
    minMonthlyIncome: 30_000,
    maxFoir: 0.6,
    foirReferMargin: 0.1,
    maxAgeAtMaturity: 70,
    maxLoanToAnnualIncome: 3,
    minDisposableIncome: 10_000,
    minYearsOperating: 2,
    referYearsOperating: 1,
  },
};