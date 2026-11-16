"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Action = "approved" | "declined" | "more_info";

export function DecisionForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(action: Action) {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/staff/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, action, note }),
    });
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    setBusy(false);
    if (!res.ok) {
      setError(data.message ?? "Something went wrong.");
      return;
    }
    router.refresh();
  }

  return (
    <section className="rounded-xl border border-slate-200 p-5">
      <h2 className="font-semibold text-navy-900">Your decision</h2>
      <label className="mt-3 block text-sm">
        Note (the applicant can see this; required to decline or ask for more information)
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={1000}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => decide("approved")}
          className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => decide("more_info")}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Request more information
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => decide("declined")}
          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-800 disabled:opacity-50"
        >
          Decline
        </button>
      </div>
    </section>
  );
}