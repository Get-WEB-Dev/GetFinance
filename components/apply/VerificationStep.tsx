"use client";

import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SimulationNotice } from "@/components/ui/SimulationNotice";
import { IdentityCard } from "@/components/apply/IdentityCard";
import { useReadyDraft } from "@/components/wizard/DraftProvider";
import { StepActions } from "@/components/wizard/StepLayout";
import { simulationTestValues } from "@/config/identity";
import { getStepPath } from "@/config/steps";
import { withCompletedStep } from "@/lib/draft/completion";
import type { VerifiedIdentity } from "@/lib/validation/identity";
import type { IdentityKind } from "@/types/verification";

export function VerificationStep() {
  const router = useRouter();
  const { draft, updateDraft } = useReadyDraft();

  const verification = draft.verification;
  const allVerified = Boolean(verification?.pan && verification?.aadhaar);

  function setResult(kind: IdentityKind, result: VerifiedIdentity | undefined) {
    void updateDraft((current) => {
      const existing = current.verification ?? {};
      return {
        verification: kind === "pan" ? { ...existing, pan: result } : { ...existing, aadhaar: result },
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
          No real PAN or Aadhaar verification happens and nothing is sent to any government system.
          Please use only the test values below. Never enter your own identity numbers. We store only a
          masked version after a successful check.
        </p>
      </SimulationNotice>

      <details className="mt-4 rounded-md border border-line bg-white p-4 text-sm">
        <summary className="cursor-pointer font-medium text-navy-900">Test values for this demo</summary>
        <table className="mt-3 w-full text-left">
          <thead>
            <tr className="text-slate-500">
              <th className="py-1 pr-4 font-medium">Outcome</th>
              <th className="py-1 pr-4 font-medium">PAN</th>
              <th className="py-1 font-medium">Aadhaar</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            <tr>
              <td className="py-1 pr-4 font-sans">Verified</td>
              <td className="py-1 pr-4">{simulationTestValues.pan.verified}</td>
              <td className="py-1">{simulationTestValues.aadhaar.verified}</td>
            </tr>
            <tr>
              <td className="py-1 pr-4 font-sans">Fails verification</td>
              <td className="py-1 pr-4">{simulationTestValues.pan.failed}</td>
              <td className="py-1">{simulationTestValues.aadhaar.failed}</td>
            </tr>
            <tr>
              <td className="py-1 pr-4 font-sans">Service error, then works on retry</td>
              <td className="py-1 pr-4">{simulationTestValues.pan.flaky}</td>
              <td className="py-1">{simulationTestValues.aadhaar.flaky}</td>
            </tr>
          </tbody>
        </table>
      </details>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <IdentityCard
          kind="pan"
          result={verification?.pan}
          onVerified={(result) => setResult("pan", result)}
          onCleared={() => setResult("pan", undefined)}
        />
        <IdentityCard
          kind="aadhaar"
          result={verification?.aadhaar}
          onVerified={(result) => setResult("aadhaar", result)}
          onCleared={() => setResult("aadhaar", undefined)}
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
            <p className="text-sm text-slate-600">Verify both your PAN and Aadhaar to continue.</p>
          )}
        </div>
      </StepActions>
    </div>
  );
}