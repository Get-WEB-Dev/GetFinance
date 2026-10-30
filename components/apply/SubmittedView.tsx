"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SimulationNotice } from "@/components/ui/SimulationNotice";
import { useReadyDraft } from "@/components/wizard/DraftProvider";
import { getLoanProduct } from "@/config/loans";
import { getStepPath } from "@/config/steps";
import { formatCurrency } from "@/lib/format/currency";
import { formatDateTime } from "@/lib/format/date";
import { formatTerm } from "@/lib/format/term";

const decisionLabel = {
  eligible: "Likely to be eligible (indicative)",
  review: "Needs a manual review (indicative)",
  "not-eligible": "Not eligible on these details (indicative)",
} as const;

const outcomeLabel = { pass: "Met", refer: "Needs review", fail: "Not met" } as const;

export function SubmittedView() {
  const { draft } = useReadyDraft();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const submission = draft.submission;

  if (!submission) {
    return (
      <div>
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold text-navy-900 focus:outline-none">
          Not submitted yet
        </h1>
        <p className="mt-2 text-slate-600">This application hasn&apos;t been submitted.</p>
        <div className="mt-6">
          <ButtonLink href={getStepPath(draft.id, "review")}>Go to review</ButtonLink>
        </div>
      </div>
    );
  }

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(submission!.reference);
      setCopied("copied");
    } catch {
      setCopied("failed");
    }
  }

  const { eligibility } = submission;

  return (
    <div>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="flex items-center gap-2 text-2xl font-semibold text-navy-900 focus:outline-none"
      >
        <CheckCircle2 aria-hidden className="h-7 w-7 text-emerald-700" />
        Application received
      </h1>

      <div className="mt-4">
        <SimulationNotice>
          <p className="font-medium">This is a demonstration. No real application has been made.</p>
          <p className="mt-1">
            No lender received anything. The reference below only identifies this demo application in your browser.
          </p>
        </SimulationNotice>
      </div>

      <div className="mt-6 rounded-lg border border-line bg-white p-5">
        <p className="text-sm text-slate-600">Your reference number</p>
        <p className="mt-1 font-mono text-2xl font-semibold tracking-wide text-navy-900">{submission.reference}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={copyReference}>
            Copy reference
          </Button>
          <span aria-live="polite" className="text-sm text-slate-600">
            {copied === "copied" && "Copied."}
            {copied === "failed" && "Couldn't copy. Please select and copy it manually."}
          </span>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 rounded-lg border border-line bg-white p-5 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-slate-600">Submitted</dt>
          <dd className="font-semibold text-navy-900">{formatDateTime(submission.submittedAt)}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-600">Loan</dt>
          <dd className="font-semibold text-navy-900">{getLoanProduct(draft.loanType).name}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-600">Amount requested</dt>
          <dd className="font-semibold text-navy-900">{formatCurrency(submission.requestedAmount)}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-600">Term</dt>
          <dd className="font-semibold text-navy-900">{formatTerm(submission.termMonths)}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-600">Estimated monthly payment</dt>
          <dd className="font-semibold text-navy-900">{formatCurrency(Math.round(eligibility.monthlyPayment))}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-600">Indicative result at submission</dt>
          <dd className="font-semibold text-navy-900">{decisionLabel[eligibility.decision]}</dd>
        </div>
      </dl>

      <h2 className="mt-8 font-semibold text-navy-900">How that result was reached</h2>
      <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-white text-sm">
        {eligibility.rules.map((rule) => (
          <li key={rule.id} className="flex flex-wrap items-start justify-between gap-2 p-4">
            <div>
              <p className="font-medium text-navy-900">{rule.label}</p>
              <p className="text-slate-600">
                You: {rule.yourValue}. Requirement: {rule.requirement}.
              </p>
            </div>
            <p className="font-semibold text-slate-800">{outcomeLabel[rule.outcome]}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 font-semibold text-navy-900">What would happen next</h2>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-700">
        <li>A real lender would verify your identity and documents with trusted sources.</li>
        <li>They would run a credit check and assess your affordability.</li>
        <li>You would receive a decision and, if approved, a formal offer to accept or decline.</li>
      </ol>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => window.print()}>
          Print this page
        </Button>
        <ButtonLink href="/">Back to home</ButtonLink>
      </div>
    </div>
  );
}