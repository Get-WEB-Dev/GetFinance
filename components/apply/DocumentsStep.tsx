"use client";

import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SimulationNotice } from "@/components/ui/SimulationNotice";
import { DocumentSlot } from "@/components/apply/DocumentSlot";
import { useReadyDraft } from "@/components/wizard/DraftProvider";
import { StepActions } from "@/components/wizard/StepLayout";
import { documentCatalog } from "@/config/documents";
import { getStepPath } from "@/config/steps";
import { withCompletedStep } from "@/lib/draft/completion";
import { getRequiredDocuments } from "@/lib/documents/requirements";
import type { StoredDocument } from "@/lib/validation/documents";

export function DocumentsStep() {
  const router = useRouter();
  const { draft, updateDraft } = useReadyDraft();

  const required = getRequiredDocuments(draft.loanType, draft.employment?.employmentStatus);
  const documents = draft.documents ?? {};
  const missing = required.filter((id) => !documents[id]);

  function handleStored(document: StoredDocument) {
    void updateDraft((current) => ({
      documents: { ...current.documents, [document.documentId]: document },
    }));
  }

  function handleRemoved(documentId: string) {
    void updateDraft((current) => ({
      documents: Object.fromEntries(
        Object.entries(current.documents ?? {}).filter(([key]) => key !== documentId),
      ),
      completedSteps: current.completedSteps.filter((slug) => slug !== "documents"),
    }));
  }

  async function handleContinue() {
    await updateDraft({ completedSteps: withCompletedStep(draft.completedSteps, "documents") });
    router.push(getStepPath(draft.id, "signature"));
  }

  return (
    <div>
      <SimulationNotice>
        <p className="font-medium">Files are not uploaded to any server.</p>
        <p className="mt-1">
          Your files are checked and optimised in this browser, and the upload is simulated. Only file
          names and sizes are saved in this demo, and the files themselves are lost when you refresh.
          Please use sample files, never real identity or financial documents.
        </p>
      </SimulationNotice>

      <p className="mt-6 text-sm text-slate-600" aria-live="polite">
        {required.length - missing.length} of {required.length} required documents added.
      </p>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {required.map((documentId) => (
          <DocumentSlot
            key={documentId}
            applicationId={draft.id}
            documentId={documentId}
            stored={documents[documentId]}
            onStored={handleStored}
            onRemoved={() => handleRemoved(documentId)}
          />
        ))}
      </div>

      <StepActions
        back={
          <ButtonLink href={getStepPath(draft.id, "verification")} variant="secondary">
            Back
          </ButtonLink>
        }
      >
        <div className="flex flex-col items-end gap-2">
          <Button onClick={handleContinue} disabled={missing.length > 0}>
            Save and continue
          </Button>
          {missing.length > 0 && (
            <p className="max-w-xs text-right text-sm text-slate-600">
              Still needed: {missing.map((id) => documentCatalog[id].label).join(", ")}.
            </p>
          )}
        </div>
      </StepActions>
    </div>
  );
}