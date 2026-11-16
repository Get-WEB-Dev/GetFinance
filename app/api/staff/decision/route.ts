import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z
  .object({
    applicationId: z.string().min(1).max(100),
    action: z.enum(["approved", "declined", "more_info"]),
    note: z.string().trim().max(1000).default(""),
  })
  .refine((v) => v.action === "approved" || v.note.length >= 5, {
    message: "Please add a note of at least 5 characters.",
    path: ["note"],
  });

const fail = (message: string, status: number) => NextResponse.json({ message }, { status });

export async function POST(request: Request) {
  if (!supabaseConfigured || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return fail("The backend is not configured.", 503);
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return fail("Please sign in.", 401);

  const { data: staff } = await supabase
    .from("staff")
    .select("role")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!staff) return fail("Not allowed.", 403);

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "The request was not valid.", 400);
  }
  const { applicationId, action, note } = parsed.data;

  const { error } = await createAdminClient().rpc("record_review", {
    p_app: applicationId,
    p_actor: auth.user.id,
    p_action: action,
    p_note: note,
  });

  if (error) {
    if (error.message.includes("not_reviewable")) {
      return fail("This application has already been decided or was not submitted.", 409);
    }
    return fail("We couldn't save the decision. Please try again.", 503);
  }
  return NextResponse.json({ ok: true });
}