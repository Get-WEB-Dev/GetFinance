"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDraft } from "./DraftProvider";

export function SubmissionLock({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { draft } = useDraft();

  const target = `/apply/${applicationId}/submitted`;
  const locked = Boolean(draft?.submission) && pathname !== target;

  useEffect(() => {
    if (locked) router.replace(target);
  }, [locked, router, target]);

  return null;
}