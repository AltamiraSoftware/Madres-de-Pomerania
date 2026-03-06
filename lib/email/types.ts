export type MembershipTier = "esencial" | "vip";

export type EmailTemplateKey =
  | "welcome_d0"
  | "followup_d7"
  | "followup_d14"
  | "followup_d21"
  | "dossier_unlock";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface SendEmailResult {
  ok: boolean;
  provider: "resend";
  providerMessageId?: string;
  error?: string;
}