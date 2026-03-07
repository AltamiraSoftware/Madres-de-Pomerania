import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { unlockMonthlyDossier } from "@/lib/content/unlock-content";
import { sendSequenceEmail } from "@/lib/email/send-sequence-email";
import { buildInitialProgramStart, buildPauseProgramUpdate, buildResumeProgramUpdate } from "@/lib/billing/subscription-transitions";
import { getProgramProgressSnapshot } from "@/lib/billing/program-progress";
import { toISODate } from "@/lib/utils/date";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function mapStripeStatus(s: string): "active" | "past_due" | "canceled" {
  if (s === "active" || s === "trialing") return "active";
  if (s === "canceled" || s === "incomplete_expired") return "canceled";
  return "past_due";
}

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
  current_period_start?: number | null;
  current_period_end?: number | null;
};

function extractPeriod(s: StripeSubRuntime): { start: number | null; end: number | null } {
  const topStart = s.current_period_start ?? null;
  const topEnd = s.current_period_end ?? null;

  const items = s.items?.data ?? [];
  const starts = items
    .map((i) => i.current_period_start ?? null)
    .filter((x): x is number => typeof x === "number");
  const ends = items
    .map((i) => i.current_period_end ?? null)
    .filter((x): x is number => typeof x === "number");

  const start = topStart ?? (starts.length ? Math.min(...starts) : null);
  const end = topEnd ?? (ends.length ? Math.max(...ends) : null);

  return { start, end };
}

type SubscriptionRow = {
  id: string;
  user_id: string;
  tier: "esencial" | "vip";
  status: "active" | "past_due" | "canceled";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_start_at: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  cancel_at: string | null;
  canceled_at: string | null;
  program_days_consumed: number;
  program_last_resumed_at: string | null;
};

async function getSubscriptionByUserId(userId: string): Promise<SubscriptionRow | null> {
  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Error fetching subscription by user: ${error.message}`);
  }

  return data as SubscriptionRow | null;
}

async function getSubscriptionByStripeIds(params: {
  stripeSubscriptionId: string;
  customerId: string;
}): Promise<SubscriptionRow | null> {
  const bySub = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("stripe_subscription_id", params.stripeSubscriptionId)
    .maybeSingle();

  if (bySub.error) {
    throw new Error(`Error fetching subscription by stripe_subscription_id: ${bySub.error.message}`);
  }

  if (bySub.data) {
    return bySub.data as SubscriptionRow;
  }

  const byCustomer = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("stripe_customer_id", params.customerId)
    .maybeSingle();

  if (byCustomer.error) {
    throw new Error(`Error fetching subscription by stripe_customer_id: ${byCustomer.error.message}`);
  }

  return (byCustomer.data as SubscriptionRow | null) ?? null;
}

async function getProfile(userId: string): Promise<{ email: string | null; full_name: string | null } | null> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Error fetching profile: ${error.message}`);
  }

  return data;
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
  subscriptionStartAt?: string;
  programDaysConsumed?: number;
  programLastResumedAt?: string | null;
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

  const existing = await getSubscriptionByUserId(params.userId);

  const subscription_start_at =
    params.subscriptionStartAt ??
    existing?.subscription_start_at ??
    new Date().toISOString();

  const program_days_consumed =
    params.programDaysConsumed ?? existing?.program_days_consumed ?? 0;

  const program_last_resumed_at =
    params.programLastResumedAt !== undefined
      ? params.programLastResumedAt
      : existing?.program_last_resumed_at ?? null;

  const { error } = await supabaseAdmin.from("subscriptions").upsert(
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
      program_days_consumed,
      program_last_resumed_at,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    throw new Error(`Error upserting subscription: ${error.message}`);
  }
}

async function handleInitialOnboarding(params: {
  userId: string;
  tier: "esencial" | "vip";
}) {
  const profile = await getProfile(params.userId);
  if (!profile?.email) return;

  const unlock = await unlockMonthlyDossier({
    userId: params.userId,
    tier: params.tier,
    monthIndex: 1,
  });

  if (!unlock.ok) {
    throw new Error(unlock.error ?? "Failed to unlock dossier 1");
  }

  await sendSequenceEmail({
    userId: params.userId,
    userEmail: profile.email,
    userName: profile.full_name,
    tier: params.tier,
    monthIndex: 1,
    dayOffset: 0,
    scheduledFor: toISODate(),
    dossierTitle: unlock.contentTitle ?? null,
  });
}

async function handleResumeOrRenewal(params: {
  subscription: SubscriptionRow;
}) {
  const profile = await getProfile(params.subscription.user_id);
  if (!profile?.email) return;

  const progress = getProgramProgressSnapshot({
    programDaysConsumed: params.subscription.program_days_consumed,
    programLastResumedAt: params.subscription.program_last_resumed_at,
    isCurrentlyActive: params.subscription.status === "active",
  });

  if (progress.dayInCycle !== 0) return;
  if (progress.monthIndex < 2) return;

  const unlock = await unlockMonthlyDossier({
    userId: params.subscription.user_id,
    tier: params.subscription.tier,
    monthIndex: progress.monthIndex,
  });

  if (!unlock.ok) {
    throw new Error(unlock.error ?? "Failed to unlock renewal dossier");
  }

  await sendSequenceEmail({
    userId: params.subscription.user_id,
    userEmail: profile.email,
    userName: profile.full_name,
    tier: params.subscription.tier,
    monthIndex: progress.monthIndex,
    dayOffset: 0,
    scheduledFor: toISODate(),
    dossierTitle: unlock.contentTitle ?? null,
  });
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

        const full = await stripe.subscriptions.retrieve(stripeSubId);
        const s = full as unknown as StripeSubRuntime;
        const { start, end } = extractPeriod(s);

        const existing = await getSubscriptionByUserId(userId);

        const initialProgram = existing
          ? buildResumeProgramUpdate({
              programDaysConsumed: existing.program_days_consumed,
              alreadyRunning: !!existing.program_last_resumed_at,
            })
          : buildInitialProgramStart();

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
          subscriptionStartAt: existing?.subscription_start_at,
          programDaysConsumed: initialProgram.program_days_consumed,
          programLastResumedAt:
            initialProgram.program_last_resumed_at === undefined
              ? existing?.program_last_resumed_at ?? null
              : initialProgram.program_last_resumed_at,
        });

        if (!existing) {
          await handleInitialOnboarding({
            userId,
            tier,
          });
        }

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

        const existing = await getSubscriptionByStripeIds({
          stripeSubscriptionId: s.id,
          customerId,
        });

        if (!existing?.user_id) {
          break;
        }

        const nextStatus = mapStripeStatus(s.status);
        const wasActive = existing.status === "active";
        const willBeActive = nextStatus === "active";

        let nextProgramDaysConsumed = existing.program_days_consumed;
        let nextProgramLastResumedAt = existing.program_last_resumed_at;

        if (wasActive && !willBeActive) {
          const paused = buildPauseProgramUpdate({
            programDaysConsumed: existing.program_days_consumed,
            programLastResumedAt: existing.program_last_resumed_at,
          });

          nextProgramDaysConsumed = paused.program_days_consumed;
          nextProgramLastResumedAt = paused.program_last_resumed_at;
        }

        if (!wasActive && willBeActive) {
          const resumed = buildResumeProgramUpdate({
            programDaysConsumed: existing.program_days_consumed,
            alreadyRunning: !!existing.program_last_resumed_at,
          });

          nextProgramDaysConsumed = resumed.program_days_consumed;
          nextProgramLastResumedAt =
            resumed.program_last_resumed_at === undefined
              ? existing.program_last_resumed_at
              : resumed.program_last_resumed_at;
        }

        await upsertSubscription({
          userId: existing.user_id,
          customerId,
          stripeSubId: s.id,
          status: nextStatus,
          tier: existing.tier,
          periodStart: start,
          periodEnd: end,
          cancelAtPeriodEnd: s.cancel_at_period_end,
          cancelAt: s.cancel_at ?? null,
          canceledAt: s.canceled_at ?? null,
          subscriptionStartAt: existing.subscription_start_at,
          programDaysConsumed: nextProgramDaysConsumed,
          programLastResumedAt: nextProgramLastResumedAt,
        });

        const updated = await getSubscriptionByUserId(existing.user_id);

        if (updated && !wasActive && willBeActive) {
          await handleResumeOrRenewal({
            subscription: updated,
          });
        }

        break;
      }

      default:
        break;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook handler error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}