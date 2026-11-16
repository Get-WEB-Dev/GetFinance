import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export default async function AccountPage() {
  if (!supabaseConfigured) redirect("/login");

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: rows } = await supabase
    .from("applications")
    .select("id, reference, loan_type, status, updated_at, draft")
    .order("updated_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Your applications</h1>
          <p className="text-sm text-slate-600">{auth.user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <ul className="mt-8 space-y-3">
        {(rows ?? []).map((row) => {
          const step = (row.draft as { currentStep?: string } | null)?.currentStep ?? "";
          return (
            <li
              key={row.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
            >
              <div>
                <p className="font-medium capitalize">{row.loan_type} loan</p>
                <p className="text-sm text-slate-600">
                  {row.reference} · {row.status} · updated{" "}
                  {new Date(row.updated_at).toLocaleDateString()}
                </p>
              </div>
              <Link
                href={`/apply/${row.id}/${step}`}
                className="text-sm font-medium text-navy-900 underline"
              >
                {row.status === "submitted" ? "View" : "Continue"}
              </Link>
            </li>
          );
        })}
        {(rows ?? []).length === 0 && (
          <li className="text-slate-600">
            No saved applications yet. <Link className="underline" href="/apply">Start one</Link>.
          </li>
        )}
      </ul>
    </div>
  );
}