import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LoanProduct } from "@/config/loans";
import { formatCurrency } from "@/lib/format/currency";
import { formatTerm } from "@/lib/format/term";

export function LoanCard({ product }: { product: LoanProduct }) {
  const Icon = product.icon;

  return (
    <article className="flex flex-col rounded-lg border border-line bg-white p-6 transition-shadow hover:shadow-md">
      <span className="flex h-11 w-11 items-center justify-center rounded-md bg-navy-900">
        <Icon aria-hidden className="h-6 w-6 text-accent-400" />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-navy-900">{product.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{product.summary}</p>

      <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Illustrative amount</dt>
          <dd className="text-right font-medium text-navy-900">
            {formatCurrency(product.minAmount)} – {formatCurrency(product.maxAmount)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Illustrative term</dt>
          <dd className="text-right font-medium text-navy-900">
            {formatTerm(product.minMonths)} – {formatTerm(product.maxMonths)}
          </dd>
        </div>
      </dl>

      <Link
        href={`/loans/${product.type}`}
        className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-accent-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
      >
        View details <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
    </article>
  );
}