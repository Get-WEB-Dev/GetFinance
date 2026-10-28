import { ApplicantForm } from "@/components/apply/ApplicantForm";
import { StepLayout } from "@/components/wizard/StepLayout";

export default function ApplicantPage() {
  return (
    <StepLayout
      slug="applicant"
      title="Applicant information"
      description="Tell us who is applying. Use the name as it appears on your government ID. This is a demo, so please use made-up details, not your own."
    >
      <ApplicantForm />
    </StepLayout>
  );
}