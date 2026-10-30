import { getStepLabel, steps, type StepSlug } from "@/config/steps";
import { revalidateDraft } from "@/lib/draft/revalidate";
import type { ApplicationDraft } from "@/types/application";

export interface SubmissionBlocker {
  slug: StepSlug;
  label: string;
  issues: string[];
}

/** The draft exists only because a loan type was chosen, and review is where we are. */
const stepsRequiredToSubmit = steps
  .map((step) => step.slug)
  .filter((slug) => slug !== "loan-selection" && slug !== "review");

export function getSubmissionBlockers(draft: ApplicationDraft): SubmissionBlocker[] {
  const validations = revalidateDraft(draft);

  return stepsRequiredToSubmit.flatMap((slug) => {
    const validation = validations.find((item) => item.slug === slug);
    const notCompleted = !draft.completedSteps.includes(slug);
    const invalid = validation ? !validation.valid : false;
    if (!notCompleted && !invalid) return [];

    const issues = validation?.issues.map((issue) => issue.message) ?? [];
    return [
      {
        slug,
        label: getStepLabel(slug),
        issues: issues.length > 0 ? issues : ["This step hasn't been completed."],
      },
    ];
  });
}