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
    .select("status,tier,current_period_end,cancel_at_period_end,cancel_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const status = sub?.status ?? "canceled";
  const tier = sub?.tier ?? "esencial";
  const isActive = status === "active";

  const willCancel = Boolean(sub?.cancel_at) || Boolean(sub?.cancel_at_period_end);
  const cancelDate = sub?.cancel_at ?? sub?.current_period_end;

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

          {willCancel && cancelDate && (
            <p className="mt-2 text-sm">
              ⚠️ Tu suscripción se cancelará el{" "}
              <span className="font-medium">
                {new Date(cancelDate).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              . Mantendrás acceso hasta esa fecha.
            </p>
          )}

          <ManageSubscriptionButton userId={user.id} />
        </div>
      ) : (
        <div className="mt-4 rounded-md border p-4">
          <p className="font-medium">🔒 Sin suscripción activa</p>
          <p className="text-sm opacity-80">
            Estado: <span className="font-medium">{status}</span>
          </p>

          <div className="mt-4">
            <SubscribeButton userId={user.id} tier="esencial" />
          </div>
        </div>
      )}
    </main>
  );
}