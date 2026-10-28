import { EmploymentForm } from "@/components/apply/EmploymentForm";
import { StepLayout } from "@/components/wizard/StepLayout";

export default function EmploymentPage() {
  return (
    <StepLayout
      slug="employment"
      title="Employment and income"
      description="Tell us how you earn a living. The questions change depending on your employment status."
    >
      <EmploymentForm />
    </StepLayout>
  );
}