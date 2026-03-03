import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  // 🔒 Si hay error o no hay fila, fuera
  if (error || !admin) redirect("/app");

  return (
    <main className="p-8">
      <h1 className="text-2xl font-serif">Panel Admin</h1>
      <p className="mt-2 text-black/60">Acceso verificado.</p>
    </main>
  );
}