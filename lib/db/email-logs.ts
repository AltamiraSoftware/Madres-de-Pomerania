export interface EmailLogRow {
    id: string;
    user_id: string;
    sequence_id: string | null;
    scheduled_for: string;
    sent_at: string | null;
    status: "pending" | "sent" | "failed";
    error: string | null;
    provider: string | null;
    provider_message_id: string | null;
  }