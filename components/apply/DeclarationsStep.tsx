"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SimulationNotice } from "@/components/ui/SimulationNotice";
import { SignaturePad } from "@/components/apply/SignaturePad";
import { useReadyDraft } from "@/components/wizard/DraftProvider";
import { StepActions } from "@/components/wizard/StepLayout";
import { declarationsVersion, getRequiredDeclarations, marketingConsentText } from "@/config/declarations";
import { getStepPath } from "@/config/steps";
import { withCompletedStep } from "@/lib/draft/completion";
import { getApplicantFullName, validateDeclarationsInput } from "@/lib/declarations/check";
import { renderSignatureToDataUrl } from "@/lib/signature/render";
import { isSignatureSubstantial, type Stroke } from "@/lib/signature/strokes";
import type { SignatureRecord } from "@/lib/validation/declarations";

const MAX_SIGNATURE_DATA_URL_LENGTH = 100_000;

export function DeclarationsStep() {
  const router = useRouter();
  const { draft, updateDraft } = useReadyDraft();

  const existing = draft.declarations;
  const fullName = getApplicantFullName(draft);
  const required = getRequiredDeclarations(draft.loanType);

  const sameVersion = existing?.version === declarationsVersion;
  const existingSignature =
    existing?.signature && existing.signature.signedAs === fullName ? existing.signature : undefined;

  const [accepted, setAccepted] = useState<Record<string, boolean>>(sameVersion ? existing.accepted : {});
  const [marketing, setMarketing] = useState(existing?.marketingConsent ?? false);
  const [method, setMethod] = useState<"drawn" | "typed">(existingSignature?.method ?? "drawn");
  const [typedName, setTypedName] = useState(existingSignature?.typedName ?? "");
  const [replacing, setReplacing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [issues, setIssues] = useState<string[]>([]);
  const strokesRef = useRef<Stroke[]>([]);
  const issuesRef = useRef<HTMLDivElement>(null);

  const keepExistingDrawing = method === "drawn" && existingSignature?.method === "drawn" && !replacing;

  useEffect(() => {
    if (issues.length > 0) issuesRef.current?.focus();
  }, [issues]);

  function handleStrokes(strokes: Stroke[]) {
    strokesRef.current = strokes;
    setHasDrawing(isSignatureSubstantial(strokes));
  }

  async function handleContinue() {
    const found = validateDeclarationsInput({
      loanType: draft.loanType,
      accepted,
      fullName,
      signature:
        method === "drawn"
          ? { method: "drawn", hasDrawing: hasDrawing || keepExistingDrawing }
          : { method: "typed", typedName },
    });
    if (found.length > 0) {
      setIssues(found);
      return;
    }

    let signature: SignatureRecord;
    if (method === "typed") {
      signature = {
        method: "typed",
        signedAs: fullName,
        typedName: typedName.trim().replace(/\s+/g, " "),
        signedAt: new Date().toISOString(),
      };
    } else if (keepExistingDrawing && existingSignature) {
      signature = existingSignature;
    } else {
      const imageDataUrl = renderSignatureToDataUrl(strokesRef.current);
      if (imageDataUrl.length > MAX_SIGNATURE_DATA_URL_LENGTH) {
        setIssues(["Your signature is too complex to save. Clear it and sign again more simply."]);
        return;
      }
      signature = { method: "drawn", signedAs: fullName, imageDataUrl, signedAt: new Date().toISOString() };
    }

    setIssues([]);
    await updateDraft({
      declarations: {
        version: declarationsVersion,
        accepted: Object.fromEntries(required.map((item) => [item.id, true])),
        marketingConsent: marketing,
        signature,
      },
      completedSteps: withCompletedStep(draft.completedSteps, "signature"),
    });
    router.push(getStepPath(draft.id, "review"));
  }

  return (
    <div>
      <SimulationNotice>
        <p className="font-medium">This e-signature is a simulation and is not legally binding.</p>
        <p className="mt-1">
          A real lender would use a legally recognised e-signature method and keep an audit trail on a
          secure server. Here, your consent and signature are saved only in this browser, and only when you
          click Save and continue.
        </p>
      </SimulationNotice>

      {issues.length > 0 && (
        <div
          ref={issuesRef}
          tabIndex={-1}
          role="alert"
          className="mt-6 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800"
        >
          <p className="font-semibold">Please fix the following before continuing:</p>
          <ul className="mt-2 list-disc pl-5">
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      <fieldset className="mt-8">
        <legend className="text-lg font-semibold text-navy-900">Declarations</legend>
        <p className="mt-1 text-sm text-slate-600">Please read and tick each statement. All are required.</p>
        <ul className="mt-4 space-y-3">
          {required.map((item) => (
            <li key={item.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-white p-4">
                <input
                  type="checkbox"
                  checked={accepted[item.id] === true}
                  onChange={(event) => setAccepted((current) => ({ ...current, [item.id]: event.target.checked }))}
                  className="mt-1 h-4 w-4 accent-[var(--color-accent-600)]"
                />
                <span className="text-sm text-slate-800">{item.text}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="text-lg font-semibold text-navy-900">Marketing preferences (optional)</legend>
        <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-md border border-line bg-white p-4">
          <input
            type="checkbox"
            checked={marketing}
            onChange={(event) => setMarketing(event.target.checked)}
            className="mt-1 h-4 w-4 accent-[var(--color-accent-600)]"
          />
          <span className="text-sm text-slate-800">{marketingConsentText}</span>
        </label>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="text-lg font-semibold text-navy-900">Your signature</legend>
        <p className="mt-1 text-sm text-slate-600">
          Signing as <strong>{fullName || "the applicant"}</strong>.
        </p>

        <div className="mt-3 flex flex-wrap gap-6 text-sm">
          {(["drawn", "typed"] as const).map((option) => (
            <label key={option} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="signature-method"
                checked={method === option}
                onChange={() => setMethod(option)}
                className="h-4 w-4 accent-[var(--color-accent-600)]"
              />
              {option === "drawn" ? "Draw my signature" : "Type my name instead"}
            </label>
          ))}
        </div>

        <div className="mt-4">
          {method === "drawn" && keepExistingDrawing && existingSignature?.imageDataUrl && (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={existingSignature.imageDataUrl}
                alt="Your saved signature"
                className="w-full max-w-md rounded-md border border-line bg-white"
              />
              <div className="mt-3">
                <Button variant="secondary" onClick={() => setReplacing(true)}>
                  Sign again
                </Button>
              </div>
            </div>
          )}

          {method === "drawn" && !keepExistingDrawing && <SignaturePad onChange={handleStrokes} />}

          {method === "typed" && (
            <div>
              <label htmlFor="typed-name" className="block text-sm font-medium text-navy-900">
                Type your full name
              </label>
              <input
                id="typed-name"
                type="text"
                autoComplete="off"
                value={typedName}
                onChange={(event) => setTypedName(event.target.value)}
                className="mt-1 w-full max-w-md rounded-md border border-slate-300 px-3 py-2"
              />
              {typedName.trim() !== "" && (
                <p aria-hidden className="mt-3 max-w-md rounded-md border border-line bg-white p-4 font-serif text-2xl italic text-navy-900">
                  {typedName}
                </p>
              )}
            </div>
          )}
        </div>
      </fieldset>

      <StepActions
        back={
          <ButtonLink href={getStepPath(draft.id, "documents")} variant="secondary">
            Back
          </ButtonLink>
        }
      >
        <Button onClick={handleContinue}>Save and continue</Button>
      </StepActions>
    </div>
  );
}