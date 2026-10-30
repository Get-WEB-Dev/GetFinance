import { ReviewStep } from "@/components/apply/ReviewStep";
import { StepLayout } from "@/components/wizard/StepLayout";

export default function ReviewPage() {
  return (
    <StepLayout
      slug="review"
      title="Review and submit"
      description="Check your pre-approval summary and your details, then submit your application."
    >
      <ReviewStep />
    </StepLayout>
  );
}