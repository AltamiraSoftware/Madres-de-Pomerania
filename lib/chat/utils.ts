export function isMutedNow(moderation: {
  isMuted: boolean;
  mutedUntil: string | null;
}) {
  if (!moderation.isMuted) {
    return false;
  }

  if (!moderation.mutedUntil) {
    return true;
  }

  return new Date(moderation.mutedUntil).getTime() > Date.now();
}
