import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const { data: sub, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (subError) {
      return NextResponse.json({ error: subError.message }, { status: 500 });
    }

    let customerId = sub?.stripe_customer_id ?? null;

    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
      } catch {
        customerId = null;
      }
    }

    if (!customerId) {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();

      if (profileError || !profile?.email) {
        return NextResponse.json({ error: "Profile not found" }, { status: 400 });
      }

      const found = await stripe.customers.list({ email: profile.email, limit: 1 });
      customerId = found.data[0]?.id ?? null;

      if (customerId) {
        const { error: updateError } = await supabaseAdmin
          .from("subscriptions")
          .update({ stripe_customer_id: customerId })
          .eq("user_id", userId);

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
      }
    }

    if (!customerId) {
      return NextResponse.json({ error: "No Stripe customer found for this user" }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Portal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
