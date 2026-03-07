import type { EmailSequence } from "./types";
import { renderWelcomeEmail } from "./templates/welcome";
import { renderFollowupEmail } from "./templates/followup";
import { renderDossierUnlockEmail } from "./templates/dossier-unlock";
import { resolveEmailUrl } from "./resolve-email-url";

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
  const resolvedCtaUrl = resolveEmailUrl(sequence.cta_url);

  switch (sequence.template_key) {
    case "welcome_d0":
      return renderWelcomeEmail({
        userName,
        heading: sequence.heading,
        body: sequence.body,
        ctaLabel: sequence.cta_label,
        ctaUrl: resolvedCtaUrl,
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
        ctaUrl: resolvedCtaUrl,
      });

    case "dossier_unlock":
      return renderDossierUnlockEmail({
        userName,
        heading: sequence.heading,
        body: sequence.body,
        ctaLabel: sequence.cta_label,
        ctaUrl: resolvedCtaUrl,
        dossierTitle,
        monthIndex: sequence.month_index,
      });

    default:
      return renderFollowupEmail({
        userName,
        heading: sequence.heading,
        body: sequence.body,
        ctaLabel: sequence.cta_label,
        ctaUrl: resolvedCtaUrl,
      });
  }
}