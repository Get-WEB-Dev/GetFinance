import { steps } from "@/config/steps";
import { revalidateDraft } from "@/lib/draft/revalidate";
import type { ApplicationDraft } from "@/types/application";

export function reconcileDraft(draft: ApplicationDraft): ApplicationDraft {
  const invalid = revalidateDraft(draft)
    .filter((result) => !result.valid)
    .map((result) => result.slug);

  const newlyInvalid = draft.completedSteps.filter((slug) => invalid.includes(slug));
  if (newlyInvalid.length === 0) return draft;

  return {
    ...draft,
    completedSteps: draft.completedSteps.filter((slug) => !newlyInvalid.includes(slug)),
    stepsToReview: steps
      .map((step) => step.slug)
      .filter((slug) => draft.stepsToReview.includes(slug) || newlyInvalid.includes(slug)),
  };
}