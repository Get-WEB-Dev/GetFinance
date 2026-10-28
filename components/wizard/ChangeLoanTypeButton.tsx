"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { loanProducts, type LoanType } from "@/config/loans";
import { getStepLabel, getStepPath } from "@/config/steps";
import { describeLoanTypeChange } from "@/lib/draft/change-loan-type";
import { useReadyDraft } from "./DraftProvider";

export function ChangeLoanTypeButton() {
  const router = useRouter();
  const { draft, updateDraft } = useReadyDraft();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<LoanType | null>(null);

  const change = useMemo(
    () => (selected ? describeLoanTypeChange(draft, selected) : null),
    [draft, selected],
  );

  function close() {
    setOpen(false);
    setSelected(null);
  }

  async function confirm() {
    if (!change) return;
    await updateDraft(change.patch);
    close();
    const firstToReview = change.reviewSteps[0];
    if (firstToReview) router.push(getStepPath(draft.id, firstToReview));
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Change loan type
      </Button>

      <ConfirmDialog
        open={open}
        title="Change loan type?"
        description="Your applicant and address details are kept. Details that only apply to one loan type may be cleared, and some steps may need another look."
        confirmLabel="Change loan type"
        confirmVariant="primary"
        confirmDisabled={!change}
        onConfirm={confirm}
        onCancel={close}
      >
        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-navy-900">Switch to</legend>
          {loanProducts
            .filter((product) => product.type !== draft.loanType)
            .map((product) => (
              <label
                key={product.type}
                className="mt-2 flex cursor-pointer items-center gap-3 rounded-md border border-slate-300 p-3 has-[:checked]:border-accent-600 has-[:checked]:ring-2 has-[:checked]:ring-accent-600"
              >
                <input
                  type="radio"
                  name="new-loan-type"
                  value={product.type}
                  checked={selected === product.type}
                  onChange={() => setSelected(product.type)}
                  className="h-4 w-4 accent-accent-600"
                />
                <span className="text-sm font-medium text-navy-900">{product.name}</span>
              </label>
            ))}
        </fieldset>

        <div aria-live="polite" className="mt-4 space-y-2 text-sm text-slate-700">
          {change && (
            <>
              {change.clearedLabels.length > 0 && (
                <p>
                  <strong>Will be cleared:</strong> {change.clearedLabels.join(", ")}.
                </p>
              )}
              {change.reviewSteps.length > 0 && (
                <p>
                  <strong>Needs review:</strong>{" "}
                  {change.reviewSteps.map(getStepLabel).join(", ")}.
                </p>
              )}
              {change.clearedLabels.length === 0 && change.reviewSteps.length === 0 && (
                <p>No other details are affected.</p>
              )}
            </>
          )}
        </div>
      </ConfirmDialog>
    </>
  );
}