import type { Metadata } from "next";
import { DraftProvider } from "@/components/wizard/DraftProvider";
import { WizardShell } from "@/components/wizard/WizardShell";
import { SubmissionLock } from "@/components/wizard/SubmissionLock";

export const metadata: Metadata = {
  title: "Your application",
  robots: { index: false, follow: false },
};

export default async function ApplicationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = await params;

  return (
    <DraftProvider applicationId={applicationId}>
      <SubmissionLock applicationId={applicationId} />
      <WizardShell applicationId={applicationId}>{children}</WizardShell>
    </DraftProvider>
  );
}