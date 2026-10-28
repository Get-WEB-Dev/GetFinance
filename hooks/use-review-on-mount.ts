"use client";

import { useEffect, useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { useReadyDraft } from "@/components/wizard/DraftProvider";
import type { StepSlug } from "@/config/steps";

export function useReviewOnMount<T extends FieldValues>(form: UseFormReturn<T>, slug: StepSlug) {
  const { draft } = useReadyDraft();
  const [needsReview] = useState(() => draft.stepsToReview.includes(slug));
  const { trigger } = form;

  useEffect(() => {
    if (needsReview) void trigger();
  }, [needsReview, trigger]);
}