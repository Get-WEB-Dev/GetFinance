import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./env";

// SERVER ONLY. Never import this file from a client component.
export function createAdminClient() {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    "";

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}