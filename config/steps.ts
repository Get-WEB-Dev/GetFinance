export const steps = [
  { slug: "loan-selection", label: "Loan selection" },
  { slug: "applicant", label: "Applicant" },
  { slug: "address", label: "Address" },
  { slug: "employment", label: "Employment & income" },
  { slug: "loan-details", label: "Loan details" },
  { slug: "finances", label: "Finances" },
  { slug: "verification", label: "Identity verification" },
  { slug: "documents", label: "Documents" },
  { slug: "signature", label: "Declarations & signature" },
  { slug: "review", label: "Review & submit" },
] as const;

export type StepSlug = (typeof steps)[number]["slug"];

export function isStepSlug(value: string): value is StepSlug {
  return steps.some((step) => step.slug === value);
}

export function getStepPath(applicationId: string, slug: StepSlug): string {
  return slug === "loan-selection" ? "/apply" : `/apply/${applicationId}/${slug}`;
}
export function getStepLabel(slug: StepSlug): string {
  const step = steps.find((s) => s.slug === slug);
  return step ? step.label : slug;
}

export function getAdjacentSteps(slug: StepSlug): {
  previous: StepSlug | undefined;
  next: StepSlug | undefined;
} {
  const index = steps.findIndex((s) => s.slug === slug);
  return {
    previous: index > 0 ? steps[index - 1].slug : undefined,
    next: index < steps.length - 1 ? steps[index + 1].slug : undefined,
  };
}