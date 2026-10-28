import { LoanDetailsForm } from "@/components/apply/LoanDetailsForm";
import { StepLayout } from "@/components/wizard/StepLayout";

export default function LoanDetailsPage() {
  return (
    <StepLayout
      slug="loan-details"
      title="Loan details"
      description="Tell us how much you'd like to borrow and for how long. Estimates are illustrations, not offers."
    >
      <LoanDetailsForm />
    </StepLayout>
  );
}