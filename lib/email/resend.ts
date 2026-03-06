import { Resend } from "resend";
import type { SendEmailInput, SendEmailResult } from "./types";

let resendClient: Resend | null = null;

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY");
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return resendClient;
}

export async function sendEmailWithResend(
  input: SendEmailInput
): Promise<SendEmailResult> {
  try {
    const resend = getResendClient();

    const payload: {
      from: string;
      to: string;
      subject: string;
      html: string;
      replyTo?: string;
    } = {
      from: process.env.EMAIL_FROM!,
      to: input.to,
      subject: input.subject,
      html: input.html,
    };

    const replyTo = input.replyTo ?? process.env.EMAIL_REPLY_TO;
    if (replyTo) {
      payload.replyTo = replyTo;
    }

    const result = await resend.emails.send(payload);

    if (result.error) {
      return {
        ok: false,
        provider: "resend",
        error: result.error.message,
      };
    }

    return {
      ok: true,
      provider: "resend",
      providerMessageId: result.data?.id,
    };
  } catch (error) {
    return {
      ok: false,
      provider: "resend",
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}