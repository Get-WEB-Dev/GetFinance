import { NextResponse } from "next/server";
import { evaluateEligibility } from "@/lib/eligibility/evaluate";
import { buildEligibilityInput } from "@/lib/eligibility/input";
import { toEligibilitySnapshot } from "@/lib/eligibility/snapshot";
import { getSubmissionBlockers } from "@/lib/review/readiness";
import { simulateSubmission } from "@/lib/simulation/submission";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { draftSchema } from "@/lib/validation/draft";
import { submissionRequestSchema, type SubmissionRequest } from "@/lib/validation/submission";

const delayMs = Number(process.env.SIMULATED_DELAY_MS ?? 1200);

const fail = (message: string, status: number) =>
  NextResponse.json({ status: "error", message }, { status });

/** Returns a response when the real (database) path applies, or null to use the simulation. */
async function submitToDatabase(request: SubmissionRequest): Promise<NextResponse | null> {
  const hasServiceKey = Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  );
  if (!supabaseConfigured || !hasServiceKey) return null;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  // Row level security means this only finds the signed-in user's own application.
  const { data: row } = await supabase
    .from("applications")
    .select("id, reference, draft, submitted_at")
    .eq("id", request.applicationId)
    .maybeSingle();
  if (!row) return null;

  if (row.submitted_at) {
    return NextResponse.json({
      status: "received",
      reference: row.reference,
      receivedAt: row.submitted_at,
      simulated: false,
    });
  }

  const parsed = draftSchema.safeParse(row.draft);
  if (!parsed.success) return fail("We couldn't read your saved application. Please reload and try again.", 422);
  const draft = parsed.data;

  if (getSubmissionBlockers(draft).length > 0) {
    return fail("Your latest changes haven't finished saving. Please wait a moment and try again.", 409);
  }

  const input = buildEligibilityInput(draft);
  const result = input ? evaluateEligibility(input) : null;
  if (!result) return fail("We couldn't assess this application. Please check your loan details.", 422);

  const snapshot = toEligibilitySnapshot(result);
  const submittedAt = new Date().toISOString();

  const { error } = await createAdminClient()
    .from("applications")
    .update({
      decision: snapshot.decision,
      decision_detail: snapshot,
      submitted_at: submittedAt,
      status: "submitted",
    })
    .eq("id", row.id)
    .eq("user_id", auth.user.id)
    .is("submitted_at", null);

  if (error) return fail("We couldn't record your submission. Please try again.", 503);

  return NextResponse.json({
    status: "received",
    reference: row.reference,
    receivedAt: submittedAt,
    simulated: false,
  });
}

export async function POST(request: Request) {
  const idempotencyKey = request.headers.get("Idempotency-Key");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("The request was not valid.", 400);
  }

  const parsed = submissionRequestSchema.safeParse(body);
  if (!parsed.success || idempotencyKey !== parsed.data.applicationId) {
    return fail("The request was not valid.", 400);
  }

  // The test hook for the failure path must keep working.
  if (!parsed.data.simulateFailure) {
    const real = await submitToDatabase(parsed.data);
    if (real) return real;
  }

  await new Promise((resolve) => setTimeout(resolve, delayMs));
  const outcome = simulateSubmission(parsed.data);
  return NextResponse.json(outcome, { status: outcome.status === "received" ? 200 : 503 });
}