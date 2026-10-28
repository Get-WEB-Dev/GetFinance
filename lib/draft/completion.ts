import { steps, type StepSlug } from "@/config/steps";

export function withCompletedStep(completed: StepSlug[], slug: StepSlug): StepSlug[] {
  const set = new Set<StepSlug>(completed);
  set.add(slug);
  return steps.map((s) => s.slug).filter((s) => set.has(s));
}

export function getFirstIncompleteStep(completed: StepSlug[]): StepSlug {
  const next = steps.find((s) => !completed.includes(s.slug));
  return next ? next.slug : "review";
}

export function canAccessStep(completed: StepSlug[], slug: StepSlug): boolean {
  const target = steps.findIndex((s) => s.slug === slug);
  const limit = steps.findIndex((s) => s.slug === getFirstIncompleteStep(completed));
  return target <= limit;
}