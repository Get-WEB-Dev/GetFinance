import { VerificationStep } from "@/components/apply/VerificationStep";
import { StepLayout } from "@/components/wizard/StepLayout";

export default function VerificationPage() {
  return (
    <StepLayout
      slug="verification"
      title="Identity verification"
      description="Confirm your identity with a simulated identity check."
    >
      <VerificationStep />
    </StepLayout>
  );
}