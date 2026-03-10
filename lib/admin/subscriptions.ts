import { supabaseAdmin } from "@/lib/supabase/admin";

interface SubscriptionRow {
  user_id: string;
  status: "active" | "past_due" | "canceled";
  tier: "esencial" | "vip";
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
}

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
}

export interface ActiveAdminSubscription {
  userId: string;
  status: SubscriptionRow["status"];
  tier: SubscriptionRow["tier"];
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  email: string | null;
  fullName: string | null;
}

export async function getActiveAdminSubscriptions(): Promise<
  ActiveAdminSubscription[]
> {
  const { data: subscriptions, error: subscriptionError } = await supabaseAdmin
    .from("subscriptions")
    .select(
      "user_id, status, tier, current_period_end, cancel_at_period_end, created_at"
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (subscriptionError) {
    throw new Error(
      `Error fetching active subscriptions: ${subscriptionError.message}`
    );
  }

  const rows = (subscriptions ?? []) as SubscriptionRow[];
  const userIds = rows.map((subscription) => subscription.user_id);

  if (userIds.length === 0) {
    return [];
  }

  const { data: profiles, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, email, full_name")
    .in("id", userIds);

  if (profileError) {
    throw new Error(`Error fetching subscription profiles: ${profileError.message}`);
  }

  const profilesById = new Map(
    ((profiles ?? []) as ProfileRow[]).map((profile) => [profile.id, profile])
  );

  return rows.map((subscription) => {
    const profile = profilesById.get(subscription.user_id);

    return {
      userId: subscription.user_id,
      status: subscription.status,
      tier: subscription.tier,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      createdAt: subscription.created_at,
      email: profile?.email ?? null,
      fullName: profile?.full_name ?? null,
    };
  });
}
