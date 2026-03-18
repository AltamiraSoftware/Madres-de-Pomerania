import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  getProgramProgressSnapshot,
  shouldSendSequenceForDay,
} from "@/lib/billing/program-progress";
import { unlockMonthlyDossier } from "@/lib/content/unlock-content";
import { sendSequenceEmail } from "@/lib/email/send-sequence-email";
import { toISODate } from "@/lib/utils/date";

type ActiveSubscriptionRow = {
  user_id: string;
  tier: "esencial" | "vip";
  status: "active" | "past_due" | "canceled";
  program_days_consumed: number;
  program_last_resumed_at: string | null;
};

function getDebugDate(raw: string | null): Date | null {
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isAuthorizedCronRequest(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    throw new Error("Missing CRON_SECRET");
  }

  return authHeader === `Bearer ${cronSecret}`;
}

async function getProfile(userId: string): Promise<{
  email: string | null;
  full_name: string | null;
} | null> {
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

export async function POST(req: Request) {
  return handleCronRequest(req);
}

export async function GET(req: Request) {
  return handleCronRequest(req);
}

async function handleCronRequest(req: Request) {
  try {
    if (!isAuthorizedCronRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const debugNow = getDebugDate(url.searchParams.get("now"));
    const debugUserId = url.searchParams.get("userId");

    if (url.searchParams.get("now") && !debugNow) {
      return NextResponse.json(
        { ok: false, error: "Invalid now param. Use ISO datetime." },
        { status: 400 }
      );
    }

    const today = debugNow ?? new Date();
    const scheduledFor = toISODate(today);

    let query = supabaseAdmin.from("subscriptions").select(`
        user_id,
        tier,
        status,
        program_days_consumed,
        program_last_resumed_at
      `);

    query = query.eq("status", "active");

    if (debugUserId) {
      query = query.eq("user_id", debugUserId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching active subscriptions: ${error.message}`);
    }

    const subscriptions = (data ?? []) as ActiveSubscriptionRow[];

    const results: Array<{
      userId: string;
      effectiveProgramDays?: number;
      currentSegmentDays?: number;
      programDaysConsumed?: number;
      programLastResumedAt?: string | null;
      monthIndex?: number;
      dayOffset?: number;
      status: "sent" | "skipped" | "error";
      detail?: string;
    }> = [];

    for (const subscription of subscriptions) {
      try {
        const profile = await getProfile(subscription.user_id);
        const email = profile?.email ?? null;
        const fullName = profile?.full_name ?? null;

        if (!email) {
          results.push({
            userId: subscription.user_id,
            status: "skipped",
            detail: "missing_email",
          });
          continue;
        }

        const progress = getProgramProgressSnapshot({
          programDaysConsumed: subscription.program_days_consumed,
          programLastResumedAt: subscription.program_last_resumed_at,
          isCurrentlyActive: subscription.status === "active",
          now: today,
        });

        const { monthIndex, dayInCycle } = progress;

        if (!shouldSendSequenceForDay(dayInCycle)) {
          results.push({
            userId: subscription.user_id,
            effectiveProgramDays: progress.effectiveProgramDays,
            currentSegmentDays: progress.currentSegmentDays,
            programDaysConsumed: subscription.program_days_consumed,
            programLastResumedAt: subscription.program_last_resumed_at,
            monthIndex,
            dayOffset: dayInCycle,
            status: "skipped",
            detail: "not_sequence_day",
          });
          continue;
        }

        let dossierTitle: string | null = null;

        if (dayInCycle === 0) {
          const unlock = await unlockMonthlyDossier({
            userId: subscription.user_id,
            tier: subscription.tier,
            monthIndex,
          });

          if (!unlock.ok) {
            results.push({
              userId: subscription.user_id,
              effectiveProgramDays: progress.effectiveProgramDays,
              currentSegmentDays: progress.currentSegmentDays,
              programDaysConsumed: subscription.program_days_consumed,
              programLastResumedAt: subscription.program_last_resumed_at,
              monthIndex,
              dayOffset: dayInCycle,
              status: "error",
              detail: unlock.error ?? "unlock_failed",
            });
            continue;
          }

          dossierTitle = unlock.contentTitle ?? null;
        }

        const sendResult = await sendSequenceEmail({
          userId: subscription.user_id,
          userEmail: email,
          userName: fullName,
          tier: subscription.tier,
          monthIndex,
          dayOffset: dayInCycle,
          scheduledFor,
          dossierTitle,
        });

        results.push({
          userId: subscription.user_id,
          effectiveProgramDays: progress.effectiveProgramDays,
          currentSegmentDays: progress.currentSegmentDays,
          programDaysConsumed: subscription.program_days_consumed,
          programLastResumedAt: subscription.program_last_resumed_at,
          monthIndex,
          dayOffset: dayInCycle,
          status: sendResult.ok
            ? sendResult.skipped
              ? "skipped"
              : "sent"
            : "error",
          detail: sendResult.reason,
        });
      } catch (innerError) {
        results.push({
          userId: subscription.user_id,
          programDaysConsumed: subscription.program_days_consumed,
          programLastResumedAt: subscription.program_last_resumed_at,
          status: "error",
          detail:
            innerError instanceof Error
              ? innerError.message
              : "unknown_subscription_error",
        });
      }
    }

    return NextResponse.json({
      ok: true,
      debug: {
        now: today.toISOString(),
        scheduledFor,
        userId: debugUserId ?? null,
      },
      processed: subscriptions.length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown cron error",
      },
      { status: 500 }
    );
  }
}
