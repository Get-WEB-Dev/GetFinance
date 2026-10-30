import type { SubmissionReceived, SubmissionRequest } from "@/lib/validation/submission";

export type SubmissionOutcome = SubmissionReceived | { status: "error"; message: string };

/** Pure simulation: no network, no storage. */
export function simulateSubmission(request: SubmissionRequest, now: Date = new Date()): SubmissionOutcome {
  if (request.simulateFailure) {
    return { status: "error", message: "The simulated lender system is unavailable. Please try again." };
  }
  return {
    status: "received",
    reference: request.reference,
    receivedAt: now.toISOString(),
    simulated: true,
  };
}