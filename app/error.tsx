"use client";

import { useEffect } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageShell title="Something went wrong" intro="An unexpected error occurred. Your saved progress is safe.">
      <div role="alert" className="mb-6 text-sm text-slate-600">
        {error.digest ? <p>Error reference: {error.digest}</p> : null}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Back to home
        </ButtonLink>
      </div>
    </PageShell>
  );
}