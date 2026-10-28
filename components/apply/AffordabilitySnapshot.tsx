import { getLoanProduct } from "@/config/loans";
import { calculateAffordability } from "@/lib/calculations/affordability";
import { calculateRepayment } from "@/lib/calculations/repayment";
import { getMonthlyIncome, getRequestedLoan } from "@/lib/draft/selectors";
import { formatCurrency } from "@/lib/format/currency";
import { formatPercent } from "@/lib/format/percent";
import { parseAmount } from "@/lib/validation/helpers";
import type { ApplicationDraft } from "@/types/application";

interface AffordabilitySnapshotProps {
  draft: ApplicationDraft;
  monthlyExpenses: string;
  existingEmi: string;
}

export function AffordabilitySnapshot({ draft, monthlyExpenses, existingEmi }: AffordabilitySnapshotProps) {
  const product = getLoanProduct(draft.loanType);
  const income = getMonthlyIncome(draft);
  const loan = getRequestedLoan(draft);
  const expenses = parseAmount(monthlyExpenses);
  const existing = parseAmount(existingEmi === "" ? "0" : existingEmi);

  const repayment = loan ? calculateRepayment(loan.amount, product.illustrativeRate, loan.months) : null;

  const result =
    income !== null && expenses !== null && existing !== null && repayment
      ? calculateAffordability({
          monthlyIncome: income,
          monthlyExpenses: expenses,
          existingEmi: existing,
          newEmi: repayment.monthlyPayment,
        })
      : null;

  return (
    <section aria-labelledby="afford-title" className="mt-8 rounded-lg border border-line bg-surface p-5">
      <h2 id="afford-title" className="font-semibold text-navy-900">
        Monthly affordability snapshot
      </h2>

      <div aria-live="polite">
        {result && income !== null && expenses !== null && existing !== null && repayment ? (
          <>
            <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              <Row label="Monthly income" value={formatCurrency(income)} />
              <Row label="Living expenses" value={formatCurrency(expenses)} />
              <Row label="Existing loan payments" value={formatCurrency(existing)} />
              <Row label="Estimated new payment" value={formatCurrency(repayment.monthlyPayment)} />
              <Row label="Left over each month" value={formatCurrency(result.disposableIncome)} />
              <Row label="Income going to loan payments" value={formatPercent(result.foir)} />
            </dl>
            {result.disposableIncome < 0 && (
              <p className="mt-3 text-sm font-medium text-red-700">
                On these figures your expenses and payments would be higher than your income.
              </p>
            )}
          </>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            Complete your income, loan details and expenses to see this snapshot.
          </p>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Illustrative only. It is not a credit assessment or a lending decision.
      </p>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-1">
      <dt className="text-slate-600">{label}</dt>
      <dd className="font-medium text-navy-900">{value}</dd>
    </div>
  );
}