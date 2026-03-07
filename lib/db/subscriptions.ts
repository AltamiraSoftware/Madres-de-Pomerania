export interface SubscriptionRow {
    id: string;
    user_id: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    status: "active" | "past_due" | "canceled";
    tier: "esencial" | "vip";
    subscription_start_at: string;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    cancel_at: string | null;
    canceled_at: string | null;
    program_days_consumed: number;
    program_last_resumed_at: string | null;
  }