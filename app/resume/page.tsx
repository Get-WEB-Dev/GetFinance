import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { ResumeForm } from "@/components/resume/ResumeForm";
import { SimulationNotice } from "@/components/ui/SimulationNotice";

export const metadata: Metadata = {
  title: "Resume your application",
  robots: { index: false, follow: false },
};

export default function ResumePage() {
  return (
    <PageShell
      crumbs={[{ label: "Home", href: "/" }, { label: "Resume" }]}
      title="Resume your application"
      intro="Enter your reference number to carry on where you left off."
    >
      <div className="mb-8">
        <SimulationNotice>
          <p className="font-medium">Applications are saved only in this browser.</p>
          <p className="mt-1">
            You can resume on the same browser and device you started on. If you cleared your browser data or
            switched device, your application won&apos;t be here.
          </p>
        </SimulationNotice>
      </div>

      <ResumeForm />

      <p className="mt-10 text-sm text-slate-600">
        Nothing to resume?{" "}
        <Link href="/apply" className="font-medium text-accent-700 underline">
          Start a new application
        </Link>
      </p>
    </PageShell>
  );
}