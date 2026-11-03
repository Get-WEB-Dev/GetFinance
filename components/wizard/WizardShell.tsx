"use client";

import { useState } from "react";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { getLoanProduct } from "@/config/loans";
import { isStepSlug } from "@/config/steps";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ChangeLoanTypeButton } from "./ChangeLoanTypeButton";
import { ProgressIndicator } from "./ProgressIndicator";
import { SaveStatus } from "./SaveStatus";
import { useDraft } from "./DraftProvider";
import { fileStore } from "@/lib/documents/file-store";

export function WizardShell({
  applicationId,
  children,
}: {
  applicationId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const segment = useSelectedLayoutSegment();
  const { status, draft, saveState, discard } = useDraft();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20">
        <p role="status" className="text-slate-600">
          Loading your application…
        </p>
      </div>
    );
  }

  if (status === "missing" || !draft) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <h1 className="text-2xl font-semibold text-navy-900">We couldn&apos;t find this application</h1>
        <p className="mt-3 text-slate-600">
          It may have been discarded or have expired, or it was started in a different browser.
          In this demo, drafts are stored only in the browser where you began them.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/apply">Start a new application</ButtonLink>
          <ButtonLink href="/resume" variant="secondary">
            Resume with a reference
          </ButtonLink>
        </div>
      </div>
    );
  }

  const product = getLoanProduct(draft.loanType);
  const currentSlug = segment && isStepSlug(segment) ? segment : null;

    async function handleDiscard() {
    fileStore.clearApplication(applicationId);
    await discard();
    router.push("/apply");
  }


  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Application reference
          </p>
          <p className="font-mono text-sm font-semibold text-navy-900">{draft.reference}</p>
          <p className="text-sm text-slate-600">{product.name}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <SaveStatus state={saveState} />
          <ChangeLoanTypeButton />
                   {segment !== "submitted" && (
            <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
              Discard draft
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside>
          <ProgressIndicator
            applicationId={applicationId}
            currentSlug={currentSlug}
            completedSteps={draft.completedSteps}
            stepsToReview={draft.stepsToReview}
          />
        </aside>
        <div key={draft.loanType}>{children}</div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Discard this draft?"
        description="Your saved answers will be deleted from this browser. This can't be undone."
        confirmLabel="Discard draft"
        onConfirm={handleDiscard}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}