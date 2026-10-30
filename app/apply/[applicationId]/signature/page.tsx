import { DeclarationsStep } from "@/components/apply/DeclarationsStep";
import { StepLayout } from "@/components/wizard/StepLayout";

export default function SignaturePage() {
  return (
    <StepLayout
      slug="signature"
      title="Declarations and signature"
      description="Confirm the declarations and sign your application."
    >
      <DeclarationsStep />
    </StepLayout>
  );
}