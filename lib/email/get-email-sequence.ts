import { supabaseAdmin } from "@/lib/supabase/admin";
import type { EmailSequence, MembershipTier } from "./types";

interface GetEmailSequenceInput {
  tier: MembershipTier;
  monthIndex: number;
  dayOffset: number;
}

export async function getEmailSequence({
  tier,
  monthIndex,
  dayOffset,
}: GetEmailSequenceInput): Promise<EmailSequence | null> {


  const { data, error } = await supabaseAdmin
    .from("email_sequences")
    .select("*")
    .eq("tier_required", tier)
    .eq("month_index", monthIndex)
    .eq("day_offset", dayOffset)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Error fetching email sequence: ${error.message}`);
  }

  return data as EmailSequence | null;
}