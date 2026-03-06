interface FollowupEmailProps {
    userName?: string | null;
    dayOffset: number;
  }
  
  export function renderFollowupEmail({
    userName,
    dayOffset,
  }: FollowupEmailProps) {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1>Seguimiento técnico</h1>
        <p>Hola${userName ? `, ${userName}` : ""}.</p>
        <p>Este es tu correo de seguimiento correspondiente al día ${dayOffset} de tu ciclo.</p>
      </div>
    `;
  }