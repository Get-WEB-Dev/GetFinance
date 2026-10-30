import { describe, expect, it } from "vitest";
import { toEligibilitySnapshot } from "./snapshot";
import type { EligibilityResult } from "./types";

describe("toEligibilitySnapshot", () => {
  it("keeps the decision and each rule's facts, but drops hints", () => {
    const result: EligibilityResult = {
      decision: "review",
      annualRatePercent: 12.5,
      monthlyPayment: 6_691,
      totalPayable: 240_876,
      totalInterest: 40_876,
      foir: 0.5,
      disposableIncome: 10_000,
      maxAmount: 150_000,
      rules: [
        { id: "foir", label: "FOIR", outcome: "refer", yourValue: "52%", requirement: "At most 50%", hint: "Lower the amount." },
      ],
    };

    const snapshot = toEligibilitySnapshot(result);
    expect(snapshot.decision).toBe("review");
    expect(snapshot.rules[0]).toEqual({
      id: "foir",
      label: "FOIR",
      outcome: "refer",
      yourValue: "52%",
      requirement: "At most 50%",
    });
    expect("foir" in snapshot).toBe(false);
  });
});