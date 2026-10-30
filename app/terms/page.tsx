import type { Metadata } from "next";
import { LegalSection } from "@/components/legal/LegalSection";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <PageShell
      crumbs={[{ label: "Home", href: "/" }, { label: "Terms of use" }]}
      title="Terms of use"
      intro="Last updated 30 October 2026."
    >
      <LegalSection title="This is a demonstration">
        <p>
          GetFinance is a fictional product built to demonstrate a loan application experience. No loan is
          offered, and nothing you do here creates a contract or a legal obligation.
        </p>
      </LegalSection>

      <LegalSection title="Illustrative information">
        <p>
          Amounts, terms, interest rates and eligibility results are illustrative. They are not offers, quotes,
          credit decisions or financial advice.
        </p>
      </LegalSection>

      <LegalSection title="Please use sample data">
        <p>
          Do not enter real personal, identity or financial information, and do not upload real documents. Use
          invented details and sample files.
        </p>
      </LegalSection>

      <LegalSection title="No warranty">
        <p>
          The demo is provided as it is, without any promise that it is accurate, complete or always available.
        </p>
      </LegalSection>
    </PageShell>
  );
}