import type { LoanType } from "@/config/loans";
export const residenceTypeOptions = [
  { value: "owned", label: "Owned" },
  { value: "rented", label: "Rented" },
  { value: "family", label: "Living with family" },
  { value: "employer", label: "Employer-provided" },
  { value: "other", label: "Other" },
] as const;

export const employmentStatusOptions = [
  { value: "salaried", label: "Salaried", description: "Employed by a company or organisation." },
  { value: "self-employed", label: "Self-employed", description: "Business owner, freelancer or professional." },
  { value: "unemployed", label: "Not currently employed", description: "Between jobs, retired or studying." },
] as const;

export const incomeSourceOptions = [
  { value: "pension", label: "Pension" },
  { value: "rental", label: "Rental income" },
  { value: "family-support", label: "Family support" },
  { value: "savings", label: "Savings or investments" },
  { value: "other", label: "Other" },
] as const;

export type EmploymentStatus = (typeof employmentStatusOptions)[number]["value"];

export function isOptionValue(options: readonly { value: string }[], value: string): boolean {
  return options.some((option) => option.value === value);
}

export function isEmploymentStatus(value: string): value is EmploymentStatus {
  return isOptionValue(employmentStatusOptions, value);
}

export function employmentStatusLabel(status: EmploymentStatus): string {
  return employmentStatusOptions.find((o) => o.value === status)?.label ?? status;
}
export const yesNoOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

export const loanPurposeOptions: Record<LoanType, readonly { value: string; label: string }[]> = {
  personal: [
    { value: "medical", label: "Medical expenses" },
    { value: "travel", label: "Travel" },
    { value: "wedding", label: "Wedding or event" },
    { value: "home-renovation", label: "Home renovation" },
    { value: "debt-consolidation", label: "Debt consolidation" },
    { value: "other", label: "Other" },
  ],
  home: [
    { value: "purchase", label: "Purchase a property" },
    { value: "refinance", label: "Refinance an existing home loan" },
  ],
  business: [
    { value: "working-capital", label: "Working capital" },
    { value: "equipment", label: "Equipment purchase" },
    { value: "expansion", label: "Business expansion" },
    { value: "inventory", label: "Inventory" },
    { value: "other", label: "Other" },
  ],
};

export function isLoanPurpose(loanType: LoanType, value: string): boolean {
  return isOptionValue(loanPurposeOptions[loanType], value);
}

export const businessTypeOptions = [
  { value: "sole-proprietorship", label: "Sole proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "llp", label: "Limited liability partnership (LLP)" },
  { value: "private-limited", label: "Private limited company" },
  { value: "other", label: "Other" },
] as const;

export const industryOptions = [
  { value: "retail", label: "Retail and trade" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "services", label: "Professional services" },
  { value: "technology", label: "Technology" },
  { value: "agriculture", label: "Agriculture" },
  { value: "healthcare", label: "Healthcare" },
  { value: "construction", label: "Construction" },
  { value: "hospitality", label: "Hospitality" },
  { value: "other", label: "Other" },
] as const;