import { z } from "zod";

export const ruleSnapshotSchema = z.object({
  id: z.string(),
  label: z.string(),
  outcome: z.enum(["pass", "refer", "fail"]),
  yourValue: z.string(),
  requirement: z.string(),
});

export const eligibilitySnapshotSchema = z.object({
  decision: z.enum(["eligible", "review", "not-eligible"]),
  annualRatePercent: z.number(),
  monthlyPayment: z.number(),
  totalPayable: z.number(),
  totalInterest: z.number(),
  maxAmount: z.number().nullable(),
  rules: z.array(ruleSnapshotSchema),
});

export const submissionRecordSchema = z.object({
  reference: z.string(),
  submittedAt: z.string(),
  status: z.literal("received"),
  loanType: z.string(),
  requestedAmount: z.number(),
  termMonths: z.number(),
  eligibility: eligibilitySnapshotSchema,
});

export type EligibilitySnapshot = z.infer<typeof eligibilitySnapshotSchema>;
export type SubmissionRecord = z.infer<typeof submissionRecordSchema>;

/** What the client sends to the (mock) API. Deliberately contains no personal details. */
export const submissionRequestSchema = z.object({
  applicationId: z.string().min(1).max(100),
  reference: z.string().regex(/^GF-[A-Z0-9]{8}$/),
  loanType: z.enum(["personal", "home", "business"]),
  requestedAmount: z.number().positive().max(1_000_000_000),
  termMonths: z.number().int().min(1).max(1200),
  simulateFailure: z.boolean().optional(),
});

export type SubmissionRequest = z.infer<typeof submissionRequestSchema>;

export const submissionReceivedSchema = z.object({
  status: z.literal("received"),
  reference: z.string(),
  receivedAt: z.string(),
  simulated: z.literal(true),
});

export type SubmissionReceived = z.infer<typeof submissionReceivedSchema>;