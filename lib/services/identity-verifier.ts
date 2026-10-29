import { z } from "zod";
import type { VerifyOutcome, VerifyRequest } from "@/types/verification";

export interface IdentityVerifier {
  verify(request: VerifyRequest, signal?: AbortSignal): Promise<VerifyOutcome>;
}

const outcomeSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("verified"), referenceId: z.string(), message: z.string() }),
  z.object({ status: z.literal("failed"), message: z.string() }),
  z.object({ status: z.literal("error"), message: z.string() }),
]);

const UNREACHABLE: VerifyOutcome = {
  status: "error",
  message: "We couldn't reach the verification service. Please try again.",
};

export class HttpIdentityVerifier implements IdentityVerifier {
  private readonly endpoint: string;
  private readonly timeoutMs: number;

  constructor(endpoint = "/api/verify/identity", timeoutMs = 10_000) {
    this.endpoint = endpoint;
    this.timeoutMs = timeoutMs;
  }

  async verify(request: VerifyRequest, signal?: AbortSignal): Promise<VerifyOutcome> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    const forwardAbort = () => controller.abort();
    signal?.addEventListener("abort", forwardAbort);

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
      const parsed = outcomeSchema.safeParse(await response.json());
      return parsed.success ? parsed.data : UNREACHABLE;
    } catch {
      return UNREACHABLE;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", forwardAbort);
    }
  }
}