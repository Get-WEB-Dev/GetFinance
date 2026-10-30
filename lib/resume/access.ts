import type { ApplicationDraft } from "@/types/application";

/** Accepts "gf-abc12345", "GF ABC12345", "ABC12345" and returns "GF-ABC12345". */
export function normalizeReference(input: string): string {
  const compact = input.trim().toUpperCase().replace(/[\s-]/g, "");
  const code = compact.length === 10 && compact.startsWith("GF") ? compact.slice(2) : compact;
  return `GF-${code}`;
}

export function isReferenceFormat(reference: string): boolean {
  return /^GF-[A-Z0-9]{8}$/.test(reference);
}

/**
 * Light verification: once a date of birth is saved in the draft, resuming needs it.
 * A draft with no personal details yet has nothing to protect, so it needs only the reference.
 */
export function checkResumeAccess(draft: ApplicationDraft, dateOfBirthInput: string): "ok" | "denied" {
  const saved = draft.applicant?.dateOfBirth;
  if (!saved) return "ok";
  return saved === dateOfBirthInput.trim() ? "ok" : "denied";
}