import { PageShell } from "@/components/layout/PageShell";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <PageShell title="Page not found" intro="We couldn't find the page you were looking for.">
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/">Back to home</ButtonLink>
        <ButtonLink href="/loans" variant="secondary">
          View loans
        </ButtonLink>
        <ButtonLink href="/resume" variant="secondary">
          Resume an application
        </ButtonLink>
      </div>
    </PageShell>
  );
}