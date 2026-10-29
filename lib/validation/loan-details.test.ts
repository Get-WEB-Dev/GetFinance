import { describe, expect, it } from "vitest";
import { errorsFor, validHomeLoanDetails, validPersonalLoanDetails } from "@/test/fixtures";
import { createLoanDetailsSchema } from "./loan-details";

describe("createLoanDetailsSchema", () => {
  it("accepts a valid personal loan", () => {
    expect(errorsFor(createLoanDetailsSchema("personal"), validPersonalLoanDetails)).toEqual({});
  });

  it.each([
    ["just below the minimum", "49999"],
    ["just above the maximum", "1000001"],
  ])("rejects an amount %s", (_label, amount) => {
    const errors = errorsFor(createLoanDetailsSchema("personal"), { ...validPersonalLoanDetails, loanAmount: amount });
    expect(errors.loanAmount).toMatch(/between/);
  });

  it("accepts the exact minimum and maximum amounts", () => {
    expect(errorsFor(createLoanDetailsSchema("personal"), { ...validPersonalLoanDetails, loanAmount: "50000" })).toEqual({});
    expect(errorsFor(createLoanDetailsSchema("personal"), { ...validPersonalLoanDetails, loanAmount: "1000000" })).toEqual({});
  });

  it("requires a description when the purpose is 'other'", () => {
    const errors = errorsFor(createLoanDetailsSchema("personal"), { ...validPersonalLoanDetails, purpose: "other" });
    expect(errors.purposeOther).toBeDefined();
  });

  it("accepts a home loan whose amount plus down payment equals the property value", () => {
    expect(errorsFor(createLoanDetailsSchema("home"), validHomeLoanDetails)).toEqual({});
  });

  it("rejects a home loan whose amount plus down payment exceeds the property value", () => {
    const errors = errorsFor(createLoanDetailsSchema("home"), { ...validHomeLoanDetails, loanAmount: "4600000" });
    expect(errors.loanAmount).toMatch(/can't exceed the property value/);
  });
});