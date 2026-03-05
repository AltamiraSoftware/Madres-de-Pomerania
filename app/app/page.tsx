import CheckoutStatusBanner from "@/components/app/CheckoutStatusBanner";
import ManageSubscriptionButton from "@/components/app/ManageSubscriptionButton";
import { redirect } from "next/navigation";
import SubscribeButton from "@/components/app/SubscribeButton";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!error && admin) redirect("/admin");

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status,tier,current_period_end,cancel_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const status = sub?.status ?? "canceled";
  const tier = sub?.tier ?? "esencial";

  const isActive = status === "active";

  // ✅ Fuente de verdad: cancel_at (si existe), si no, current_period_end (si lo guardas)
  const cancelDate = sub?.cancel_at ?? sub?.current_period_end ?? null;

  // ✅ “Cancelación programada” si sigue activa pero ya hay fecha de fin programada
  const scheduledCancel = isActive && !!cancelDate;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-serif">Dashboard Cliente</h1>

      <div className="mt-6">
        <CheckoutStatusBanner tier={tier} />
      </div>

      {isActive ? (
        <div className="mt-4 rounded-md border p-4">
          <p className="font-medium">✅ Suscripción activa</p>
          <p className="text-sm opacity-80">Plan: {tier}</p>

          {scheduledCancel && (
            <p className="mt-2 text-sm">
              ⚠️ Tu suscripción se cancelará el{" "}
              <span className="font-medium">
                {new Date(cancelDate!).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              . Mantendrás acceso hasta esa fecha.
            </p>
          )}

          <div className="mt-4">
            <ManageSubscriptionButton userId={user.id} />
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-md border p-4">
          <p className="font-medium">🔒 Sin suscripción activa</p>
          <p className="text-sm opacity-80">
            Estado: <span className="font-medium">{status}</span>
          </p>

          {/* Opcional: si tienes cancelDate guardada también para estado canceled */}
          {cancelDate && (
            <p className="mt-2 text-sm opacity-80">
              Tu acceso finalizó el{" "}
              <span className="font-medium">
                {new Date(cancelDate).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              .
            </p>
          )}

          <div className="mt-4">
            <SubscribeButton userId={user.id} tier="esencial" />
          </div>
        </div>
      )}
    </main>
  );
}