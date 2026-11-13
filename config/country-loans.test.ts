import { describe, expect, it } from "vitest";
import { countryCodes } from "./countries";
import { getEligibilityPolicy } from "./eligibility";
import { getLoanProducts } from "./loans";
import { getRepaymentExample } from "@/lib/loans/example";

describe.each(countryCodes)("loan setup for %s", (country) => {
  it("has sensible limits and a repayment example for every product", () => {
    for (const product of getLoanProducts(country)) {
      expect(product.minAmount).toBeGreaterThan(0);
      expect(product.maxAmount).toBeGreaterThan(product.minAmount);
      expect(product.minMonths).toBeGreaterThan(0);
      expect(product.maxMonths).toBeGreaterThan(product.minMonths);
      expect(product.illustrativeRate).toBeGreaterThan(0);
      expect(getRepaymentExample(product)).not.toBeNull();
    }
  });

  it("has the extra rules each product needs", () => {
    expect(getEligibilityPolicy("home", country).maxLtv).toBeDefined();
    expect(getEligibilityPolicy("business", country).minYearsOperating).toBeDefined();
  });
});