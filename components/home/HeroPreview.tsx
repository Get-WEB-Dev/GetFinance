import { CheckCircle2, FileText, ShieldCheck } from "lucide-react";

export function HeroPreview() {
  return (
    <div
      className="rounded-xl border border-white/10 bg-white p-6 text-navy-900 shadow-2xl"
      role="img"
      aria-label="Example of an application summary screen with sample figures"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Application summary</p>
        <span className="rounded-full bg-accent-600/10 px-3 py-1 text-xs font-semibold text-accent-700">
          Sample
        </span>
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Step 6 of 10</span>
          <span>60% complete</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-100">
          <div className="h-2 w-[60%] rounded-full bg-accent-600" />
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-surface p-4">
          <dt className="text-xs text-slate-500">Requested amount</dt>
          <dd className="mt-1 text-2xl font-semibold">$12,500</dd>
        </div>
        <div className="rounded-lg bg-surface p-4">
          <dt className="text-xs text-slate-500">Est. monthly repayment</dt>
          <dd className="mt-1 text-2xl font-semibold">$398</dd>
        </div>
      </dl>

      <ul className="mt-6 space-y-3 text-sm">
        <li className="flex items-center gap-3">
          <CheckCircle2 aria-hidden className="h-5 w-5 text-accent-600" />
          Personal details completed
        </li>
        <li className="flex items-center gap-3">
          <CheckCircle2 aria-hidden className="h-5 w-5 text-accent-600" />
          Employment and finances completed
        </li>
        <li className="flex items-center gap-3">
          <FileText aria-hidden className="h-5 w-5 text-slate-400" />
          Documents: 2 of 3 added
        </li>
      </ul>

      <p className="mt-6 flex items-center gap-2 border-t border-line pt-4 text-xs text-slate-500">
        <ShieldCheck aria-hidden className="h-4 w-4" />
        Illustrative figures only. Not a real offer.
      </p>
    </div>
  );
}