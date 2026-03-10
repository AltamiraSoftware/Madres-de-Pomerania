import { supabaseAdmin } from "@/lib/supabase/admin";

export interface AdminEmailSequence {
  id: string;
  template_key: string;
  tier_required: string;
  month_index: number;
  day_offset: number;
  subject: string;
  heading: string | null;
  body: string | null;
  cta_label: string | null;
  cta_url: string | null;
  is_active: boolean;
  created_at: string | null;
}

export async function getAdminEmailSequences(): Promise<AdminEmailSequence[]> {
  const { data, error } = await supabaseAdmin
    .from("email_sequences")
    .select(
      "id, template_key, tier_required, month_index, day_offset, subject, heading, body, cta_label, cta_url, is_active, created_at"
    )
    .order("month_index", { ascending: true })
    .order("day_offset", { ascending: true })
    .order("tier_required", { ascending: true });

  if (error) {
    throw new Error(`Error fetching admin email sequences: ${error.message}`);
  }

  return (data ?? []) as AdminEmailSequence[];
}
