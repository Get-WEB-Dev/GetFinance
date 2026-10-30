"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { PreApprovalSummary } from "@/components/apply/PreApprovalSummary";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useReadyDraft } from "@/components/wizard/DraftProvider";
import { StepActions } from "@/components/wizard/StepLayout";
import { getStepPath } from "@/config/steps";
import { withCompletedStep } from "@/lib/draft/completion";
import { evaluateEligibility } from "@/lib/eligibility/evaluate";
import { buildEligibilityInput } from "@/lib/eligibility/input";
import { toEligibilitySnapshot } from "@/lib/eligibility/snapshot";
import { getSubmissionBlockers } from "@/lib/review/readiness";
import { buildReviewSections } from "@/lib/review/sections";
import { applicationSubmitter } from "@/lib/services";

type Phase = "idle" | "submitting" | "error";

export function ReviewStep() {
  const router = useRouter();
  const { draft, updateDraft } = useReadyDraft();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const sections = buildReviewSections(draft);
  const blockers = getSubmissionBlockers(draft);
  const input = buildEligibilityInput(draft);
  const eligibility = input ? evaluateEligibility(input) : null;

  const canSubmit = blockers.length === 0 && eligibility !== null && draft.submission === undefined;
  const submitting = phase === "submitting";

  async function handleSubmit() {
    if (submittingRef.current || !canSubmit || !input || !eligibility) return;
    submittingRef.current = true;
    setPhase("submitting");
    setError(null);

    const outcome = await applicationSubmitter.submit({
      applicationId: draft.id,
      reference: draft.reference,
      loanType: draft.loanType,
      requestedAmount: input.requestedAmount,
      termMonths: input.termMonths,
      // Test hook for the failure path: an email starting with "fail-submit" makes the mock API fail.
      simulateFailure: draft.applicant?.email.toLowerCase().startsWith("fail-submit") || undefined,
    });

    if (outcome.status === "error") {
      submittingRef.current = false;
      setPhase("error");
      setError(outcome.message);
      return;
    }

    await updateDraft({
      submission: {
        reference: outcome.reference,
        submittedAt: outcome.receivedAt,
        status: "received",
        loanType: draft.loanType,
        requestedAmount: input.requestedAmount,
        termMonths: input.termMonths,
        eligibility: toEligibilitySnapshot(eligibility),
      },
      completedSteps: withCompletedStep(draft.completedSteps, "review"),
    });
    router.push(`/apply/${draft.id}/submitted`);
  }

  return (
    <div>
      {blockers.length > 0 && (
        <section aria-labelledby="blockers-title" className="mb-8 rounded-lg border border-amber-300 bg-amber-50 p-5">
          <h2 id="blockers-title" className="font-semibold text-amber-950">
            Finish these steps before you submit
          </h2>
          <ul className="mt-3 space-y-3 text-sm text-amber-950">
            {blockers.map((blocker) => (
              <li key={blocker.slug}>
                <Link href={getStepPath(draft.id, blocker.slug)} className="font-medium underline">
                  {blocker.label}
                </Link>
                <ul className="mt-1 list-disc pl-5">
                  {blocker.issues.slice(0, 3).map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}

      <PreApprovalSummary />

      <h2 className="mt-10 text-lg font-semibold text-navy-900">Your details</h2>
      <p className="mt-1 text-sm text-slate-600">Check everything below. Use Edit to change a section.</p>

      <div className="mt-4 space-y-4">
        {sections.map((section) => (
          <section key={section.slug} aria-labelledby={`review-${section.slug}`} className="rounded-lg border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <h3 id={`review-${section.slug}`} className="font-semibold text-navy-900">
                {section.title}
              </h3>
              <Link
                href={getStepPath(draft.id, section.slug)}
                className="text-sm font-medium text-accent-700 underline"
              >
                Edit<span className="sr-only"> {section.title}</span>
              </Link>
            </div>
            <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[minmax(0,14rem)_1fr]">
              {section.rows.map((row) => (
                <div key={row.label} className="contents">
                  <dt className="text-slate-600">{row.label}</dt>
                  <dd className="break-words font-medium text-navy-900">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-line bg-surface p-5 text-sm text-slate-700">
        <p>
          This is a demo. Submitting sends only your reference, loan type, amount and term to a mock endpoint
          inside this app. Nothing is sent to a real lender.
        </p>
        {eligibility?.decision === "not-eligible" && (
          <p className="mt-2 font-medium">
            Your indicative result is &ldquo;not eligible&rdquo;. You can still submit, or go back and adjust your
            details first.
          </p>
        )}
      </div>

      <div aria-live="polite" className="mt-4 text-sm">
        {submitting && <p className="text-slate-700">Submitting your application. Please don&apos;t close this page.</p>}
        {error && (
          <p role="alert" className="flex items-start gap-2 font-medium text-red-700">
            <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}
      </div>

      <StepActions
        back={
          <ButtonLink href={getStepPath(draft.id, "signature")} variant="secondary">
            Back
          </ButtonLink>
        }
      >
        <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
          {submitting ? "Submitting…" : phase === "error" ? "Try again" : "Submit application"}
        </Button>
      </StepActions>
    </div>
  );
}