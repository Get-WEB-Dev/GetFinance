import { DocumentsStep } from "@/components/apply/DocumentsStep";
import { StepLayout } from "@/components/wizard/StepLayout";

export default function DocumentsPage() {
  return (
    <StepLayout
      slug="documents"
      title="Documents"
      description="Add the documents required for your loan. Accepted formats are PDF, JPG and PNG."
    >
      <DocumentsStep />
    </StepLayout>
  );
}