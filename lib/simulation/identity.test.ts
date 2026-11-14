import { describe, expect, it } from "vitest";
import { countryCodes } from "@/config/countries";
import { getIdentityDocument, getTestValues } from "@/config/identity";
import { maskIdentity, normalizeIdentity } from "@/lib/validation/identity";
import { simulateIdentityCheck } from "./identity";

const kinds = ["primary", "secondary"] as const;

describe.each(countryCodes)("simulateIdentityCheck for %s", (country) => {
  const values = getTestValues(country);

  it.each(kinds)("verifies, fails and flakes the documented %s values", (kind) => {
    expect(simulateIdentityCheck(kind, values[kind].verified, 1, country).status).toBe("verified");
    expect(simulateIdentityCheck(kind, values[kind].failed, 1, country).status).toBe("failed");
    expect(simulateIdentityCheck(kind, values[kind].flaky, 1, country).status).toBe("error");
    expect(simulateIdentityCheck(kind, values[kind].flaky, 2, country).status).toBe("verified");
  });

  it.each(kinds)("rejects a badly formatted %s number", (kind) => {
    expect(simulateIdentityCheck(kind, "12", 1, country).status).toBe("failed");
  });

  it.each(kinds)("documents %s test values that are correctly formatted", (kind) => {
    const document = getIdentityDocument(country, kind);
    for (const value of Object.values(values[kind])) {
      expect(document.isValid(document.normalize(value))).toBe(true);
    }
  });
});

describe("simulateIdentityCheck details", () => {
  it("is deterministic and never echoes the full number in the reference", () => {
    const a = simulateIdentityCheck("secondary", "D1234567", 1, "US");
    const b = simulateIdentityCheck("secondary", " d1234567 ", 1, "US");
    expect(a).toEqual(b);
    if (a.status === "verified") expect(a.referenceId).not.toContain("D1234567");
  });
});

describe("identity helpers", () => {
  it("normalises input", () => {
    expect(normalizeIdentity("primary", "123-45-6789", "US")).toBe("123456789");
    expect(normalizeIdentity("primary", " ab 12 34 56 c ", "GB")).toBe("AB123456C");
    expect(normalizeIdentity("primary", "1234 5678 9012 3456", "ET")).toBe("1234567890123456");
  });

  it("masks identifiers", () => {
    expect(maskIdentity("primary", "123456789", "US")).toBe("•••-••-6789");
    expect(maskIdentity("primary", "AB123456C", "GB")).toBe("AB••••••C");
    expect(maskIdentity("primary", "1234567890123456", "ET")).toBe("••••••••••••3456");
  });

  it("applies the SSN and National Insurance rules", () => {
    const ssn = getIdentityDocument("US", "primary");
    for (const bad of ["000121234", "666121234", "900121234", "123001234", "123450000"]) {
      expect(ssn.isValid(bad)).toBe(false);
    }
    const nino = getIdentityDocument("GB", "primary");
    for (const bad of ["BG123456C", "AB123456E", "DA123456C", "AO123456C"]) {
      expect(nino.isValid(bad)).toBe(false);
    }
    expect(nino.isValid("AB123456A")).toBe(true);
  });
});