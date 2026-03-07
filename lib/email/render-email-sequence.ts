import type { EmailSequence } from "./types";
import { renderWelcomeEmail } from "./templates/welcome";
import { renderFollowupEmail } from "./templates/followup";
import { renderDossierUnlockEmail } from "./templates/dossier-unlock";

interface RenderEmailSequenceInput {
  sequence: EmailSequence;
  userName?: string | null;
  dossierTitle?: string | null;
}

export function renderEmailSequence({
  sequence,
  userName,
  dossierTitle,
}: RenderEmailSequenceInput): string {
  switch (sequence.template_key) {
    case "welcome_d0":
      return renderWelcomeEmail({
        userName,
        heading: sequence.heading,
        body: sequence.body,
        ctaLabel: sequence.cta_label,
        ctaUrl: sequence.cta_url,
        dossierTitle,
      });

    case "followup_d7":
    case "followup_d14":
    case "followup_d21":
      return renderFollowupEmail({
        userName,
        heading: sequence.heading,
        body: sequence.body,
        ctaLabel: sequence.cta_label,
        ctaUrl: sequence.cta_url,
      });

    case "dossier_unlock":
      return renderDossierUnlockEmail({
        userName,
        heading: sequence.heading,
        body: sequence.body,
        ctaLabel: sequence.cta_label,
        ctaUrl: sequence.cta_url,
        dossierTitle,
        monthIndex: sequence.month_index,
      });

    default:
      return renderFollowupEmail({
        userName,
        heading: sequence.heading,
        body: sequence.body,
        ctaLabel: sequence.cta_label,
        ctaUrl: sequence.cta_url,
      });
  }
}