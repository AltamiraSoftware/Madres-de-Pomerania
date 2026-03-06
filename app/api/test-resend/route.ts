import { NextRequest, NextResponse } from "next/server";
import { sendEmailWithResend } from "@/lib/email/resend";
import { renderWelcomeEmail } from "@/lib/email/templates/welcome";

// Opcional: evita cache
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const to = body?.to as string | undefined;

    if (!to) {
      return NextResponse.json(
        { ok: false, error: 'Falta el campo "to"' },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "Falta RESEND_API_KEY en las variables de entorno" },
        { status: 500 }
      );
    }

    if (!process.env.EMAIL_FROM) {
      return NextResponse.json(
        { ok: false, error: "Falta EMAIL_FROM en las variables de entorno" },
        { status: 500 }
      );
    }

    const html = renderWelcomeEmail({
      userName: "Prueba",
      dossierTitle: "Dossier 01",
    });

    const result = await sendEmailWithResend({
      to,
      subject: "Prueba Resend MVP",
      html,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          provider: result.provider,
          error: result.error ?? "Error desconocido al enviar",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      provider: result.provider,
      providerMessageId: result.providerMessageId ?? null,
      sentTo: to,
      from: process.env.EMAIL_FROM,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Error interno",
      },
      { status: 500 }
    );
  }
}