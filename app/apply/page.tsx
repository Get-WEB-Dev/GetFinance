import type { Metadata } from "next";
import Link from "next/link";
import { isLoanType } from "@/config/loans";
import { steps } from "@/config/steps";
import { LoanSelectionForm } from "@/components/apply/LoanSelectionForm";
import { getCurrentCountry } from "@/lib/country/server";

export const metadata: Metadata = {
  title: "Start your application",
};

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const country = await getCurrentCountry();
  const initialType = type && isLoanType(type) ? type : undefined;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link href="/" className="hover:text-navy-900">Home</Link>
        <span aria-hidden> / </span>
        <span>Apply</span>
      </nav>

      <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-accent-700">
        Step 1 of {steps.length}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy-900">
        Start your application
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        No account needed. Your progress is saved in this browser as you go, so you can leave and
        come back. This is a demonstration, so please don&apos;t enter real personal details.
      </p>

      <div className="mt-10">
       <LoanSelectionForm key={country} initialType={initialType} initialCountry={country} />
      </div>

      <p className="mt-10 text-sm text-slate-600">
        Already started?{" "}
        <Link href="/resume" className="font-medium text-accent-700 underline">
          Resume your application
        </Link>
      </p>
    </div>
  );
}