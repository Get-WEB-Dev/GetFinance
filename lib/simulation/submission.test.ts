import { describe, expect, it } from "vitest";
import { submissionRequestSchema } from "@/lib/validation/submission";
import { simulateSubmission } from "./submission";

const request = {
  applicationId: "abc-123",
  reference: "GF-1A2B3C4D",
  loanType: "personal" as const,
  requestedAmount: 200_000,
  termMonths: 36,
};

describe("simulateSubmission", () => {
  it("echoes the reference and marks itself simulated", () => {
    const now = new Date("2026-10-30T10:00:00.000Z");
    expect(simulateSubmission(request, now)).toEqual({
      status: "received",
      reference: "GF-1A2B3C4D",
      receivedAt: "2026-10-30T10:00:00.000Z",
      simulated: true,
    });
  });

  it("fails when asked to", () => {
    expect(simulateSubmission({ ...request, simulateFailure: true }).status).toBe("error");
  });
});

describe("submissionRequestSchema", () => {
  it("accepts a valid request", () => {
    expect(submissionRequestSchema.safeParse(request).success).toBe(true);
  });

  it("rejects bad references, amounts, terms and loan types", () => {
    expect(submissionRequestSchema.safeParse({ ...request, reference: "nope" }).success).toBe(false);
    expect(submissionRequestSchema.safeParse({ ...request, requestedAmount: 0 }).success).toBe(false);
    expect(submissionRequestSchema.safeParse({ ...request, termMonths: 1.5 }).success).toBe(false);
    expect(submissionRequestSchema.safeParse({ ...request, loanType: "gold" }).success).toBe(false);
  });
});