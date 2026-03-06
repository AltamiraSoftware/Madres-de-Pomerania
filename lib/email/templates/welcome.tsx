interface WelcomeEmailProps {
    userName?: string | null;
    dossierTitle?: string | null;
  }
  
  export function renderWelcomeEmail({
    userName,
    dossierTitle,
  }: WelcomeEmailProps) {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1>Bienvenida${userName ? `, ${userName}` : ""}</h1>
        <p>Tu suscripción ya está activa y ya tienes acceso al contenido privado.</p>
        ${
          dossierTitle
            ? `<p>Ya tienes disponible tu primer dossier: <strong>${dossierTitle}</strong>.</p>`
            : ""
        }
        <p>En los próximos días recibirás más correos de seguimiento técnico.</p>
      </div>
    `;
  }