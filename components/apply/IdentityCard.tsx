"use client";


import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useReadyDraft } from "@/components/wizard/DraftProvider";
import { getIdentityDocument } from "@/config/identity";
import { identityVerifier } from "@/lib/services";
import { useEffect, useMemo, useRef, useState } from "react";
import type { IdentityKind } from "@/types/verification";
import {
  createIdentityFormSchema,
  maskIdentity,
  normalizeIdentity,
  type IdentityFormValues,
  type VerifiedIdentity,
} from "@/lib/validation/identity";

interface IdentityCardProps {
  kind: IdentityKind;
  result: VerifiedIdentity | undefined;
  onVerified: (result: VerifiedIdentity) => void;
  onCleared: () => void;
}

type Status = "idle" | "verifying" | "failed" | "error";

export function IdentityCard({ kind, result, onVerified, onCleared }: IdentityCardProps) {
  const { draft } = useReadyDraft();
  const country = draft.country;
  const config = getIdentityDocument(country, kind);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const attemptRef = useRef(0);
  const lastValueRef = useRef("");
  const abortRef = useRef<AbortController | null>(null);

   const schema = useMemo(() => createIdentityFormSchema(kind, country), [kind, country]);

  const form = useForm<IdentityFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { value: "" },
  });

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

    async function onSubmit({ value }: IdentityFormValues) {
    if (status === "verifying") return;

    const normalized = normalizeIdentity(kind, value, country);
    if (lastValueRef.current !== normalized) {
      lastValueRef.current = normalized;
      attemptRef.current = 0;
    }
    attemptRef.current += 1;

    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("verifying");
    setMessage(null);

    const outcome = await identityVerifier.verify(
      { kind, country, value: normalized, attempt: attemptRef.current },
      controller.signal,
    );
    if (controller.signal.aborted) return;

    if (outcome.status === "verified") {
      form.reset({ value: "" });
      lastValueRef.current = "";
      setStatus("idle");
      onVerified({
        status: "verified",
        maskedValue: maskIdentity(kind, normalized, country),
        referenceId: outcome.referenceId,
        verifiedAt: new Date().toISOString(),
      });
      return;
    }

    setStatus(outcome.status);
    setMessage(outcome.message);
  }

  return (
    <section aria-labelledby={`${kind}-title`} className="rounded-lg border border-line bg-white p-5">
      <h2 id={`${kind}-title`} className="font-semibold text-navy-900">
        {config.title}
      </h2>

      {result ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 font-medium text-navy-900">
              <CheckCircle2 aria-hidden className="h-5 w-5 text-emerald-700" />
              Verified (simulated)
            </p>
            <dl className="mt-2 space-y-1 text-sm text-slate-600">
              <div className="flex gap-2">
                <dt>Number:</dt>
                <dd className="font-mono">{result.maskedValue}</dd>
              </div>
              <div className="flex gap-2">
                <dt>Simulation reference:</dt>
                <dd className="font-mono">{result.referenceId}</dd>
              </div>
            </dl>
          </div>
          <Button variant="secondary" onClick={onCleared}>
            {config.changeLabel}
          </Button>
        </div>
      ) : (
               <form
          onSubmit={(event) => {
            void form.handleSubmit(onSubmit)(event);
          }}
          noValidate
          className="mt-4"
        >
          <TextField
            label={config.label}
            hint={config.hint}
            placeholder={config.placeholder}
            maxLength={config.maxLength}
            inputMode={config.inputMode}
            autoComplete="off"
            spellCheck={false}
            readOnly={status === "verifying"}
            error={form.formState.errors.value?.message}
            {...form.register("value")}
          />

          <div aria-live="polite" className="mt-3 min-h-5 text-sm">
            {status === "verifying" && <p className="text-slate-600">Checking with the simulated service…</p>}
            {(status === "failed" || status === "error") && message && (
              <p className="flex items-start gap-2 font-medium text-red-700">
                <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                {status === "failed" ? "Verification failed. " : "Something went wrong. "}
                {message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={status === "verifying"} className="mt-3">
            {status === "verifying" ? "Verifying…" : status === "error" ? "Try again" : config.verifyLabel}
          </Button>
        </form>
      )}
    </section>
  );
}