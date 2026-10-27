import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LoanProduct } from "@/config/loans";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function LoanCard({ product }: { product: LoanProduct }) {
  const Icon = product.icon;

  return (
    <article className="flex flex-col rounded-lg border border-line bg-white p-6">
      <Icon aria-hidden className="h-8 w-8 text-accent-600" />
      <h3 className="mt-4 text-lg font-semibold text-navy-900">{product.name}</h3>
      <p className="mt-2 flex-1 text-sm text-slate-600">{product.summary}</p>

      <dl className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Illustrative amount</dt>
          <dd className="font-medium text-navy-900">
            {money.format(product.minAmount)} – {money.format(product.maxAmount)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Illustrative term</dt>
          <dd className="font-medium text-navy-900">
            {product.minMonths} – {product.maxMonths} months
          </dd>
        </div>
      </dl>

      <Link
        href={`/loans/${product.type}`}
        className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-accent-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
      >
        View details <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
    </article>
  );
}