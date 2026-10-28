import { FinancesForm } from "@/components/apply/FinancesForm";
import { StepLayout } from "@/components/wizard/StepLayout";

export default function FinancesPage() {
  return (
    <StepLayout
      slug="finances"
      title="Finances and obligations"
      description="Your regular expenses and any existing loan repayments help us show an illustrative affordability view."
    >
      <FinancesForm />
    </StepLayout>
  );
}