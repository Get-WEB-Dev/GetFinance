import { describe, expect, it } from "vitest";
import { makeDraft } from "@/test/fixtures";
import { buildEligibilityInput } from "./input";
import { evaluateEligibility } from "./evaluate";
import type { EligibilityInput } from "./types";

const personal: EligibilityInput = {
  country: "ET",
  loanType: "personal",
  age: 30,
  monthlyIncome: 80_000,
  monthlyExpenses: 25_000,
  existingEmi: 0,
  requestedAmount: 200_000,
  termMonths: 36,
  annualRatePercent: 12.5,
  employmentStatus: "salaried",
  yearsInCurrentWork: 3,
  propertyValue: null,
  yearsOperating: null,
};

const home: EligibilityInput = {
  country: "ET",
  loanType: "home",
  age: 35,
  monthlyIncome: 300_000,
  monthlyExpenses: 50_000,
  existingEmi: 0,
  requestedAmount: 8_500_000,
  termMonths: 240,
  annualRatePercent: 8.75,
  employmentStatus: "salaried",
  yearsInCurrentWork: 6,
  propertyValue: 10_000_000,
  yearsOperating: null,
};

const business: EligibilityInput = {
  country: "ET",
  loanType: "business",
  age: 40,
  monthlyIncome: 150_000,
  monthlyExpenses: 40_000,
  existingEmi: 0,
  requestedAmount: 1_000_000,
  termMonths: 36,
  annualRatePercent: 14,
  employmentStatus: "self-employed",
  yearsInCurrentWork: 5,
  propertyValue: null,
  yearsOperating: 3,
};

function evaluate(input: EligibilityInput) {
  const result = evaluateEligibility(input);
  if (!result) throw new Error("Expected the input to be evaluable.");
  return result;
}

const outcomeOf = (input: EligibilityInput, ruleId: string) =>
  evaluate(input).rules.find((rule) => rule.id === ruleId)?.outcome;

describe("which rules apply", () => {
  it("applies loan-specific rules only to the right products", () => {
    const ids = (input: EligibilityInput) => evaluate(input).rules.map((rule) => rule.id);
    expect(ids(personal)).toEqual([
      "age", "maturity-age", "income", "foir", "disposable-income", "loan-to-income", "work-stability",
    ]);
    expect(ids(home)).toContain("ltv");
    expect(ids(business)).toContain("business-vintage");
    expect(ids(business)).not.toContain("work-stability");
  });
});

describe("overall decision", () => {
  it("is eligible when every rule passes", () => {
      for (const input of [personal, { ...home, requestedAmount: 8_000_000 }, business]) {
      const result = evaluate(input);
      expect(result.rules.every((rule) => rule.outcome === "pass")).toBe(true);
      expect(result.decision).toBe("eligible");
    }
  });

  it("needs review when a rule is in the grey band but none fail", () => {
    const result = evaluate({ ...personal, monthlyIncome: 60_000, monthlyExpenses: 15_000, existingEmi: 25_000 });
    expect(result.rules.find((rule) => rule.id === "foir")?.outcome).toBe("refer");
    expect(result.decision).toBe("review");
  });

  it("is not eligible when any rule fails", () => {
    expect(evaluate({ ...personal, monthlyIncome: 15_000 }).decision).toBe("not-eligible");
  });
});

describe("individual rules", () => {
  it("fails income below the minimum and passes it exactly at the minimum", () => {
    expect(outcomeOf({ ...personal, monthlyIncome: 19_999 }, "income")).toBe("fail");
    expect(outcomeOf({ ...personal, monthlyIncome: 20_000 }, "income")).toBe("pass");
  });

  it("fails FOIR well above the limit", () => {
    expect(
      outcomeOf({ ...personal, monthlyIncome: 60_000, monthlyExpenses: 15_000, existingEmi: 35_000 }, "foir"),
    ).toBe("fail");
  });

  it("checks age and age at maturity", () => {
    expect(outcomeOf({ ...personal, age: 17 }, "age")).toBe("fail");
    expect(outcomeOf({ ...personal, age: 71 }, "age")).toBe("fail");
    expect(outcomeOf({ ...personal, age: 63, termMonths: 36 }, "maturity-age")).toBe("fail");
    expect(outcomeOf({ ...personal, age: 62, termMonths: 36 }, "maturity-age")).toBe("pass");
  });

  it("applies loan-to-value bands on a home loan", () => {
    expect(outcomeOf(home, "ltv")).toBe("refer");
    expect(evaluate(home).decision).toBe("review");
    expect(outcomeOf({ ...home, requestedAmount: 9_500_000 }, "ltv")).toBe("fail");
    expect(outcomeOf({ ...home, requestedAmount: 8_000_000 }, "ltv")).toBe("pass");
  });

  it("applies business age bands", () => {
    expect(outcomeOf({ ...business, yearsOperating: 2 }, "business-vintage")).toBe("pass");
    expect(outcomeOf({ ...business, yearsOperating: 1 }, "business-vintage")).toBe("refer");
    expect(outcomeOf({ ...business, yearsOperating: 0 }, "business-vintage")).toBe("fail");
  });

  it("sends short work history and unemployment to review, not rejection", () => {
    expect(outcomeOf({ ...personal, yearsInCurrentWork: 0 }, "work-stability")).toBe("refer");
    const unemployed = { ...personal, employmentStatus: "unemployed", yearsInCurrentWork: null };
    expect(outcomeOf(unemployed, "work-stability")).toBe("refer");
    expect(evaluate(unemployed).decision).toBe("review");
  });
});

describe("unevaluable input", () => {
  it("returns null instead of guessing", () => {
    expect(evaluateEligibility({ ...personal, requestedAmount: 0 })).toBeNull();
    expect(evaluateEligibility({ ...personal, monthlyIncome: 0 })).toBeNull();
    expect(evaluateEligibility({ ...home, propertyValue: null })).toBeNull();
    expect(evaluateEligibility({ ...business, yearsOperating: null })).toBeNull();
  });
});

describe("maximum amount suggestion", () => {
  it("suggests an amount that really passes the amount-related rules", () => {
    const tooBig = { ...personal, monthlyIncome: 100_000, monthlyExpenses: 30_000, existingEmi: 20_000, requestedAmount: 1_300_000 };
    const result = evaluate(tooBig);
    expect(result.rules.find((rule) => rule.id === "foir")?.outcome).toBe("fail");
    expect(result.maxAmount).not.toBeNull();
    expect(result.maxAmount!).toBeLessThan(tooBig.requestedAmount);
    expect(result.maxAmount! % 1_000).toBe(0);

    const retried = evaluate({ ...tooBig, requestedAmount: result.maxAmount! });
    for (const id of ["foir", "disposable-income", "loan-to-income"]) {
      expect(retried.rules.find((rule) => rule.id === id)?.outcome).toBe("pass");
    }
  });

  it("returns null when there is no spare capacity at all", () => {
    const stretched = { ...personal, monthlyIncome: 60_000, monthlyExpenses: 15_000, existingEmi: 35_000 };
    expect(evaluate(stretched).maxAmount).toBeNull();
  });
});

describe("buildEligibilityInput", () => {
  it("builds numbers from a complete draft", () => {
    const input = buildEligibilityInput(makeDraft());
    expect(input).not.toBeNull();
    expect(Number.isFinite(input!.age)).toBe(true);
    expect(input!.requestedAmount).toBeGreaterThan(0);
  });

  it("returns null when income is missing", () => {
    expect(buildEligibilityInput(makeDraft({ employment: undefined }))).toBeNull();
  });
});