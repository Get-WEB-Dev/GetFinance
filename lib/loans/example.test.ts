import { describe, expect, it } from "vitest";
import { loanContent } from "@/config/loan-content";
import { loanProducts } from "@/config/loans";
import { simulatedFeatures } from "@/config/simulations";
import { getRepaymentExample } from "./example";

describe.each(loanProducts)("repayment example for $name", (product) => {
  it("stays inside the product's range", () => {
    const example = getRepaymentExample(product)!;
    expect(example).not.toBeNull();
    expect(example.amount).toBeGreaterThanOrEqual(product.minAmount);
    expect(example.amount).toBeLessThanOrEqual(product.maxAmount);
    expect(example.months).toBeGreaterThanOrEqual(product.minMonths);
    expect(example.months).toBeLessThanOrEqual(product.maxMonths);
    expect(Number.isInteger(example.months)).toBe(true);
  });

  it("has marketing content", () => {
    expect(loanContent[product.type].headline.length).toBeGreaterThan(0);
    expect(loanContent[product.type].features.length).toBeGreaterThan(0);
  });
});

describe("simulated features list", () => {
  it("has unique ids and complete text", () => {
    const ids = simulatedFeatures.map((feature) => feature.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const feature of simulatedFeatures) {
      expect(feature.inThisDemo.length).toBeGreaterThan(10);
      expect(feature.inProduction.length).toBeGreaterThan(10);
    }
  });
});