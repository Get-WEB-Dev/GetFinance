"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getStepPath, type StepSlug } from "@/config/steps";
import { canAccessStep, getFirstIncompleteStep } from "@/lib/draft/completion";
import { useDraft } from "./DraftProvider";
import { AlertCircle } from "lucide-react";

interface StepLayoutProps {
  slug: StepSlug;
  title: string;
  description?: string;
  guard?: boolean;
  children: React.ReactNode;
}

export function StepLayout({ slug, title, description, guard = true, children }: StepLayoutProps) {
  const router = useRouter();
  const { draft, updateDraft } = useDraft();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const allowed = !guard || !draft || canAccessStep(draft.completedSteps, slug);
  const redirectTo =
    draft && !allowed ? getStepPath(draft.id, getFirstIncompleteStep(draft.completedSteps)) : null;

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  useEffect(() => {
    if (!allowed) return;
    headingRef.current?.focus();
    void updateDraft({ currentStep: slug });
  }, [allowed, slug, updateDraft]);

  if (!allowed) {
    return (
      <p role="status" className="text-slate-600">
        Taking you to the next step you need to complete…
      </p>
    );
  }

  return (
    <section>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-semibold tracking-tight text-navy-900 focus:outline-none"
      >
        {title}
      </h1>
      {description && <p className="mt-2 max-w-2xl text-slate-600">{description}</p>}
            {draft?.stepsToReview.includes(slug) && (
        <div
          role="status"
          className="mt-4 flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <strong>Please review this step.</strong> Something you entered earlier no longer fits
            your current answers, such as a changed loan type. Check the highlighted fields and save
            again.
          </p>
        </div>
      )}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export function StepActions({
  back,
  children,
}: {
  back?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
      <div>{back}</div>
      <div>{children}</div>
    </div>
  );
}