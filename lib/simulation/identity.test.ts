import { describe, expect, it } from "vitest";
import { simulationTestValues } from "@/config/identity";
import { maskIdentity, normalizeIdentity } from "@/lib/validation/identity";
import { simulateIdentityCheck } from "./identity";

describe("simulateIdentityCheck", () => {
  it("verifies the documented test values", () => {
    expect(simulateIdentityCheck("pan", simulationTestValues.pan.verified, 1).status).toBe("verified");
    expect(simulateIdentityCheck("aadhaar", simulationTestValues.aadhaar.verified, 1).status).toBe("verified");
  });

  it("fails the documented failing values", () => {
    expect(simulateIdentityCheck("pan", simulationTestValues.pan.failed, 1).status).toBe("failed");
    expect(simulateIdentityCheck("aadhaar", simulationTestValues.aadhaar.failed, 1).status).toBe("failed");
  });

  it("errors on the first attempt and succeeds on retry for the flaky values", () => {
    expect(simulateIdentityCheck("pan", simulationTestValues.pan.flaky, 1).status).toBe("error");
    expect(simulateIdentityCheck("pan", simulationTestValues.pan.flaky, 2).status).toBe("verified");
    expect(simulateIdentityCheck("aadhaar", simulationTestValues.aadhaar.flaky, 1).status).toBe("error");
    expect(simulateIdentityCheck("aadhaar", simulationTestValues.aadhaar.flaky, 2).status).toBe("verified");
  });

  it("rejects badly formatted numbers", () => {
    expect(simulateIdentityCheck("pan", "12345", 1).status).toBe("failed");
    expect(simulateIdentityCheck("aadhaar", "123456789012", 1).status).toBe("failed");
  });

  it("is deterministic and never echoes the full number in the reference", () => {
    const a = simulateIdentityCheck("pan", "ABCDE1234F", 1);
    const b = simulateIdentityCheck("pan", "abcde1234f ", 1);
    expect(a).toEqual(b);
    if (a.status === "verified") expect(a.referenceId).not.toContain("ABCDE1234F");
  });
});

describe("identity helpers", () => {
  it("normalises input", () => {
    expect(normalizeIdentity("pan", " abcde1234f ")).toBe("ABCDE1234F");
    expect(normalizeIdentity("aadhaar", "2345 6789 0123")).toBe("234567890123");
  });

  it("masks identifiers", () => {
    expect(maskIdentity("pan", "ABCDE1234F")).toBe("ABC•••••4F");
    expect(maskIdentity("aadhaar", "234567890123")).toBe("XXXX XXXX 0123");
  });
});