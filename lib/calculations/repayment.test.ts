import { describe, expect, it } from "vitest";
import { calculateRepayment } from "./repayment";

describe("calculateRepayment", () => {
  it("matches a known EMI example (5,00,000 at 10% for 60 months)", () => {
    const result = calculateRepayment(500_000, 10, 60);
    expect(Math.round(result?.monthlyPayment ?? 0)).toBe(10624);
  });

  it("splits the principal evenly when the rate is zero", () => {
    const result = calculateRepayment(120_000, 0, 12);
    expect(result?.monthlyPayment).toBe(10_000);
    expect(result?.totalInterest).toBe(0);
  });

  it("keeps total payable consistent with the monthly payment", () => {
    const result = calculateRepayment(300_000, 12.5, 36);
    expect(result?.totalPayable).toBeCloseTo((result?.monthlyPayment ?? 0) * 36, 6);
  });

  it.each([
    ["zero principal", 0, 10, 12],
    ["negative principal", -1, 10, 12],
    ["zero months", 1000, 10, 0],
    ["fractional months", 1000, 10, 12.5],
    ["negative rate", 1000, -1, 12],
    ["NaN principal", Number.NaN, 10, 12],
  ])("returns null for %s", (_label, principal, rate, months) => {
    expect(calculateRepayment(principal, rate, months)).toBeNull();
  });
});