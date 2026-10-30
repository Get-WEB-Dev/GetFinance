import { z } from "zod";

export const signatureSchema = z.object({
  method: z.enum(["drawn", "typed"]),
  signedAs: z.string(),
  typedName: z.string().optional(),
  imageDataUrl: z.string().optional(),
  signedAt: z.string(),
});

export const declarationsStoredSchema = z.object({
  version: z.string(),
  accepted: z.record(z.string(), z.boolean()),
  marketingConsent: z.boolean().default(false),
  signature: signatureSchema.optional(),
});

export type SignatureRecord = z.infer<typeof signatureSchema>;
export type DeclarationsData = z.infer<typeof declarationsStoredSchema>;