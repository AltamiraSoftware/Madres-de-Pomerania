interface WelcomeEmailProps {
    userName?: string | null;
    heading?: string | null;
    body?: string | null;
    ctaLabel?: string | null;
    ctaUrl?: string | null;
    dossierTitle?: string | null;
  }
  
  export function renderWelcomeEmail({
    userName,
    heading,
    body,
    ctaLabel,
    ctaUrl,
    dossierTitle,
  }: WelcomeEmailProps) {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h1>${heading ?? `Bienvenida${userName ? `, ${userName}` : ""}`}</h1>
        ${
          body
            ? `<p>${body}</p>`
            : `<p>Tu suscripción ya está activa y ya tienes acceso al contenido privado.</p>`
        }
        ${
          dossierTitle
            ? `<p><strong>Dossier disponible:</strong> ${dossierTitle}</p>`
            : ""
        }
        ${
          ctaLabel && ctaUrl
            ? `<p><a href="${ctaUrl}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">${ctaLabel}</a></p>`
            : ""
        }
      </div>
    `;
  }