"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { SimulationNotice } from "@/components/ui/SimulationNotice";
import { useReadyDraft } from "@/components/wizard/DraftProvider";
import { getLoanProduct } from "@/config/loans";
import { steps, getStepPath } from "@/config/steps";
import { buildEligibilityInput } from "@/lib/eligibility/input";
import { evaluateEligibility } from "@/lib/eligibility/evaluate";
import type { Decision, RuleOutcome } from "@/lib/eligibility/types";
import { formatCurrency as formatMoney } from "@/lib/format/currency";
import { formatPercent } from "@/lib/format/percent";
import { formatTerm } from "@/lib/format/term";

const decisionCopy: Record<Decision, { title: string; body: string; style: string }> = {
  eligible: {
    title: "Likely to be eligible (indicative)",
    body: "On the details you gave, your application meets all of our demo rules.",
    style: "border-emerald-300 bg-emerald-50 text-emerald-900",
  },
  review: {
    title: "Needs a manual review (indicative)",
    body: "Some details fall in a grey area. A real lender's adviser would look at your case.",
    style: "border-amber-300 bg-amber-50 text-amber-900",
  },
  "not-eligible": {
    title: "Not eligible on these details (indicative)",
    body: "One or more demo rules are not met. The table below shows which, and what could help.",
    style: "border-red-300 bg-red-50 text-red-900",
  },
};

const outcomeCopy: Record<RuleOutcome, { label: string; Icon: typeof CheckCircle2; colour: string }> = {
  pass: { label: "Met", Icon: CheckCircle2, colour: "text-emerald-700" },
  refer: { label: "Needs review", Icon: AlertTriangle, colour: "text-amber-700" },
  fail: { label: "Not met", Icon: XCircle, colour: "text-red-700" },
};

export function PreApprovalSummary() {
  const { draft } = useReadyDraft();
  const formatCurrency = (amount: number) => formatMoney(amount, draft.country);

  const input = buildEligibilityInput(draft);
  const result = input ? evaluateEligibility(input) : null;
  const product = getLoanProduct(draft.loanType, draft.country)

  if (!input || !result) {
    const nextStep = steps.find((step) => step.slug !== "review" && !draft.completedSteps.includes(step.slug));
    return (
      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="font-semibold text-navy-900">Pre-approval summary</h2>
        <p className="mt-2 text-sm text-slate-700">
          Complete the earlier steps to see your indicative pre-approval summary.
        </p>
        {nextStep && (
          <Link
            href={getStepPath(draft.id, nextStep.slug)}
            className="mt-3 inline-block text-sm font-medium text-accent-700 underline"
          >
            Continue with {nextStep.label}
          </Link>
        )}
      </section>
    );
  }

  const copy = decisionCopy[result.decision];
  const reducedAmountHelps =
    result.decision !== "eligible" && result.maxAmount !== null && result.maxAmount < input.requestedAmount;

  return (
    <section aria-labelledby="preapproval-title">
      <SimulationNotice>
        <p className="font-medium">Indicative only. This is not a loan offer or a credit decision.</p>
        <p className="mt-1">
          This summary uses simplified demo rules and illustrative rates. A real lender would verify your
          details and documents before making any decision.
        </p>
      </SimulationNotice>

      <h2 id="preapproval-title" className="mt-6 text-lg font-semibold text-navy-900">
        Pre-approval summary
      </h2>

      <div role="status" className={`mt-3 rounded-lg border p-5 ${copy.style}`}>
        <p className="text-lg font-semibold">{copy.title}</p>
        <p className="mt-1 text-sm">{copy.body}</p>
      </div>

      <dl className="mt-6 grid gap-4 rounded-lg border border-line bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-sm text-slate-600">Amount requested</dt>
          <dd className="font-semibold text-navy-900">{formatCurrency(input.requestedAmount)}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-600">Term</dt>
          <dd className="font-semibold text-navy-900">{formatTerm(input.termMonths)}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-600">Illustrative rate</dt>
          <dd className="font-semibold text-navy-900">{result.annualRatePercent}% a year</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-600">Estimated monthly payment</dt>
          <dd className="font-semibold text-navy-900">{formatCurrency(Math.round(result.monthlyPayment))}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-600">Total interest</dt>
          <dd className="font-semibold text-navy-900">{formatCurrency(Math.round(result.totalInterest))}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-600">Total payable</dt>
          <dd className="font-semibold text-navy-900">{formatCurrency(Math.round(result.totalPayable))}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-600">Income committed to repayments</dt>
          <dd className="font-semibold text-navy-900">{formatPercent(result.foir)}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-600">Left each month</dt>
          <dd className="font-semibold text-navy-900">{formatCurrency(Math.round(result.disposableIncome))}</dd>
        </div>
      </dl>

      {reducedAmountHelps && result.maxAmount !== null && (
        <p className="mt-4 rounded-md bg-surface p-4 text-sm text-slate-800">
          On your income and commitments, a smaller {product.name.toLowerCase()} of up to{" "}
          <strong>{formatCurrency(result.maxAmount)}</strong> over {formatTerm(input.termMonths)} would meet the
          amount-related rules. You can change the amount on the Loan details step.
        </p>
      )}

      <h3 className="mt-8 font-semibold text-navy-900">How we reached this</h3>
      <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-white">
        {result.rules.map((rule) => {
          const { label, Icon, colour } = outcomeCopy[rule.outcome];
          return (
            <li key={rule.id} className="grid gap-1 p-4 sm:grid-cols-[1fr_auto] sm:gap-4">
              <div>
                <p className="font-medium text-navy-900">{rule.label}</p>
                <p className="text-sm text-slate-600">
                  You: {rule.yourValue}. Requirement: {rule.requirement}.
                </p>
                {rule.outcome !== "pass" && rule.hint && (
                  <p className="mt-1 text-sm text-slate-700">What could help: {rule.hint}</p>
                )}
              </div>
              <p className={`flex items-center gap-1.5 text-sm font-semibold ${colour}`}>
                <Icon aria-hidden className="h-4 w-4" />
                {label}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}