import { describe, expect, it } from "vitest";
import { calculateAffordability } from "./affordability";

describe("calculateAffordability", () => {
  it("computes disposable income and the obligations ratio", () => {
    const result = calculateAffordability({
      monthlyIncome: 100_000,
      monthlyExpenses: 30_000,
      existingEmi: 10_000,
      newEmi: 20_000,
    });
    expect(result?.disposableIncome).toBe(40_000);
    expect(result?.foir).toBeCloseTo(0.3, 10);
  });

  it("reports a negative disposable income instead of hiding it", () => {
    const result = calculateAffordability({
      monthlyIncome: 50_000,
      monthlyExpenses: 40_000,
      existingEmi: 10_000,
      newEmi: 10_000,
    });
    expect(result?.disposableIncome).toBe(-10_000);
  });

  it("returns null when income is zero or any value is invalid", () => {
    expect(calculateAffordability({ monthlyIncome: 0, monthlyExpenses: 1, existingEmi: 0, newEmi: 0 })).toBeNull();
    expect(calculateAffordability({ monthlyIncome: 1000, monthlyExpenses: -1, existingEmi: 0, newEmi: 0 })).toBeNull();
  });
});