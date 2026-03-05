import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function mapStripeStatus(s: string): "active" | "past_due" | "canceled" {
  if (s === "active" || s === "trialing") return "active";
  if (s === "canceled" || s === "incomplete_expired") return "canceled";
  return "past_due";
}

// runtime shape mínimo (tu API version mete periodos en items.data)
type StripeSubRuntime = {
  id: string;
  status: string;
  customer: string;
  cancel_at?: number | null;
  cancel_at_period_end?: boolean;
  canceled_at?: number | null;
  items?: {
    data?: Array<{
      current_period_start?: number | null;
      current_period_end?: number | null;
    }>;
  };
  // a veces puede existir arriba también (por si Stripe cambia)
  current_period_start?: number | null;
  current_period_end?: number | null;
};

// coge el periodo desde top-level o desde items.data (max end, min start)
function extractPeriod(s: StripeSubRuntime): { start: number | null; end: number | null } {
  const topStart = s.current_period_start ?? null;
  const topEnd = s.current_period_end ?? null;

  const items = s.items?.data ?? [];
  const starts = items.map(i => i.current_period_start ?? null).filter((x): x is number => typeof x === "number");
  const ends = items.map(i => i.current_period_end ?? null).filter((x): x is number => typeof x === "number");

  const start = topStart ?? (starts.length ? Math.min(...starts) : null);
  const end = topEnd ?? (ends.length ? Math.max(...ends) : null);

  return { start, end };
}

async function upsertSubscription(params: {
  userId: string;
  customerId: string;
  stripeSubId: string;
  status: "active" | "past_due" | "canceled";
  tier: "esencial" | "vip";

  periodStart?: number | null;
  periodEnd?: number | null;

  cancelAtPeriodEnd?: boolean;
  cancelAt?: number | null;
  canceledAt?: number | null;
}) {
  const current_period_start = params.periodStart
    ? new Date(params.periodStart * 1000).toISOString()
    : null;

  const current_period_end = params.periodEnd
    ? new Date(params.periodEnd * 1000).toISOString()
    : null;

  const cancel_at_period_end = params.cancelAtPeriodEnd === true;

  const cancel_at = params.cancelAt
    ? new Date(params.cancelAt * 1000).toISOString()
    : null;

  const canceled_at = params.canceledAt
    ? new Date(params.canceledAt * 1000).toISOString()
    : null;

  const { data: existing } = await supabaseAdmin
    .from("subscriptions")
    .select("subscription_start_at")
    .eq("user_id", params.userId)
    .maybeSingle();

  const subscription_start_at =
    existing?.subscription_start_at ?? new Date().toISOString();

  await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: params.userId,
      stripe_customer_id: params.customerId,
      stripe_subscription_id: params.stripeSubId,
      status: params.status,
      tier: params.tier,
      subscription_start_at,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      cancel_at,
      canceled_at,
    },
    { onConflict: "user_id" }
  );
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = (session.metadata?.supabase_user_id || "") as string;
        const tier = ((session.metadata?.tier as "esencial" | "vip") || "esencial") as
          | "esencial"
          | "vip";

        const customerId = session.customer as string;
        const stripeSubId = session.subscription as string;

        if (!userId || !customerId || !stripeSubId) {
          return NextResponse.json(
            { error: "Missing metadata/customer/subscription on session" },
            { status: 400 }
          );
        }

        const full = await stripe.subscriptions.retrieve(stripeSubId);
        const s = full as unknown as StripeSubRuntime;
        const { start, end } = extractPeriod(s);

        await upsertSubscription({
          userId,
          customerId,
          stripeSubId: s.id,
          status: mapStripeStatus(s.status),
          tier,
          periodStart: start,
          periodEnd: end,
          cancelAtPeriodEnd: s.cancel_at_period_end,
          cancelAt: s.cancel_at ?? null,
          canceledAt: s.canceled_at ?? null,
        });

        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const eventSub = event.data.object as Stripe.Subscription;
        const subId = eventSub.id;

        const full = await stripe.subscriptions.retrieve(subId);
        const s = full as unknown as StripeSubRuntime;
        const customerId = s.customer as string;
        const { start, end } = extractPeriod(s);

        const row =
          (
            await supabaseAdmin
              .from("subscriptions")
              .select("user_id, tier")
              .eq("stripe_subscription_id", s.id)
              .maybeSingle()
          ).data ??
          (
            await supabaseAdmin
              .from("subscriptions")
              .select("user_id, tier")
              .eq("stripe_customer_id", customerId)
              .maybeSingle()
          ).data;

        if (row?.user_id) {
          await upsertSubscription({
            userId: row.user_id,
            customerId,
            stripeSubId: s.id,
            status: mapStripeStatus(s.status),
            tier: row.tier,
            periodStart: start,
            periodEnd: end,
            cancelAtPeriodEnd: s.cancel_at_period_end,
            cancelAt: s.cancel_at ?? null,
            canceledAt: s.canceled_at ?? null,
          });
        }

        break;
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook handler error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}