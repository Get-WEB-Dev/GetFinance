import { ResumeRedirect } from "@/components/wizard/ResumeRedirect";

export default async function ApplicationIndexPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;
  return <ResumeRedirect applicationId={applicationId} />;
}