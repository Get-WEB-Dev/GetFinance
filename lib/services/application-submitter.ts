import {
  submissionReceivedSchema,
  type SubmissionReceived,
  type SubmissionRequest,
} from "@/lib/validation/submission";

export type SubmitOutcome = SubmissionReceived | { status: "error"; message: string };

export interface ApplicationSubmitter {
  submit(request: SubmissionRequest): Promise<SubmitOutcome>;
}

const TIMEOUT_MS = 15_000;

export class HttpApplicationSubmitter implements ApplicationSubmitter {
  async submit(request: SubmissionRequest): Promise<SubmitOutcome> {
    try {
      const response = await fetch("/api/applications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": request.applicationId },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          typeof body === "object" && body !== null && "message" in body && typeof body.message === "string"
            ? body.message
            : "We couldn't submit your application. Please try again.";
        return { status: "error", message };
      }

      const parsed = submissionReceivedSchema.safeParse(body);
      return parsed.success
        ? parsed.data
        : { status: "error", message: "We got an unexpected response. Please try again." };
    } catch (error) {
      if (error instanceof DOMException && error.name === "TimeoutError") {
        return { status: "error", message: "The request took too long. Please try again." };
      }
      return { status: "error", message: "We couldn't reach the server. Check your connection and try again." };
    }
  }
}