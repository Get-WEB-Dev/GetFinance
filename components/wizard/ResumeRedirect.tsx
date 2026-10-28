"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStepPath } from "@/config/steps";
import { useDraft } from "./DraftProvider";

export function ResumeRedirect({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const { draft } = useDraft();
  const target = draft ? getStepPath(applicationId, draft.currentStep) : null;

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  return (
    <p role="status" className="text-slate-600">
      Taking you back to where you left off…
    </p>
  );
}