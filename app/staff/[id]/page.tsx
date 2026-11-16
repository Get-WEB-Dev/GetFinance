import Link from "next/link";
import { notFound } from "next/navigation";
import { DecisionForm } from "@/components/staff/DecisionForm";
import type { CountryCode } from "@/config/countries";
import { buildEligibilityInput } from "@/lib/eligibility/input";
import { formatCurrency } from "@/lib/format/currency";
import { requireStaff } from "@/lib/staff/auth";
import { draftSchema } from "@/lib/validation/draft";

interface RuleRow {
  label: string;
  outcome: string;
  yourValue: string;
  requirement: string;
}

export default async function StaffApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabase } = await requireStaff();
  const { id } = await params;

  const { data: row } = await supabase
    .from("applications")
    .select(
      "id, reference, loan_type, country, draft, decision, decision_detail, submitted_at, review_status, review_note, reviewed_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (!row || !row.submitted_at) notFound();

  const { data: events } = await supabase
    .from("application_events")
    .select("action, detail, created_at")
    .eq("application_id", id)
    .order("created_at", { ascending: true });

  const parsed = draftSchema.safeParse(row.draft);
  const draft = parsed.success ? parsed.data : null;
  const input = draft ? buildEligibilityInput(draft) : null;
  const country = row.country as CountryCode;
  const rules = ((row.decision_detail as { rules?: RuleRow[] } | null)?.rules ?? []) as RuleRow[];
  const reviewable = row.review_status === "pending" || row.review_status === "more_info";

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-16">
      <div>
        <Link href="/staff" className="text-sm underline">
          ← Back to queue
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-navy-900">{row.reference}</h1>
        <p className="text-sm capitalize text-slate-600">
          {row.loan_type} loan · {row.country} · pre-check: {row.decision} · review:{" "}
          {row.review_status.replace("_", " ")}
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-navy-900">Applicant</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-600">Name</dt>
            <dd>{draft?.applicant?.fullName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-600">Email</dt>
            <dd>{draft?.applicant?.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-600">Mobile</dt>
            <dd>{draft?.applicant?.mobile ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-600">Requested</dt>
            <dd>
              {input
                ? `${formatCurrency(input.requestedAmount, country)} over ${input.termMonths} months`
                : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-navy-900">Rule results (computed on the server)</h2>
        <table className="mt-3 w-full text-left text-sm">
          <thead className="text-slate-600">
            <tr>
              <th className="py-1 pr-3">Rule</th>
              <th className="py-1 pr-3">Result</th>
              <th className="py-1 pr-3">Applicant</th>
              <th className="py-1">Requirement</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.label} className="border-t border-slate-200">
                <td className="py-1 pr-3">{r.label}</td>
                <td className="py-1 pr-3 capitalize">{r.outcome}</td>
                <td className="py-1 pr-3">{r.yourValue}</td>
                <td className="py-1">{r.requirement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {reviewable ? (
        <DecisionForm applicationId={row.id} />
      ) : (
        <p className="rounded-xl border border-slate-200 p-5 text-sm">
          Decided: <strong>{row.review_status}</strong>
          {row.review_note ? ` — ${row.review_note}` : ""}
        </p>
      )}

      <section className="rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-navy-900">History</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(events ?? []).map((e, i) => {
            const note = (e.detail as { note?: string } | null)?.note;
            return (
              <li key={i}>
                <span className="text-slate-600">{new Date(e.created_at).toLocaleString()}</span> ·{" "}
                <strong>{e.action.replace("_", " ")}</strong>
                {note ? ` — ${note}` : ""}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}