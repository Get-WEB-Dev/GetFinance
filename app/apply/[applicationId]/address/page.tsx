import { AddressForm } from "@/components/apply/AddressForm";
import { StepLayout } from "@/components/wizard/StepLayout";

export default function AddressPage() {
  return (
    <StepLayout
      slug="address"
      title="Residential address"
      description="Where do you currently live? Use made-up details for this demo."
    >
      <AddressForm />
    </StepLayout>
  );
}