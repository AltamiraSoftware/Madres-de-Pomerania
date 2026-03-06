interface DossierUnlockEmailProps {
    userName?: string | null;
    dossierTitle: string;
    monthIndex: number;
  }
  
  export function renderDossierUnlockEmail({
    userName,
    dossierTitle,
    monthIndex,
  }: DossierUnlockEmailProps) {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1>Nuevo dossier desbloqueado</h1>
        <p>Hola${userName ? `, ${userName}` : ""}.</p>
        <p>Ya tienes disponible el dossier del mes ${monthIndex}:</p>
        <p><strong>${dossierTitle}</strong></p>
      </div>
    `;
  }