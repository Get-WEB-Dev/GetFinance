import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./env";

// SERVER ONLY. Never import this file from a client component.
export function createAdminClient() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY ?? "", {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}