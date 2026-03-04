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

async function upsertSubscription(params: {
  userId: string;
  customerId: string;
  stripeSubId: string;
  status: "active" | "past_due" | "canceled";
  tier: "esencial" | "vip";

  periodStart?: number | null;
  periodEnd?: number | null;

  cancelAtPeriodEnd?: boolean | null;
  cancelAt?: number | null;
  canceledAt?: number | null;
}) {
  const current_period_start = params.periodStart
    ? new Date(params.periodStart * 1000).toISOString()
    : null;

  const current_period_end = params.periodEnd
    ? new Date(params.periodEnd * 1000).toISOString()
    : null;

  const cancel_at_period_end =
    typeof params.cancelAtPeriodEnd === "boolean" ? params.cancelAtPeriodEnd : false;

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
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
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

        const sub = await stripe.subscriptions.retrieve(stripeSubId);

        // Tipos: Stripe.Subscription trae estos campos en runtime, pero TS a veces molesta
        const s = sub as unknown as {
          id: string;
          status: string;
          current_period_start?: number | null;
          current_period_end?: number | null;
          cancel_at_period_end?: boolean;
          cancel_at?: number | null;
          canceled_at?: number | null;
        };

        await upsertSubscription({
          userId,
          customerId,
          stripeSubId: s.id,
          status: mapStripeStatus(s.status),
          tier,
          periodStart: s.current_period_start ?? null,
          periodEnd: s.current_period_end ?? null,
          cancelAtPeriodEnd: typeof s.cancel_at_period_end === "boolean" ? s.cancel_at_period_end : false,
          cancelAt: s.cancel_at ?? null,
          canceledAt: s.canceled_at ?? null,
        });

        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const s = sub as unknown as {
          id: string;
          status: string;
          current_period_start?: number | null;
          current_period_end?: number | null;
          cancel_at_period_end?: boolean;
          cancel_at?: number | null;
          canceled_at?: number | null;
        };

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
            periodStart: s.current_period_start ?? null,
            periodEnd: s.current_period_end ?? null,
            cancelAtPeriodEnd: typeof s.cancel_at_period_end === "boolean" ? s.cancel_at_period_end : false,
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