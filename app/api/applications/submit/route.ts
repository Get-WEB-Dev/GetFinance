import { NextResponse } from "next/server";
import { simulateSubmission } from "@/lib/simulation/submission";
import { submissionRequestSchema } from "@/lib/validation/submission";

const delayMs = Number(process.env.SIMULATED_DELAY_MS ?? 1200);

export async function POST(request: Request) {
  const idempotencyKey = request.headers.get("Idempotency-Key");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: "error", message: "The request was not valid." }, { status: 400 });
  }

  const parsed = submissionRequestSchema.safeParse(body);
  if (!parsed.success || idempotencyKey !== parsed.data.applicationId) {
    return NextResponse.json({ status: "error", message: "The request was not valid." }, { status: 400 });
  }

  await new Promise((resolve) => setTimeout(resolve, delayMs));

  const outcome = simulateSubmission(parsed.data);
  return NextResponse.json(outcome, { status: outcome.status === "received" ? 200 : 503 });
}