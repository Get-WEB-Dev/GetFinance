import type { Metadata } from "next";
import { LoanIcon } from "@/components/loans/LoanIcon";
import { PageShell } from "@/components/layout/PageShell";
import { ButtonLink } from "@/components/ui/Button";
import { SimulationNotice } from "@/components/ui/SimulationNotice";
import type { CountryCode } from "@/config/countries";
import { getEligibilityPolicy } from "@/config/eligibility";
import { requiredDocumentsByLoanType } from "@/config/documents";
import { getLoanProduct, getLoanProducts, type LoanType } from "@/config/loans";
import { employmentStatusOptions } from "@/config/options";
import { allowedEmploymentStatuses } from "@/config/rules";
import { getCurrentCountry } from "@/lib/country/server";
import { formatCurrency } from "@/lib/format/currency";
import { formatPercent } from "@/lib/format/percent";
import { formatTerm } from "@/lib/format/term";

export const metadata: Metadata = {
  title: "Compare loans",
  description: "Compare GetFinance personal, home and business loans side by side.",
};

const statusLabel = (value: string) =>
  employmentStatusOptions.find((option) => option.value === value)?.label ?? value;

const rows: { label: string; value: (type: LoanType, country: CountryCode) => string }[] = [
  {
    label: "Illustrative amount",
    value: (type, country) => {
      const product = getLoanProduct(type, country);
      return `${formatCurrency(product.minAmount, country)} to ${formatCurrency(product.maxAmount, country)}`;
    },
  },
  {
    label: "Illustrative term",
    value: (type, country) => {
      const product = getLoanProduct(type, country);
      return `${formatTerm(product.minMonths)} to ${formatTerm(product.maxMonths)}`;
    },
  },
  {
    label: "Illustrative rate",
    value: (type, country) => `${getLoanProduct(type, country).illustrativeRate}% a year`,
  },
  {
    label: "Who can apply",
    value: (type) => allowedEmploymentStatuses[type].map(statusLabel).join(", "),
  },
  {
    label: "Minimum monthly income",
    value: (type, country) => formatCurrency(getEligibilityPolicy(type, country).minMonthlyIncome, country),
  },
  {
    label: "Most of your income that can go to repayments",
    value: (type, country) => formatPercent(getEligibilityPolicy(type, country).maxFoir, country),
  },
  {
    label: "Most you can borrow compared with property value",
    value: (type, country) => {
      const limit = getEligibilityPolicy(type, country).maxLtv;
      return limit === undefined ? "Not applicable" : formatPercent(limit, country);
    },
  },
  {
    label: "Minimum years the business has operated",
    value: (type, country) => {
      const years = getEligibilityPolicy(type, country).minYearsOperating;
      return years === undefined ? "Not applicable" : `${years} years`;
    },
  },
  {
    label: "Documents to upload",
    value: (type) => `${requiredDocumentsByLoanType[type].length} documents`,
  },
];

export default async function LoansPage() {
  const country = await getCurrentCountry();
  const products = getLoanProducts(country);

  return (
    <PageShell
      wide
      crumbs={[{ label: "Home", href: "/" }, { label: "Loans" }]}
      title="Compare loans"
      intro="See how our three loans differ. Choose one to read the details or start an application."
    >
      <SimulationNotice>
        <p>
          Amounts, terms, rates and eligibility limits on this page are illustrative demo values, not real
          lending terms.
        </p>
      </SimulationNotice>

      <div
        role="region"
        aria-label="Loan comparison table"
        tabIndex={0}
        className="mt-8 overflow-x-auto rounded-lg border border-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
      >
        <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
          <caption className="sr-only">Comparison of personal, home and business loans</caption>
          <thead>
            <tr className="bg-surface">
              <td className="p-4">
                <span className="sr-only">Feature</span>
              </td>
              {products.map((product) => (
                <th key={product.type} scope="col" className="p-4 align-bottom">
                  <LoanIcon product={product} />
                  <p className="mt-2 text-base font-semibold text-navy-900">{product.name}</p>
                  <div className="mt-3 flex flex-wrap gap-2 font-normal">
                    <ButtonLink href={`/loans/${product.type}`} variant="secondary">
                      Details
                    </ButtonLink>
                    <ButtonLink href={`/apply?type=${product.type}`}>Apply</ButtonLink>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-line">
                <th scope="row" className="w-1/4 p-4 font-medium text-slate-600">
                  {row.label}
                </th>
                {products.map((product) => (
                  <td key={product.type} className="p-4 text-navy-900">
                    {row.value(product.type, country)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}