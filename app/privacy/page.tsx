import type { Metadata } from "next";
import { LegalSection } from "@/components/legal/LegalSection";
import { PageShell } from "@/components/layout/PageShell";
import { SimulationNotice } from "@/components/ui/SimulationNotice";

export const metadata: Metadata = { title: "Privacy notice" };

export default function PrivacyPage() {
  return (
    <PageShell
      crumbs={[{ label: "Home", href: "/" }, { label: "Privacy notice" }]}
      title="Privacy notice"
      intro="Last updated 30 October 2026."
    >
      <SimulationNotice>
        <p>
          GetFinance is a demonstration. This notice explains what the demo does with data. It is not a legal
          document for a real service. Please use sample details only.
        </p>
      </SimulationNotice>

      <LegalSection title="What is saved, and where">
        <p>
          As you complete the application, your answers are saved in your own browser (local storage) so you can
          leave and come back. This storage is not encrypted and is not shared with other devices. Anyone using
          this browser profile could read it.
        </p>
        <p>
          Your identity numbers are never saved in full. Only a masked version and a simulated reference are
          kept. Your uploaded documents are not saved at all, only their file names and sizes.
        </p>
      </LegalSection>

      <LegalSection title="What leaves your browser">
        <p>
          The demo calls a few simulated endpoints inside this same application: identity verification (it
          receives the number you type), address suggestions (it receives what you type in the address box) and
          submission (it receives your reference, loan type, amount and term). They return made-up results and do
          not store anything.
        </p>
        <p>This demo does not use advertising or analytics, and does not share your data with anyone.</p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>
          You can remove an application at any time using &ldquo;Discard application&rdquo; inside it, or by
          clearing this site&apos;s data in your browser settings.
        </p>
      </LegalSection>

      <LegalSection title="If this were a real service">
        <p>
          A real lender would collect only what it needs, explain why, store it securely with access controls,
          keep it only as long as required, and give you ways to access, correct or delete your data.
        </p>
      </LegalSection>
    </PageShell>
  );
}