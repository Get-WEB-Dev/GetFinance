import { PreApprovalSummary } from "@/components/apply/PreApprovalSummary";
import { ButtonLink } from "@/components/ui/Button";
import { StepLayout } from "@/components/wizard/StepLayout";
import { getStepPath } from "@/config/steps";

interface ReviewPageProps {
  params: Promise<{ applicationId: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { applicationId } = await params;

  return (
    <StepLayout
      slug="review"
      title="Review and pre-approval"
      description="Check your pre-approval summary. In the next lesson we add the full review and submit."
    >
      <PreApprovalSummary />
      <div className="mt-8">
        <ButtonLink href={getStepPath(applicationId, "signature")} variant="secondary">
          Back
        </ButtonLink>
      </div>
    </StepLayout>
  );
}