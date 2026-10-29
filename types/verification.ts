export type IdentityKind = "pan" | "aadhaar";

export interface VerifyRequest {
  kind: IdentityKind;
  value: string;
  attempt: number;
}

export type VerifyOutcome =
  | { status: "verified"; referenceId: string; message: string }
  | { status: "failed"; message: string }
  | { status: "error"; message: string };