import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { simulatedFeatures } from "@/config/simulations";

export const metadata: Metadata = { title: "Demo disclaimer" };

export default function DisclaimerPage() {
  return (
    <PageShell
      crumbs={[{ label: "Home", href: "/" }, { label: "Demo disclaimer" }]}
      title="Demo disclaimer"
      intro="GetFinance is a fictional product. These features are simulated, and here is what a real service would do instead."
    >
      <ul className="space-y-4">
        {simulatedFeatures.map((feature) => (
          <li key={feature.id} className="rounded-lg border border-line bg-white p-5">
            <h2 className="font-semibold text-navy-900">{feature.name}</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="font-medium text-slate-600">In this demo</dt>
                <dd className="text-slate-800">{feature.inThisDemo}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-600">In a real service</dt>
                <dd className="text-slate-800">{feature.inProduction}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}