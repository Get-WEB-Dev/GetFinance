import { describe, expect, it } from "vitest";
import { draftSchema } from "./draft";

const minimal = {
  schemaVersion: 1,
  id: "x",
  reference: "GF-TEST0001",
  loanType: "personal",
  currentStep: "applicant",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("draftSchema country", () => {
  it("gives old drafts without a country the default", () => {
    const parsed = draftSchema.safeParse(minimal);
    expect(parsed.success && parsed.data.country).toBe("ET");
  });

  it("keeps a valid country and rejects an unknown one", () => {
    const us = draftSchema.safeParse({ ...minimal, country: "US" });
    expect(us.success && us.data.country).toBe("US");
    expect(draftSchema.safeParse({ ...minimal, country: "IN" }).success).toBe(false);
  });
});