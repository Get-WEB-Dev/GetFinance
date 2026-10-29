import { describe, expect, it } from "vitest";
import { makeDraft, validHomeLoanDetails } from "@/test/fixtures";
import { applyLoanTypeChange, describeLoanTypeChange } from "./change-loan-type";
import { reconcileDraft } from "./reconcile";

describe("reconcileDraft", () => {
  it("returns the same draft when everything is still valid", () => {
    const draft = makeDraft();
    expect(reconcileDraft(draft)).toBe(draft);
  });

  it("un-completes a step whose data became invalid", () => {
    const draft = makeDraft({ applicant: { ...makeDraft().applicant!, mobile: "123" } });
    const result = reconcileDraft(draft);
    expect(result.completedSteps).not.toContain("applicant");
    expect(result.stepsToReview).toEqual(["applicant"]);
  });
});

describe("loan type changes", () => {
  it("flags only loan-details when switching personal to home", () => {
    const change = describeLoanTypeChange(makeDraft(), "home");
    expect(change.reviewSteps).toEqual(["loan-details"]);
    expect(change.next.completedSteps).toEqual(
      expect.arrayContaining(["loan-selection", "applicant", "address", "employment", "finances"]),
    );
  });

  it("flags employment, loan details and finances when switching personal to business", () => {
    const change = describeLoanTypeChange(makeDraft(), "business");
    expect(change.reviewSteps).toEqual(["employment", "loan-details", "finances"]);
  });

  it("keeps shared data untouched", () => {
    const draft = makeDraft();
    const next = applyLoanTypeChange(draft, "business");
    expect(next.applicant).toEqual(draft.applicant);
    expect(next.address).toEqual(draft.address);
  });

  it("clears home-only fields when switching home to personal", () => {
    const draft = makeDraft({ loanType: "home", loanDetails: validHomeLoanDetails });
    const change = describeLoanTypeChange(draft, "personal");
    expect(change.clearedLabels).toEqual(
      expect.arrayContaining(["Property value", "Down payment", "Property city", "Property state", "Loan purpose"]),
    );
    expect(change.next.loanDetails?.propertyValue).toBe("");
  });
});