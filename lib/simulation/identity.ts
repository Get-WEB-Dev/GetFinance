import { DEFAULT_COUNTRY, type CountryCode } from "@/config/countries";
import { getIdentityDocument } from "@/config/identity";
import type { IdentityKind, VerifyOutcome } from "@/types/verification";

function referenceFor(country: CountryCode, kind: IdentityKind, value: string): string {
  let hash = 5381;
  for (const char of `${country}:${kind}:${value}`) {
    hash = ((hash * 33) ^ char.charCodeAt(0)) >>> 0;
  }
  return `SIM-${country}-${kind.toUpperCase()}-${hash.toString(16).toUpperCase().padStart(8, "0")}`;
}

export function simulateIdentityCheck(
  kind: IdentityKind,
  rawValue: string,
  attempt: number,
  country: CountryCode = DEFAULT_COUNTRY,
): VerifyOutcome {
  const document = getIdentityDocument(country, kind);
  const value = document.normalize(rawValue);

  if (!document.isValid(value)) {
    return { status: "failed", message: "That number is not in a valid format." };
  }

  const { failed, flaky } = document.testValues;

  if (value === failed) {
    return {
      status: "failed",
      message: "We couldn't verify these details. Check the number and try again.",
    };
  }

  if (value === flaky && attempt < 2) {
    return {
      status: "error",
      message: "The simulated verification service is temporarily unavailable. Please try again.",
    };
  }

  return {
    status: "verified",
    referenceId: referenceFor(country, kind, value),
    message: "Verified (simulated).",
  };
}