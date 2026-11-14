import type { CountryCode } from "@/config/countries";

/** Every country asks for two identity documents: a primary and a secondary one. */
export type IdentityKind = "primary" | "secondary";

export interface VerifyRequest {
  kind: IdentityKind;
  country: CountryCode;
  value: string;
  attempt: number;
}

export type VerifyOutcome =
  | { status: "verified"; referenceId: string; message: string }
  | { status: "failed"; message: string }
  | { status: "error"; message: string };