import { supabaseAdmin } from "@/lib/supabase/admin";

export interface EmailLogPayload {
  userId: string;
  sequenceId: string;
  scheduledFor: string; // YYYY-MM-DD
  status?: "pending" | "sent" | "failed";
  sentAt?: string | null;
  error?: string | null;
  provider?: string | null;
  providerMessageId?: string | null;
}

export async function getExistingEmailLog(params: {
  userId: string;
  sequenceId: string;
  scheduledFor: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("email_logs")
    .select("*")
    .eq("user_id", params.userId)
    .eq("sequence_id", params.sequenceId)
    .eq("scheduled_for", params.scheduledFor)
    .maybeSingle();

  if (error) {
    throw new Error(`Error fetching email log: ${error.message}`);
  }

  return data;
}

export async function insertEmailLog(payload: EmailLogPayload) {
  const { data, error } = await supabaseAdmin
    .from("email_logs")
    .insert({
      user_id: payload.userId,
      sequence_id: payload.sequenceId,
      scheduled_for: payload.scheduledFor,
      status: payload.status ?? "pending",
      sent_at: payload.sentAt ?? null,
      error: payload.error ?? null,
      provider: payload.provider ?? null,
      provider_message_id: payload.providerMessageId ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error inserting email log: ${error.message}`);
  }

  return data;
}

export async function updateEmailLog(params: {
  logId: string;
  status: "pending" | "sent" | "failed";
  sentAt?: string | null;
  error?: string | null;
  provider?: string | null;
  providerMessageId?: string | null;
}) {
  const { data, error } = await supabaseAdmin
    .from("email_logs")
    .update({
      status: params.status,
      sent_at: params.sentAt ?? null,
      error: params.error ?? null,
      provider: params.provider ?? null,
      provider_message_id: params.providerMessageId ?? null,
    })
    .eq("id", params.logId)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating email log: ${error.message}`);
  }

  return data;
}