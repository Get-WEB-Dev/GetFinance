import { getLoanProduct, type LoanType } from "@/config/loans";
import { calculateRepayment } from "@/lib/calculations/repayment";
import { formatCurrency as formatMoney } from "@/lib/format/currency";
import { isWholeNumber, parseAmount } from "@/lib/validation/helpers";
import type { CountryCode } from "@/config/countries";

interface RepaymentEstimateCardProps {
  country: CountryCode;
  loanType: LoanType;
  amount: string;
  months: string;
}

export function RepaymentEstimateCard({ loanType, country, amount, months }: RepaymentEstimateCardProps) {
  const formatCurrency = (value: number) => formatMoney(value, country);
  const product = getLoanProduct(loanType, country);
  const principal = parseAmount(amount);
  const term = isWholeNumber(months, product.minMonths, product.maxMonths) ? Number(months) : null;

  const estimate =
    principal !== null && term !== null && principal >= product.minAmount && principal <= product.maxAmount
      ? calculateRepayment(principal, product.illustrativeRate, term)
      : null;

  return (
    <section aria-labelledby="estimate-title" className="mt-8 rounded-lg border border-line bg-surface p-5">
      <h2 id="estimate-title" className="font-semibold text-navy-900">
        Illustrative repayment estimate
      </h2>

      <div aria-live="polite">
        {estimate ? (
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-slate-500">Monthly payment</dt>
              <dd className="text-xl font-semibold text-navy-900">{formatCurrency(estimate.monthlyPayment)}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Total interest</dt>
              <dd className="text-xl font-semibold text-navy-900">{formatCurrency(estimate.totalInterest)}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Total payable</dt>
              <dd className="text-xl font-semibold text-navy-900">{formatCurrency(estimate.totalPayable)}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            Enter a valid amount and term to see an estimate.
          </p>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Based on a sample rate of {product.illustrativeRate}% a year. This is an illustration, not an offer or a
        binding quote.
      </p>
    </section>
  );
}