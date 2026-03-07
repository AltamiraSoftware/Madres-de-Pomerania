interface DossierUnlockEmailProps {
    userName?: string | null;
    heading?: string | null;
    body?: string | null;
    ctaLabel?: string | null;
    ctaUrl?: string | null;
    dossierTitle?: string | null;
    monthIndex: number;
  }
  
  export function renderDossierUnlockEmail({
    userName,
    heading,
    body,
    ctaLabel,
    ctaUrl,
    dossierTitle,
    monthIndex,
  }: DossierUnlockEmailProps) {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h1>${heading ?? `Nuevo dossier desbloqueado`}</h1>
        ${userName ? `<p>Hola, ${userName}.</p>` : ""}
        ${
          body
            ? `<p>${body}</p>`
            : `<p>Ya tienes disponible el dossier del mes ${monthIndex}.</p>`
        }
        ${dossierTitle ? `<p><strong>${dossierTitle}</strong></p>` : ""}
        ${
          ctaLabel && ctaUrl
            ? `<p><a href="${ctaUrl}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">${ctaLabel}</a></p>`
            : ""
        }
      </div>
    `;
  }