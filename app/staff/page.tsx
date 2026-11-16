import Link from "next/link";
import { requireStaff } from "@/lib/staff/auth";

const FILTERS = ["pending", "more_info", "approved", "declined"] as const;
const LABEL: Record<string, string> = {
  pending: "Pending",
  more_info: "More info",
  approved: "Approved",
  declined: "Declined",
};

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { supabase, role } = await requireStaff();
  const { status } = await searchParams;

  let query = supabase
    .from("applications")
    .select("id, reference, loan_type, country, decision, review_status, submitted_at")
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: false })
    .limit(100);
  if (status && (FILTERS as readonly string[]).includes(status)) {
    query = query.eq("review_status", status);
  }
  const { data: rows } = await query;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-navy-900">Review queue</h1>
      <p className="text-sm text-slate-600">Signed in as {role}</p>

      <nav aria-label="Filter" className="mt-6 flex flex-wrap gap-2 text-sm">
        <Link href="/staff" className="rounded-full border border-slate-300 px-3 py-1">
          All
        </Link>
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/staff?status=${f}`}
            className="rounded-full border border-slate-300 px-3 py-1"
          >
            {LABEL[f]}
          </Link>
        ))}
      </nav>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-600">
            <tr>
              <th className="py-2 pr-4">Reference</th>
              <th className="py-2 pr-4">Loan</th>
              <th className="py-2 pr-4">Country</th>
              <th className="py-2 pr-4">Pre-check</th>
              <th className="py-2 pr-4">Review</th>
              <th className="py-2 pr-4">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => (
              <tr key={r.id} className="border-t border-slate-200">
                <td className="py-2 pr-4">
                  <Link href={`/staff/${r.id}`} className="font-medium underline">
                    {r.reference}
                  </Link>
                </td>
                <td className="py-2 pr-4 capitalize">{r.loan_type}</td>
                <td className="py-2 pr-4">{r.country}</td>
                <td className="py-2 pr-4">{r.decision}</td>
                <td className="py-2 pr-4">{LABEL[r.review_status] ?? r.review_status}</td>
                <td className="py-2 pr-4">
                  {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : ""}
                </td>
              </tr>
            ))}
            {(rows ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-slate-600">
                  Nothing here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}