import type { Metadata } from "next";
import { LoanIcon } from "@/components/loans/LoanIcon";
import { PageShell } from "@/components/layout/PageShell";
import { ButtonLink } from "@/components/ui/Button";
import { SimulationNotice } from "@/components/ui/SimulationNotice";
import { eligibilityPolicies } from "@/config/eligibility";
import { requiredDocumentsByLoanType } from "@/config/documents";
import { getLoanProduct, loanProducts, type LoanType } from "@/config/loans";
import { employmentStatusOptions } from "@/config/options";
import { allowedEmploymentStatuses } from "@/config/rules";
import { formatCurrency } from "@/lib/format/currency";
import { formatPercent } from "@/lib/format/percent";
import { formatTerm } from "@/lib/format/term";

export const metadata: Metadata = {
  title: "Compare loans",
  description: "Compare GetFinance personal, home and business loans side by side.",
};

const statusLabel = (value: string) =>
  employmentStatusOptions.find((option) => option.value === value)?.label ?? value;

const rows: { label: string; value: (type: LoanType) => string }[] = [
  {
    label: "Illustrative amount",
    value: (type) => {
      const product = getLoanProduct(type);
      return `${formatCurrency(product.minAmount)} to ${formatCurrency(product.maxAmount)}`;
    },
  },
  {
    label: "Illustrative term",
    value: (type) => {
      const product = getLoanProduct(type);
      return `${formatTerm(product.minMonths)} to ${formatTerm(product.maxMonths)}`;
    },
  },
  { label: "Illustrative rate", value: (type) => `${getLoanProduct(type).illustrativeRate}% a year` },
  {
    label: "Who can apply",
    value: (type) => allowedEmploymentStatuses[type].map(statusLabel).join(", "),
  },
  {
    label: "Minimum monthly income",
    value: (type) => formatCurrency(eligibilityPolicies[type].minMonthlyIncome),
  },
  {
    label: "Most of your income that can go to repayments",
    value: (type) => formatPercent(eligibilityPolicies[type].maxFoir),
  },
  {
    label: "Most you can borrow compared with property value",
    value: (type) => {
      const limit = eligibilityPolicies[type].maxLtv;
      return limit === undefined ? "Not applicable" : formatPercent(limit);
    },
  },
  {
    label: "Minimum years the business has operated",
    value: (type) => {
      const years = eligibilityPolicies[type].minYearsOperating;
      return years === undefined ? "Not applicable" : `${years} years`;
    },
  },
  {
    label: "Documents to upload",
    value: (type) => `${requiredDocumentsByLoanType[type].length} documents`,
  },
];

export default function LoansPage() {
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
              {loanProducts.map((product) => (
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
                {loanProducts.map((product) => (
                  <td key={product.type} className="p-4 text-navy-900">
                    {row.value(product.type)}
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