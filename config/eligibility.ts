import { DEFAULT_COUNTRY, type CountryCode } from "@/config/countries";
import type { LoanType } from "@/config/loans";

export interface EligibilityPolicy {
  minMonthlyIncome: number;
  /** Fixed obligations to income ratio (0.5 = 50%) including the new payment. */
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

type PolicySet = Record<LoanType, EligibilityPolicy>;

// Illustrative rules only. Verify against each country's real regulations before real use.
const ethiopia: PolicySet = {
  personal: {
    minMonthlyIncome: 20_000, maxFoir: 0.5, foirReferMargin: 0.1, maxAgeAtMaturity: 65,
    maxLoanToAnnualIncome: 2, minDisposableIncome: 5_000, minYearsInCurrentWork: 1,
  },
  home: {
    minMonthlyIncome: 40_000, maxFoir: 0.55, foirReferMargin: 0.1, maxAgeAtMaturity: 75,
    maxLoanToAnnualIncome: 6, minDisposableIncome: 10_000, maxLtv: 0.8, ltvReferMargin: 0.1,
    minYearsInCurrentWork: 1,
  },
  business: {
    minMonthlyIncome: 30_000, maxFoir: 0.6, foirReferMargin: 0.1, maxAgeAtMaturity: 70,
    maxLoanToAnnualIncome: 3, minDisposableIncome: 10_000, minYearsOperating: 2, referYearsOperating: 1,
  },
};

const unitedStates: PolicySet = {
  personal: {
    minMonthlyIncome: 2_000, maxFoir: 0.43, foirReferMargin: 0.07, maxAgeAtMaturity: 80,
    maxLoanToAnnualIncome: 1, minDisposableIncome: 300, minYearsInCurrentWork: 1,
  },
  home: {
    minMonthlyIncome: 3_500, maxFoir: 0.43, foirReferMargin: 0.07, maxAgeAtMaturity: 85,
    maxLoanToAnnualIncome: 5, minDisposableIncome: 600, maxLtv: 0.8, ltvReferMargin: 0.1,
    minYearsInCurrentWork: 1,
  },
  business: {
    minMonthlyIncome: 3_000, maxFoir: 0.5, foirReferMargin: 0.1, maxAgeAtMaturity: 80,
    maxLoanToAnnualIncome: 3, minDisposableIncome: 600, minYearsOperating: 2, referYearsOperating: 1,
  },
};

const unitedKingdom: PolicySet = {
  personal: {
    minMonthlyIncome: 1_500, maxFoir: 0.45, foirReferMargin: 0.1, maxAgeAtMaturity: 75,
    maxLoanToAnnualIncome: 1, minDisposableIncome: 250, minYearsInCurrentWork: 1,
  },
  home: {
    minMonthlyIncome: 2_500, maxFoir: 0.45, foirReferMargin: 0.1, maxAgeAtMaturity: 75,
    maxLoanToAnnualIncome: 4.5, minDisposableIncome: 500, maxLtv: 0.85, ltvReferMargin: 0.05,
    minYearsInCurrentWork: 1,
  },
  business: {
    minMonthlyIncome: 2_000, maxFoir: 0.5, foirReferMargin: 0.1, maxAgeAtMaturity: 75,
    maxLoanToAnnualIncome: 3, minDisposableIncome: 500, minYearsOperating: 2, referYearsOperating: 1,
  },
};

export const eligibilityPoliciesByCountry: Record<CountryCode, PolicySet> = {
  ET: ethiopia,
  US: unitedStates,
  GB: unitedKingdom,
};

export function getEligibilityPolicy(type: LoanType, country: CountryCode = DEFAULT_COUNTRY): EligibilityPolicy {
  return eligibilityPoliciesByCountry[country][type];
}

/** Policies for the default country. In country-aware code use getEligibilityPolicy. */
export const eligibilityPolicies: PolicySet = eligibilityPoliciesByCountry[DEFAULT_COUNTRY];