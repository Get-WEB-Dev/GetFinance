import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LoanIcon } from "@/components/loans/LoanIcon";
import { PageShell } from "@/components/layout/PageShell";
import { ButtonLink } from "@/components/ui/Button";
import { SimulationNotice } from "@/components/ui/SimulationNotice";
import { documentCatalog, requiredDocumentsByLoanType } from "@/config/documents";
import { eligibilityPolicies } from "@/config/eligibility";
import { loanContent } from "@/config/loan-content";
import { getLoanProduct, isLoanType, loanProducts } from "@/config/loans";
import { employmentStatusOptions } from "@/config/options";
import { allowedEmploymentStatuses, applicantRules } from "@/config/rules";
import { formatCurrency } from "@/lib/format/currency";
import { formatTerm } from "@/lib/format/term";
import { getRepaymentExample } from "@/lib/loans/example";

export function generateStaticParams() {
  return loanProducts.map((product) => ({ type: product.type }));
}

interface LoanDetailPageProps {
  params: Promise<{ type: string }>;
}

export async function generateMetadata({ params }: LoanDetailPageProps): Promise<Metadata> {
  const { type } = await params;
  if (!isLoanType(type)) return {};
  const product = getLoanProduct(type);
  return { title: product.name, description: product.summary };
}

const statusLabel = (value: string) =>
  employmentStatusOptions.find((option) => option.value === value)?.label ?? value;

export default async function LoanDetailPage({ params }: LoanDetailPageProps) {
  const { type } = await params;
  if (!isLoanType(type)) notFound();

  const product = getLoanProduct(type);
  const content = loanContent[type];
  const policy = eligibilityPolicies[type];
  const example = getRepaymentExample(product);
  const others = loanProducts.filter((item) => item.type !== type);

  return (
    <PageShell
      crumbs={[{ label: "Home", href: "/" }, { label: "Loans", href: "/loans" }, { label: product.name }]}
      title={product.name}
      intro={content.headline}
    >
      <div className="flex flex-wrap items-center gap-4">
        <LoanIcon product={product} />
        <ButtonLink href={`/apply?type=${type}`}>Start a {product.name.toLowerCase()} application</ButtonLink>
      </div>

      <section aria-labelledby="facts" className="mt-10">
        <h2 id="facts" className="text-lg font-semibold text-navy-900">
          Key facts
        </h2>
        <dl className="mt-4 grid gap-4 rounded-lg border border-line bg-white p-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-600">Illustrative amount</dt>
            <dd className="font-semibold text-navy-900">
              {formatCurrency(product.minAmount)} to {formatCurrency(product.maxAmount)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-600">Illustrative term</dt>
            <dd className="font-semibold text-navy-900">
              {formatTerm(product.minMonths)} to {formatTerm(product.maxMonths)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-600">Illustrative rate</dt>
            <dd className="font-semibold text-navy-900">{product.illustrativeRate}% a year</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-600">Minimum monthly income</dt>
            <dd className="font-semibold text-navy-900">{formatCurrency(policy.minMonthlyIncome)}</dd>
          </div>
        </dl>
      </section>

      {example && (
        <section aria-labelledby="example" className="mt-10">
          <h2 id="example" className="text-lg font-semibold text-navy-900">
            Example repayment
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            A {formatCurrency(example.amount)} loan over {formatTerm(example.months)} at{" "}
            {example.annualRatePercent}% a year would cost about:
          </p>
          <dl className="mt-4 grid gap-4 rounded-lg border border-line bg-surface p-5 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-slate-600">Monthly payment</dt>
              <dd className="font-semibold text-navy-900">{formatCurrency(Math.round(example.estimate.monthlyPayment))}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-600">Total interest</dt>
              <dd className="font-semibold text-navy-900">{formatCurrency(Math.round(example.estimate.totalInterest))}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-600">Total payable</dt>
              <dd className="font-semibold text-navy-900">{formatCurrency(Math.round(example.estimate.totalPayable))}</dd>
            </div>
          </dl>
          <div className="mt-4">
            <SimulationNotice>
              <p>This example uses an illustrative demo rate. It is not an offer or a quote.</p>
            </SimulationNotice>
          </div>
        </section>
      )}

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section aria-labelledby="suitable">
          <h2 id="suitable" className="text-lg font-semibold text-navy-900">
            Who it&apos;s for
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
            {content.suitableFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="features">
          <h2 id="features" className="text-lg font-semibold text-navy-900">
            Features
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
            {content.features.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="eligibility" className="mt-10">
        <h2 id="eligibility" className="text-lg font-semibold text-navy-900">
          Who can apply
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
          <li>
            Aged {applicantRules.minAge} to {applicantRules.maxAge}, and no older than {policy.maxAgeAtMaturity} when
            the loan ends
          </li>
          <li>Employment status: {allowedEmploymentStatuses[type].map(statusLabel).join(", ")}</li>
          <li>Monthly income of at least {formatCurrency(policy.minMonthlyIncome)}</li>
        </ul>
      </section>

      <section aria-labelledby="documents" className="mt-10">
        <h2 id="documents" className="text-lg font-semibold text-navy-900">
          Documents you&apos;ll need
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
          {requiredDocumentsByLoanType[type].map((id) => (
            <li key={id}>{documentCatalog[id].label}</li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-slate-600">PDF, JPG or PNG. In this demo, please use sample files only.</p>
      </section>

      <section aria-labelledby="others" className="mt-12 border-t border-line pt-8">
        <h2 id="others" className="text-lg font-semibold text-navy-900">
          Other loans
        </h2>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {others.map((item) => (
            <li key={item.type}>
              <Link href={`/loans/${item.type}`} className="font-medium text-accent-700 underline">
                {item.name}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/loans" className="font-medium text-accent-700 underline">
              Compare all loans
            </Link>
          </li>
        </ul>
      </section>
    </PageShell>
  );
}