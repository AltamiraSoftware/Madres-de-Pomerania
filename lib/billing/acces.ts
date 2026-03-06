export type SubscriptionStatus = "active" | "past_due" | "canceled";

export function isSubscriptionActive(status: SubscriptionStatus | string | null | undefined) {
  return status === "active";
}

export function hasProgramAccess(status: SubscriptionStatus | string | null | undefined) {
  return status === "active";
}