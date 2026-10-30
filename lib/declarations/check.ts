import { declarationsVersion, getRequiredDeclarations, type DeclarationItem } from "@/config/declarations";
import type { LoanType } from "@/config/loans";
import type { ApplicationDraft } from "@/types/application";

export function getApplicantFullName(draft: Pick<ApplicationDraft, "applicant">): string {
  return draft.applicant?.fullName.trim() ?? "";
}

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

export function namesMatch(a: string, b: string): boolean {
  const left = normalizeName(a);
  return left.length > 0 && left === normalizeName(b);
}

export function getMissingDeclarations(
  loanType: LoanType,
  accepted: Record<string, boolean>,
): DeclarationItem[] {
  return getRequiredDeclarations(loanType).filter((item) => accepted[item.id] !== true);
}

export type SignatureInput =
  | { method: "drawn"; hasDrawing: boolean }
  | { method: "typed"; typedName: string };

/** Validates what the user has entered on the step. Returns human-readable problems. */
export function validateDeclarationsInput(input: {
  loanType: LoanType;
  accepted: Record<string, boolean>;
  fullName: string;
  signature: SignatureInput;
}): string[] {
  const issues = getMissingDeclarations(input.loanType, input.accepted).map(
    (item) => `Please confirm ${item.short}.`,
  );

  if (input.signature.method === "drawn") {
    if (!input.signature.hasDrawing) {
      issues.push("Draw your signature in the box, or choose to type your name instead.");
    }
  } else if (input.signature.typedName.trim() === "") {
    issues.push("Type your full name to sign.");
  } else if (!namesMatch(input.signature.typedName, input.fullName)) {
    issues.push(`The name you type must match the name on your application (${input.fullName}).`);
  }

  return issues;
}

/** Re-checks a saved record against the current draft (used by cross-step revalidation). */
export function getDeclarationIssues(draft: ApplicationDraft): { field: string; message: string }[] {
  const data = draft.declarations;
  if (!data) return [{ field: "declarations", message: "Declarations have not been completed." }];

  if (data.version !== declarationsVersion) {
    return [{ field: "declarations", message: "The declarations have changed. Please review and sign again." }];
  }

  const issues = getMissingDeclarations(draft.loanType, data.accepted).map((item) => ({
    field: item.id,
    message: `Please confirm ${item.short}.`,
  }));

  if (!data.signature) {
    issues.push({ field: "signature", message: "A signature is required." });
  } else if (!namesMatch(data.signature.signedAs, getApplicantFullName(draft))) {
    issues.push({ field: "signature", message: "Your name changed after you signed. Please sign again." });
  }

  return issues;
}