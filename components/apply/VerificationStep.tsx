"use client";

import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SimulationNotice } from "@/components/ui/SimulationNotice";
import { IdentityCard } from "@/components/apply/IdentityCard";
import { useReadyDraft } from "@/components/wizard/DraftProvider";
import { StepActions } from "@/components/wizard/StepLayout";
import { getIdentityDocument } from "@/config/identity";
import { getStepPath } from "@/config/steps";
import { withCompletedStep } from "@/lib/draft/completion";
import type { VerifiedIdentity } from "@/lib/validation/identity";
import type { IdentityKind } from "@/types/verification";

export function VerificationStep() {
  const router = useRouter();
  const { draft, updateDraft } = useReadyDraft();

  const primary = getIdentityDocument(draft.country, "primary");
  const secondary = getIdentityDocument(draft.country, "secondary");

  const verification = draft.verification;
  const allVerified = Boolean(verification?.primary && verification?.secondary);

  function setResult(kind: IdentityKind, result: VerifiedIdentity | undefined) {
    void updateDraft((current) => {
      const existing = current.verification ?? {};
      return {
        verification: kind === "primary" ? { ...existing, primary: result } : { ...existing, secondary: result },
        completedSteps: current.completedSteps.filter((slug) => slug !== "verification"),
      };
    });
  }

  async function handleContinue() {
    await updateDraft({
      completedSteps: withCompletedStep(draft.completedSteps, "verification"),
    });
    router.push(getStepPath(draft.id, "documents"));
  }

  return (
    <div>
      <SimulationNotice>
        <p className="font-medium">This is a simulated check.</p>
        <p className="mt-1">
          No real {primary.title} or {secondary.title} verification happens and nothing is sent to any
          government system. Please use only the test values below. Never enter your own identity numbers.
          We store only a masked version after a successful check.
        </p>
      </SimulationNotice>

      <details className="mt-4 rounded-md border border-line bg-white p-4 text-sm">
        <summary className="cursor-pointer font-medium text-navy-900">Test values for this demo</summary>
        <table className="mt-3 w-full text-left">
          <thead>
            <tr className="text-slate-500">
              <th className="py-1 pr-4 font-medium">Outcome</th>
              <th className="py-1 pr-4 font-medium">{primary.title}</th>
              <th className="py-1 font-medium">{secondary.title}</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            <tr>
              <td className="py-1 pr-4 font-sans">Verified</td>
              <td className="py-1 pr-4">{primary.testValues.verified}</td>
              <td className="py-1">{secondary.testValues.verified}</td>
            </tr>
            <tr>
              <td className="py-1 pr-4 font-sans">Fails verification</td>
              <td className="py-1 pr-4">{primary.testValues.failed}</td>
              <td className="py-1">{secondary.testValues.failed}</td>
            </tr>
            <tr>
              <td className="py-1 pr-4 font-sans">Service error, then works on retry</td>
              <td className="py-1 pr-4">{primary.testValues.flaky}</td>
              <td className="py-1">{secondary.testValues.flaky}</td>
            </tr>
          </tbody>
        </table>
      </details>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <IdentityCard
          kind="primary"
          result={verification?.primary}
          onVerified={(result) => setResult("primary", result)}
          onCleared={() => setResult("primary", undefined)}
        />
        <IdentityCard
          kind="secondary"
          result={verification?.secondary}
          onVerified={(result) => setResult("secondary", result)}
          onCleared={() => setResult("secondary", undefined)}
        />
      </div>

      <StepActions
        back={
          <ButtonLink href={getStepPath(draft.id, "finances")} variant="secondary">
            Back
          </ButtonLink>
        }
      >
        <div className="flex flex-col items-end gap-2">
          <Button onClick={handleContinue} disabled={!allVerified}>
            Save and continue
          </Button>
          {!allVerified && (
            <p className="text-sm text-slate-600">
              Verify both your {primary.title} and {secondary.title} to continue.
            </p>
          )}
        </div>
      </StepActions>
    </div>
  );
}