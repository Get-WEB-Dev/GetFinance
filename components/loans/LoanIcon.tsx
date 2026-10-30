import type { LoanProduct } from "@/config/loans";

export function LoanIcon({ product }: { product: LoanProduct }) {
  const Icon = product.icon;
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-navy-900">
      <Icon aria-hidden className="h-5 w-5 text-accent-400" />
    </span>
  );
}