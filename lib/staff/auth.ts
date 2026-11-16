import { notFound, redirect } from "next/navigation";
import { supabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function requireStaff() {
  if (!supabaseConfigured) redirect("/login");
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const { data: staff } = await supabase
    .from("staff")
    .select("role")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (!staff) notFound(); // non-staff just see a normal 404

  return { supabase, user: data.user, role: staff.role as string };
}