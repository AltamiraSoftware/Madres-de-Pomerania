import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface AdminContext {
  userId: string;
  email: string | null;
}

export async function requireAdmin(): Promise<AdminContext> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !admin) {
    redirect("/app");
  }

  return {
    userId: user.id,
    email: user.email ?? null,
  };
}
