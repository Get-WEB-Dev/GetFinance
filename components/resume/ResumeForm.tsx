"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { draftRepository } from "@/lib/persistence";
import { checkResumeAccess, isReferenceFormat, normalizeReference } from "@/lib/resume/access";

const MAX_ATTEMPTS = 5;
const LOCK_MS = 30_000;
const GENERIC_FAILURE = "We couldn't find an application with those details. Check them and try again.";

export function ResumeForm() {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const attempts = useRef(0);
  const lockedUntil = useRef(0);

  function recordFailure(text: string) {
    attempts.current += 1;
    if (attempts.current >= MAX_ATTEMPTS) {
      attempts.current = 0;
      lockedUntil.current = Date.now() + LOCK_MS;
    }
    setMessage(text);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;

    const remaining = lockedUntil.current - Date.now();
    if (remaining > 0) {
      setMessage(`Too many attempts. Please wait ${Math.ceil(remaining / 1000)} seconds and try again.`);
      return;
    }

    const normalized = normalizeReference(reference);
    if (!isReferenceFormat(normalized)) {
      setMessage("Enter your reference as it appears on your application, for example GF-1A2B3C4D.");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const draft = await draftRepository.findByReference(normalized);
      if (draft && checkResumeAccess(draft, dateOfBirth) === "ok") {
        router.push(`/apply/${draft.id}`);
        return;
      }
      recordFailure(GENERIC_FAILURE);
    } catch {
      setMessage("Something went wrong while looking for your application. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus-visible:outline-2 focus-visible:outline-accent-600";

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-md space-y-5">
      <div>
        <label htmlFor="reference" className="block text-sm font-medium text-navy-900">
          Reference number
        </label>
        <input
          id="reference"
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          aria-describedby="reference-hint"
          className={inputClass}
        />
        <p id="reference-hint" className="mt-1 text-sm text-slate-600">
          It looks like GF-1A2B3C4D and was shown on your application.
        </p>
      </div>

      <div>
        <label htmlFor="dob" className="block text-sm font-medium text-navy-900">
          Date of birth
        </label>
        <input
          id="dob"
          type="date"
          value={dateOfBirth}
          onChange={(event) => setDateOfBirth(event.target.value)}
          aria-describedby="dob-hint"
          className={inputClass}
        />
        <p id="dob-hint" className="mt-1 text-sm text-slate-600">
          Needed if you had already entered it in your application.
        </p>
      </div>

      <div aria-live="polite">
        {message && (
          <p role="alert" className="text-sm font-medium text-red-700">
            {message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={busy}>
        {busy ? "Looking…" : "Find my application"}
      </Button>
    </form>
  );
}