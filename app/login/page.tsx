import { LoginForm } from "@/components/auth/LoginForm";
import { supabaseConfigured } from "@/lib/supabase/env";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      {supabaseConfigured ? (
        <LoginForm />
      ) : (
        <p className="text-slate-600">
          Accounts are not set up yet. Add your Supabase keys to .env.local.
        </p>
      )}
    </div>
  );
}