import Link from "next/link";
import { Check } from "lucide-react";
import { getStepPath, steps, type StepSlug } from "@/config/steps";

interface ProgressIndicatorProps {
  applicationId: string;
  currentSlug: StepSlug | null;
}

export function ProgressIndicator({ applicationId, currentSlug }: ProgressIndicatorProps) {
  const total = steps.length;
  const currentIndex = steps.findIndex((s) => s.slug === currentSlug);
  const percent = currentIndex < 0 ? 0 : Math.round(((currentIndex + 1) / total) * 100);

  return (
    <nav aria-label="Application progress">
      {/* Compact version for small screens */}
      <div className="lg:hidden">
        {currentIndex >= 0 && (
          <>
            <p className="text-sm font-medium text-navy-900">
              Step {currentIndex + 1} of {total}: {steps[currentIndex].label}
            </p>
            <div
              role="progressbar"
              aria-label="Application progress"
              aria-valuemin={1}
              aria-valuemax={total}
              aria-valuenow={currentIndex + 1}
              className="mt-2 h-2 rounded-full bg-slate-200"
            >
              <div className="h-2 rounded-full bg-accent-600" style={{ width: `${percent}%` }} />
            </div>
          </>
        )}
      </div>

      {/* Full step list for large screens */}
      <ol className="hidden space-y-1 lg:block">
        {steps.map((step, index) => {
          const state =
            index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming";

          const marker = (
            <span
              className={
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold " +
                (state === "complete"
                  ? "bg-navy-900 text-white"
                  : state === "current"
                    ? "bg-accent-600 text-navy-950"
                    : "border border-slate-300 text-slate-500")
              }
            >
              {state === "complete" ? <Check aria-hidden className="h-4 w-4" /> : index + 1}
            </span>
          );

          const statusText =
            state === "complete" ? " (completed)" : state === "current" ? " (current step)" : " (not started)";

          const content = (
            <>
              {marker}
              <span className={state === "current" ? "font-semibold text-navy-900" : "text-slate-700"}>
                {step.label}
                <span className="sr-only">{statusText}</span>
              </span>
            </>
          );

          const rowClass = "flex items-center gap-3 rounded-md px-2 py-2 text-sm";
          const isLink = state === "complete" && index > 0;

          return (
            <li key={step.slug}>
              {isLink ? (
                <Link
                  href={getStepPath(applicationId, step.slug)}
                  className={`${rowClass} hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent-600`}
                >
                  {content}
                </Link>
              ) : (
                <div aria-current={state === "current" ? "step" : undefined} className={rowClass}>
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}