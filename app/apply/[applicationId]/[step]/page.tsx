import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { StepActions, StepLayout } from "@/components/wizard/StepLayout";
import { getAdjacentSteps, getStepLabel, getStepPath, isStepSlug } from "@/config/steps";

export default async function PlaceholderStepPage({
  params,
}: {
  params: Promise<{ applicationId: string; step: string }>;
}) {
  const { applicationId, step } = await params;

  if (!isStepSlug(step) || step === "loan-selection") notFound();

  const { previous, next } = getAdjacentSteps(step);
  const showBack = previous !== undefined && previous !== "loan-selection";

  return (
    <StepLayout slug={step} title={getStepLabel(step)}>
      <p className="rounded-lg border border-dashed border-line bg-surface p-6 text-sm text-slate-600">
        This step is built in a later lesson. For now, use the buttons below to move through the
        wizard and test navigation, progress and saving.
      </p>

      <StepActions
        back={
          showBack && previous ? (
            <ButtonLink href={getStepPath(applicationId, previous)} variant="secondary">
              Back
            </ButtonLink>
          ) : undefined
        }
      >
        {next && <ButtonLink href={getStepPath(applicationId, next)}>Next</ButtonLink>}
      </StepActions>
    </StepLayout>
  );
}