import { z } from "zod";
import type { IdentityKind } from "@/types/verification";

const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const AADHAAR_PATTERN = /^[2-9]\d{11}$/;

export function normalizeIdentity(kind: IdentityKind, raw: string): string {
  return kind === "pan" ? raw.trim().toUpperCase() : raw.replace(/\s+/g, "");
}

export function isValidPan(value: string): boolean {
  return PAN_PATTERN.test(value);
}

export function isValidAadhaar(value: string): boolean {
  return AADHAAR_PATTERN.test(value);
}

export function maskIdentity(kind: IdentityKind, normalized: string): string {
  return kind === "pan"
    ? `${normalized.slice(0, 3)}•••••${normalized.slice(-2)}`
    : `XXXX XXXX ${normalized.slice(-4)}`;
}

export interface IdentityFormValues {
  value: string;
}

const FORMAT_MESSAGES: Record<IdentityKind, { empty: string; invalid: string }> = {
  pan: {
    empty: "Enter your PAN.",
    invalid: "Enter a 10-character PAN: 5 letters, 4 digits, then 1 letter (for example ABCDE1234F).",
  },
  aadhaar: {
    empty: "Enter your Aadhaar number.",
    invalid: "Enter a 12-digit Aadhaar number that doesn't start with 0 or 1.",
  },
};

export function createIdentityFormSchema(kind: IdentityKind) {
  const messages = FORMAT_MESSAGES[kind];

  return z.object({ value: z.string() }).superRefine((v, ctx) => {
    const normalized = normalizeIdentity(kind, v.value);
    const valid = kind === "pan" ? isValidPan(normalized) : isValidAadhaar(normalized);

    if (normalized === "") {
      ctx.addIssue({ code: "custom", path: ["value"], message: messages.empty });
    } else if (!valid) {
      ctx.addIssue({ code: "custom", path: ["value"], message: messages.invalid });
    }
  });
}

export const verifiedIdentitySchema = z.object({
  status: z.literal("verified"),
  maskedValue: z.string(),
  referenceId: z.string(),
  verifiedAt: z.string(),
});

export type VerifiedIdentity = z.infer<typeof verifiedIdentitySchema>;

/** What a draft stores: only successful, masked results. */
export const verificationStoredSchema = z.object({
  pan: verifiedIdentitySchema.optional(),
  aadhaar: verifiedIdentitySchema.optional(),
});

export type VerificationData = z.infer<typeof verificationStoredSchema>;

/** Strict rule for step completion: both checks must have passed. */
export const verificationSchema = z.object({
  pan: verifiedIdentitySchema,
  aadhaar: verifiedIdentitySchema,
});