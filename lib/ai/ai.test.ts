import { describe, expect, it } from "vitest";
import { parseQuestion } from "./parse";
import { redact } from "./redact";
import { buildFacts } from "./facts";
import { fallbackAnswer } from "./fallback";

describe("parseQuestion", () => {
  it("reads amount, years and rate", () => {
    expect(parseQuestion("EMI for 500,000 over 3 years at 12%")).toEqual({
      amount: 500000,
      months: 36,
      ratePercent: 12,
    });
  });
  it("reads k suffix and months", () => {
    expect(parseQuestion("$25k for 36 months")).toMatchObject({ amount: 25000, months: 36 });
  });
  it("returns nothing for plain questions", () => {
    expect(parseQuestion("how long does approval take")).toEqual({});
  });
});

describe("redact", () => {
  it("masks emails, SSNs, phones and long numbers", () => {
    expect(redact("a@b.com")).toBe("[email]");
    expect(redact("123-45-6789")).toBe("[id]");
    expect(redact("+251 911 234 567")).toBe("[phone]");
    expect(redact("1234567890123456")).toBe("[number]");
  });
  it("keeps loan amounts and terms", () => {
    expect(redact("loan 1000000 60 months")).toBe("loan 1000000 60 months");
  });
});

describe("facts and fallback", () => {
  it("computes a verified estimate", () => {
    const facts = buildFacts("GB", "£10k for 24 months");
    expect(facts.estimate?.monthlyPayment).toBeGreaterThan(0);
    expect(fallbackAnswer("GB", facts, "£10k for 24 months")).toContain("a month");
  });
  it("still answers without numbers", () => {
    const facts = buildFacts("US", "what documents do I need");
    expect(facts.estimate).toBeNull();
    expect(fallbackAnswer("US", facts, "what documents do I need")).toContain("Documents");
  });
});