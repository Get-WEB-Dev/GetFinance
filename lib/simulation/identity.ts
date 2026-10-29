import { simulationTestValues } from "@/config/identity";
import { isValidAadhaar, isValidPan, normalizeIdentity } from "@/lib/validation/identity";
import type { IdentityKind, VerifyOutcome } from "@/types/verification";

function referenceFor(kind: IdentityKind, value: string): string {
  let hash = 5381;
  for (const char of `${kind}:${value}`) {
    hash = ((hash * 33) ^ char.charCodeAt(0)) >>> 0;
  }
  return `SIM-${kind.toUpperCase()}-${hash.toString(16).toUpperCase().padStart(8, "0")}`;
}

export function simulateIdentityCheck(kind: IdentityKind, rawValue: string, attempt: number): VerifyOutcome {
  const value = normalizeIdentity(kind, rawValue);
  const formatOk = kind === "pan" ? isValidPan(value) : isValidAadhaar(value);

  if (!formatOk) {
    return { status: "failed", message: "That number is not in a valid format." };
  }

  const testValues = simulationTestValues[kind];

  if (value === testValues.failed) {
    return {
      status: "failed",
      message: "We couldn't verify these details. Check the number and try again.",
    };
  }

  if (value === testValues.flaky && attempt < 2) {
    return {
      status: "error",
      message: "The simulated verification service is temporarily unavailable. Please try again.",
    };
  }

  return {
    status: "verified",
    referenceId: referenceFor(kind, value),
    message: "Verified (simulated).",
  };
}