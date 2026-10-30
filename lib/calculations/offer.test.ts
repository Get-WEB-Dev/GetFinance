import { describe, expect, it } from "vitest";
import { maxPrincipalForEmi } from "./offer";
import { calculateRepayment } from "./repayment";

describe("maxPrincipalForEmi", () => {
  it("is the inverse of calculateRepayment", () => {
    const estimate = calculateRepayment(500_000, 10, 60)!;
    expect(maxPrincipalForEmi(estimate.monthlyPayment, 10, 60)).toBeCloseTo(500_000, 3);
  });

  it("handles a zero rate", () => {
    expect(maxPrincipalForEmi(1_000, 0, 12)).toBe(12_000);
  });

  it("returns null for invalid input", () => {
    expect(maxPrincipalForEmi(0, 10, 60)).toBeNull();
    expect(maxPrincipalForEmi(1_000, -1, 60)).toBeNull();
    expect(maxPrincipalForEmi(1_000, 10, 0)).toBeNull();
    expect(maxPrincipalForEmi(Number.NaN, 10, 60)).toBeNull();
  });
});