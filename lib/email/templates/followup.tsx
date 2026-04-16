interface FollowupEmailProps {
    userName?: string | null;
    heading?: string | null;
    body?: string | null;
    ctaLabel?: string | null;
    ctaUrl?: string | null;
  }
  
  export function renderFollowupEmail({
    userName,
    heading,
    body,
    ctaLabel,
    ctaUrl,
  }: FollowupEmailProps) {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h1>${heading ?? "Seguimiento técnico"}</h1>
        ${userName ? `<p>Hola, ${userName}.</p>` : ""}
        ${body ? `<p>${body}</p>` : `<p>Te enviamos este correo de seguimiento.</p>`}
        ${
          ctaLabel && ctaUrl
            ? `<p><a href="${ctaUrl}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">${ctaLabel}</a></p>`
            : ""
        }
      </div>
    `;
  }
