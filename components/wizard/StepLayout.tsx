"use client";

import { useEffect, useRef } from "react";
import type { StepSlug } from "@/config/steps";
import { useDraft } from "./DraftProvider";

interface StepLayoutProps {
  slug: StepSlug;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function StepLayout({ slug, title, description, children }: StepLayoutProps) {
  const { updateDraft } = useDraft();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [slug]);

  useEffect(() => {
    void updateDraft({ currentStep: slug });
  }, [slug, updateDraft]);

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