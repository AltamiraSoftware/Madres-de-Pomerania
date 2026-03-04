import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { userId, tier = "esencial" } = (await req.json()) as {
    userId: string;
    tier?: "esencial" | "vip";
  };

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("id,email")
    .eq("id", userId)
    .single();

  if (error || !profile?.email) {
    return NextResponse.json({ error: "Profile not found" }, { status: 400 });
  }

  // Reutiliza stripe_customer_id si ya existe en subscriptions
  const { data: existingSub } = await supabaseAdmin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  let customerId = existingSub?.stripe_customer_id ?? null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      metadata: { supabase_user_id: userId },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=1`,
    allow_promotion_codes: true,
    metadata: {
      supabase_user_id: userId,
      tier,
    },
  });

  return NextResponse.json({ url: session.url });
}