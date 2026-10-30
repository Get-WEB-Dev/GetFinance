import type { LoanType } from "@/config/loans";

/** Bump this whenever the wording below changes, so earlier acceptances are no longer valid. */
export const declarationsVersion = "2026-10-v1";

export interface DeclarationItem {
  id: string;
  short: string;
  text: string;
  loanTypes?: LoanType[];
}

const declarations: DeclarationItem[] = [
  {
    id: "accuracy",
    short: "the information is accurate",
    text: "The information I have given is true and complete to the best of my knowledge.",
  },
  {
    id: "credit-check",
    short: "the credit check authorisation",
    text: "I authorise GetFinance to check my credit information as part of this application. (Simulated in this demo.)",
  },
  {
    id: "terms",
    short: "the terms and privacy notice",
    text: "I have read the terms, the privacy notice and the demo disclaimer.",
  },
  {
    id: "property-rights",
    short: "the property declaration",
    text: "I confirm the property details are accurate and that I am entitled to offer the property as security.",
    loanTypes: ["home"],
  },
  {
    id: "business-authority",
    short: "your authority to apply for the business",
    text: "I am authorised to apply for this loan on behalf of the business.",
    loanTypes: ["business"],
  },
];

export function getRequiredDeclarations(loanType: LoanType): DeclarationItem[] {
  return declarations.filter((item) => !item.loanTypes || item.loanTypes.includes(loanType));
}

export const marketingConsentText =
  "I'd like to receive offers and updates from GetFinance. This is optional and does not affect my application.";