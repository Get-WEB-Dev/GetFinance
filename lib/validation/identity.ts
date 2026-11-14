import { z } from "zod";
import { DEFAULT_COUNTRY, type CountryCode } from "@/config/countries";
import { getIdentityDocument } from "@/config/identity";
import type { IdentityKind } from "@/types/verification";

export function normalizeIdentity(kind: IdentityKind, raw: string, country: CountryCode = DEFAULT_COUNTRY): string {
  return getIdentityDocument(country, kind).normalize(raw);
}

export function maskIdentity(kind: IdentityKind, normalized: string, country: CountryCode = DEFAULT_COUNTRY): string {
  return getIdentityDocument(country, kind).mask(normalized);
}

export interface IdentityFormValues {
  value: string;
}

export function createIdentityFormSchema(kind: IdentityKind, country: CountryCode = DEFAULT_COUNTRY) {
  const doc = getIdentityDocument(country, kind);

  return z.object({ value: z.string() }).superRefine((v, ctx) => {
    const normalized = doc.normalize(v.value);

    if (normalized === "") {
      ctx.addIssue({ code: "custom", path: ["value"], message: doc.emptyMessage });
    } else if (!doc.isValid(normalized)) {
      ctx.addIssue({ code: "custom", path: ["value"], message: doc.invalidMessage });
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
  primary: verifiedIdentitySchema.optional(),
  secondary: verifiedIdentitySchema.optional(),
});

export type VerificationData = z.infer<typeof verificationStoredSchema>;

/** Strict rule for step completion: both checks must have passed. */
export const verificationSchema = z.object({
  primary: verifiedIdentitySchema,
  secondary: verifiedIdentitySchema,
});