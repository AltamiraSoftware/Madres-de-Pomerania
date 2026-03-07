import { getEmailSequence } from "./get-email-sequence";
import { renderEmailSequence } from "./render-email-sequence";
import { sendEmailWithResend } from "./resend";
import {
  getExistingEmailLog,
  insertEmailLog,
  updateEmailLog,
} from "./log-email";
import type { EmailSequence } from "./types";

interface SendSequenceEmailInput {
  userId: string;
  userEmail: string;
  userName?: string | null;
  tier: "esencial" | "vip";
  monthIndex: number;
  dayOffset: number;
  scheduledFor: string; // YYYY-MM-DD
  dossierTitle?: string | null;
}

export type SendSequenceEmailResult =
  | {
      ok: true;
      skipped: true;
      reason: "already_sent";
      sequence: EmailSequence;
    }
  | {
      ok: true;
      skipped: false;
      reason: "sent";
      sequence: EmailSequence;
      providerMessageId: string | null;
    }
  | {
      ok: false;
      skipped: true;
      reason: "sequence_not_found";
    }
  | {
      ok: false;
      skipped: false;
      reason: "send_failed";
      sequence: EmailSequence;
      error?: string;
    };

export async function sendSequenceEmail({
  userId,
  userEmail,
  userName,
  tier,
  monthIndex,
  dayOffset,
  scheduledFor,
  dossierTitle,
}: SendSequenceEmailInput): Promise<SendSequenceEmailResult> {
  const sequence = await getEmailSequence({
    tier,
    monthIndex,
    dayOffset,
  });

  if (!sequence) {
    return {
      ok: false,
      skipped: true,
      reason: "sequence_not_found",
    };
  }

  const existingLog = await getExistingEmailLog({
    userId,
    sequenceId: sequence.id,
    scheduledFor,
  });

  if (existingLog && existingLog.status === "sent") {
    return {
      ok: true,
      skipped: true,
      reason: "already_sent",
      sequence,
    };
  }

  const html = renderEmailSequence({
    sequence,
    userName,
    dossierTitle,
  });

  let logId: string | undefined = existingLog?.id;

  if (!logId) {
    const insertedLog = await insertEmailLog({
      userId,
      sequenceId: sequence.id,
      scheduledFor,
      status: "pending",
    });

    logId = insertedLog.id;
  }

  if (!logId) {
    throw new Error("Failed to create or resolve email log id");
  }

  const sendResult = await sendEmailWithResend({
    to: userEmail,
    subject: sequence.subject,
    html,
  });

  if (!sendResult.ok) {
    await updateEmailLog({
      logId,
      status: "failed",
      error: sendResult.error ?? "Unknown send error",
      provider: sendResult.provider,
      providerMessageId: sendResult.providerMessageId ?? null,
    });

    return {
      ok: false,
      skipped: false,
      reason: "send_failed",
      sequence,
      error: sendResult.error,
    };
  }

  await updateEmailLog({
    logId,
    status: "sent",
    sentAt: new Date().toISOString(),
    error: null,
    provider: sendResult.provider,
    providerMessageId: sendResult.providerMessageId ?? null,
  });

  return {
    ok: true,
    skipped: false,
    reason: "sent",
    sequence,
    providerMessageId: sendResult.providerMessageId ?? null,
  };
}