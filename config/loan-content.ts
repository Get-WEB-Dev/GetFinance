import type { LoanType } from "@/config/loans";

export interface LoanContent {
  headline: string;
  suitableFor: string[];
  features: string[];
}

export const loanContent: Record<LoanType, LoanContent> = {
  personal: {
    headline: "Flexible funds for planned personal expenses.",
    suitableFor: [
      "Medical costs, travel, weddings or home improvements",
      "Consolidating several smaller debts into one payment",
      "People with a regular salary or other steady income",
    ],
    features: [
      "No security required",
      "Fixed monthly payments so you can plan",
      "Apply online and save your progress as you go",
    ],
  },
  home: {
    headline: "Finance for buying, building or renovating a home.",
    suitableFor: [
      "Buying a ready home or a plot",
      "Construction or major renovation",
      "Salaried or self-employed applicants with a stable income",
    ],
    features: [
      "Longer terms for lower monthly payments",
      "Loan amount based on your income and the property's value",
      "Property documents reviewed as part of your application",
    ],
  },
  business: {
    headline: "Working capital and equipment finance for your business.",
    suitableFor: [
      "Managing cash flow or buying stock",
      "Purchasing equipment or expanding premises",
      "Self-employed owners with an operating business",
    ],
    features: [
      "Decision based on your business history and income",
      "Terms chosen to match your business cycle",
      "Registration and financial statements reviewed with your application",
    ],
  },
};