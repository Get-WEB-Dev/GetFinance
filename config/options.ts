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