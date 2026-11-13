import type { CountryCode } from "@/config/countries";
import type { LoanType } from "@/config/loans";

export interface LoanTerms {
  minAmount: number;
  maxAmount: number;
  minMonths: number;
  maxMonths: number;
  /** Sample annual rate in percent. Illustration only, never an offer. */
  illustrativeRate: number;
}

type TermsSet = Record<LoanType, LoanTerms>;

// Ethiopia: placeholder values (they match the app's earlier numbers). Verify before real use.
// United States and United Kingdom: illustrative values, not regulatory limits.
export const loanTerms: Record<CountryCode, TermsSet> = {
  ET: {
    personal: { minAmount: 50_000, maxAmount: 1_000_000, minMonths: 6, maxMonths: 60, illustrativeRate: 12.5 },
    home: { minAmount: 500_000, maxAmount: 50_000_000, minMonths: 60, maxMonths: 360, illustrativeRate: 8.75 },
    business: { minAmount: 100_000, maxAmount: 5_000_000, minMonths: 12, maxMonths: 84, illustrativeRate: 14 },
  },
  US: {
    personal: { minAmount: 1_000, maxAmount: 50_000, minMonths: 12, maxMonths: 84, illustrativeRate: 11.5 },
    home: { minAmount: 50_000, maxAmount: 2_000_000, minMonths: 120, maxMonths: 360, illustrativeRate: 6.75 },
    business: { minAmount: 5_000, maxAmount: 500_000, minMonths: 12, maxMonths: 120, illustrativeRate: 9.5 },
  },
  GB: {
    personal: { minAmount: 1_000, maxAmount: 35_000, minMonths: 12, maxMonths: 84, illustrativeRate: 8.9 },
    home: { minAmount: 25_000, maxAmount: 1_500_000, minMonths: 60, maxMonths: 360, illustrativeRate: 5 },
    business: { minAmount: 1_000, maxAmount: 250_000, minMonths: 12, maxMonths: 120, illustrativeRate: 9 },
  },
};